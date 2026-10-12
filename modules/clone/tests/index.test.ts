import assert from "assert";
import path from "path";
import { parseArgument, run } from "../index.ts";
import { describe, test } from "../../../test.ts";

interface Testcase {
  org: string;
  user: string;
  repo: string;
  remote: string;
}

const tests: {
  [url: string]: Testcase;
} = {
  "https://amirs@bitbucket.org/amirs/dev.git": {
    org: "bitbucket.org",
    user: "amirs",
    repo: "dev",
    remote: "https://amirs@bitbucket.org/amirs/dev.git",
  },
  "git@bitbucket.org:amirs/dev.git": {
    org: "bitbucket.org",
    user: "amirs",
    repo: "dev",
    remote: "git@bitbucket.org:amirs/dev.git",
  },
  "https://github.com/amir-s/dev.git": {
    org: "github.com",
    user: "amir-s",
    repo: "dev",
    remote: "https://github.com/amir-s/dev.git",
  },
  "git@github.com:amir-s/dev.git": {
    org: "github.com",
    user: "amir-s",
    repo: "dev",
    remote: "git@github.com:amir-s/dev.git",
  },
  "amir-s/dev": {
    org: "github.com",
    user: "amir-s",
    repo: "dev",
    remote: "git@github.com:amir-s/dev.git",
  },
  "amir-s/dev.git": {
    org: "github.com",
    user: "amir-s",
    repo: "dev",
    remote: "git@github.com:amir-s/dev.git",
  },
  "https://git.somewhere.co.uk/one-1/~two/Three/user/repo.git": {
    org: "git.somewhere.co.uk",
    user: "user",
    repo: "repo",
    remote: "https://git.somewhere.co.uk/one-1/~two/Three/user/repo.git",
  },
  "https://git.somewhere.co.uk/one-1/~two/Three/user/repo": {
    org: "git.somewhere.co.uk",
    user: "user",
    repo: "repo",
    remote: "https://git.somewhere.co.uk/one-1/~two/Three/user/repo",
  },
};

describe("parseArgument", () => {
  Object.keys(tests).forEach((url) => {
    const testcase = tests[url];
    test(url, () => {
      const { org, user, repo, remote } = parseArgument(url, { ssh: true })!;
      assert.deepEqual({ org, user, repo, remote }, testcase);
    });
  });

  test("with ssh=false", () => {
    const { org, user, repo, remote } = parseArgument("amir-s/dev.git", {
      ssh: false,
    })!;
    assert.deepEqual(
      { org, user, repo, remote },
      {
        org: "github.com",
        user: "amir-s",
        repo: "dev",
        remote: "https://github.com/amir-s/dev.git",
      },
    );
  });
});

describe("clone host verification", () => {
  test("requires strict SSH host checking without enrolling a key", async () => {
    const directory = await Deno.makeTempDir();
    const previousPath = Deno.env.get("PATH");
    const previousLog = Deno.env.get("DEV_CLONE_TEST_LOG");
    const log = path.join(directory, "git-command");
    const scanLog = path.join(directory, "ssh-keyscan-command");
    try {
      const git = path.join(directory, "git");
      await Deno.writeTextFile(
        git,
        '#!/bin/sh\nprintf "%s" "$GIT_SSH_COMMAND" > "$DEV_CLONE_TEST_LOG"\necho "Host key verification failed." >&2\nexit 1\n',
      );
      await Deno.chmod(git, 0o755);
      const scan = path.join(directory, "ssh-keyscan");
      await Deno.writeTextFile(
        scan,
        `#!/bin/sh\ntouch "${scanLog}"\nexit 1\n`,
      );
      await Deno.chmod(scan, 0o755);
      Deno.env.set("PATH", `${directory}:${previousPath ?? ""}`);
      Deno.env.set("DEV_CLONE_TEST_LOG", log);

      await run({
        args: ["git@untrusted.example:alice/project.git"],
        config: ((key: string, fallback: unknown) => {
          if (key === "clone.path") return path.join(directory, "<repo>");
          if (key === "clone.cd") return false;
          if (key === "clone.ssh") return true;
          return fallback;
        }) as Parameters<typeof run>[0]["config"],
        writeConfig: () => {},
        cd: () => {},
        source: () => {},
      });

      assert.equal(
        await Deno.readTextFile(log),
        "ssh -o StrictHostKeyChecking=yes",
      );
      assert.equal(
        await Deno.stat(scanLog).then(() => true, () => false),
        false,
      );
    } finally {
      if (previousPath === undefined) Deno.env.delete("PATH");
      else Deno.env.set("PATH", previousPath);
      if (previousLog === undefined) Deno.env.delete("DEV_CLONE_TEST_LOG");
      else Deno.env.set("DEV_CLONE_TEST_LOG", previousLog);
      await Deno.remove(directory, { recursive: true });
    }
  });
});
