#!/usr/bin/env node

import fs from "fs";
import os from "os";
import path from "path";

import { load } from "./config/index.mjs";
import { stringCloseness } from "./internals/index.mjs";
import { list as getContextualCommands } from "./contextual/list.mjs";

import { SHELLS } from "./shell/index.mjs";

const { config, writeConfig } = load();
const modules = {
  config: {},
  default: { indirect: true },
  clone: {},
  cd: {},
  shell: {},
  update: {},
  open: {},
  up: {},
  ls: {},
  projects: {},
  contextual: { indirect: true },
};

const writeToFD = async (fd, str) => {
  return new Promise((resolve) => {
    fs.write(fd, str, () => {
      resolve();
    });
  });
};

const shellExec = async (cmd) => {
  const { DEV_CLI_CMD_EXEC_FILE } = process.env;
  const command = `${cmd}\n`;

  if (DEV_CLI_CMD_EXEC_FILE) {
    return fs.appendFileSync(DEV_CLI_CMD_EXEC_FILE, command);
  }

  return writeToFD(9, command);
};

const cd = (path) => shellExec(`cd:${path}`);

const source = () => {
  const currentShellType = (
    process.env.DEV_CLI_SHELL_TYPE || "unknown"
  ).toLowerCase();

  const shell = SHELLS.find((shell) => shell.name === currentShellType);
  if (!shell) return;

  return shellExec(`source:${path.resolve(os.homedir(), shell.profile)}`);
};

const findModule = (name) => {
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

const execute = async () => {
  const args = process.argv.slice(2);

  let module = null;

  if (args.length === 0) {
    module = "default";
  } else {
    module = findModule(args[0]);

    const isFuzzy = module !== args[0];
    const contextualCommands = await getContextualCommands();

    // execute contextual command only when
    // there is no built-in module OR module is fuzzy matched but the exact command exists in contextual commands
    if (
      (!module && contextualCommands.includes(module)) ||
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

  const moduleExports = await import(`./${module}/index.mjs`);

  await moduleExports.run({
    args: args.slice(1),
    config,
    writeConfig,
    cd,
    source,
  });
};

execute();
