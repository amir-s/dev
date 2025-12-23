import os from "os";
import { globby } from "zx";
import report from "yurnalist";
import { calculateCloseness } from "../cd/index.ts";
import type { ModuleRunOptions } from "../../utils/types.ts";

function notEmpty<TValue>(value: TValue): value is NonNullable<TValue> {
  return value !== null && value !== undefined;
}

function group<T>(repos: T[], key: keyof T) {
  const groups: {
    [key: string]: T[];
  } = {};
  repos.forEach((repo) => {
    const groupKey = String(repo[key]);
    if (groups[groupKey] === undefined) groups[groupKey] = [];
    groups[groupKey].push(repo);
  });
  return groups;
}

export const run = async ({ args, config }: ModuleRunOptions) => {
  const path = config("clone.path", "<home>/src/<org>/<user>/<repo>")!;

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
    (arg) => arg === "-u" || arg === "--user",
  );
  const orgFilterIndex = args.findIndex(
    (arg) => arg === "-o" || arg === "--org",
  );
  const userFilter = userFilterIndex < 0 ? null : args[userFilterIndex + 1];
  const orgFilter = orgFilterIndex < 0 ? null : args[orgFilterIndex + 1];

  const searchIndex = args.findIndex(
    (arg, i) =>
      !arg.startsWith("-") && (i - 1 < 0 || !args[i - 1].startsWith("-")),
  );
  const search = searchIndex < 0 ? null : args[searchIndex];

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
        friendlyPath: path.startsWith(os.homedir())
          ? `~${path.slice(os.homedir().length)}`
          : path,
        closeness: 0,
      };
    })
    .filter(notEmpty)
    .filter((x) => {
      if (orgFilter && x.org !== orgFilter) return false;
      if (userFilter && x.user !== userFilter) return false;
      return true;
    })
    .map((repo) => {
      if (search) {
        const closeness = calculateCloseness(repo, search);
        return { ...repo, closeness };
      }
      return repo;
    })
    .filter((repo) => {
      if (search) {
        return repo.closeness > 0;
      }
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
      repos.sort((a, b) => {
        if (a.closeness && b.closeness) {
          return b.closeness - a.closeness;
        }
        return a.repo.localeCompare(b.repo);
      });
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
