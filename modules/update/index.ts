import "colors";

import fetch from "node-fetch";
import { $ } from "zx";
import { spinner } from "../../utils/spinner.ts";
import report from "yurnalist";
import yn from "yn";
import { getCurrentVersion } from "../../utils/version.ts";
import type { ModuleRunOptions } from "../../utils/types.ts";

$.verbose = false;

const URL = "https://raw.githubusercontent.com/amir-s/dev/main/deno.json";
const INSTALL_SCRIPT =
  "https://raw.githubusercontent.com/amir-s/dev/refs/heads/main/install.sh";

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
        `You are using the latest version (${version.bold}) of dev.`.green,
      );
      return;
    }

    const runUpdate = yn(
      await report.question(
        `update available. update ${currentVersion.green} to ${version.green}? (y/n)`,
      ),
    );

    if (runUpdate) {
      report.info(`updating to ${version.bold}`);
      report.command(`curl -o- ${INSTALL_SCRIPT} | bash`);

      await spinner("installing", async () => {
        await $`curl -o- ${INSTALL_SCRIPT} | bash`;
      });

      report.success(`updated to ${version.bold}`);
      report.warn(
        "you may need to restart your terminal to use the new version.",
      );
      await source();
    }
  } catch (e) {
    report.error(e);
    return;
  }
};
