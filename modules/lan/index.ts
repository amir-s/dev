import { $ } from "zx";
import report from "yurnalist";
import * as help from "./help.ts";
import { spinner } from "../../utils/spinner.ts";
import { Writable } from "stream";
import zonefile from "dns-zonefile";
import { isIPv4 } from "net";
import chokidar from "chokidar";
import { toVendor } from "@network-utils/vendor-lookup";
import path from "path";
import process from "process";
import type { ModuleRunOptions } from "../../utils/types.ts";

interface Server {
  name: string;
  port: number;
  target: string;
}

function notEmpty<TValue>(value: TValue): value is NonNullable<TValue> {
  return value !== null && value !== undefined;
}

const getTable = async () => {
  const result = await $`arp -a`;
  const regex = /.*\s+\((?<ip>.*)\)\s+at\s+(?<mac>.*)\s+on\s+.*/;
  return result.stdout
    .trim()
    .split("\n")
    .map((line) => {
      const result = line.match(regex);
      if (!result) {
        return null;
      }
      const { ip, mac } = result.groups!;
      return { ip, mac };
    })
    .filter(notEmpty)
    .filter((i) => i.mac !== "(incomplete)");
};

type IPInfo = Awaited<ReturnType<typeof getTable>>[number];

const reverseMDNS = (ip: string, timeout: number): Promise<string | null> => {
  let to: number;

  const timeoutPromise = new Promise<null>((resolve) => {
    to = setTimeout(() => {
      resolve(null);
    }, timeout);
  });

  const get = async () => {
    try {
      const result = await $`dig +short -p 5353 @224.0.0.251 -x ${ip}`;
      return result.stdout.trim().slice(0, -1);
    } catch (_) {
      return null;
    } finally {
      clearTimeout(to);
    }
  };

  return Promise.race([timeoutPromise, get()]);
};

const getDomains = (table: IPInfo[], timeout: number) => {
  return spinner("reverse query for mDNS", async () => {
    return await Promise.all(table.map((row) => reverseMDNS(row.ip, timeout)));
  });
};

const getMacVendors = (table: IPInfo[]) => {
  return spinner("get mac address vendors", async () => {
    return await Promise.all(table.map((row) => toVendor(row.mac)));
  });
};

const listServices = (timeout: number): Promise<string[]> => {
  let output = "";
  let to: number;

  const parse = (data: string) => {
    return Array.from(
      new Set(
        data
          .trim()
          .split("\n")
          .slice(4)
          .map((line) => line.split(/\s+/).slice(-2))
          .map(([type, name]) => `${name}.${type}`.replace(/\.local\.$/, "")),
      ),
    );
  };

  const timeoutPromise: Promise<string[]> = new Promise((resolve) => {
    to = setTimeout(() => {
      resolve(parse(output));
    }, timeout);
  });

  const get = async () => {
    try {
      const stream = new Writable({
        write: function (chunk, _, next) {
          output += chunk.toString();
          next();
        },
      });
      await $`dns-sd -B _services._dns-sd._udp`.pipe(stream);
      return parse(output); // this never happens as await above always waits indefinitely. This is a workaround to avoid typescript error
    } catch (_) {
      return parse(output);
    } finally {
      clearTimeout(to);
    }
  };

  return Promise.race([timeoutPromise, get()]);
};

const serviceInstances = (
  service: string,
  timeout: number,
): Promise<{
  service: string;
  servers: Server[];
}> => {
  let output = "";
  let to: number;

  const parse = (data: string) => {
    // parser does not like parentheses in names
    const srv = zonefile.parse(data.trim().replace(/(\(|\))/g, ""))["srv"] ||
      [];

    const servers = Array.from(
      new Set(
        srv.map((s) => {
          return JSON.stringify({
            name: s.name,
            port: s.port,
            target: s.target,
          });
        }),
      ),
    ).map((s) => JSON.parse(s)) as Server[];

    return {
      service,
      servers,
    };
  };

  const timeoutPromise: Promise<{
    service: string;
    servers: Server[];
  }> = new Promise((resolve) => {
    to = setTimeout(() => {
      resolve(parse(output));
    }, timeout);
  });

  const get = async () => {
    try {
      const stream = new Writable({
        write: function (chunk, _, next) {
          output += chunk.toString();
          next();
        },
      });
      await $`dns-sd -Z ${service} local.`.pipe(stream);
      return parse(output); // this never happens as await above always waits indefinitely. This is a workaround to avoid typescript error
    } catch (_) {
      return parse(output);
    } finally {
      clearTimeout(to);
    }
  };

  return Promise.race([timeoutPromise, get()]);
};

const serverDetails = (
  service: string,
  server: Server,
  timeout: number,
): Promise<{
  service: string;
  server: Server;
  ips: string[];
}> => {
  let output = "";
  let to: number;

  const parse = (data: string) => {
    return {
      service,
      server,
      ips: data
        .trim()
        .split("\n")
        .slice(3)
        .map((row) => row.trim().split(/\s+/).slice(-2, -1).pop())
        .filter((addr) => addr && isIPv4(addr))
        .filter(notEmpty),
    };
  };

  const timeoutPromise = new Promise<{
    service: string;
    server: Server;
    ips: string[];
  }>((resolve) => {
    to = setTimeout(() => {
      resolve(parse(output));
    }, timeout);
  });

  const get = async () => {
    try {
      const stream = new Writable({
        write: function (chunk, _, next) {
          output += chunk.toString();
          next();
        },
      });
      await $`dns-sd -Gv4 ${server.target}`.pipe(stream);
      return parse(output); // this never happens as await above always waits indefinitely. This is a workaround to avoid typescript error
    } catch (_) {
      return parse(output);
    } finally {
      clearTimeout(to);
    }
  };

  return Promise.race([timeoutPromise, get()]);
};

