import "colors";

import fs from "fs";
import { $ } from "zx";
import path from "path";
import open from "open";
import { Searcher } from "fast-fuzzy";
import report from "yurnalist";

import { spinner } from "../utils/spinner.mjs";
import * as help from "./help.mjs";

$.verbose = false;

const PROTECTED_BRANCHES = [
  "master",
  "develop",
  "dev",
  "staging",
  "production",
  "main",
];

const remoteExists = async (branch) => {
  return await spinner(
    `checking if branch ${branch} exists on remote.`,
    async () => {
      try {
        await $`git ls-remote --heads --exit-code origin ${branch}`;
        return true;
      } catch (e) {
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

const COMMANDS = ["pr"];
const findCommand = (name) => {
  if (COMMANDS.includes(name)) return name;
  const searcher = new Searcher(COMMANDS);
  const [match] = searcher.search(name);
  return match;
};

export const run = async ({ args }) => {
  if (args.length === 0) {
    help.generic();
    return;
  }

  const command = findCommand(args[0]);

  if (!command) {
    help.generic();
    return;
  }

  if (command === "pr") {
    const repoPath = path.resolve(".git");
    if (!fs.existsSync(repoPath)) {
      report.error("you are not in a git repository.");
      report.error(`${repoPath} does not exist`.gray);
      return;
    }

    const branch = (await $`git branch --show-current`).toString().trim();

    if (PROTECTED_BRANCHES.includes(branch.toLowerCase())) {
      report.error(
        `you cannot create a pull request on the ${branch.bold} branch.`
      );
      return;
    }

    if (!(await remoteExists(branch))) {
      const push = await report.question(
        `branch "${branch.bold}" does not exist on remote.\n Do you want to create it? (y/n)`
      );

      if (["y", "yes"].includes(push.toLocaleLowerCase())) {
        await spinner(`pushing ${branch} to origin`, async () => {
          await $`git push origin ${branch}`;
        });
      } else {
        report.error("aborted.".red);
        return;
      }
    }

    const remoteUrl = await getRemoteUrl();
    const newPath = args[1] === "--new" ? "/new" : "";

    open(`${remoteUrl}/pull${newPath}/${branch}`);
    return;
  }
};
