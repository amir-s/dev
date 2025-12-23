import os from "os";
import { globby } from "zx";
import report from "yurnalist";
import process from "process";
import { stringCloseness } from "../../utils/stringCloseness.ts";

import * as help from "./help.ts";
import type { ModuleRunOptions } from "../../utils/types.ts";

function notEmpty<TValue>(value: TValue): value is NonNullable<TValue> {
  return value !== null && value !== undefined;
}

const shellModuleInstalled = () => {
  return !!process.env["DEV_CLI_BIN_PATH"];
};

interface RepoData {
  user: string;
  repo: string;
  path: string;
}

export const calculateCloseness = (repo: RepoData, requestedString: string) => {
  // calculate closeness for both full path and repo name
  // we get the maximum of the two and add 1 if both are > 0 to give a slight preference
  // to strings that match both the full path and the repo name

  const fullPathCloseness = stringCloseness(
    `${repo.user}${repo.repo}`.toLocaleLowerCase(),
    requestedString,
  );
  const repoNameCloseness = stringCloseness(
    `${repo.repo}`.toLocaleLowerCase(),
    requestedString,
  );

  let closeness = Math.max(fullPathCloseness, repoNameCloseness);
  if (fullPathCloseness > 0 && repoNameCloseness > 0) closeness += 1;

  return closeness;
};

export const findMatch = (allRepos: RepoData[], requestedString: string) => {
  return allRepos.reduce<{
    closeness: number;
    repo: RepoData | null;
  }>(
    (candidate, repo) => {
      const closeness = calculateCloseness(repo, requestedString);

      if (closeness > candidate.closeness) return { closeness, repo };
      return candidate;
    },
    {
      closeness: -Infinity,
      repo: null,
    },
  );
};

export const run = async ({ config, args, cd }: ModuleRunOptions) => {
  if (!shellModuleInstalled()) {
    report.error("shell module is not installed.");
    report.info("`dev cd` requires shell module to be installed.".gray);
    report.info("you can install it by running `dev shell install`.".gray);

    return;
  }

  const path = config("clone.path", "<home>/src/<org>/<user>/<repo>")!;

  if (args.length === 0) {
    help.generic();
    return;
  }

  const clonePath = path
    .replace("<home>", os.homedir())
    .replace("<org>", "*")
    .replace("<user>", "*")
    .replace("<repo>", "*");

  const clonePathRegex = path
    .replace("<home>", os.homedir())
    .replace("<org>", "(?<org>[\\w.\\-]+)")
    .replace("<user>", "(?<user>[\\w.\\-]+)")
    .replace("<repo>", "(?<repo>[\\w.\\-]+)");

  const paths = await globby([clonePath], {
    onlyDirectories: true,
    onlyFiles: false,
  });

  const allRepos = paths
    .map((path) => {
      const match = path.match(new RegExp(clonePathRegex));
      if (!match) return null;
      const { org, user, repo } = match.groups!;
      return {
        path,
        org,
        user,
        repo,
      };
    })
    .filter(notEmpty);

  const requestedString = args.join("").toLocaleLowerCase();

  const matched = findMatch(allRepos, requestedString);

  if (!matched.repo) {
    report.error(`no repo found for ${args.join(" ")}`);
    return;
  }

  report.command(`cd ${matched.repo.path}`);
  await cd(matched.repo.path);
};
