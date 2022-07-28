import os from "os";
import fs from "fs";
import { $, nothrow } from "zx";
import report from "yurnalist";
import { spinner } from "../utils/spinner.mjs";

$.verbose = false;

import * as help from "./help.mjs";

const isUrl = (string) => {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
};

const removeGitPostfix = (str) => {
  if (str.endsWith(".git")) {
    return str.slice(0, -4);
  }
  return str;
};

const parseUrl = (urlString) => {
  const url = new URL(urlString);

  const org = url.host;
  const [user, repo] = url.pathname.split("/").slice(-2);

  return {
    org,
    user,
    repo: removeGitPostfix(repo),
    remote: urlString,
  };
};

const GIT_SSH_REGEX =
  /git@(?<org>[\w.]+):(?:\/\/)?(?<user>[\w.-]+)\/(?<repo>[\w.-]+)(?:\.git)(?:\/)?/i;

const isSsh = (string) => {
  return GIT_SSH_REGEX.test(string);
};

const parseSsh = (str) => {
  const {
    groups: { org, user, repo },
  } = str.match(GIT_SSH_REGEX);

  return {
    org,
    user,
    repo: removeGitPostfix(repo),
    remote: str,
  };
};

const GIT_SHORT_REGEX = /(?<user>[\w.-]+)\/(?<repo>[\w.-]+)/i;

const isShort = (string) => {
  return GIT_SHORT_REGEX.test(string);
};

const parseShort = (str, ssh) => {
  const org = "github.com";
  const {
    groups: { user, repo },
  } = str.match(GIT_SHORT_REGEX);

  const sanitizedRepo = removeGitPostfix(repo);

  const remote = ssh
    ? `git@${org}:${user}/${sanitizedRepo}.git`
    : `https://${org}/${user}/${sanitizedRepo}.git`;

  return {
    org,
    user,
    repo: sanitizedRepo,
    remote,
  };
};

export const parseArgument = (str, { ssh }) => {
  if (isUrl(str)) {
    return parseUrl(str);
  }

  if (isSsh(str)) {
    return parseSsh(str);
  }

  if (isShort(str)) {
    return parseShort(str, ssh);
  }

  return null;
};

export const run = async ({ config, args, cd }) => {
  const path = config("clone.path", "<home>/src/<org>/<user>/<repo>");
  const changeDirectory = config("clone.cd", true);
  const ssh = config("clone.ssh", true);
  const singleBranch = config("clone.branch.single", false);
  const depth = config("clone.depth", null);
  const tags = config("clone.tags", true);

  if (args.length === 0) {
    help.generic();
    return;
  }

  const parts = parseArgument(args[0], { ssh });

  if (!parts) {
    report.error(`invalid argument: ${args[0]}`);
    return;
  }

  const { org, user, repo, remote } = parts;

  const clonePath = path
    .replace("<home>", os.homedir())
    .replace("<org>", org)
    .replace("<user>", user)
    .replace("<repo>", repo);

  if (fs.existsSync(clonePath)) {
    report.warn(`clone path "${clonePath}" already exists.`);
    report.command(`cd ${clonePath}`);
    if (changeDirectory) {
      await cd(clonePath);
    }
    return;
  }

  const singleBranchArg = singleBranch ? "--single-branch" : "";
  const depthArg = depth !== null ? `--depth ${depth}` : "";
  const tagsArg = tags ? "" : "--no-tags";

  const result = await spinner(
    `cloning ${user}/${repo} into ${clonePath}`,
    async () => {
      return await nothrow(
        $`git clone ${depthArg} ${singleBranchArg} ${tagsArg} ${remote} ${clonePath}`
      );
    }
  );

  if (result.exitCode !== 0) {
    report.error(`failed to clone ${user}/${repo} into ${clonePath}`);
    report.error(result.stderr);
    return;
  }

  report.success("clone complete");

  if (changeDirectory) {
    report.command(`cd ${clonePath}`);
    await cd(clonePath);
  }
};
