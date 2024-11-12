import "colors";
import report from "yurnalist";
import inquirer from "inquirer";

import type { KV } from "./kv.ts";
import type { DevJson } from "./index.ts";
import { fs } from "zx";
import type { ModuleRunOptions } from "../../utils/types.ts";

const CHOICES = ["no", "yes", "never", "always"] as const;

export const handleEnvFile = async (
  devJson: DevJson,
  kv: KV,
  loadEnvFile: ModuleRunOptions["loadEnvFile"]
) => {
  const { env } = devJson;

  if (!env || !env["_cd"]) {
    return;
  }

  const envFile = env["_cd"];

  const isAllowed = () => {
    const all = kv.read<string>("_cd", "auto load env file");

    if (all === "never") {
      return false;
    }

    if (all === "always") {
      return true;
    }

    return null;
  };

  const allowed = isAllowed();
  if (allowed === false) {
    return false;
  }

  if (!fs.existsSync(envFile)) {
    report.error(
      `ENV file specified in ${"dev.json".green} not found: ${envFile.red}`
    );
    return false;
  }

  if (allowed === true) {
    loadEnvFile(envFile);
    return true;
  }

  report.info(`ENV variables are about to be loaded from ${envFile.green}`);

  const { run } = (await inquirer.prompt([
    {
      type: "list",
      name: "run",
      message: "Do you accept?",
      choices: CHOICES,
    },
  ])) as { run: (typeof CHOICES)[number] };

  if (run === "no") {
    return false;
  }

  if (run === "never") {
    kv.write("_cd", "auto load env file", "never");
    return false;
  }

  if (run === "always") {
    kv.write("_cd", "auto load env file", "always");
  }

  loadEnvFile(envFile);
  return true;
};
