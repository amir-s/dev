import "colors";
import { $ } from "zx";
import report from "yurnalist";
import inquirer from "inquirer";

import type { KV } from "./kv.ts";
import type { DevJson } from "./index.ts";

const CHOICES = [
  "no",
  "yes",
  "never this command",
  "always this command",
  "never for _cd commands for this project",
  "always for _cd commands for this project",
] as const;

export const handleScript = async (devJson: DevJson, kv: KV) => {
  const { scripts } = devJson;

  if (!scripts || !scripts["_cd"]) {
    return;
  }

  const script = scripts["_cd"];

  const allowedCommands =
    kv.read<Record<string, boolean>>("_cd", "allowed") || {};
  const bannedCommands =
    kv.read<Record<string, boolean>>("_cd", "banned") || {};

  const isAllowed = (command: string) => {
    const all = kv.read<string>("_cd", "run all _cd commands for this project");

    if (all === "never") {
      return false;
    }

    if (all === "always") {
      return true;
    }

    if (bannedCommands[command]) {
      return false;
    }

    if (allowedCommands[command]) {
      return true;
    }

    return null;
  };

  const allowed = isAllowed(script);
  if (allowed === false) {
    return false;
  }

  if (allowed === true) {
    await $`$SHELL -c ${script}`;
    return true;
  }

  report.info(`This _cd command is about to run: ${script.green}`);

  const { run } = (await inquirer.prompt([
    {
      type: "list",
      name: "run",
      message: "Do you want to run the script?",
      choices: CHOICES,
    },
  ])) as { run: (typeof CHOICES)[number] };

  if (run === "no") {
    return false;
  }

  if (run === "never this command") {
    kv.write("_cd", "banned", { ...bannedCommands, [script]: true });
    return false;
  }

  if (run === "never for _cd commands for this project") {
    kv.write("_cd", "run all _cd commands for this project", "never");
    return false;
  }

  if (run === "always this command") {
    kv.write("_cd", "allowed", { ...allowedCommands, [script]: true });
  }

  if (run === "always for _cd commands for this project") {
    kv.write("_cd", "run all _cd commands for this project", "always");
  }

  await $`$SHELL -c ${script}`;
  return true;
};