const discoverServices = async (timeout: number) => {
  return await spinner("discovering services", async () => {
    const services = await listServices(timeout);

    const instances = await Promise.all(
      services.map((service) => serviceInstances(service, timeout)),
    );
    const details = await Promise.all(
      instances.map((instance) =>
        Promise.all(
          instance.servers.map((server) =>
            serverDetails(instance.service, server, timeout)
          ),
        )
      ),
    );

    const ip2service = details.reduce(
      (acc, cur) => {
        cur.forEach((detail) => {
          detail.ips.forEach((ip) => {
            acc[ip] = acc[ip] || { domains: {}, services: {}, details: [] };
            acc[ip].domains[detail.server.target.replace(/\.$/, "")] = true;
            acc[ip].services[
              detail.service.slice(1, -5) + ":" + detail.server.port
            ] = true;
            acc[ip].details.push({
              service: detail.service,
              server: detail.server,
            });
          });
        });
        return acc;
      },
      {} as {
        [ip: string]: {
          domains: { [domain: string]: true };
          services: { [service: string]: true };
          details: { service: string; server: Server }[];
        };
      },
    );

    return ip2service;
  });
};

export const run = async ({ config, args }: ModuleRunOptions) => {
  const [command, ...flags] = args;

  if (!["scan", "sync"].includes(command)) {
    help.generic();
    return;
  }

  if (command === "scan") {
    const discovery = flags.includes("--services") || flags.includes("-s");
    const skipMDNS = flags.includes("--no-mdns");
    const skipMacLookup = flags.includes("--no-mac");
    const outputList = flags.includes("--list") || flags.includes("-l") ||
      flags.includes("ls");

    const timeout = config("lan.scan.lookup.timeout", 3000)!;

    const ip2service = discovery ? await discoverServices(timeout) : {};

    const table = await spinner("getting arp table", async () => {
      return await getTable();
    });

    const domains = skipMDNS ? [] : await getDomains(table, timeout);
    const vendors = skipMacLookup ? [] : await getMacVendors(table);

    const maxWith = Math.max(...vendors.map((i: string) => (i ? i.length : 0)));

    if (outputList || skipMacLookup) {
      console.log();
      for (let i = 0; i < table.length; i++) {
        const { ip, mac } = table[i];
        const domain = domains[i] || "";
        const vendor = vendors[i] || "";

        console.log(
          `⚡ ${ip.padEnd(15, " ").white} ${`(${mac})`.gray} ${
            vendor.padEnd(maxWith, " ").gray
          } ${domain.yellow}`,
        );
      }
    } else {
      const groups: {
        [vendor: string]: { ip: string; mac: string; domain: string }[];
      } = {};
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
        if (!group.length) {
          continue;
        }

        console.log(` 🏢 ${vendor.bold} ${`(${group.length})`.gray}`);

        for (const { ip, mac, domain } of group) {
          let serviceDomains = "";
          let services = "";
          if (ip2service[ip]) {
            const domains = Object.keys(ip2service[ip].domains).filter(
              (d) => d != domain,
            );
            if (domains.length) {
              serviceDomains = `${domains.join(" ")} `;
            }

            const servicesList = Object.keys(ip2service[ip].services);
            if (servicesList.length) {
              services = `(${servicesList.join(" ")})`;
            }
          }
          console.log(
            ` ⚡ ${ip.padEnd(15, " ").white} ${
              `(${mac})`.gray
            } ${domain.green} ${serviceDomains.yellow}${services.blue}`,
          );
        }
        console.log();
      }
    }
    process.exit(0);
  } else if (command === "sync") {
    const [source, target] = args
      .slice(1)
      .map((p: string) => (p.includes("@") ? p : path.resolve(p)));
    if (!source || !target) {
      return report.error("missing source and/or target");
    }

    const ignoreDotFiles = !args.includes("--dot");
    const ignoreNodeModules = !args.includes("--node_modules");

    const ignore = [];
    if (ignoreDotFiles) {
      ignore.push("**/.*");
    }
    if (ignoreNodeModules) {
      ignore.push("**/node_modules/**");
    }

    const sync = async () => {
      return await $`rsync --exclude ${
        ignoreDotFiles ? "**/.*" : "_nonex_"
      } --exclude ${
        ignoreNodeModules ? "**/node_modules/**" : "_nonex_"
      } -ah ${source} ${target}`;
    };

    chokidar
      .watch(source, {
        ignored: ignore,
        ignoreInitial: true,
      })
      .on("all", (event, path) => {
        report.info(`${event} ${path}`);
        sync();
      })
      .on("ready", () => {
        report.info(`📦 ${source} -> ${target}`);
        sync();
      });
  }
};
