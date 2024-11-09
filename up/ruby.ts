import { $ } from "zx";
import report from "yurnalist";
import { spinner } from "../utils/spinner.ts";

const isInstalled = async (name: string) => {
  try {
    const { exitCode } = await $`which ${name}`;
    return exitCode === 0;
  } catch (_) {
    return false;
  }
};

export const installRubyDependencies = async () => {
  if (!(await isInstalled("gem"))) {
    report.error("`Gemfile` is found but `gem` is not installed.");
    report.info("you can install ruby with `rbenv install`");
    return;
  }
  if (!(await isInstalled("bundle"))) {
    report.error("`Gemfile` is found but `bundle` is not installed.");
    report.info("you can install ruby with `gem install bundler`");
    return;
  }
  const installed = await spinner(
    "installing ruby dependencies with `bundle`...",
    async () => {
      const { exitCode, stderr } = await $`bundle install`;
      if (exitCode !== 0) {
        report.error(stderr);
        return false;
      }
      return true;
    }
  );
  if (!installed) {
    report.error("failed to install ruby dependencies.");
    return;
  }

  report.success("ruby dependencies installed.");
};
