import "colors";

import report from "yurnalist";

export const cmd = ["shell install", "shell use <local|prod>"];
export const description = "install or use a shell integration";

export const help = (DEV) => ({
  description: [`shell utilities for ${DEV.yellow}`],
  commands: [
    {
      cmd: "shell install",
      description: `install shell integration for ${DEV.yellow}. this adds a script to your shell startup file to make ${DEV.yellow} a shell module. certain commands requires shell module to be active.`,
    },
    {
      cmd: "shell use <local|prod>",
      description: `use local copy or the production version of the ${
        DEV.yellow
      }. learn more at ${"https://github.com/amir-s/dev".cyan}.`,
    },
  ],
});

export const generic = () => {
  console.log("No command specified.".gray);
};

export const shellInstallSuccess = (installCommand, file) => {
  const sourceCommand = `source ${file}`;
  report.success(`command "${installCommand}" added to "${file}".`);

  report.warn(
    `please restart your terminal or run ${sourceCommand.inverse} for the changes to take effect.`
      .yellow
  );
};
