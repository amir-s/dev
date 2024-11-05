import "colors";

export const cmd = "cd <project>";
export const description =
  "change the current working directory to where <project> is located";

export const help = () => ({
  description: [
    `changes the current working directory to a cloned repo by ${
      "fuzzy matching".cyan
    } the input name.`,
    `shell module must be installed for this command to work.`,
  ],
  commands: [
    {
      cmd: "cd <project>",
      description:
        "change the current working directory to where <project> is located.",
      examples: [
        {
          cmd: "cd dev",
          description: "goes to ~/src/github.com/amir-s/dev",
        },
        {
          cmd: "cd fbreact",
          description: "goes to ~/src/github.com/facebook/react",
        },
      ],
    },
  ],
});

export const generic = () => {};
