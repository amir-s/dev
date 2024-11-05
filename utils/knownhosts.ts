import fs from "fs";
import path from "path";
import { os } from "zx";

const KNOWN_HOSTS_PATH = path.resolve(os.homedir(), ".ssh", "known_hosts");

export const isKnownHost = (host: string) => {
  if (!fs.existsSync(KNOWN_HOSTS_PATH)) return false;
  const knownHosts = fs.readFileSync(KNOWN_HOSTS_PATH, "utf8").split("\n");
  return knownHosts.some((entry) => entry.split(" ")[0] === host);
};
