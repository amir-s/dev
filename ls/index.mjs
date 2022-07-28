import { $ } from "zx";
import report from "yurnalist";
import { commands } from "../contextual/list.mjs";

$.verbose = true;

export const run = async ({ args, config }) => {
  const localCommands = await commands();
  if (Object.keys(localCommands).length === 0) {
    report.info("no commands found.");
    return;
  }

  const maxLength = Object.keys(localCommands).reduce(
    (max, name) => Math.max(max, name.length),
    0
  );

  const list = Object.keys(localCommands)
    .map((key) => {
      return `\n ▸ ${key.padEnd(maxLength, " ").green} ${"$ ".gray}${
        localCommands[key].gray
      }`;
    })
    .join("");
  report.info(`available commands:\n${list}`);
};
