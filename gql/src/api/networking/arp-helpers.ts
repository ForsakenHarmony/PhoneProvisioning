import { getLocalIps } from "./ip-helper";

const { exec } = require("child_process");
const { promisify } = require("util");
const execProm: (
  args: string
) => Promise<{ stdout: string; stderr: string }> = promisify(exec);

// const ifaceRegex = /Interface: ([\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3})/;
const entryRegex = /([\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}) ((?:[0-9a-fA-F]{2}-){5}[0-9a-fA-F]{2}) (\w+)/;

interface ArpMap {
  [mac: string]: {
    mac: string;
    ip: string;
    type: string;
  };
}

async function execAndParseArp() {
  const { stdout } = await execProm("arp -a");
  const lines = stdout
    .split(/[\r\n]+/g)
    .map(s => s.trim())
    .map(s => s.replace(/\s{2,}/g, " "))
    .filter(Boolean);
  return lines.reduce<ArpMap>((map, line) => {
    const entry = entryRegex.exec(line);

    if (entry) {
      const ip = entry[1];
      const mac = entry[2].replace(/-/g, ":");
      const type = entry[3];
      map[mac.toUpperCase()] = {
        ip,
        mac: mac.toUpperCase(),
        type
      };
    }

    return map;
  }, {});
}

async function ping(ip: string) {
  console.log("[arp-helper] [ping]", ip);
  try {
    await execProm(`ping -4 -w 100 -n 1 ${ip}`);
  } catch (e) {}
}

async function executor<T, R>(
  input: T[],
  creator: (val: T) => Promise<R>,
  maxRunning: number
): Promise<R[]> {
  const queue = input;
  const running: {
    id: number;
    prom: Promise<void>;
  }[] = [];
  const results: R[] = [];
  let i = 0;

  while (queue.length > 0 || running.length > 0) {
    while (running.length < maxRunning && queue.length > 0) {
      const id = i++;
      const val = queue.pop();
      running.push({
        id: id,
        prom: creator(val!).then(res => {
          results.push(res);
          running.splice(running.findIndex(run => run.id === id), 1);
        })
      });
    }
    await Promise.race(running.map(r => r.prom));
  }

  return results;
}

export class ArpHelper {
  private cache: ArpMap = {};
  private lastPingTime = 0;
  private currentPromise: Promise<void> | null = null;
  private readonly initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.execArp();
    setInterval(() => {
      this.execArp();
    }, 60 * 1000);
  }

  async execArp() {
    try {
      this.cache = await execAndParseArp();
    } catch (e) {}
  }

  private pingProm() {
    if (Date.now() - this.lastPingTime < 30 * 1000)
      return this.currentPromise || Promise.resolve();
    this.lastPingTime = Date.now();
    this.currentPromise = this.pingAll();
    return this.currentPromise;
  }

  private async pingAll() {
    const localIps = getLocalIps();
    const ips = localIps.reduce((acc, [a, b, c]) => {
      return acc.concat(
        Array.from({ length: 255 }, (_, i) => i).map(d =>
          [a, b, c, d].join(".")
        )
      );
    }, []);
    await executor(ips, ping, 50);
    await this.execArp();
    this.currentPromise = null;
  }

  async findMacsInNamespace(namespace: string) {
    await this.initPromise;
    await this.pingProm();

    return Object.values(this.cache)
      .map(e => e.mac)
      .filter(mac => mac.startsWith(namespace.toUpperCase()));
  }

  findIpForMac(mac: string): string | undefined {
    if (!mac.trim()) return;

    const entry = this.cache[mac.toUpperCase()];

    if (entry) return entry.ip;

    this.initPromise.then(() => {
      if (!this.cache[mac.toUpperCase()]) return this.pingProm();
      return Promise.resolve();
    });

    return;
  }

  async waitForIp(mac: string): Promise<string | undefined> {
    if (!mac.trim()) return;

    await this.initPromise;

    let entry = this.cache[mac.toUpperCase()];
    if (entry) return entry.ip;

    // console.log(mac, this.cache);
    await this.pingProm();

    entry = this.cache[mac.toUpperCase()];
    if (entry) return entry.ip;

    return;
  }
}
