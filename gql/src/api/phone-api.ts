import {
  AxiosInstance,
  AxiosRequestConfig,
  default as axiosFactory
} from "axios";
import {
  PhoneNotificationPayload,
  PhoneStatus
} from "../resolvers/types/phone-notification";
import { parseForm, stripToContent } from "./parse-forms";
import { Softkey } from "../entities/softkey";
import { TopSoftkey } from "../entities/top-softkey";
import { URLSearchParams } from "url";
import { logFn } from "../helpers";
import { getLocalSharedSubnetIP } from "./networking/ip-helper";
import { genSoftkeyXml, genTopSoftkeyXml } from "./networking/xml-helpers";
import { ArpHelper } from "./networking/arp-helpers";
import { Container } from "typedi";
import { Phone } from "../entities/phone";
import { TopSoftkeyTypes } from "../constants";
import { Publisher } from "type-graphql";

export class PhoneApiProvider {
  private apiCache: { [mac: string]: PhoneApi } = {};

  getPhoneApi(
    phone: Phone,
    publish: Publisher<PhoneNotificationPayload>
  ): PhoneApi {
    const { mac, name, id } = phone;
    if (!mac) return new PhoneApi(phone, publish);

    const api =
      this.apiCache[mac] || (this.apiCache[mac] = new PhoneApi(phone, publish));
    if (api.name !== name) api.name = name;
    if (api.id !== id) api.id = id;

    return api;
  }
}

const defaultCredentials = {
  username: "admin",
  password: "22222"
};

export class PhoneApi {
  private _axios?: AxiosInstance;
  private readonly log: (message: string) => void = logFn.bind(
    null,
    "phone_api"
  );
  public watched = false;

  constructor(
    phone: Phone,
    private publish: Publisher<PhoneNotificationPayload>,
    public name: string = phone.name,
    readonly mac: string = phone.mac || "",
    public id: string = phone.id,
    private ip = Container.get(ArpHelper).findIpForMac(mac),
    private _status = mac ? PhoneStatus.Loading : PhoneStatus.Nonexistent
  ) {
    if (!ip && mac !== "") {
      Container.get(ArpHelper)
        .waitForIp(mac)
        .then(ip => {
          if (ip) {
            this.ip = ip;
          } else {
            this.log(`Phone API initialized without IP: ${name}`);
          }
          return this.check();
        })
        .catch(() => {});
    } else if (ip) {
      this.check().catch(() => {});
    }
  }

  get status() {
    return this._status;
  }

  set status(status: PhoneStatus) {
    if (this._status !== status && this.watched)
      this.publish({ id: this.id, status });
    this._status = status;
  }

  get axios() {
    const ip = Container.get(ArpHelper).findIpForMac(this.mac);
    if (ip && (!this.ip || this.ip !== ip || !this._axios)) {
      return (this._axios = createAxios(ip, defaultCredentials));
    } else if (!ip) {
      throw new Error(`Phone API can't resolve IP: ${this.name}`);
    }

    return this._axios;
  }

  async restart() {
    await this.postUrlEncoded("/reset.html", {
      resetOption: "0"
    });
  }

  async reset() {
    await this.postUrlEncoded("/reset.html", {
      resetOption: "1"
    });
    await this.postUrlEncoded("/reset.html", {
      resetOption: "2"
    });
  }

  async check() {
    // logFn("phone_api", `check: ${this.ip}`);
    try {
      if (this.ip) {
        await axiosFactory.get(`http://${this.ip}/`, {
          auth: defaultCredentials
        });
        this.status = PhoneStatus.Online;
      } else {
        this.status = PhoneStatus.Offline;
      }
    } catch (e) {
      if (e.response) {
        this.status = PhoneStatus.Online;
      } else {
        this.status = PhoneStatus.Offline;
      }
    }
    return this.status;
  }

  async setLocalConfigServer() {
    const localIp = this.findSharedSubnetIP();

    await this.postUrlEncoded("/configurationServer.html", {
      protocol: "HTTP",
      httpserv: localIp,
      httppath: "/",
      httpport: "8000"
    });
  }

  async updateSoftkeys(softkeys: Softkey[]) {
    const xml = genSoftkeyXml(softkeys);
    await this.postRpc(xml);
  }

  async updateTopSoftkeys(softkeys: TopSoftkey[], companyPhoneBook: Phone[]) {
    const xml = genTopSoftkeyXml(
      softkeys,
      companyPhoneBook.map(phone => {
        return {
          type: TopSoftkeyTypes.Blf,
          label: phone.name,
          value: phone.number.toString()
        };
      })
    );
    await this.postRpc(xml);
  }

