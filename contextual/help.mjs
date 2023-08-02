export const cmd = "<cmd>";
export const description = "run a custom command defined in package.json";

export const help = (DEV) => ({
  description: [
    `You can run any command that is available in the script section of ${
      "package.json".green
    } in the current`,
    `working directory, if there is one. For example, if you have a ${
      "package.json".green
    } file like this:`,
    "",
    `{
    "scripts": {
      "build": "react-scripts build",
    }
  }`.cyan,
    "",
    `You can run ${"dev build".green} to run ${
      "react-scripts build".green
    } in the current working directory.`,
  ],
  commands: [
    {
      cmd: "<cmd> args...",
      description: `run a custom command defined in ${"package.json".green}.`,
    },
  ],
  configs: [
    {
      key: "contextual.node.yarn",
      description: `whether to use ${"yarn".green} instead of ${
        "npm".green
      } to run the command.`,
      def: "false",
    },
  ],
});
