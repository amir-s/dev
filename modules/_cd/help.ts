import "colors";
import type { HelpDocFN } from "../help/help.ts";

export const cmd = "_cd";
export const description =
  "This is not a command. It's an internal module that runs the :cd script defined in the dev.json file when you cd into your project.";

export const help: HelpDocFN = () => ({
  description: [description],
  commands: [],
});

export const generic = () => {};