  private async readConfig(): Promise<{ [key: string]: string }> {
    const { data: serverData } = await this.get<string>("/servercfg.html");
    const { data: localData } = await this.get<string>("/localcfg.html");

    return (serverData + "\n" + localData)
      .split("\n")
      .filter(line => !line.trim().startsWith("#"))
      .filter(Boolean)
      .map(line =>
        line
          .trim()
          .split(":")
          .map(part => part.trim())
          .filter(Boolean)
      )
      .reduce(
        (acc, [k, ...val]) =>
          Object.assign(acc, { [k]: val.join(":").replace(/^"(.+)"$/, "$1") }),
        {}
      );
  }

  async readSoftkeys(): Promise<{
    softkeys: Softkey[];
    topSoftkeys: TopSoftkey[];
    name: string,
    number: string,
  }> {
    const cfg = await this.readConfig();
    const softkeys: Softkey[] = [];
    const topSoftkeys: TopSoftkey[] = [];

    for (let key in cfg) {
      const res = key.match(/^(?:top)?softkey(\d*) (\w+)$/);
      if (res) {
        let idx = parseInt(res[1], 10) - 1;
        let field = res[2];
        const arr: (Softkey | TopSoftkey)[] = key.startsWith("top")
          ? topSoftkeys
          : softkeys;
        const softkey: any =
          arr[idx] ||
          (arr[idx] = key.startsWith("top") ? new TopSoftkey() : new Softkey());
        softkey[field] = cfg[key];
      }
    }

    return {
      softkeys: softkeys.filter(Boolean).filter(s => s.type),
      topSoftkeys: topSoftkeys.filter(Boolean).filter(s => s.type),
      name: cfg["sip line1 screen name"],
      number: cfg["sip line1 auth name"]
    };
  }

  assertHasIP() {
    if (!this.ip)
      throw new Error(`You can't contact a phone without a MAC (${this.name})`);
  }

  findSharedSubnetIP() {
    this.assertHasIP();

    return getLocalSharedSubnetIP(this.ip!);
  }

  async ensurePushList() {
    await this.createOrConfirmSession();

    const res = await this.get<string>("/configurationServer.html");
    const form = parseForm(stripToContent(res.data))[0];
    const postList = form.fields.postList;

    const localIp = this.findSharedSubnetIP();
    console.log(form, postList, localIp);

    if (!postList.includes(localIp)) {
      await this.postUrlEncoded("/configurationServer.html", {
        postList: postList ? postList + "," + localIp : localIp
      });
    }
  }

  private async createOrConfirmSession(tries: number = 5): Promise<undefined> {
    this.assertHasIP();
    try {
      await this.axios!.get("/");
      this.status = PhoneStatus.Online;
      return;
    } catch (e) {
      if (!e.response) {
        tries = 1;
      }
      if (tries <= 1) {
        this.status = PhoneStatus.Offline;
        if (this.ip && this.watched)
          setTimeout(() => this.createOrConfirmSession(), 15 * 1000);
        throw e;
      }
      return this.createOrConfirmSession(tries - 1);
    }
  }

  private async get<T = any>(path: string) {
    await this.createOrConfirmSession();
    return this.axios!.get<T>(path);
  }

  private async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ) {
    await this.createOrConfirmSession();
    return this.axios!.post<T>(url, data, config);
  }

  private async postUrlEncoded<T = any>(url: string, data: any) {
    return this.post<T>(url, new URLSearchParams(data));
  }

  private async postRpc<T = any>(xml: string) {
    this.log(`[RPC] ${JSON.stringify(xml)}`);
    await this.ensurePushList();
    return this.post<T>("/", xml, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
  }
}

function createAxios(ip: string, auth: { username: string; password: string }) {
  const alog = logFn.bind(null, "axios");
  const axios = axiosFactory.create({
    baseURL: `http://${ip}`,
    timeout: 2000,
    auth
  });
  axios.interceptors.request.use(
    req => {
      alog(`[->] [${req.method}] ${req.url}`);
      return req;
    },
    err => {
      alog(`[x>]  ${err && err.message}`);
      return Promise.reject(err);
    }
  );
  axios.interceptors.response.use(
    res => {
      alog(`[<-] ${res.config && res.config.url} [${res.status}]`);
      // if (res.data.startsWith("<!DOCTYPE")) {
      //   alog(`[<-] ${JSON.stringify(stripToContent(res.data))}`);
      // }
      return res;
    },
    err => {
      if (err.request) {
        alog(
          `[<x] ${err.request.config && err.request.config.url} [${
            err.request.status
          }]`
        );
        if (!err.request.config) {
          console.error(err);
        }
      } else {
        alog(`[xx] ${err && err.message}`);
      }
      return Promise.reject(err);
    }
  );
  return axios;
}
