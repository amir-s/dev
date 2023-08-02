import report from "yurnalist";
import fs from "fs";
import { fileURLToPath } from "url";

import "colors";

import { modules } from "../index.mjs";
import path, { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const run = async ({ args, config }) => {
  const DEV = config("shell.function", "dev");

  if (args.length === 0) {
    report.info("These are the available commands for dev:\n");

    const output = [];
    let padding = 0;

    for (let module of Object.keys(modules)) {
      const modulePath = path.resolve(__dirname, `../${module}/help.mjs`);
      if (!fs.existsSync(modulePath)) continue;
      const { cmd, description } = await import(modulePath);
      padding = Math.max(padding, module.length);
      output.push({ module, cmd, description });
    }
    const descriptionPad = "".padEnd(padding + 2, " ");
    for (let { module, cmd, description } of output) {
      const CMDS = (Array.isArray(cmd) ? cmd : [cmd]).map((cmd) => {
        if (!cmd) return;
        return `${"$".yellow} ${DEV.yellow} ${cmd.yellow.bold}`;
      });

      const paddedModule = module.padEnd(padding, " ");

      console.log(
        ` ${paddedModule.green.bold} ${"-".gray} ${CMDS.join(", ")}${
          description ? `\n ${descriptionPad} ${description}` : ""
        }\n`
      );
    }

    console.log(
      ` ⚠ You can run ${
        `${DEV} help <command>`.green.bold
      } for more information and more examples about any of the listed commands.`
    );
    return;
  } else {
    const module = args[0];
    const modulePath = path.resolve(__dirname, `../${module}/help.mjs`);
    if (!fs.existsSync(modulePath)) {
      return report.error(`No help available for ${module}.`);
    }
    console.log();
    const { help } = await import(modulePath);
    const { description, commands, configs } = help(DEV);
    console.log(description.map((i) => `  ${i}`).join("\n"));
    console.log();

    if (commands) {
      commands.forEach(({ cmd, description, examples }) => {
        console.log(`${"$".yellow} ${DEV.green} ${cmd.green.bold}`);
        console.log(`  ${description}\n`);
        if (examples) {
          console.log("  some examples:\n".blue);
          examples.forEach(({ cmd, description }) => {
            console.log(`  + ${DEV.green} ${cmd.yellow.bold}`);
            console.log(`    ${description}\n`);
          });
        }
      });
    }

    if (configs) {
      console.log("  configs available:\n".blue);
      configs.forEach(({ key, description, def }) => {
        console.log(
          `  + ${key.yellow} ${def ? `${"default:".gray} ${def.cyan}` : ""}`
        );
        console.log(`    ${description}\n`);
      });
    }
  }
};
