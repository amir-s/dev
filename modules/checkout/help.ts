import "colors";

import { report } from "../../utils/logger.ts";

export const cmd = "checkout <branch name>";
export const description = [
  "checkout a new branch localy or from remote with tracking.",
];

export const help = (DEV: string) => ({
  description: [
    `${
      `${DEV} checkout <branch name>`.yellow
    } will checkout a new branch locally or from remote with tracking.`,
    "+ if the branch exists locally, it will be checked out.",
    "+ if the branch exists remotely, it will be checked out with tracking.",
    "+ if the branch is already checked out in a worktree, you will be prompted to:",
    "  - cd into the worktree (default)",
    "  - delete and prune the worktree, then checkout here (fails if worktree has uncommitted changes)",
    "  - abort",
  ],
  commands: [
    {
      cmd: "checkout <branch name>",
      description:
        "checkout a new branch locally or from remote with tracking.",
      examples: [
        {
          cmd: "checkout fix-123",
          description: "checkout a new branch named fix-123.",
        },
        {
          cmd: "checkout brand-new-feature",
          description:
            "create a branch called `brand-new-feature` and check it out from remote and setup tracking.",
        },
      ],
    },
  ],
});

export const generic = () => {
  report.info("No branch specified.");
};
