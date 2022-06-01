import { $ } from "zx";
import report from "yurnalist";
import arp from "arpjs";
import fetch from "node-fetch";
import * as help from "./help.mjs";
import { spinner } from "../utils/spinner.mjs";

const getTable = async () => {
  return new Promise((resolve, reject) => {
    arp.table((err, table) => {
      if (err) return reject(err);
      resolve(table.filter((i) => i.mac != "(incomplete)"));
    });
  });
};

const getVendor = async (mac, timeout) => {
  let to;

  const timeoutPromise = new Promise((resolve) => {
    to = setTimeout(() => {
      resolve(null);
    }, timeout);
  });

  const get = async () => {
    try {
      const result = await fetch(
        `https://macvendors.co/api/${mac.replace(/:([^:]{1}):/g, ":0$1:")}/json`
      );
      const {
        result: { company },
      } = await result.json();
      return company;
    } catch (e) {
      return null;
    } finally {
      clearTimeout(to);
    }
  };

  return Promise.race([timeoutPromise, get()]);
};

const reverseMDNS = async (ip, timeout) => {
  let to;

  const timeoutPromise = new Promise((resolve) => {
    to = setTimeout(() => {
      resolve(null);
    }, timeout);
  });

  const get = async () => {
    try {
      const result = await $`dig +short -p 5353 @224.0.0.251 -x ${ip}`;
      return result.stdout.trim().slice(0, -1);
    } catch (e) {
      return null;
    } finally {
      clearTimeout(to);
    }
  };

  return Promise.race([timeoutPromise, get()]);
};

const getDomains = async (table, timeout) => {
  return spinner("reverse query for mDNS", async () => {
    return await Promise.all(table.map((row) => reverseMDNS(row.ip, timeout)));
  });
};

const getMacVendors = async (table, timeout) => {
  return spinner("get mac address vendors", async () => {
    return await Promise.all(table.map((row) => getVendor(row.mac, timeout)));
  });
};

export const run = async ({ config, args }) => {
  const [command, ...flags] = args;

  if (command !== "scan") {
    help.generic();
    return;
  }

  const skipMDNS = flags.includes("--no-mdns");
  const skipMacLookup = flags.includes("--no-mac");
  const outputList =
    flags.includes("--list") || flags.includes("-l") || flags.includes("ls");

  const timeout = config("lan.scan.lookup.timeout", 3000);

  const table = await spinner("getting arp table", async () => {
    return await getTable();
  });

  const domains = skipMDNS ? [] : await getDomains(table, timeout);
  const vendors = skipMacLookup ? [] : await getMacVendors(table, timeout);

  const maxWith = Math.max(...vendors.map((i) => (i ? i.length : 0)));

  if (outputList || skipMacLookup) {
    console.log();
    for (let i = 0; i < table.length; i++) {
      const { ip, mac } = table[i];
      const domain = domains[i] || "";
      const vendor = vendors[i] || "";

      console.log(
        `⚡ ${ip.padEnd(15, " ").white} ${`(${mac})`.gray} ${
          vendor.padEnd(maxWith, " ").gray
        } ${domain.yellow}`
      );
    }
  } else {
    const groups = {};
    const unknowns = [];
    for (let i = 0; i < table.length; i++) {
      const { ip, mac } = table[i];
      const domain = domains[i] || "";
      const vendor = vendors[i];

      if (vendor) {
        groups[vendor] = groups[vendor] || [];
        groups[vendor].push({ ip, mac, domain });
      } else {
        unknowns.push({ ip, mac, domain });
      }
    }
    groups["unknown"] = unknowns;

    console.log();
    for (const vendor in groups) {
      const group = groups[vendor];
      console.log(` 🏢 ${vendor.bold} ${`(${group.length})`.gray}`);

      for (const { ip, mac, domain } of group) {
        console.log(
          ` ⚡ ${ip.padEnd(15, " ").white} ${`(${mac})`.gray} ${domain.yellow}`
        );
      }
      console.log();
    }
  }

  process.exit(0);
};
