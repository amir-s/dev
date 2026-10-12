import os from "os";
import fs from "fs";
import { $ } from "zx";
import report from "../../utils/report.ts";
import { spinner } from "../../utils/spinner.ts";

$.verbose = false;

import * as help from "./help.ts";
import type { ModuleRunOptions } from "../../utils/types.ts";

const isUrl = (string: string) => {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
};

const removeGitPostfix = (str: string) => {
  if (str.endsWith(".git")) {
    return str.slice(0, -4);
  }
  return str;
};

const parseUrl = (urlString: string) => {
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

const isSsh = (string: string) => {
  return GIT_SSH_REGEX.test(string);
};

const parseSsh = (str: string) => {
  const { org, user, repo } = str.match(GIT_SSH_REGEX)?.groups || {};

  return {
    org,
    user,
    repo: removeGitPostfix(repo),
    remote: str,
  };
};

const GIT_SHORT_REGEX = /(?<user>[\w.-]+)\/(?<repo>[\w.-]+)/i;

const isShort = (string: string) => {
  return GIT_SHORT_REGEX.test(string);
};

const parseShort = (str: string, ssh: boolean) => {
  const org = "github.com";
  const { user, repo } = str.match(GIT_SHORT_REGEX)!.groups || {};

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

export const parseArgument = (
  str: string,
  {
    ssh,
  }: {
    ssh: boolean;
  },
) => {
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

export const run = async ({ config, args, cd }: ModuleRunOptions) => {
  const path = config("clone.path", "<home>/src/<org>/<user>/<repo>")!;
  const changeDirectory = config("clone.cd", true);
  const ssh = config("clone.ssh", true)!;

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
    if (changeDirectory) {
      report.command(`cd ${clonePath}`);
      await cd(clonePath);
    }
    return;
  }

  const forwardedArgs = args.slice(1);
  report.command(`git clone ${forwardedArgs.join(" ")} ${remote} ${clonePath}`);
  const result = await spinner(
    `cloning ${user}/${repo} into ${clonePath}`,
    async () => {
      if (remote.startsWith("git@")) {
        return await $`GIT_SSH_COMMAND='ssh -o StrictHostKeyChecking=yes' git clone ${forwardedArgs} ${remote} ${clonePath}`
          .nothrow();
      }
      return await $`git clone ${forwardedArgs} ${remote} ${clonePath}`
        .nothrow();
    },
  );

  if (result.exitCode !== 0) {
    report.error(`failed to clone ${user}/${repo} into ${clonePath}`);
    report.error(result.stderr);
    if (result.stderr.includes("Host key verification failed")) {
      report.info(
        `Verify ${org}'s SSH host key fingerprint with the provider and add it to known_hosts before retrying.`,
      );
    }
    return;
  }

  report.success("clone complete");

  if (changeDirectory) {
    report.command(`cd ${clonePath}`);
    await cd(clonePath);
  }
};
