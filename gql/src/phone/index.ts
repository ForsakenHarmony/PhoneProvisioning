import { Phone } from "../entities/phone";
import axios, { AxiosInstance } from "axios";
import { URLSearchParams } from "url";
import { networkInterfaces } from "os";

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

export class PhoneAPI {
  private axios: AxiosInstance;

  constructor(private phone: Phone) {
    this.axios = axios.create({
      baseURL: `http://${phone.ip}`,
      auth: defaultCredentials
    });
  }

  async restart() {
    await this.postUrlEncoded(
      "/reset.html", {
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
    await this.get("/");
  }

  async setLocalConfigServer() {
    const [pa, pb, pc] = this.phone.ip.split(".");
    const ips = getLocalIps();
    const localIp = (ips.find(([la, lb, lc]) => la === pa && lb === pb && lc === pc) || []).join(".");

    if (!localIp) {
      throw new Error("Could not find shared subnet for: " + this.phone.ip);
    }

    await this.postUrlEncoded("/configurationServer.html", {
      protocol: "HTTP",
      httpserv: localIp,
      httppath: "/",
      httpport: "8000",
      postList: localIp
    });
  }

  private buildUrl(path: string) {
    return `http://${this.phone.ip}${path}`;
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

