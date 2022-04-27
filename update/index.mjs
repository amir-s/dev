import "colors";

import fetch from "node-fetch";
import fs from "fs";
import { $, question } from "zx";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const URL =
  "https://raw.githubusercontent.com/amir-s/dev-cli/main/package.json";
const PACKAGE = "amir-s/dev-cli";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getCurrentVersion = () => {
  const packageFile = path.resolve(__dirname, "../package.json");
  const { version } = JSON.parse(fs.readFileSync(packageFile));
  return version;
};

export const run = async ({ config }) => {
  const currentVersion = getCurrentVersion();

  console.log(`\n Checking for updates`.green);
  console.log(` Fetching ${URL}`.gray);

  try {
    const resp = await fetch(URL);
    const { version } = await resp.json();

    if (version === currentVersion) {
      console.log(
        `\n You are using the latest version (${version.bold}) of dev-cli.`
          .green
      );
      return;
    }

    const response = await question(
      `\n Update available. Would you like to update ${currentVersion.green} to ${version.green}? (y/n)? `
        .white,
      {
        choices: ["y", "n"],
      }
    );

    if (["y", "yes"].includes(response.toLocaleLowerCase())) {
      console.log(`\n Updating to ${version.bold}\n`.green);

      $`npm install -g ${PACKAGE}`;
    }
  } catch (e) {
    console.log(`\n ${e.message}`.red);
    return;
  }
};
