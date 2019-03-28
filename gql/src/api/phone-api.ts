import { AxiosInstance, AxiosRequestConfig, default as axiosFactory } from "axios";
import { PhoneStatus } from "../resolvers/types/phone-notification";
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

// type Obj = { [key: string]: string | string[] | undefined };

export class PhoneApiProvider {
  private apiCache: { [mac: string]: PhoneApi } = {};

  getPhoneApi({ name, mac }: Phone): PhoneApi {
    if (!mac) return new PhoneApi(name);

    const api = this.apiCache[mac] || (this.apiCache[mac] = new PhoneApi(name, mac));
    if (api.name !== name)
      api.name = name;

    return api;
  }
}

const defaultCredentials = {
  username: "admin",
  password: "22222"
};

export class PhoneApi {
  private readonly axios?: AxiosInstance;
  status: PhoneStatus = PhoneStatus.Loading;

  constructor(
    public name: string,
    readonly mac: string = "",
    private readonly log: (message: string) => void = logFn.bind(null, "phone_api"),
    private readonly ip = Container.get(ArpHelper).findIpForMac(mac)
  ) {
    if (ip)
      this.axios = createAxios(ip, defaultCredentials);
    else
      log(`Phone API initialized without IP: ${name}`);
  }

  async restart() {
    await this.postUrlEncoded(
      "/reset.html",
      {
        resetOption: "0"
      }
    );
  }

  async reset() {
    await this.postUrlEncoded("/reset.html", {
      resetOption: "1"
    });
    await this.postUrlEncoded("/reset.html", {
      resetOption: "2"
    });
  }

  static async check(mac: string) {
    const arpHelper = Container.get(ArpHelper);
    const ip = arpHelper.findIpForMac(mac);
    logFn("phone_api", `check: ${ip}`);
    try {
      if (ip) {
        await axiosFactory.get(`http://${ip}/`, {
          auth: defaultCredentials
        });
        return PhoneStatus.Online;
      }
    } catch (e) {
      if (e.response) {
        return PhoneStatus.Online;
      }
    }
    return PhoneStatus.Offline;
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
    this.assertHasIP();

    const res = await this.get<string>("/configurationServer.html");
    const form = parseForm(stripToContent(res.data))[0];
    const postList = form.fields.postList;

    const localIp = this.findSharedSubnetIP();

    if (!postList.includes(localIp)) {
      await this.postUrlEncoded("/configurationServer.html", {
        postList: postList + "," + localIp
      });
    }
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
    const xml = genTopSoftkeyXml(softkeys, companyPhoneBook.map(phone => {
      return {
        type: TopSoftkeyTypes.Blf,
        label: phone.name,
        value: phone.number.toString(),
      };
    }));
    await this.postRpc(xml);
  }

  async readConfig(): Promise<{[key: string]: string}> {
    const { data: serverData } = await this.get<string>("/servercfg.html");
    const { data: localData } = await this.get<string>("/localcfg.html");

    return (serverData + "\n" + localData)
      .split("\n")
      .filter(line => !line.trim().startsWith("#"))
      .filter(Boolean)
      .map(line => line.trim().split(":").map(part => part.trim()).filter(Boolean))
      .reduce((acc, [k, ...val]) => Object.assign(acc, { [k]: val.join(":") }), {});
  }

  async readSoftkeys(): Promise<{ softkeys: Softkey[], topSoftkeys: TopSoftkey[]}> {
    const cfg = await this.readConfig();
    const softkeys: Softkey[] = [];
    const topSoftkeys: TopSoftkey[] = [];

    for (let key in cfg) {
      const res = key.match(/^(?:top)?softkey(\d*) (\w+)$/);
      if (res) {
        let idx = parseInt(res[1], 10) - 1;
        let field = res[2];
        const arr: (Softkey | TopSoftkey)[] = key.startsWith('top') ? topSoftkeys : softkeys;
        const softkey: any = (arr[idx] || (arr[idx] = key.startsWith('top') ? new TopSoftkey() : new Softkey()));
        softkey[field] = cfg[key];
      }
    }

    console.log(softkeys, topSoftkeys);

    return {
      softkeys: softkeys.filter(Boolean).filter(s => s.type),
      topSoftkeys: topSoftkeys.filter(Boolean).filter(s => s.type),
    }
  }

  private async createOrConfirmSession(tries: number = 5): Promise<undefined> {
    this.assertHasIP();
    try {
      await this.axios!.get("/");
      return;
    } catch (e) {
      if (!e.response) {
        tries = 1;
      }
      if (tries <= 1) {
        throw e;
      }
      return await this.createOrConfirmSession(tries - 1);
    }
  }

  private async get<T = any>(path: string) {
    await this.createOrConfirmSession();
    return this.axios!.get<T>(path);
  }

  private async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
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

function createAxios(ip: string, auth: { username: string, password: string }) {
  const alog = logFn.bind(null, "axios");
  const axios = axiosFactory.create({
    baseURL: `http://${ip}`,
    timeout: 2000,
    auth
  });
  axios.interceptors.request.use(req => {
    alog(`[->] [${req.method}] ${req.url}`);
    return req;
  }, err => {
    alog(`[x>]  ${err && err.message}`);
    return Promise.reject(err);
  });
  axios.interceptors.response.use(res => {
    alog(`[<-] ${res.config.url} [${res.status}]`);
    if (res.data.startsWith("<!DOCTYPE")) {
      alog(`[<-] ${JSON.stringify(stripToContent(res.data))}`);
    }
    return res;
  }, err => {
    if (err.request) {
      alog(`[<x] ${err.request.config.url} [${err.request.status}]`);
    } else {
      alog(`[xx] ${err && err.message}`);
    }
    return Promise.reject(err);
  });
  return axios;
}
