import "colors";

import process from "process";
import { getCurrentVersion } from "../../utils/version.ts";
import { spinner } from "../../utils/spinner.ts";
import type { ModuleRunOptions } from "../../utils/types.ts";

const DEBUG_INFO = {
  OS: () => process.platform,
  VERSION: () => getCurrentVersion(),
  ARGS: () => `[${process.argv.join(", ")}]`,
  CWD: () => process.cwd(),
  EXEC_PATH: () => Deno.execPath(),
  IMPORT_META_URL: () => import.meta.url,
} as { [key: string]: () => Promise<string> | string };

export const run = async ({}: ModuleRunOptions) => {
  const maxKeyLength = Math.max(
    ...Object.keys(DEBUG_INFO).map((key) => key.length)
  );

  let output: string = "\n";
  await spinner("getting debug info", async () => {
    for (const [key, value] of Object.entries(DEBUG_INFO)) {
      const paddedKey = key.padEnd(maxKeyLength, " ");
      output += `${paddedKey.blue} ${"=>".gray} ${(await value()).green}\n`;
    }
  });

  console.log(output);
  return;
};
