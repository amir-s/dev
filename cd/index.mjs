import { Searcher } from "fast-fuzzy";
import os from "os";
import { $, globby, question } from "zx";

import * as help from "./help.mjs";

export const run = async ({ config, args, cd }) => {
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
    console.log("No repo found");
    return;
  }

  await cd(mathced.path);
};
