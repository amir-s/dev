import "colors";

import os from "os";
import path from "path";
import fs from "fs";

import * as help from "./help.mjs";

const homedir = os.homedir();
const configFile = path.join(homedir, ".dev.config.json");

const readConfigFile = () => {
  if (!fs.existsSync(configFile)) {
    fs.writeFileSync(configFile, JSON.stringify({ version: "0.0.1" }));
  }

  return JSON.parse(fs.readFileSync(configFile));
};

const gracefulParse = (json) => {
  try {
    return JSON.parse(json);
  } catch (e) {
    return json;
  }
};

export const load = () => {
  const config = readConfigFile();

  return {
    config: (key, value) => {
      if (value === undefined) return config[key];
      if (config[key] === undefined) {
        config[key] = value;
      }
      return config[key];
    },
    writeConfig: (key, value) => {
      config[key] = value;
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    },
  };
};

export const run = ({ args }) => {
  if (args.length === 0) {
    help.generic();
    return;
  }

  const config = readConfigFile();
  const command = args[0].toLowerCase();
  const key = args[1];

  if (command === "read") {
    console.log(`${JSON.stringify(config, null, 2)}`);
    return;
  }

  if (command === "get") {
    if (config[key] === undefined) {
      console.log(`Key "${key}" not found.`);
    } else {
      console.log(`${key}: ${JSON.stringify(config[key])}`);
    }
    return;
  }

  if (command === "set") {
    if (key === undefined) {
      console.log("Key not specified.");
      return;
    } else {
      if (key === "shell.function" && args[2] === "dev-cli") {
        console.log(
          '\n Cannot set shell.function to "dev-cli"\n Please use some other name.'
            .red
        );
        return;
      }
      config[key] = gracefulParse(args[2]);
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
      console.log(`${key}: ${JSON.stringify(config[key])}`);
      return;
    }
  }
};
