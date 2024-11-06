import "colors";
import { $ } from "zx";
import fetch from "node-fetch";
import report from "yurnalist";
import yn from "yn";

import { spinner } from "../utils/spinner";
import { getCurrentVersion } from "../utils/version";
import type { ModuleRunOptions } from "../internals";

$.verbose = false;

const URL = "https://raw.githubusercontent.com/amir-s/dev/main/package.json";
const PACKAGE = "amir-s/dev";

export const run = async ({ source }: ModuleRunOptions) => {
  report.info("checking for updates...");

  try {
    const currentVersion = getCurrentVersion();

    const version = await spinner(`fetching ${URL}`.gray, async () => {
      const resp = await fetch(URL);
      const { version } = (await resp.json()) as { version: string };
      return version;
    });

    report.success(`found version ${version}`);

    if (version === currentVersion) {
      report.success(
        `You are using the latest version (${version.bold}) of dev.`.green
      );
      return;
    }

    const runUpdate = yn(
      await report.question(
        `update available. update ${currentVersion.green} to ${version.green}? (y/n)`
      )
    );

    if (runUpdate) {
      report.info(`updating to ${version.bold}`);
      report.command(`npm install -g ${PACKAGE}`);

      await spinner("installing", async () => {
        await $`npm install -g ${PACKAGE}`;
      });

      report.success(`updated to ${version.bold}`);
      report.warn(
        "you may need to restart your terminal to use the new version."
      );
      await source();
    }
  } catch (e) {
    report.error(e);
    return;
  }
};
