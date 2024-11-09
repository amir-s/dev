import { $ } from "zx";
import process from "process";

import { commands } from "./list.ts";
import type { ModuleRunOptions } from "../../utils/types.ts";

$.verbose = true;

export const run = async ({ args, config }: ModuleRunOptions) => {
  process.env.FORCE_COLOR = "1";

  const task = args[0];
  const taskInfo = (await commands())[task];

  const useDeno = config(
    "contextual.node.deno",
    taskInfo.source === "deno.json"
  );
  const useYarn = config("contextual.node.yarn", false);

  try {
    if (useDeno) {
      await $`deno task ${args}`;
    } else if (useYarn) {
      await $`yarn run ${args}`;
    } else {
      await $`npm run ${args}`;
    }
  } catch (e: any) {
    if (e.exitCode) process.exit(e.exitCode);
    else process.exit(1);
  }
};
