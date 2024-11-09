import "colors";

import fs from "fs";
import { $ } from "zx";
import path from "path";
import open from "open";
import report from "yurnalist";
import yn from "yn";

import { spinner } from "../utils/spinner.ts";
import type { ModuleRunOptions } from "../main.ts";

$.verbose = false;

const PROTECTED_BRANCHES = [
  "master",
  "develop",
  "dev",
  "staging",
  "production",
  "main",
];

const remoteExists = async (branch: string) => {
  return await spinner(
    `checking if branch ${branch} exists on remote.`,
    async () => {
      try {
        await $`git ls-remote --heads --exit-code origin ${branch}`;
        return true;
      } catch (_) {
        return false;
      }
    }
  );
};

const getRemoteUrl = async () => {
  const { stdout } = await $`git config --get remote.origin.url`;
  const url = stdout.trim();
  if (url.trim().startsWith("git@")) {
    return `https://${url.trim().replace(":", "/").slice(4, -4)}`;
  }
  return url.trim().slice(0, -4);
};

export const run = async ({ args }: ModuleRunOptions) => {
  const repoPath = path.resolve(".git");
  if (!fs.existsSync(repoPath)) {
    report.error("you are not in a git repository.");
    report.error(`${repoPath} does not exist`.gray);
    return;
  }

  const command = args[0];

  const remoteUrl = await getRemoteUrl();
  const newPath = args[1] === "--new" ? "/new" : "";

  if (!command) {
    console.log(remoteUrl);
    await open(`${remoteUrl}`, {
      wait: true,
    });
    return;
  }

  if (command === "pr" || command === "p") {
    const branch = (await $`git branch --show-current`).toString().trim();

    if (PROTECTED_BRANCHES.includes(branch.toLowerCase())) {
      report.error(
        `you cannot create a pull request on the ${branch.bold} branch.`
      );
      return;
    }

    if (!(await remoteExists(branch))) {
      report.info(`branch "${branch.bold}" does not exist on remote.`);
      const push = yn(
        await report.question(
          `do you want to push this branch on remote? (y/n)`
        )
      );

      if (push) {
        await spinner(`pushing ${branch} to origin`, async () => {
          await $`git push origin ${branch}`;
        });
        report.success(`pushed branch ${branch.bold} to origin.`);
      } else {
        report.info("aborting.");
        return;
      }
    }

    await open(`${remoteUrl}/pull${newPath}/${branch}`);
    return;
  }
};
