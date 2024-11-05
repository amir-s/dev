import { $, nothrow } from "zx";
import process from "process";
import type { ModuleRunOptions } from "../main";
import { commands } from "./list";

const isDenoInstalled = async () => {
  $.verbose = false;
  const denoInstalled = await nothrow($`denso --version`);
  $.verbose = true;
  return denoInstalled.exitCode === 0;
};

export const run = async ({ args, config }: ModuleRunOptions) => {
  process.env.FORCE_COLOR = "1";

  const task = args[0];
  const taskInfo = (await commands())[task];

  const useDeno = config(
    "contextual.node.deno",
    taskInfo.source === "deno.json"
  );
  const useYarn = config("contextual.node.yarn", false);

  if (useDeno && !(await isDenoInstalled())) {
    console.log(
      "Deno is not installed. Please install Deno to run this command."
    );
    process.exit(1);
  }

  try {
    if (useDeno) {
      await $`deno task ${args}`;
    } else if (useYarn) {
      await $`yarn run ${args}`;
    } else {
      await $`npm run ${args}`;
    }
    // deno-lint-ignore no-explicit-any
  } catch (e: any) {
    if (e.exitCode) process.exit(e.exitCode);
    else process.exit(1);
  }
};
