import "colors";

import fs from "fs";
import { $, sleep } from "zx";
import path from "path";
import open from "open";
import report from "yurnalist";
import yn from "yn";

import { spinner } from "../../utils/spinner.ts";
import type { ModuleRunOptions } from "../../utils/types.ts";

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

const getRemoteUrl = async (): Promise<string | null> => {
  try {
    const stdout = (await $`git config --get remote.origin.url`).toString();
    const raw = stdout.trim();
    if (!raw) return null;
    if (raw.startsWith("git@")) {
      const hostPath = raw.replace(":", "/").replace(/^git@/, "");
      const withoutGit = hostPath.replace(/\.git$/, "");
      return `https://${withoutGit}`;
    }
    return raw.replace(/\.git$/, "");
  } catch (_) {
    // No remote configured (or git returned non-zero)
    return null;
  }
};

const getCurrentBranch = async (): Promise<string | null> => {
  try {
    const out = (await $`git branch --show-current`).toString();
    const b = out.trim();
    return b.length > 0 ? b : null;
  } catch (_) {
    return null;
  }
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
  if (!remoteUrl) {
    const branch = await getCurrentBranch();
    report.error('this repository does not have a git remote configured (missing "origin").');
    report.info("tip: add a remote and push your branch:".gray);
    report.info(`  ${"git remote add origin URL".bold}`);
    report.info(`  ${`git push -u origin ${branch ?? "BRANCH_NAME"}`.bold}`);
    return;
  }

  const newPath = args[1] === "--new" ? "/new" : "";

  if (!command) {
    await open(`${remoteUrl}`);
    await sleep(100);
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
    await sleep(100);
    return;
  }
};
