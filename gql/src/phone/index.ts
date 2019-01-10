import { default as axiosFactory, AxiosInstance, AxiosRequestConfig } from "axios";
import { URLSearchParams } from "url";
import { networkInterfaces } from "os";
import { PhoneNotificationPayload, PhoneStatus } from "../resolvers/types/phone-notification";
import { Publisher } from "type-graphql";
import { Softkey } from "../entities/softkey";
import { TopSoftkey } from "../entities/top-softkey";
import { stringify } from "querystring";
import { parseForm, stripToContent } from "./parse-forms";

type Obj = { [key: string]: string | string[] | undefined };

const defaultCredentials = {
  username: "admin",
  password: "22222"
};

function convertCredentials({ username, password } = defaultCredentials) {
  const buffer = Buffer.from(`${username}:${password}`, "utf8");
  return buffer.toString("base64");
}

function getLocalIps() {
  return Object.values(networkInterfaces())
    .reduce((acc, val) => acc.concat(val), [])
    .filter(iface => iface.internal === false && iface.family === "IPv4")
    .map(iface => iface.address.split("."));
}

export interface PhoneAPIConfig {
  id: string,
  ip?: string,
  companyId: string,
}

function timeout(ms: number) {
  return new Promise(res => {
    setTimeout(res, ms);
  })
}

function logFn(context: string, message: string) {
  process.stdout.write(`[${context}] ${message}\n`);
}

export class PhoneAPI {
  private readonly axios: AxiosInstance;
  status: PhoneStatus = PhoneStatus.Loading;

