import { $, fs } from "zx";
import report from "yurnalist";
import process from "process";
import { spinner } from "../../utils/spinner.ts";
import inquirer from "inquirer";

import type { ModuleRunOptions } from "../../utils/types.ts";

import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo("en-US");

$.verbose = false;

export const run = async ({}: ModuleRunOptions) => {
  if (!(await fs.exists(".git"))) {
    report.error(`not a git repository in ${process.cwd().yellow}`);
    return;
  }

  const result = await $`git symbolic-ref refs/remotes/origin/HEAD`;
  const mainBranch = result.stdout.split("/").pop()?.trim();

  if (!mainBranch) {
    report.error("could not determine main branch");
    return;
  }

  const mergedBranches = await $`git branch --merged ${mainBranch}`;
  const branches = await Promise.all(
    mergedBranches.stdout
      .split("\n")
      .map((branch) => branch.replace(/^\* /, "").trim())
      .filter((branch) => branch !== mainBranch && branch !== "")
      .map(async (branch) => {
        const lastCommit = (
          await $`git log -1 --pretty=format:"%h %s" ${branch}`
        ).stdout;
        const date = (
          await $`git log -1 --pretty=format:"%cd" --date=short ${branch}`
        ).stdout;

        return {
          branch,
          lastHash: lastCommit.split(" ")[0],
          lastCommit: lastCommit.split(" ").slice(1).join(" "),
          ago: timeAgo.format(new Date(date), "mini"),
        };
      }),
  );

  const agoMaxLen = branches.reduce(
    (max, branch) => Math.max(max, branch.ago.length),
    0,
  );

  const branchMaxLen = branches.reduce(
    (max, branch) => Math.max(max, branch.branch.length),
    0,
  );

  if (branches.length === 0) {
    report.info("No branches to delete");
    return;
  }

  report.info(
    `found these branches that are merged into ${mainBranch.green.bold}`,
  );

  const { deleteBranches } = await inquirer.prompt<{
    deleteBranches: {
      branch: string;
      lastHash: string;
      lastCommit: string;
      ago: string;
    }[];
  }>([
    {
      type: "checkbox",
      loop: false,
      pageSize: 10,
      message: "Select branches to delete",
      name: "deleteBranches",
      choices: [
        ...branches.map((branch) => ({
          name: `${branch.branch.padEnd(branchMaxLen)} ${
            `[${branch.lastHash}`.gray
          } ${
            branch.ago.padStart(agoMaxLen).yellow
          }${"]".gray} ${branch.lastCommit.green}`,
          value: branch,
        })),
      ],
    },
  ]);

  if (deleteBranches.length === 0) {
    report.info("No branches selected");
    return;
  }

  const confirm = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message:
        `Are you sure you want to delete ${deleteBranches.length} branches?`,
    },
  ]);

  if (!confirm.confirm) {
    report.info("Aborted");
    return;
  }

  await spinner("Deleting branches", () => {
    return Promise.all(
      deleteBranches.map(async (branch) => {
        await $`git branch -d ${branch.branch}`;
      }),
    );
  });

  report.success(`deleted ${deleteBranches.length} branches`);
  process.exit(0);
};
