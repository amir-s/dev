import fs from "fs";
import { $ } from "zx";
import path from "path";
import report from "yurnalist";

import { installNodeDependencies } from "./node.mjs";
import { installRubyDependencies } from "./ruby.mjs";
import { installPythonDependencies } from "./python.mjs";

$.verbose = false;

const dependencyFiles = ["package.json", "Gemfile", "requirements.txt"];

export const run = async () => {
  const existingDependencyFiles = dependencyFiles.filter((file) =>
    fs.existsSync(path.resolve(file))
  );

  if (existingDependencyFiles.length === 0) {
    report.error("no dependency files found.");
    return;
  }

  if (existingDependencyFiles.length > 1) {
    report.error(
      "multiple dependency files found. dev does not support this yet."
    );
    return;
  }

  const dependencyFile = existingDependencyFiles[0];

  if (dependencyFile === "package.json") {
    await installNodeDependencies();
  } else if (dependencyFile === "Gemfile") {
    await installRubyDependencies();
  } else if (dependencyFile === "requirements.txt") {
    await installPythonDependencies();
  }
};
