import axios, { AxiosInstance } from "axios";
import { URLSearchParams } from "url";
import { networkInterfaces } from "os";
import { PhoneNotificationPayload, PhoneStatus } from "../resolvers/types/phone-notification";
import { Publisher } from "type-graphql";
import { Softkey } from "../entities/softkey";
import { TopSoftkey } from "../entities/top-softkey";

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

export class PhoneAPI {
  private readonly axios: AxiosInstance;
  status: PhoneStatus = PhoneStatus.Loading;

  constructor(
    readonly config: PhoneAPIConfig,
    private readonly publish: Publisher<PhoneNotificationPayload>
  ) {
    this.axios = axios.create({
      baseURL: `http://${config.ip}`,
      timeout: 2000,
      auth: defaultCredentials
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
    try {
      if (this.config.ip) {
        await this.get("/");
        this.status = PhoneStatus.Online;
      } else {
        this.status = PhoneStatus.Nonexistent;
      }
    } catch (e) {
      this.status = PhoneStatus.Offline;
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

  async addLocalToPushList() {
    const localIp = this.findSharedSubnetIp();

    await this.postUrlEncoded("/configurationServer.html", {
      postList: localIp
    });
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
  }

  async updateTopSoftkeys(softkeys: TopSoftkey[]) {
    const xml = genTopSoftkeyXml(softkeys, []);
  }

  private async get(path: string) {
    return this.axios.get(path);
  }

  private async post(path: string, data: any) {
    return this.axios.post(path, data);
  }

  private async postUrlEncoded(path: string, data: Obj) {
    return this.post(path, new URLSearchParams(data));
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
        [`topsoftkey${n} type`]: ""
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

  return `<AastraIPPhoneConfiguration setType="local">${items}</AastraIPPhoneConfiguration>`;
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
