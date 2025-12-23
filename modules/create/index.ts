import { $ } from "zx";
import report from "yurnalist";
import inquirer from "inquirer";

import { spinner } from "../../utils/spinner.ts";
import type { ModuleRunOptions } from "../../utils/types.ts";
import * as help from "./help.ts";

// Reuse the pattern used in up/* modules
const isInstalled = async (name: string) => {
  try {
    const { exitCode } = await $`which ${name}`;
    return exitCode === 0;
  } catch (_) {
    return false;
  }
};

const ensureGhInstalled = async (): Promise<boolean> => {
  if (await isInstalled("gh")) return true;

  report.warn("GitHub CLI (gh) is not installed.");

  const hasBrew = await isInstalled("brew");

  if (hasBrew) {
    const { install } = await inquirer.prompt<{ install: boolean }>([
      {
        type: "confirm",
        name: "install",
        message: "Install GitHub CLI using Homebrew now?",
        default: true,
      },
    ]);

    if (!install) {
      report.info(
        "Aborted install. You can install gh via Homebrew: `brew install gh`, or see https://cli.github.com/manual/installation"
      );
      return false;
    }

    const ok = await spinner("installing gh via Homebrew", async () => {
      const { exitCode, stderr } = await $`brew install gh`;
      if (exitCode !== 0) {
        report.error(stderr);
        return false;
      }
      return true;
    });

    if (!ok) return false;

    return await isInstalled("gh");
  }

  report.info(
    "Please install GitHub CLI from https://cli.github.com/manual/installation and re-run the command."
  );
  return false;
};

const parseArgs = (args: string[]) => {
  const name = args[0];
  const flags = new Set(args.slice(1));

  const wantsPublic = flags.has("--public");
  const wantsPrivate = flags.has("--private");

  if (wantsPublic && wantsPrivate) {
    return { error: "cannot specify both --public and --private" } as const;
  }

  let visibility: "public" | "private" | null = null;
  if (wantsPublic) visibility = "public";
  if (wantsPrivate) visibility = "private";

  return { name, visibility } as const;
};

const askVisibility = async (): Promise<"public" | "private"> => {
  const { visibility } = await inquirer.prompt<{
    visibility: "public" | "private";
  }>([
    {
      type: "list",
      name: "visibility",
      message: "Repository visibility?",
      choices: ["public", "private"],
      default: "private",
    },
  ]);
  return visibility;
};

const getLogin = async (): Promise<string | null> => {
  try {
    const out = await $`gh api user -q .login`.nothrow();
    if (out.exitCode !== 0) return null;
    return out.stdout.trim();
  } catch (_) {
    return null;
  }
};

export const run = async ({
  args,
  config,
  writeConfig,
  cd,
  source,
}: ModuleRunOptions) => {
  if (args.length === 0) {
    help.generic();
    return;
  }

  const parsed = parseArgs(args);
  if ("error" in parsed) {
    report.error(parsed.error);
    return;
  }

  const { name, visibility: visFromFlag } = parsed;

  if (!name) {
    report.error(
      "missing repo name. usage: dev create <name> [--public|--private]"
    );
    return;
  }

  if (!(await ensureGhInstalled())) return;

  const visibility = visFromFlag ?? (await askVisibility());
  const isPrivate = visibility === "private";

  // Determine owner/repo
  const login = (await getLogin()) ?? "";
  let owner: string | null = null;
  let repo: string = name;
  if (name.includes("/")) {
    const [o, r] = name.split("/", 2);
    owner = o;
    repo = r;
  }

  const effectiveOwner = owner ?? login;

  // Build endpoint
  let endpoint: string;
  if (owner && login && owner !== login) {
    endpoint = `orgs/${owner}/repos`;
  } else {
    endpoint = "user/repos";
  }

  // Create repo using gh api
  const fullName = effectiveOwner ? `${effectiveOwner}/${repo}` : repo;

  const created = await spinner(`creating ${fullName} on GitHub`, async () => {
    const cmd = [
      "gh",
      "api",
      "-X",
      "POST",
      endpoint,
      "-f",
      `name=${repo}`,
      "-F",
      `private=${isPrivate}`,
      "-F",
      "auto_init=true",
    ];

    const result = await $`${cmd}`.nothrow();
    if (result.exitCode !== 0) {
      report.error(result.stderr);
      return false;
    }
    return true;
  });

  if (!created) return;

  // Clone the repo locally using existing clone module
  const { run: clone } = await import("../clone/index.ts");
  await clone({ args: [fullName], config, writeConfig, cd, source });
};
