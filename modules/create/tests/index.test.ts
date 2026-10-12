import assert from "assert";
import { fileURLToPath } from "url";
import { describe, test } from "node:test";

const main = fileURLToPath(new URL("../../../main.ts", import.meta.url));

describe("create", () => {
  test("exits nonzero for invalid visibility flags", async () => {
    const result = await new Deno.Command(Deno.execPath(), {
      args: ["run", "-A", main, "create", "taken", "--public", "--private"],
      stdout: "piped",
      stderr: "piped",
    }).output();

    assert.equal(result.code, 1);
    assert.match(
      new TextDecoder().decode(result.stderr),
      /cannot specify both --public and --private/,
    );
  });

  test("shows GitHub validation details when creation fails", async () => {
    const directory = await Deno.makeTempDir();
    try {
      const gh = `${directory}/gh`;
      await Deno.writeTextFile(
        gh,
        `#!/bin/sh
if [ "$2" = "user" ]; then
  echo test-user
  exit 0
fi
echo 'error gh: Repository creation failed. (HTTP 422)' >&2
echo '{"message":"Validation Failed","errors":[{"field":"name","code":"already_exists"}]}'
exit 1
`,
      );
      await Deno.chmod(gh, 0o755);

      const result = await new Deno.Command(Deno.execPath(), {
        args: ["run", "-A", main, "create", "taken", "--private"],
        env: { PATH: `${directory}:${Deno.env.get("PATH")}` },
        stdout: "piped",
        stderr: "piped",
      }).output();
      const output = new TextDecoder().decode(result.stdout) +
        new TextDecoder().decode(result.stderr);

      assert.equal(result.code, 1);
      assert.match(output, /Repository creation failed\. \(HTTP 422\)/);
      assert.equal(
        (output.match(/Repository creation failed/g) ?? []).length,
        1,
      );
      assert.match(output, /Validation Failed/);
      assert.match(output, /name: already exists/);
    } finally {
      await Deno.remove(directory, { recursive: true });
    }
  });
});
