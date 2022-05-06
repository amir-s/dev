import { Searcher } from "fast-fuzzy";
import os from "os";
import { globby } from "zx";
import report from "yurnalist";

import * as help from "./help.mjs";

const shellModuleInstalled = () => {
  return !!process.env["DEV_CLI_BIN_PATH"];
};

export const run = async ({ config, args, cd }) => {
  if (!shellModuleInstalled()) {
    report.error("shell module is not installed.");
    report.info("`dev cd` requires shell module to be installed.".gray);
    report.info("you can install it by running `dev shell install`.".gray);

    return;
  }

  const path = config("clone.path", "<home>/src/<org>/<user>/<repo>");

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
      const { org, user, repo } = match.groups;
      return {
        path,
        org,
        user,
        repo,
      };
    })
    .filter((x) => x);

  const searcher = new Searcher(allRepos, {
    keySelector: (x) => `${x.user} ${x.repo}`,
  });

  const [mathced] = searcher.search(args.join(""));

  if (!mathced) {
    report.error(`no repo found for ${args.join(" ")}`);
    return;
  }

  report.command(`cd ${mathced.path}`);
  await cd(mathced.path);
};
