const { exec } = require("child_process");
const { promisify } = require("util");
const execProm: (args: string) => Promise<{ stdout: string, stderr: string }> = promisify(exec);

// const ifaceRegex = /Interface: ([\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3})/;
const entryRegex = /([\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}) ((?:[0-9a-fA-F]{2}-){5}[0-9a-fA-F]{2}) (\w+)/;

interface ArpMap {
  [mac: string]: {
    mac: string,
    ip: string,
    type: string,
  }
}

async function execAndParseArp() {
  const { stdout } = await execProm("arp -a");
  const lines = stdout.split(/[\r\n]+/g).map(s => s.trim()).map(s => s.replace(/\s{2,}/g, " ")).filter(Boolean);
  const map = lines.reduce<ArpMap>((map, line) => {
    const entry = entryRegex.exec(line);

    if (entry) {
      const ip = entry[1];
      const mac = entry[2].replace(/-/g, ":");
      const type = entry[3];
      map[mac.toLowerCase()] = {
        ip, mac, type
      };
    }

    return map;
  }, {});
  return map;
}

export class ArpHelper {
  private cache: ArpMap = {};

  constructor() {
    this.execArp();
    setInterval(() => {
      this.execArp();
    }, 60 * 1000);
  }

  async execArp() {
    try {
      this.cache = await execAndParseArp();
    } catch (e) {
    }
  }

  findIpForMac(mac: string): string | undefined {
    const entry = this.cache[mac.toLowerCase()];

    if (entry)
      return entry.ip;

    return;
  }
}
