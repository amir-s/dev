import { $ } from "zx";
import { report } from "../../utils/logger.ts";
import process from "process";
import inquirer from "inquirer";

$.verbose = false;

import * as help from "./help.ts";
import type { ModuleRunOptions } from "../../utils/types.ts";

const findWorktreePath = async (branch: string): Promise<string | null> => {
  const result = await $`git worktree list --porcelain`;
  const blocks = result.stdout.trim().split("\n\n");
  for (const block of blocks) {
    const lines = block.trim().split("\n");
    const worktreeLine = lines.find((l) => l.startsWith("worktree "));
    const branchLine = lines.find((l) => l.startsWith("branch "));
    if (
      worktreeLine &&
      branchLine &&
      (branchLine.endsWith(`/${branch}`) || branchLine === `branch ${branch}`)
    ) {
      return worktreeLine.replace("worktree ", "").trim();
    }
  }
  return null;
};

export const run = async ({ args, cd }: ModuleRunOptions) => {
  if (args.length === 0) {
    help.generic();
    return;
  }

  const remote = (await $`git remote`).stdout.trim();
  if (remote === "") {
    report.error("no remote found.");
    process.exit(1);
  }

  if (remote.split("\n").length > 1) {
    report.error("multiple remotes found. this is currently not supported.");
    process.exit(1);
  }

  const branch = args[0];

  const branchExistsLocally = await $`git branch --list ${branch}`;
  if (branchExistsLocally.stdout.trim() !== "") {
    // Check if the branch is already checked out in a worktree
    let worktreePath: string | null = null;
    try {
      worktreePath = await findWorktreePath(branch);
    } catch (_) {
      // ignore, proceed normally
    }

    if (worktreePath) {
      report.warn(
        `Branch ${branch.yellow} is already checked out at ${worktreePath.cyan}`,
      );

      const { action } = await inquirer.prompt<{ action: string }>([
        {
          type: "list",
          name: "action",
          message: "What do you want to do?",
          choices: [
            { name: `cd into ${worktreePath}`, value: "cd" },
            {
              name: "delete and prune the worktree, then checkout here",
              value: "delete",
            },
            { name: "abort", value: "abort" },
          ],
          default: "cd",
        },
      ]);

      if (action === "abort") {
        report.info("Aborted.");
        process.exit(0);
      }

      if (action === "cd") {
        report.command(`cd ${worktreePath}`);
        await cd(worktreePath);
        process.exit(0);
      }

      if (action === "delete") {
        report.command(`git worktree remove ${worktreePath}`);
        try {
          await $`git worktree remove ${worktreePath}`;
        } catch (_) {
          report.error(
            `Worktree at ${worktreePath.cyan} has uncommitted changes. cd into it and clean up first.`,
          );
          process.exit(1);
        }
        report.command(`git worktree prune`);
        await $`git worktree prune`;
        report.success(`Worktree at ${worktreePath.cyan} removed.`);
      }
    }

    report.command(`git checkout ${branch}`);
    await $`git checkout ${branch}`;
    process.exit(0);
  }

  const branchExistsRemotely =
    await $`git ls-remote --heads ${remote} ${branch}`;

  if (branchExistsRemotely.stdout.trim()) {
    report.success(
      `branch ${branch.green} exists on ${remote.yellow}. checking it out with tracking.`,
    );
    report.command(`git checkout --track ${remote}/${branch}`);
    await $`git checkout --track ${remote}/${branch}`;
  } else {
    report.success(
      `Creating a new branch ${branch} and setting it to track on ${remote}.`,
    );
    report.command(`git checkout -b ${branch}`);
    await $`git checkout -b ${branch}`;
  }

  process.exit(0);
};
