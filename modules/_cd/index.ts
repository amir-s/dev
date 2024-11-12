import "colors";
import { $ } from "zx";
import process from "process";
import { kv } from "./kv.ts";
import { handleScript } from "./handleScript.ts";
import { handleEnvFile } from "./handleEnvFile.ts";
import type { ModuleRunOptions } from "../../utils/types.ts";

$.verbose = true;

export interface DevJson {
  scripts?: {
    _cd?: string;
  };
  env?: {
    _cd?: string;
  };
}

export const run = async ({ loadEnvFile }: ModuleRunOptions) => {
  const devJson = JSON.parse(Deno.readTextFileSync("dev.json")) as DevJson;
  await handleScript(devJson, kv);
  await handleEnvFile(devJson, kv, loadEnvFile);

  process.exit(0);
};
