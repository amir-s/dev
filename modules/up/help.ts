import type { HelpDocFN } from "../internals";

export const cmd = "up";
export const description = "install depedencies for the current project";

export const help: HelpDocFN = () => ({
  description: [
    `install all dependencies for the current project, using ${"yarn".green}, ${
      "bundle".green
    } or ${"pip".green}.`,
  ],
  commands: [
    {
      cmd: "up",
      description: "install all dependencies for the current project.",
    },
  ],
});
