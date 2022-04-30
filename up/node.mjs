import fs from "fs";
import { $ } from "zx";
import report from "yurnalist";
import { spinner } from "../utils/spinner.mjs";

const isInstalled = async (name) => {
  try {
    const { exitCode } = await $`which ${name}`;
    return exitCode === 0;
  } catch (error) {
    return false;
  }
};

export const installNodeDependencies = async () => {
  if (fs.existsSync("yarn.lock")) {
    if (!(await isInstalled("yarn"))) {
      report.error("`yarn.lock` is found but `yarn` is not installed.");
      report.info("you can install yarn with `npm i -g yarn`");
      return;
    }
    const installed = await spinner(
      "installing node dependencies with `yarn`...",
      async () => {
        const { exitCode, stderr } = await $`yarn`;
        if (exitCode !== 0) {
          report.error(stderr);
          return false;
        }
        return true;
      }
    );
    if (!installed) {
      report.error("failed to install node dependencies.");
      return;
    }
  } else {
    const installed = await spinner(
      "installing node dependencies with `npm`...",
      async () => {
        const { exitCode, stderr } = await $`npm install`;
        if (exitCode !== 0) {
          report.error(stderr);
          return false;
        }
        return true;
      }
    );
    if (!installed) {
      report.error("failed to install node dependencies.");
      return;
    }
  }

  report.success("node dependencies installed.");
};
