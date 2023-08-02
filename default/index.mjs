import "colors";

import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const URL = "https://github.com/amir-s/dev";

const getCurrentVersion = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const packageFile = path.resolve(__dirname, "../package.json");
  const { version } = JSON.parse(fs.readFileSync(packageFile));
  return version;
};

export const run = ({ config }) => {
  const binaryPath = process.env["DEV_CLI_BIN_PATH"];

  const version = getCurrentVersion();
  console.log(`\n Hello!\n This is ${"dev".green} version ${version}.`);
  if (binaryPath && binaryPath !== "dev-cli") {
    console.log(`\n -> ${"Using LOCAL DEV".inverse} @ ${binaryPath.gray}`);
  }
  if (binaryPath === undefined) {
    console.log(
      "\n Shell module is not installed. Some commands do not work without it."
        .yellow
    );
    console.log(
      ` You can install it by running ${"dev shell install".inverse}.`.yellow
    );
  }
  console.log(`\n The documentation and this messages are still WIP.`.gray);
  console.log(
    ` ${"You can check".gray} ${URL.white.underline} ${"to learn more.".gray}`
  );
  console.log(
    ` ${"You can also run".gray} ${"dev help".yellow} ${
      "to see a summary of all the available commands.".gray
    }`
  );
};
