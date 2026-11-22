import assert from "assert";
import path from "path";
import { describe, test } from "node:test";
import { run } from "../index.ts";
import { shellExec } from "../../../utils/shell.ts";

const init = async (shell: string, binary: string, name = "dev_test") => {
  let output = "";
  const log = console.log;
  console.log = (value) => output += value;
  try {
    await run({
      args: ["init", shell],
      config: ((key: string) =>
        key === "shell.function" ? name : binary) as Parameters<
          typeof run
        >[0]["config"],
      writeConfig: () => {},
      cd: () => {},
      source: () => {},
    });
  } finally {
    console.log = log;
  }
  return output;
};

describe("shell integration", () => {
  test("rejects injected function names without emitting executable code", async () => {
    assert.equal(
      await init("bash", "dev-cli", "dev() { touch injected; }; #"),
      "",
    );
  });

  test("rejects injected handoff commands before writing anything", async () => {
    const file = await Deno.makeTempFile();
    const previous = Deno.env.get("DEV_CLI_CMD_EXEC_FILE");
    try {
      Deno.env.set("DEV_CLI_CMD_EXEC_FILE", file);
      for (
        const target of ["repo\nsource:/tmp/payload", "repo\rpayload", "repo\0"]
      ) {
        assert.throws(() => shellExec("cd", target), /cannot contain/);
      }
      assert.equal(await Deno.readTextFile(file), "");
      shellExec("cd", "/tmp/path with spaces");
      assert.equal(await Deno.readTextFile(file), "cd:/tmp/path with spaces\n");
    } finally {
      if (previous === undefined) Deno.env.delete("DEV_CLI_CMD_EXEC_FILE");
      else Deno.env.set("DEV_CLI_CMD_EXEC_FILE", previous);
      await Deno.remove(file);
    }
  });

  for (const shell of ["bash", "zsh", "fish"]) {
    let available = false;
    try {
      available =
        new Deno.Command(shell, { args: ["--version"], stdout: "null" })
          .outputSync().success;
    } catch (error) {
      if (!(error instanceof Deno.errors.NotFound)) throw error;
    }
    const args = shell === "fish"
      ? ["--no-config", "-c"]
      : shell === "zsh"
      ? ["-f", "-c"]
      : ["--noprofile", "--norc", "-c"];

    test(
      `${shell}: quotes paths, preserves arguments, and uses a private temporary file`,
      { skip: !available },
      async () => {
        const directory = await Deno.makeTempDir();
        try {
          const binary = path.join(
            directory,
            "dev ' $& $(touch injected) `touch injected` \\",
          );
          const target = path.join(
            directory,
            "target cd: source: \\ trailing ",
          );
          await Deno.mkdir(target);
          const handoff = path.join(directory, "handoff");
          const log = path.join(directory, "args");
          await Deno.writeTextFile(
            binary,
            `#!/bin/sh
[ -f "$DEV_CLI_CMD_EXEC_FILE" ] || exit 91
[ ! -L "$DEV_CLI_CMD_EXEC_FILE" ] || exit 92
[ "$DEV_CLI_BIN_PATH" = "$DEV_SHELL_TEST_BINARY" ] || exit 93
[ "$(ls -ld "$DEV_CLI_CMD_EXEC_FILE" | cut -c1-10)" = "-rw-------" ] || exit 94
printf '%s\\n' "$DEV_CLI_CMD_EXEC_FILE" > "$DEV_SHELL_TEST_HANDOFF"
printf '%s\\n' "$@" > "$DEV_SHELL_TEST_LOG"
printf 'cd:%s\\n' "$DEV_SHELL_TEST_TARGET" >> "$DEV_CLI_CMD_EXEC_FILE"
exit 17
`,
          );
          await Deno.chmod(binary, 0o755);
          const finish = shell === "fish"
            ? "set result $status; printf '\\nEXIT=%s\\nPWD=%s\\n' $result $PWD"
            : 'result=$?; printf \'\\nEXIT=%s\\nPWD=%s\\n\' "$result" "$PWD"';
          const result = await new Deno.Command(shell, {
            args: [
              ...args,
              `${await init(
                shell,
                binary,
              )}\numask 000\ndev_test 'two words' 'literal$arg'; ${finish}`,
            ],
            cwd: directory,
            env: {
              TMPDIR: directory,
              DEV_SHELL_TEST_BINARY: binary,
              DEV_SHELL_TEST_TARGET: target,
              DEV_SHELL_TEST_HANDOFF: handoff,
              DEV_SHELL_TEST_LOG: log,
            },
            stdout: "piped",
            stderr: "piped",
          }).output();
          const output = new TextDecoder().decode(result.stdout);
          assert.equal(result.code, 0, new TextDecoder().decode(result.stderr));
          assert.match(output, /EXIT=17/);
          assert.ok(
            output.includes(`PWD=${target}\n`),
            output,
          );
          assert.equal(
            await Deno.readTextFile(log),
            "two words\nliteral$arg\n",
          );
          await assert.rejects(
            () => Deno.stat(path.join(directory, "injected")),
            Deno.errors.NotFound,
          );
          const tempfile = (await Deno.readTextFile(handoff)).trim();
          await assert.rejects(() => Deno.stat(tempfile), Deno.errors.NotFound);
        } finally {
          await Deno.remove(directory, { recursive: true });
        }
      },
    );

    test(`${shell}: stops if creating a temporary file fails`, {
      skip: !available,
    }, async () => {
      const directory = await Deno.makeTempDir();
      try {
        const mktemp = path.join(directory, "mktemp");
        await Deno.writeTextFile(mktemp, "#!/bin/sh\nexit 71\n");
        await Deno.chmod(mktemp, 0o755);
        const binary = path.join(directory, "cli");
        await Deno.writeTextFile(binary, "#!/bin/sh\ntouch executed\n");
        await Deno.chmod(binary, 0o755);
        const result = await new Deno.Command(shell, {
          args: [...args, `${await init(shell, binary)}\ndev_test`],
          cwd: directory,
          env: { PATH: `${directory}:${Deno.env.get("PATH")}` },
          stdout: "piped",
          stderr: "piped",
        }).output();
        assert.equal(result.code, 71, new TextDecoder().decode(result.stderr));
        await assert.rejects(
          () => Deno.stat(path.join(directory, "executed")),
          Deno.errors.NotFound,
        );
      } finally {
        await Deno.remove(directory, { recursive: true });
      }
    });
  }
});
