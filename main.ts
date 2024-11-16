#!/usr/bin/env -S deno run -A

import fs from "fs";
import os from "os";
import path from "path";
import process from "process";

import sudoBlock from "sudo-block";

import { load } from "./modules/config/index.ts";
import { stringCloseness } from "./utils/stringCloseness.ts";
import { list as getContextualCommands } from "./modules/contextual/list.ts";

import { SHELLS } from "./modules/shell/index.ts";
import { getCurrentVersion } from "./utils/version.ts";

import type { ModuleRunOptions } from "./utils/types.ts";

export const modules = {
  config: {},
  default: { indirect: true },
  clone: {},
  clean: {},
  checkout: {},
  cd: {},
  shell: {},
  update: {},
  open: {},
  up: {},
  ls: {},
  projects: {},
  contextual: { indirect: true },
  lan: {},
  ip: {},
  help: {},
  debug: {},
  _cd: {},
} as Record<string, { indirect?: boolean }>;

const { config, writeConfig } = load();

const shellExec = (cmd: string): unknown => {
  const { DEV_CLI_CMD_EXEC_FILE } = process.env;
  const command = `${cmd}\n`;

  if (DEV_CLI_CMD_EXEC_FILE) {
    return fs.appendFileSync(DEV_CLI_CMD_EXEC_FILE, command);
  }

  console.log(
    "DEV_CLI_CMD_EXEC_FILE has no value, possibly because shell module is not installed"
  );

  return null;
};

const cd = (path: string): unknown => shellExec(`cd:${path}`);

const source = (): unknown => {
  const currentShellType = (
    process.env.DEV_CLI_SHELL_TYPE || "unknown"
  ).toLowerCase();

  const shell = SHELLS.find((shell) => shell.name === currentShellType);
  if (!shell) return;

  return shellExec(`source:${path.resolve(os.homedir(), shell.profile)}`);
};

const findModule = (name: string) => {
  if (modules[name] && !modules[name].indirect) return name;
  const { module, closeness } = Object.keys(modules)
    .filter((name) => !modules[name].indirect)
    .reduce(
      (candidate, module) => {
        const closeness = stringCloseness(module, name);
        if (closeness > candidate.closeness) return { closeness, module };
        if (
          closeness === candidate.closeness &&
          module.length > candidate.module.length
        )
          return { closeness, module };
        return candidate;
      },
      {
        closeness: -Infinity,
        module: "",
      }
    );
  if (module && closeness > -Infinity) return module;
  return null;
};

const checkForSudo = () => {
  sudoBlock(
    `\n${
      "You are running `dev` with sudo. This is not recommended".red.bold
    }.\nIf need this, please provide feedback at ${
      "https://github.com/amir-s/dev/issues/new".blue
    } so we can improve the experience.\n`
  );
};

const execute = async () => {
  checkForSudo();

  const args = process.argv.slice(2);

  let module: string | null = null;

  if (args[0] === "-v" || args[0] === "--version") {
    console.log(getCurrentVersion());
    process.exit(0);
  }

  if (args.length === 0) {
    module = "default";
  } else {
    module = findModule(args[0]);

    const isFuzzy = module !== args[0];
    const contextualCommands = await getContextualCommands();

    // execute contextual command only when
    // there is no built-in module OR module is fuzzy matched but the exact command exists in contextual commands
    if (
      (!module && contextualCommands.includes(args[0])) ||
      (isFuzzy && contextualCommands.includes(args[0]))
    ) {
      args.unshift("contextual");
      module = args[0];
    }
  }

  if (!module) {
    console.log(`Module "${args[0]}" not found.`);
    return;
  }

  const moduleExports = await import(`./modules/${module}/index.ts`);

  await moduleExports.run({
    args: args.slice(1),
    config,
    writeConfig,
    cd,
    source,
  } as ModuleRunOptions);
};

execute();
