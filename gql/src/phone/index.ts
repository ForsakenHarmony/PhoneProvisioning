import axios, { AxiosInstance } from "axios";
import { URLSearchParams } from "url";
import { networkInterfaces } from "os";
import { PhoneNotificationPayload, PhoneStatus } from "../resolvers/types/phone-notification";
import { Publisher } from "type-graphql";

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
  ip: string,
  companyId: string,
}

export class PhoneAPI {
  private axios: AxiosInstance;
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
  }

  async setLocalConfigServer() {
    const [pa, pb, pc] = this.config.ip.split(".");
    const ips = getLocalIps();
    const localIp = (ips.find(([la, lb, lc]) => la === pa && lb === pb && lc === pc) || []).join(".");

    if (!localIp) {
      throw new Error("Could not find shared subnet for: " + this.config.ip);
    }

    await this.postUrlEncoded("/configurationServer.html", {
      protocol: "HTTP",
      httpserv: localIp,
      httppath: "/",
      httpport: "8000",
      postList: localIp
    });
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

