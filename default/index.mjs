import "colors";

import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const URL = "https://github.com/amir-s/dev-cli";

const getCurrentVersion = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const packageFile = path.resolve(__dirname, "../package.json");
  const { version } = JSON.parse(fs.readFileSync(packageFile));
  return version;
};

export const run = () => {
  const version = getCurrentVersion();
  console.log(`\n Hello!\n This is ${"dev".green} version ${version}.`);
  console.log(`\n The documentation and this messages are still WIP`.gray);
  console.log(
    ` ${"You can check".gray} ${URL.white.underline} ${"to learn more".gray}`
  );
};
