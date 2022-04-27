import "colors";

import fs from "fs";
import { $, question } from "zx";
import path from "path";
import open from "open";
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
  try {
    await $`git ls-remote --heads --exit-code origin ${branch}`;
    return true;
  } catch (e) {
    return false;
  }
};

const getRemoteUrl = async () => {
  const { stdout } = await $`git config --get remote.origin.url`;
  const url = stdout.trim();
  if (url.trim().startsWith("git@")) {
    return `https://${url.trim().replace(":", "/").slice(4, -4)}`;
  }
  return url.trim().slice(0, -4);
};

export const run = async ({ args }) => {
  if (args.length === 0) {
    help.generic();
    return;
  }

  if (args[0].toLowerCase() !== "pr") {
    help.generic();
    return;
  }

  const repoPath = path.resolve(".git");
  if (!fs.existsSync(repoPath)) {
    console.error("\n You are not in a git repository.".red);
    console.error(` ${repoPath} does not exist`.gray);
    return;
  }

  const branch = (await $`git branch --show-current`).toString().trim();

  if (PROTECTED_BRANCHES.includes(branch.toLowerCase())) {
    console.error(
      `\n You cannot create a pull request on the ${branch.bold} branch.`.red
    );
    return;
  }

  if (!(await remoteExists(branch))) {
    const push = await question(
      `\n Branch "${branch.bold}" does not exist on remote.\n Do you want to create it? (y/n) `
        .white,
      {
        choices: ["y", "n"],
      }
    );

    if (["y", "yes"].includes(push.toLocaleLowerCase())) {
      console.log(`\n Pushing ${branch} to origin`.green);
      await $`git push origin ${branch}`;
    } else {
      console.log(`\n Aborting.`.red);
      return;
    }
  }

  const remoteUrl = await getRemoteUrl();
  const newPath = args[1] === "--new" ? "/new" : "";

  open(`${remoteUrl}/pull${newPath}/${branch}`);
};
