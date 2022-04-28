#!/usr/bin/env node

import { Searcher } from "fast-fuzzy";
import { load } from "./config/index.mjs";
import fs from "fs";

const { config, writeConfig } = load();
const modules = ["config", "default", "clone", "cd", "shell", "update", "open"];

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

  const module = findModule(args[0]);

  if (!module) {
    console.log(`Module "${args[0]}" not found.`);
    return;
  }

  const moduleExports = await import(`./${module}/index.mjs`);

  await moduleExports.run({ args: args.slice(1), config, writeConfig, cd });
};

execute();
