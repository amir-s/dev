import "colors";
import type { HelpDocFN } from "../help/help.ts";

export const cmd = ["open", "open pr"];
export const description =
  "open a pull request or the remote repository in a browser";

export const help: HelpDocFN = () => ({
  description: [`open a pull request or the remote repository in a browser.`],
  commands: [
    {
      cmd: "open",
      description: "open the remote repository in a browser.",
    },
    {
      cmd: "open pr [--new]",
      description:
        "open the pull request page for the current branch in a browser.",
      examples: [
        {
          cmd: "open pr --new",
          description:
            "open a new pull request for the current branch in a browser.",
        },
      ],
    },
  ],
});

export const generic = () => {
  console.log(
    "You can run `dev open pr` to open a browser pointing to the pull request."
      .gray
  );
};
