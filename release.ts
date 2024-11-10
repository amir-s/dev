import "colors";
import inquirer from "inquirer";
import { getCurrentVersion } from "./utils/version.ts";
import semver from "semver";

const VERSION_TS_FILE = "./utils/version.ts";

const decoder = new TextDecoder();

const denoConfig = JSON.parse(await Deno.readTextFile("deno.json"));
const denoJsonVersion = `v${denoConfig.version}`;
const currentVersion = `v${getCurrentVersion()}`;

if (currentVersion !== denoJsonVersion) {
  console.error(
    "Version mismatch between current version and deno.json version.",
    {
      currentVersion,
      denoJsonVersion,
    }
  );

  Deno.exit(1);
}

const { releaseType } = await inquirer.prompt([
  {
    type: "list",
    name: "releaseType",
    message: `What type of release is this? (Current version is ${currentVersion.green})`,
    choices: ["patch", "minor", "major"].map((choice) => ({
      name: `${choice} (${semver.inc(denoConfig.version, choice)})`,
      value: choice,
    })),
  },
]);

if (!releaseType) {
  console.error("Invalid release type");
  Deno.exit(1);
}

const newVersion = semver.inc(denoConfig.version, releaseType);

if (!newVersion) {
  console.error("Invalid new version");
  Deno.exit(1);
}

console.log(` Releasing version v${newVersion.green}`);

// change version in version.ts
const versionFile = await Deno.readTextFile(VERSION_TS_FILE);
const newVersionFile = versionFile.replace(
  `/**/ "${denoConfig.version}"; /**/`,
  `/**/ "${newVersion}"; /**/`
);
await Deno.writeTextFile(VERSION_TS_FILE, newVersionFile);

// change version in deno.json
denoConfig.version = newVersion;
await Deno.writeTextFile("deno.json", JSON.stringify(denoConfig, null, 2));

const commitCommand = new Deno.Command("git", {
  args: ["commit", "--allow-empty", "-am", `Release v${newVersion}`],
  stdout: "piped",
  stderr: "piped",
});

const {
  code: commitCode,
  stdout: commitOutput,
  stderr: commitError,
} = await commitCommand.output();

if (commitCode !== 0 || commitError.length > 0) {
  console.error(`exit code: ${commitCode}`);
  console.error(decoder.decode(commitError));
  Deno.exit(1);
}

console.log(decoder.decode(commitOutput));

const tagCommand = new Deno.Command("git", {
  args: ["tag", "-a", `v${newVersion}`, "-m", `Version v${newVersion} release`],
  stdout: "piped",
  stderr: "piped",
});

const {
  code: tagCode,
  stdout: tagOutput,
  stderr: tagError,
} = await tagCommand.output();

if (tagCode !== 0 || tagError.length > 0) {
  console.error(`exit code: ${tagCode}`);
  console.error(decoder.decode(tagError));
  Deno.exit(1);
}

console.log(decoder.decode(tagOutput));
const pushCommand = new Deno.Command("git", {
  args: ["push", "origin", "main", "--tags"],
  stdout: "piped",
  stderr: "piped",
});

const {
  code: pushCode,
  stdout: pushOutput,
  stderr: pushError,
} = await pushCommand.output();

if (pushCode !== 0 || pushError.length > 0) {
  console.error(`exit code: ${pushCode}`);
  console.error(decoder.decode(pushError));
  Deno.exit(1);
}

console.log(decoder.decode(pushOutput));

console.log(`Successfully tagged and pushed ${newVersion.green}`);
