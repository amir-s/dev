import report from "yurnalist";
import fetch from "node-fetch";
import { isIP } from "net";
import { spinner } from "../utils/spinner";
import { os } from "zx";
import process from "process";
import type { ModuleRunOptions } from "../internals";

export const run = async ({ config, args }: ModuleRunOptions) => {
  const ApiToken = config("ip.ipinfoio.token", null);

  const lookupIP = args[0];

  if (lookupIP) {
    if (!isIP(lookupIP)) {
      return report.error(`${lookupIP} is not a valid IP address`);
    }
  }

  const info = {
    local: "",
    ...(await spinner("Fetching IP information", async () => {
      let url = `https://ipinfo.io/`;
      if (lookupIP) {
        url += `${lookupIP}/`;
      }
      url += "json";
      if (ApiToken) {
        url += `?token=${ApiToken}`;
      }

      const result = await fetch(url);
      return result.json() as Promise<{
        ip: string;
        city: string;
        region: string;
        country: string;
        loc: string;
        org: string;
        postal: string;
        timezone: string;
        readme?: string;
      }>;
    })),
  };

  delete info.readme;

  if (!lookupIP) {
    const ifaces = os.networkInterfaces();
    const ipv4s = Object.keys(ifaces)
      .map((ifname) => {
        return ifaces[ifname]!.filter((iface) => {
          return iface.family === "IPv4" && !iface.internal;
        });
      })
      .flat();
    info.local = ipv4s.map((iface) => iface.address).join(", ");
  }

  const maxWidth = Object.keys(info).reduce((max, key) => {
    return Math.max(max, key.length);
  }, 0);

  console.log();

  for (const key in info) {
    const value = info[key as keyof typeof info];
    if (!value) continue;
    console.log(
      ` ▸ ${key.padEnd(maxWidth, " ").green}  ${value.toString().bold}`
    );
  }

  process.exit(0);
};
