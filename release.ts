import "colors";
import inquirer from "inquirer";
import { getCurrentVersion } from "./utils/version.ts";
import semver from "semver";
import {
  commitAndTag,
  ensureMainBranch,
  ensureNoUncommitedChanges,
  ensureUpdatedOrigin,
  ensureUptodateMain,
  pushChanges,
} from "./utils/release.ts";

const VERSION_TS_FILE = "./utils/version.ts";

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

await ensureMainBranch();
await ensureNoUncommitedChanges();
await ensureUpdatedOrigin();
await ensureUptodateMain();

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

await commitAndTag(newVersion);
await pushChanges();

console.log(`Successfully tagged and pushed ${newVersion.green}`);
