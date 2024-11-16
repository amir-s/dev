import "colors";

export interface CommandOutput {
  code: number;
  stdout: string;
  stderr: string;
}

const decoder = new TextDecoder();

const runCommand = async (
  cmd: string,
  args: string[],
  callback: (meta: CommandOutput) => void
) => {
  const command = new Deno.Command(cmd, {
    args,
    stdout: "piped",
    stderr: "piped",
  });

  const output = await command.output();

  callback({
    code: output.code,
    stdout: decoder.decode(output.stdout),
    stderr: decoder.decode(output.stderr),
  } as CommandOutput);

  return decoder.decode(output.stdout);
};

export const ensureMainBranch = async () => {
  await runCommand("git", ["branch", "--show-current"], ({ stdout }) => {
    if (!stdout) {
      console.error("Unable to determine current branch".red);
      Deno.exit(1);
    }

    if (stdout.trim() !== "main") {
      console.error(`You must be on the ${"main".red} branch to release.`);
      Deno.exit(1);
    }
  });
};

export const ensureNoUncommitedChanges = async () => {
  await runCommand("git", ["status", "--porcelain"], ({ stdout }) => {
    if (stdout.trim().length > 0) {
      console.error("There are uncommitted changes in the repository.".red);
      console.error(stdout.yellow);
      Deno.exit(1);
    }
  });
};

export const ensureUpdatedOrigin = async () => {
  await runCommand("git", ["fetch", "origin"], ({ code, stderr }) => {
    if (code !== 0 || stderr.trim().length > 0) {
      console.error(`exit code: ${code}`);
      console.error(stderr);
      Deno.exit(1);
    }
  });
};

export const ensureUptodateMain = async () => {
  await runCommand(
    "git",
    ["rev-list", "--left-right", "--count", "origin/main...main"],
    ({ stdout }) => {
      const [behind, ahead] = stdout
        .trim()
        .split("\t")
        .map((i) => Number(i.trim()));

      if (ahead !== 0) {
        console.error(
          `Local branch is ahead of remote by ${
            ahead.toString().red
          } commits. Please push your changes.`
        );
        Deno.exit(1);
      }

      if (behind !== 0) {
        console.error(
          `Local branch is behind remote by ${
            behind.toString().red
          } commits. Please pull the changes.`
        );
        Deno.exit(1);
      }
    }
  );
};

export const commitAndTag = async (version: string) => {
  await runCommand(
    "git",
    ["commit", "--allow-empty", "-am", `Release v${version}`],
    ({ code, stderr }) => {
      if (code !== 0 || stderr.trim().length > 0) {
        console.error(`exit code: ${code}`);
        console.error(stderr);
        Deno.exit(1);
      }
    }
  );

  await runCommand(
    "git",
    ["tag", "-a", `v${version}`, "-m", `Version v${version} release`],
    ({ code, stderr }) => {
      if (code !== 0 || stderr.trim().length > 0) {
        console.error(`exit code: ${code}`);
        console.error(stderr);
        Deno.exit(1);
      }
      console.log(`Tagged version ${version.green}`);
    }
  );
};

export const pushChanges = async () => {
  await runCommand(
    "git",
    ["push", "origin", "main", "--tags"],
    ({ code, stderr }) => {
      if (code !== 0 || stderr.trim().length > 0) {
        console.error(`exit code: ${code}`);
        console.error(stderr);
        Deno.exit(1);
      }
      console.log(`Pushed changes to origin`);
    }
  );
};
