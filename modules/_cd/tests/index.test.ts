import assert from "assert";
import path from "path";
import { describe, test } from "node:test";
import { fileURLToPath } from "url";
import { createKV } from "../kv.ts";

const config = fileURLToPath(new URL("../../../deno.json", import.meta.url));
const moduleUrl = new URL("../index.ts", import.meta.url).href;

describe("project script trust", () => {
  test("stores private approvals outside projects and isolates canonical paths", async () => {
    const directory = await Deno.makeTempDir();
    try {
      const project = path.join(directory, "project");
      const other = path.join(directory, "other");
      const trust = path.join(directory, "trust");
      await Deno.mkdir(project);
      await Deno.mkdir(other);
      await Deno.writeTextFile(
        path.join(project, ".dev.json"),
        JSON.stringify({ _cd: { allowed: { malicious: true } } }),
      );
      const kv = createKV(project, trust);
      assert.equal(kv.read("_cd", "allowed"), null);
      assert.equal(kv.read("constructor", "name"), null);
      kv.write("_cd", "allowed", { safe: true });
      kv.write("_cd", "disabled", false);
      assert.deepEqual(createKV(project, trust).read("_cd", "allowed"), {
        safe: true,
      });
      assert.equal(kv.read("_cd", "disabled"), false);
      assert.equal(kv.read("_cd", "toString"), null);
      assert.equal(createKV(other, trust).read("_cd", "allowed"), null);

      const alias = path.join(directory, "alias");
      await Deno.symlink(project, alias);
      assert.deepEqual(createKV(alias, trust).read("_cd", "allowed"), {
        safe: true,
      });
      assert.equal((await Deno.stat(trust)).mode! & 0o777, 0o700);
      const entries = Array.from(Deno.readDirSync(trust));
      assert.equal(entries.length, 1);
      assert.equal(
        (await Deno.stat(path.join(trust, entries[0].name))).mode! & 0o777,
        0o600,
      );
    } finally {
      await Deno.remove(directory, { recursive: true });
    }
  });

  test("ignores repository approvals and requires approval for changed commands", async () => {
    const directory = await Deno.makeTempDir();
    try {
      const project = path.join(directory, "project");
      const user = path.join(directory, "user");
      await Deno.mkdir(project);
      const marker = path.join(project, "executed");
      const script = "printf ran > executed";
      await Deno.writeTextFile(
        path.join(project, "dev.json"),
        JSON.stringify({ scripts: { _cd: script } }),
      );
      await Deno.writeTextFile(
        path.join(project, ".dev.json"),
        JSON.stringify({
          _cd: {
            allowed: { [script]: true },
            "run all _cd commands for this project": "always",
          },
        }),
      );

      const invoke = async (choice: string) => {
        const result = await new Deno.Command(Deno.execPath(), {
          args: [
            "eval",
            "--config",
            config,
            `import os from "os";
             import inquirer from "inquirer";
             import { run } from ${JSON.stringify(moduleUrl)};
             os.homedir = () => ${JSON.stringify(user)};
             inquirer.prompt = () => {
               console.log("PROMPTED");
               return Promise.resolve({ run: ${JSON.stringify(choice)} });
             };
             await run();`,
          ],
          cwd: project,
          env: { SHELL: "/bin/sh" },
          stdout: "piped",
          stderr: "piped",
        }).output();
        assert.equal(result.code, 0, new TextDecoder().decode(result.stderr));
        return new TextDecoder().decode(result.stdout);
      };

      assert.match(await invoke("no"), /PROMPTED/);
      await assert.rejects(() => Deno.stat(marker), Deno.errors.NotFound);

      assert.match(await invoke("always this command"), /PROMPTED/);
      assert.equal(await Deno.readTextFile(marker), "ran");
      await Deno.remove(marker);
      assert.doesNotMatch(await invoke("no"), /PROMPTED/);
      assert.equal(await Deno.readTextFile(marker), "ran");
      await Deno.remove(marker);

      await Deno.writeTextFile(
        path.join(project, "dev.json"),
        JSON.stringify({ scripts: { _cd: "printf changed > executed" } }),
      );
      assert.match(await invoke("never this command"), /PROMPTED/);
      assert.doesNotMatch(await invoke("yes"), /PROMPTED/);
      await assert.rejects(() => Deno.stat(marker), Deno.errors.NotFound);

      await Deno.writeTextFile(
        path.join(project, "dev.json"),
        JSON.stringify({ scripts: { _cd: "toString" } }),
      );
      assert.match(await invoke("no"), /PROMPTED/);
    } finally {
      await Deno.remove(directory, { recursive: true });
    }
  });
});
