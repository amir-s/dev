import fs from "fs";
import { $ } from "zx";

$.verbose = false;

export const list = async () => {
  if (!fs.existsSync("package.json")) return [];
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  if (pkg.scripts) {
    return Object.keys(pkg.scripts);
  }
  return [];
};

export const commands = async () => {
  if (!fs.existsSync("package.json")) return {};
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  return pkg.scripts || {};
};
