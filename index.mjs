#!/usr/bin/env node

import { load } from "./config/index.mjs";

const { config } = load();
const modules = ["config", "default", "clone", "cd", "shell", "update"];

const cd = (path) => {
  console.error(`COMMAND cd ${path}`);
};

const execute = async () => {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    args.push("default");
  }

  const module = args[0];

  if (!modules.includes(module)) {
    console.log(`Module "${module}" not found.`);
    return;
  }

  const moduleExports = await import(`./${module}/index.mjs`);

  await moduleExports.run({ args: args.slice(1), config, cd });
};

execute();
