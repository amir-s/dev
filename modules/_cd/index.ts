import "colors";
import { $ } from "zx";
import report from "yurnalist";
import inquirer from "inquirer";
import { kv } from "./kv.ts";

interface Scripts {
  _cd?: string;
}

$.verbose = true;

const CHOICES = [
  "no",
  "yes",
  "never this command",
  "always this command",
  "never for _cd commands for this project",
  "always for _cd commands for this project",
] as const;

export const run = async () => {
  const { scripts }: { scripts?: Scripts } = JSON.parse(
    Deno.readTextFileSync("dev.json"),
  );

  if (!scripts || !scripts["_cd"]) {
    return;
  }

  const script = scripts["_cd"];

  const allowedCommands = kv.read<Record<string, boolean>>("_cd", "allowed") ||
    {};
  const bannedCommands = kv.read<Record<string, boolean>>("_cd", "banned") ||
    {};

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
    Deno.exit(0);
    return;
  }

  if (allowed === true) {
    await $`$SHELL -c ${script}`;
    Deno.exit(0);
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
    Deno.exit(0);
    return;
  }

  if (run === "never this command") {
    kv.write("_cd", "banned", { ...bannedCommands, [script]: true });
    Deno.exit(0);
    return;
  }

  if (run === "never for _cd commands for this project") {
    kv.write("_cd", "run all _cd commands for this project", "never");
    Deno.exit(0);
    return;
  }

  if (run === "always this command") {
    kv.write("_cd", "allowed", { ...allowedCommands, [script]: true });
  }

  if (run === "always for _cd commands for this project") {
    kv.write("_cd", "run all _cd commands for this project", "always");
  }

  await $`$SHELL -c ${script}`;
  Deno.exit(0);
};
