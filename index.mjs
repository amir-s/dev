#!/usr/bin/env node

import { Searcher } from "fast-fuzzy";
import { load } from "./config/index.mjs";

const { config, writeConfig } = load();
const modules = ["config", "default", "clone", "cd", "shell", "update", "open"];

const cd = (path) => {
  console.error(`COMMAND cd ${path}`);
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

  const module = findModule(args[0]);

  if (!module) {
    console.log(`Module "${module}" not found.`);
    return;
  }

  const moduleExports = await import(`./${module}/index.mjs`);

  await moduleExports.run({ args: args.slice(1), config, writeConfig, cd });
};

execute();
