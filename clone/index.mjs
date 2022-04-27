import os from "os";
import fs from "fs";
import { $, globby, question } from "zx";

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

const parseUrl = (urlString) => {
  const url = new URL(urlString);

  const org = url.host;
  const [user, repo] = url.pathname.split("/").slice(1);

  return {
    org,
    user,
    repo,
    url,
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
    repo,
  };
};

const GIT_SHORT_REGEX = /(?<user>[\w.-]+)\/(?<repo>[\w.-]+)/i;

const isShort = (string) => {
  return GIT_SHORT_REGEX.test(string);
};

const parseShort = (str) => {
  const {
    groups: { user, repo },
  } = str.match(GIT_SHORT_REGEX);

  return {
    user,
    repo,
    org: "github.com",
  };
};

const parseArgument = (str) => {
  if (isUrl(str)) {
    return parseUrl(str);
  }

  if (isSsh(str)) {
    return parseSsh(str);
  }

  if (isShort(str)) {
    return parseShort(str);
  }

  return null;
};

export const run = async ({ config, args, cd }) => {
  const path = config("clone.path", "<home>/src/<org>/<user>/<repo>");
  const changeDirectory = config("clone.cd", true);
  const ssh = config("clone.ssh", true);

  if (args.length === 0) {
    help.generic();
    return;
  }

  const parts = parseArgument(args[0]);

  if (!parts) {
    console.log(`Invalid argument: ${args[0]}`);
    return;
  }

  const { org, user, repo } = parts;

  const clonePath = path
    .replace("<home>", os.homedir())
    .replace("<org>", org)
    .replace("<user>", user)
    .replace("<repo>", repo);

  if (fs.existsSync(clonePath)) {
    console.log(`Clone path "${clonePath}" already exists.`);
    if (changeDirectory) {
      cd(clonePath);
    }
    return;
  }

  console.log(`\n Cloning into "${clonePath}"`.gray);

  if (ssh) {
    await $`git clone --depth 1 --single-branch --no-tags git@${org}:${user}/${repo}.git ${clonePath}`;
  } else {
    await $`git clone --depth 1 --single-branch --no-tags https://${org}/${user}/${repo}.git ${clonePath}`;
  }

  if (changeDirectory) {
    cd(clonePath);
  }
};
