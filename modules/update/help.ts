import type { HelpDocFN } from "../internals";

export const cmd = "update";
export const description = "update the current installation of dev tool";

export const help: HelpDocFN = () => ({
  description: [
    `check for new versions and update the current installation of dev tool.`,
  ],
  commands: [
    {
      cmd: "update",
      description: "update the current installation of dev tool.",
    },
  ],
});
