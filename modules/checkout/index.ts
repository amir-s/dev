import { $ } from "zx";
import report from "yurnalist";
import process from "process";

$.verbose = false;

import * as help from "./help.ts";
import type { ModuleRunOptions } from "../../utils/types.ts";

export const run = async ({ args }: ModuleRunOptions) => {
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
    report.command(`git checkout ${branch}`);
    await $`git checkout ${branch}`;
    process.exit(0);
  }

  const branchExistsRemotely =
    await $`git ls-remote --heads ${remote} ${branch}`;

  if (branchExistsRemotely.stdout.trim()) {
    report.success(
      `branch ${branch.green} exists on ${remote.yellow}. checking it out with tracking.`
    );
    report.command(`git checkout --track ${remote}/${branch}`);
    await $`git checkout --track ${remote}/${branch}`;
  } else {
    report.success(
      `Creating a new branch ${branch} and setting it to track on ${remote}.`
    );
    report.command(`git checkout -b ${branch}`);
    await $`git checkout -b ${branch}`;
  }

  process.exit(0);
};
