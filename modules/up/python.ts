import { $ } from "zx";
import report from "yurnalist";
import { spinner } from "../../utils/spinner.ts";

const isInstalled = async (name: string) => {
  try {
    const { exitCode } = await $`which ${name}`;
    return exitCode === 0;
  } catch (_) {
    return false;
  }
};

export const installPythonDependencies = async () => {
  if (!(await isInstalled("pip"))) {
    report.error("`requirements.txt` is found but `pip` is not installed.");
    report.info(
      "follow https://pip.pypa.io/en/stable/installation to install pip.",
    );
    return;
  }

  const installed = await spinner(
    "installing python dependencies with `pip`...",
    async () => {
      const { exitCode, stderr } = await $`pip install -r requirements.txt`;
      if (exitCode !== 0) {
        report.error(stderr);
        return false;
      }
      return true;
    },
  );

  if (!installed) {
    report.error("failed to install python dependencies.");
    return;
  }

  report.success("python dependencies installed.");
};
