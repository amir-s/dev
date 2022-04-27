import os from "os";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { fs } from "zx";

import * as help from "./help.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getShellProfile = () => {
  const shellType = process.env.SHELL;
  if (shellType === "/bin/bash") {
    return path.resolve(os.homedir(), ".bashrc");
  }
  if (shellType === "/bin/zsh") {
    return path.resolve(os.homedir(), ".zshrc");
  }
  return null;
};

export const run = async ({ config, args }) => {
  if (args.length === 0) {
    help.generic();
    return;
  }

  const [command] = args;

  if (command === "init") {
    const functionName = config("shell.function", "dev");

    const script = fs
      .readFileSync(path.join(__dirname, "./install.sh"), "utf8")
      .replace("<$SHELL_FN_NAME$>", functionName);

    console.log(script);

    return;
  }

  if (command === "install") {
    const installCommand = `eval "$(dev-cli shell init)"`;
    const file = getShellProfile();
    if (!file) {
      console.log("Unable to find shell profile!");
      return;
    }

    if (!fs.existsSync(file)) {
      console.log(`File "${file}" does not exist.`);
      return;
    }

    const script = fs.readFileSync(file, "utf8");

    if (script.includes(installCommand)) {
      console.log(
        `Command \`${installCommand}\` already exists in "${file}".`.yellow
      );
      return;
    }

    const newScript = `${script}\n${installCommand}\n`;

    fs.writeFileSync(file, newScript);

    help.shellInstallSuccess(installCommand, file);
  }
};
