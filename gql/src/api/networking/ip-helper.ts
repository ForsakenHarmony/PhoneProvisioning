import { networkInterfaces } from "os";

export function getLocalIps(): string[][] {
  return Object.values(networkInterfaces())
    .reduce((acc, val) => acc.concat(val), [])
    .filter(iface => iface.internal === false && iface.family === "IPv4")
    .map(iface => iface.address.split("."));
}

export function getLocalSharedSubnetIP(targetIp: string): string {
  const splitIp = targetIp.split(".");

  if (splitIp.length !== 4)
    throw new Error(`${targetIp} is not a valid IP.`);

  const [pa, pb, pc] = splitIp;

  const ips = getLocalIps();
  const localIp = (ips.find(([la, lb, lc]) => la === pa && lb === pb && lc === pc) || []).join(".");

  if (!localIp)
    throw new Error(`Could not find shared subnet for: ${targetIp}`);

  return localIp;
}
