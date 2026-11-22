import fs from "fs";
import process from "process";

export const shellExec = (
  command: "cd" | "source",
  target: string,
): unknown => {
  // The shell handoff is line-delimited; a newline could inject a source command.
  if (/[\r\n\0]/.test(target)) {
    throw new Error(
      "Shell command paths cannot contain newlines or NUL bytes.",
    );
  }

  const file = process.env.DEV_CLI_CMD_EXEC_FILE;
  if (file) return fs.appendFileSync(file, `${command}:${target}\n`);

  console.log(
    "DEV_CLI_CMD_EXEC_FILE has no value, possibly because shell module is not installed",
  );
  return null;
};
