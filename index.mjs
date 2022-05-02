#!/usr/bin/env node

import { Searcher } from "fast-fuzzy";
import { load } from "./config/index.mjs";
import { list as getContextualCommands } from "./contextual/list.mjs";
import fs from "fs";

const { config, writeConfig } = load();
const modules = [
  "config",
  "default",
  "clone",
  "cd",
  "shell",
  "update",
  "open",
  "up",
  "ls",
  // "contextual", this module can not be called directly
];

const writeToFD = async (fd, str) => {
  return new Promise((resolve) => {
    fs.write(fd, str, () => {
      resolve();
    });
  });
};

const cd = async (path) => {
  return await writeToFD(9, `cd:${path}\n`);
};

const findModule = (name) => {
  if (modules.includes(name)) return name;
  const searcher = new Searcher(modules);
  const [match] = searcher.search(name);
  return match;
};

const execute = async () => {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    args.push("default");
  }

  let module = findModule(args[0]);
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

  if (!module) {
    console.log(`Module "${args[0]}" not found.`);
    return;
  }

  const moduleExports = await import(`./${module}/index.mjs`);

  await moduleExports.run({ args: args.slice(1), config, writeConfig, cd });
};

execute();
