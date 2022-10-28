import fs from "fs";
import { $ } from "zx";
import report from "yurnalist";
import semver from "semver";
import yn from "yn";

import { spinner } from "../utils/spinner.mjs";

const isInstalled = async (name) => {
  try {
    const { exitCode } = await $`which ${name}`;
    return exitCode === 0;
  } catch (error) {
    return false;
  }
};

const checkVersion = async () => {
  if (!fs.existsSync(".nvmrc")) return true;
  const requiredVersion = fs.readFileSync(".nvmrc", "utf8").trim();
  try {
    const installedVersion = (await $`node -v`).stdout.trim();
    if (semver.satisfies(installedVersion, requiredVersion)) return true;

    report.info(
      `node ${requiredVersion.green} is required ${
        "(via .nvmrc)".gray
      }, but you have ${installedVersion.green}`
    );

    const install = yn(
      await report.question(`install the dependencies anyway? (y/n)`)
    );

    return install;
  } catch (e) {
    report.error("executable node not found.");
    report.error(e.stderr);
    return false;
  }
};

export const installNodeDependencies = async () => {
  if (!(await checkVersion())) {
    report.error("abort installing node dependencies.");
    return;
  }

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
