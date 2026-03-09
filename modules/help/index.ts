import "colors";

import { raw, report } from "../../utils/logger.ts";
import fs from "fs";
import { fileURLToPath } from "node:url";

import path, { dirname } from "path";
import { modules } from "../../main.ts";
import type { HelpDoc } from "./help.ts";
import type { ModuleRunOptions } from "../../utils/types.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const run = async ({ args, config }: ModuleRunOptions) => {
  const DEV = config("shell.function", "dev")!;

  if (args.length === 0) {
    report.info("These are the available commands for dev:\n");

    const output: {
      module: string;
      cmd: string | string[];
      description: string;
    }[] = [];
    let padding = 0;

    for (const module of Object.keys(modules)) {
      const modulePath = path.resolve(__dirname, `../${module}/help.ts`);
      if (!fs.existsSync(modulePath)) continue;
      const { cmd, description } = await import(modulePath);
      padding = Math.max(padding, module.length);
      output.push({ module, cmd, description });
    }
    const descriptionPad = "".padEnd(padding + 2, " ");
    for (const { module, cmd, description } of output) {
      const CMDS = (Array.isArray(cmd) ? cmd : [cmd]).map((cmd) => {
        if (!cmd) return "";
        return `${"$".yellow} ${DEV.yellow} ${cmd.yellow.bold}`;
      });

      const paddedModule = module.padEnd(padding, " ");

      raw(
        ` ${paddedModule.green.bold} ${"-".gray} ${CMDS.join(", ")}${
          description ? `\n ${descriptionPad} ${description}` : ""
        }\n`,
      );
    }

    raw(
      ` ⚠ You can run ${
        `${DEV} help <command>`.green.bold
      } for more information and more examples about any of the listed commands.`,
    );
    return;
  } else {
    const module = args[0];
    const modulePath = path.resolve(__dirname, `../${module}/help.ts`);
    if (!fs.existsSync(modulePath)) {
      return report.error(`No help available for ${module}.`);
    }
    raw();
    const { help } = await import(modulePath);
    const { description, commands, configs }: HelpDoc = help(DEV);
    raw(description.map((i) => `  ${i}`).join("\n"));
    raw();

    if (commands) {
      commands.forEach(({ cmd, description, examples }) => {
        raw(`${"$".yellow} ${DEV.green} ${cmd.green.bold}`);
        raw(`  ${description}\n`);
        if (examples) {
          raw("  some examples:\n".blue);
          examples.forEach(({ cmd, description }) => {
            raw(`  + ${DEV.green} ${cmd.yellow.bold}`);
            raw(`    ${description}\n`);
          });
        }
      });
    }

    if (configs) {
      raw("  configs available:\n".blue);
      configs.forEach(({ key, description, def }) => {
        raw(
          `  + ${key.yellow} ${def ? `${"default:".gray} ${def.cyan}` : ""}`,
        );
        raw(`    ${description}\n`);
      });
    }
  }
};
