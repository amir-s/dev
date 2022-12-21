import os from "os";
import { globby } from "zx";
import report from "yurnalist";

const group = (repos, key) => {
  const groups = {};
  repos.forEach((repo) => {
    if (groups[repo[key]] === undefined) groups[repo[key]] = [];
    groups[repo[key]].push(repo);
  });
  return groups;
};

export const run = async ({ args, config }) => {
  const path = config("clone.path", "<home>/src/<org>/<user>/<repo>");

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

  const showPaths = args.includes("-p");

  const userFilterIndex = args.findIndex(
    (arg) => arg === "-u" || arg === "--user"
  );
  const orgFilterIndex = args.findIndex(
    (arg) => arg === "-o" || arg === "--org"
  );
  const userFilter = userFilterIndex < 0 ? null : args[userFilterIndex + 1];
  const orgFilter = orgFilterIndex < 0 ? null : args[orgFilterIndex + 1];

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
        friendlyPath: path.startsWith(os.homedir())
          ? `~${path.slice(os.homedir().length)}`
          : path,
      };
    })
    .filter((x) => {
      if (x === null) return false;
      if (orgFilter && x.org !== orgFilter) return false;
      if (userFilter && x.user !== userFilter) return false;
      return true;
    });

  let output = "";
  const groups = group(allRepos, "org");
  const arrow = "›";
  Object.keys(groups).forEach((org) => {
    output += ` ${arrow} ${org.gray}\n`;
    const users = group(groups[org], "user");
    Object.keys(users).forEach((user) => {
      output += `   ${arrow} ${user.green}\n`;
      const repos = users[user];
      repos.forEach((repo) => {
        output += `     ${arrow} ${repo.repo.white}`;
        if (showPaths) output += ` ${repo.friendlyPath.gray}`;
        output += "\n";
      });
      output += "\n";
    });
    output += "\n";
  });

  report.success(`found these projects:\n\n${output.trim()}`);
};
