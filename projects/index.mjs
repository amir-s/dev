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

export const run = async ({ config }) => {
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
        output += `     ${arrow} ${repo.repo.white}\n`;
      });
      output += "\n";
    });
    output += "\n";
  });

  report.success(`found these projects:\n\n${output.trim()}`);
};
