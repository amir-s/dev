import "colors";

export const cmd = "clone <repo> <args>";
export const description =
  "clone a git repository into a new configured directory structure";

export const help = (DEV: string) => ({
  description: [
    `${
      `${DEV} clone <repo>`.yellow
    } clones a git repo locally into ${"~/src/<org>/<user>/<repo>".green} and`,
    `then ${"cd".green}s into that said directory ${
      `(only if shell-module is installed)`.gray
    }.`,
    `any other provided arguments are forwarded to git clone command.`,
  ],
  commands: [
    {
      cmd: "clone <repo> [forward args]",
      description:
        "clone a git repo. <repo> can be either full git URL or just the username and repo name (github will be used by default)",
      examples: [
        {
          cmd: "clone https://github.com/amir-s/dev",
          description: "clone the dev repo from github.",
        },
        {
          cmd: "clone amir-s/dev",
          description: "clone the dev repo from github.",
        },
        {
          cmd: "dev clone amir-s/dev --depth 1 --single-branch",
          description: `clone the dev repo from github with ${
            `--depth 1 --single-branch`.green
          } arguments passed to git clone`,
        },
      ],
    },
  ],
  configs: [
    {
      key: "clone.path",
      description:
        `the directory to clone the repo into. supports ${"<org>".green}, ${"<user>".green}, ${"<repo>".green} placeholders.`,
      def: `"~/src/<org>/<user>/<repo>"`,
    },
    {
      key: "clone.cd",
      description:
        `whether to ${"cd".green} into the cloned repo directory after cloning.`,
      def: "true",
    },
    {
      key: "clone.ssh",
      description:
        `If dev is needs craft the remote url via ${"ssh".green} when a short format repo (example: amir-s/dev) is provided. If set to false, it'll use ${"https".green}.`,
      def: "true",
    },
  ],
});

export const generic = () => {
  console.log("No command specified.".gray);
};
