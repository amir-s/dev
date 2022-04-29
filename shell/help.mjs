import "colors";

import report from "yurnalist";

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
