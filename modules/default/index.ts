import "colors";

import process from "process";
import { report } from "../../utils/logger.ts";
import { getCurrentVersion } from "../../utils/version.ts";

const URL = "https://github.com/amir-s/dev";

export const run = () => {
  const binaryPath = process.env["DEV_CLI_BIN_PATH"];

  const version = getCurrentVersion();
  report.info(`Hello! This is ${"dev".green} version ${version}.`);
  if (binaryPath && binaryPath !== "dev-cli") {
    report.info(`Using LOCAL DEV @ ${binaryPath.gray}`);
  }
  if (binaryPath === undefined) {
    report.warn(
      "Shell module is not installed. Some commands do not work without it.",
    );
    report.info(
      `You can install it by running ${"dev shell install".inverse}.`,
    );
  }
  report.info(`The documentation and this messages are still WIP.`);
  report.info(
    `You can check ${URL.white.underline} to learn more.`,
  );
  report.info(
    `You can also run ${"dev help".yellow} to see a summary of all the available commands.`,
  );
};
