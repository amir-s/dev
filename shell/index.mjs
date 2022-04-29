import os from "os";
import path, { dirname } from "path";
import report from "yurnalist";
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

const isDevFolder = () => {
  try {
    const packageFile = path.resolve("./package.json");
    const { name } = JSON.parse(fs.readFileSync(packageFile));
    return name === "dev";
  } catch (e) {
    return false;
  }
};

export const run = async ({ config, writeConfig, args }) => {
  if (args.length === 0) {
    help.generic();
    return;
  }

  const [command] = args;

  if (command === "init") {
    const functionName = config("shell.function", "dev");
    const binaryPath = config("shell.binary.path", "dev-cli");

    const script = fs
      .readFileSync(path.join(__dirname, "./install.sh"), "utf8")
      .replaceAll("<$SHELL_FN_NAME$>", functionName)
      .replaceAll("<$SHELL_BIN_PATH$>", binaryPath);

    console.log(script);

    return;
  }

  if (command === "install") {
    const installCommand = `eval "$(dev-cli shell init)"`;
    const file = getShellProfile();
    if (!file) {
      report.error("unable to find shell profile!");
      return;
    }

    if (!fs.existsSync(file)) {
      report.error(`file "${file}" does not exist.`);
      return;
    }

    const script = fs.readFileSync(file, "utf8");

    if (script.includes(installCommand)) {
      report.success(
        `command \`${installCommand}\` already exists in "${file}".`.yellow
      );
      return;
    }

    const newScript = `${script}\n${installCommand}\n`;

    fs.writeFileSync(file, newScript);

    help.shellInstallSuccess(installCommand, file);

    return;
  }

  if (command === "use") {
    const type = args[1];

    if (type !== "local" && type !== "prod") {
      console.log(
        `\n Invalid type "${type}". You can use either "local" or "prod".`.red
      );
      return;
    }

    if (type === "local") {
      if (!isDevFolder()) {
        console.log(
          `\n The current directory (${path.resolve()}) does not seem to be a dev-cli project.`
            .red
        );
        return;
      }

      writeConfig("shell.binary.path", path.resolve("./index.mjs"));
      console.log(`\n Updated config to use LOCAL DEV.`.green);
      console.log(
        `\n You will need to restart your terminal for changes to take effect.`
          .yellow
      );
      console.log(
        ` Verify which version you are using by running "dev-cli" with no arguments`
          .yellow
      );

      return;
    }

    if (type === "prod") {
      writeConfig("shell.binary.path", undefined);
      console.log(`\n Updated config to use PRODUCTION.`.green);
      console.log(
        `\n You will need to restart your terminal for changes to take effect.`
          .yellow
      );
      console.log(
        ` Verify which version you are using by running "dev-cli" with no arguments`
          .yellow
      );

      return;
    }
  }
};