  constructor(
    readonly config: PhoneAPIConfig,
    private readonly publish: Publisher<PhoneNotificationPayload>,
    private readonly log: (message: string) => void = logFn.bind(null,'phone_api'),
  ) {
    const alog = logFn.bind(null, 'axios');
    this.axios = axiosFactory.create({
      baseURL: `http://${config.ip}`,
      timeout: 2000,
      auth: defaultCredentials,
    });
    this.axios.interceptors.request.use(req => {
      alog(`[->] [${req.method}] ${req.url}`);
      return req;
    }, err => {
      alog(`[x>]  ${err && err.message}`);
      return Promise.reject(err);
    });
    this.axios.interceptors.response.use(res => {
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
    this.check();
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

  async check() {
    this.log(`check: ${this.config.id} [${this.config.ip}]`);
    try {
      if (this.config.ip) {
        await this.axios.get("/");
        this.status = PhoneStatus.Online;
      } else {
        this.status = PhoneStatus.Nonexistent;
      }
    } catch (e) {
      if (e.response) {
        this.status = PhoneStatus.Online;
      } else {
        this.status = PhoneStatus.Offline;
      }
    }
    await this.publish({
      id: this.config.id,
      status: this.status
    });
    return this.status;
  }

  findSharedSubnetIp() {
    if (!this.config.ip) {
      throw new Error("Can't find a shared subnet for a phone with no ip: " + this.config.id);
    }

    const [pa, pb, pc] = this.config.ip.split(".");
    const ips = getLocalIps();
    const localIp = (ips.find(([la, lb, lc]) => la === pa && lb === pb && lc === pc) || []).join(".");

    if (!localIp) {
      throw new Error("Could not find shared subnet for: " + this.config.ip);
    }

    return localIp;
  }

  async ensurePushList() {
    const res = await this.get('/configurationServer.html');
    const form = parseForm(stripToContent(res.data))[0];
    const postList = form.fields.postList;

    const localIp = this.findSharedSubnetIp();

    if (!postList.includes(localIp)) {
      await this.postUrlEncoded("/configurationServer.html", {
        postList: postList + ',' + localIp
      });
    }
  }

  async setLocalConfigServer() {
    const localIp = this.findSharedSubnetIp();

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

  async updateTopSoftkeys(softkeys: TopSoftkey[]) {
    const xml = genTopSoftkeyXml(softkeys, []);
    await this.postRpc(xml);
  }

  private async createOrConfirmSession(tries: number = 5): Promise<undefined> {
    try {
      await this.axios.get('/');
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

  private async get(path: string) {
    await this.createOrConfirmSession();
    return this.axios.get(path);
  }

  private async post(url: string, data?: any, config?: AxiosRequestConfig) {
    await this.createOrConfirmSession();
    return this.axios.post(url, data);
  }

  private async postUrlEncoded(url: string, data: Obj) {
    return this.post(url, new URLSearchParams(data));
  }

  private async postRpc(xml: string) {
    this.log(`[RPC] ${JSON.stringify(xml)}`);
    await this.ensurePushList();
    return this.post('/', xml, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
  }
}

function genTopSoftkeyXml(softkeys: TopSoftkey[], companyPhoneBook: TopSoftkey[]) {
  const obj = {
    ...Array.from({ length: 20 }, (v, i) => i + 1)
      .map(n => ({
        [`topsoftkey${n} type`]: ""
      }))
      .reduce((acc, val) => Object.assign(acc, val), {}),
    ...companyPhoneBook.concat(softkeys)
      .map((key, i) => {
        const n = i + 1;
        return {
          [`topsoftkey${n} type`]: key.type,
          [`topsoftkey${n} label`]: key.label || "",
          [`topsoftkey${n} value`]: key.value || "",
          [`topsoftkey${n} line`]: (key.line || 0).toString()
        };
      })
      .reduce((acc, val) => Object.assign(acc, val), {}),
  };

  return genXml(obj);
}

function genSoftkeyXml(softkeys: Softkey[]) {
  const obj = {
    ...Array.from({ length: 20 }, (v, i) => i + 1)
      .map(n => ({
        [`softkey${n} type`]: ""
      }))
      .reduce((acc, val) => Object.assign(acc, val), {}),
    ...softkeys
      .map((key, i) => {
        const n = i + 1;
        return {
          [`softkey${n} type`]: key.type,
          [`softkey${n} label`]: key.label || "",
          [`softkey${n} value`]: key.value || "",
          [`softkey${n} line`]: (key.line || 0).toString()
        };
      })
      .reduce((acc, val) => Object.assign(acc, val), {}),
  };

  return genXml(obj);
}

function genXml(obj: { [key: string]: string }) {
  const items = Object.entries(obj).map(
    ([k, v]) => `<ConfigurationItem><Parameter>${k}</Parameter><Value>${v}</Value></ConfigurationItem>`
  ).join("");

  return `xml=<AastraIPPhoneConfiguration setType="local">${items}</AastraIPPhoneConfiguration>`;
}

// function config_to_xml(phone, list = [], offset = 0) {
//
//
//   const out = {
//     ...Array.from({ length: 20 }, (v, i) => i + 1)
//       .map(n => ({
//         [`topsoftkey${n} type`]: ""
//       }))
//       .reduce((acc, val) => Object.assign(acc, val), {}),
//     ...list
//       .map((p, i) => {
//         const n = i + offset + 1;
//         return {
//           [`topsoftkey${n} type`]: "blf",
//           [`topsoftkey${n} label`]: list[i].name,
//           [`topsoftkey${n} value`]: list[i].number,
//           [`topsoftkey${n} line`]: "1"
//         };
//       })
//       .reduce((acc, val) => Object.assign(acc, val), {}),
//     ...phone.config.topsoftkeys
//       .map((key, i) => {
//         const n = i + 1;
//         return {
//           [`topsoftkey${n} type`]: key.type,
//           [`topsoftkey${n} label`]: key.label,
//           [`topsoftkey${n} value`]: key.value,
//           [`topsoftkey${n} line`]: "1"
//         };
//       })
//       .reduce((acc, val) => Object.assign(acc, val), {})
//   };
//
//   return `<AastraIPPhoneConfiguration setType="local">${Object.entries(out)
//     .map(
//       ([k, v]) =>
//         `<ConfigurationItem><Parameter>${k}</Parameter><Value>${v}</Value></ConfigurationItem>`
//     )
//     .join("")}</AastraIPPhoneConfiguration>`;
// }
