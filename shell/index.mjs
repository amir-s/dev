import os from "os";
import path, { dirname } from "path";
import report from "yurnalist";
import inquirer from "inquirer";
import { fileURLToPath } from "url";
import { fs } from "zx";

import * as help from "./help.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const SHELLS = [
  {
    name: "bash",
    path: "/bin/bash",
    profile: ".bashrc",
  },
  {
    name: "zsh",
    path: "/bin/zsh",
    profile: ".zshrc",
  },
  {
    name: "fish",
    path: "/bin/fish",
    profile: ".config/fish/conf.d/dev.fish",
  },
];

const getShellProfile = async () => {
  const { type } = await inquirer.prompt([
    {
      type: "list",
      name: "type",
      message: "Which shell do you want to install to?",
      choices: SHELLS.map((shell) => {
        const path = ` ~/${shell.profile}`.gray;
        return `${shell.name.padEnd(
          SHELLS.reduce((max, { name }) => Math.max(max, name.length), 0)
        )} ${path}`;
      }),
      default: () =>
        SHELLS.findIndex((shell) => shell.path === process.env.SHELL),
      filter: (shell) => shell.split(" ")[0],
    },
  ]);

  return SHELLS.find((shell) => shell.name === type);
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

export const run = async ({ config, writeConfig, args, source }) => {
  if (args.length === 0) {
    help.generic();
    return;
  }

  const [command] = args;

  if (command === "init") {
    const shellType = args[1] || "bash";

    const functionName = config("shell.function", "dev");
    const binaryPath = config("shell.binary.path", "dev-cli");

    if (shellType === "bash" || shellType === "zsh") {
      const script = fs
        .readFileSync(path.join(__dirname, "./install.sh"), "utf8")
        .replaceAll("<$SHELL_FN_NAME$>", functionName)
        .replaceAll("<$SHELL_TYPE$>", shellType)
        .replaceAll("<$SHELL_BIN_PATH$>", binaryPath);

      console.log(script);
    } else if (shellType === "fish") {
      const script = fs
        .readFileSync(path.join(__dirname, "./install.fish"), "utf8")
        .replaceAll("<$SHELL_FN_NAME$>", functionName)
        .replaceAll("<$SHELL_TYPE$>", shellType)
        .replaceAll("<$SHELL_BIN_PATH$>", binaryPath);

      console.log(script);
    }

    return;
  }

  if (command === "install") {
    const shell = await getShellProfile();
    const shellProfile = path.resolve(os.homedir(), shell.profile);

    if (!shellProfile) {
      report.error("unable to find shell profile!");
      return;
    }

    const installCommand = `eval "$(dev-cli shell init ${shell.name})"`;

    let script = "";
    if (shell.name == "fish") {
      if (fs.existsSync(shellProfile)) {
        script += fs.readFileSync(shellProfile, "utf8");
        if (script.includes(installCommand)) {
          report.success(
            `command \`${installCommand}\` already exists in "${shellProfile}".`
              .yellow
          );
          return;
        }
      }
    }
    else {
      if (!fs.existsSync(shellProfile)) {
        report.error(`file "${shellProfile}" does not exist.`);
        return;
      }

      script += fs.readFileSync(shellProfile, "utf8");
      if (script.includes(installCommand)) {
        report.success(
          `command \`${installCommand}\` already exists in "${shellProfile}".`
            .yellow
        );
        return;
      }
    }

    if (script) script += "\n";
    const newScript = `${script}${installCommand}\n`;

    fs.writeFileSync(shellProfile, newScript);

    help.shellInstallSuccess(installCommand, shellProfile);

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
        `\n You may need to restart your terminal for changes to take effect.`
          .yellow
      );
      console.log(
        ` Verify which version you are using by running "dev" with no arguments`
          .yellow
      );
      await source();

      return;
    }

    if (type === "prod") {
      writeConfig("shell.binary.path", undefined);
      console.log(`\n Updated config to use PRODUCTION.`.green);
      console.log(
        `\n You may need to restart your terminal for changes to take effect.`
          .yellow
      );
      console.log(
        ` Verify which version you are using by running "dev" with no arguments`
          .yellow
      );
      await source();

      return;
    }
  }
};
