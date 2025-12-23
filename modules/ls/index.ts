import { $ } from "zx";
import report from "yurnalist";
import { commands } from "../contextual/list.ts";

$.verbose = true;

export const run = async () => {
  const localCommands = await commands();
  const commandsList = Object.keys(localCommands);
  if (commandsList.length === 0) {
    report.info("no commands found.");
    return;
  }

  const maxLength = commandsList.reduce(
    (max, name) => Math.max(max, name.length),
    0,
  );

  const showSource =
    new Set(commandsList.map((key) => localCommands[key].source)).size > 1;

  const list = commandsList
    .map((key) => {
      return `\n ▸ ${key.padEnd(maxLength, " ").green} ${"$ ".gray}${
        localCommands[key].command.white
      } ${showSource ? `[↪ ${localCommands[key].source}]`.gray : ""}`;
    })
    .join("");
  report.info(`available commands:\n${list}`);
};
