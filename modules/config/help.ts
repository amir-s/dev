import "colors";
import type { HelpDocFN } from "../internals";

export const cmd = "config set <key> <value>";
export const description = "set or read a configuration value";

export const help: HelpDocFN = (DEV) => ({
  description: [
    `set overrides for the configuration of ${DEV.green} via ${
      "config".green
    }.`,
    `The configuration files lives in ${"~/.dev.config.json".green}.`,
  ],
  commands: [
    {
      cmd: "config set <key> [value]",
      description:
        "set a configuration value. to reset a key, run the command with no value.",
      examples: [
        {
          cmd: "config set shell.function blah",
          description: "set the shell function name to 'blah'.",
        },
        {
          cmd: "config set clone.cd false",
          description: "set clone.cd config to false.",
        },
        {
          cmd: "config set clone.cd",
          description: "reset clone.cd config to its default.",
        },
      ],
    },
    {
      cmd: "config read",
      description: "read the configuration file.",
    },
  ],
});

export const generic = () => {
  console.log("No command specified.".gray);
};
