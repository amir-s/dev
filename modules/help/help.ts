import "colors";

export interface HelpDoc {
  description: string[];
  commands?: {
    cmd: string;
    description: string;
    examples?: { cmd: string; description: string }[];
  }[];
  configs?: {
    key: string;
    description: string;
    def: string;
  }[];
}
export type HelpDocFN = (DEV: string) => HelpDoc;

export const cmd = "help <command>";
export const description = "show help for a command";

export const help = () => ({
  description: [
    `get help for a specific command, or get a list of all available commands.`,
  ],
  commands: [
    {
      cmd: "help <command>",
      description: "show help for a specific command.",
      examples: [
        {
          cmd: "help clone",
          description: "show help for clone command.",
        },
      ],
    },
    {
      cmd: "help",
      description: "show help for all available commands.",
    },
  ],
});
export const generic = () => {};
