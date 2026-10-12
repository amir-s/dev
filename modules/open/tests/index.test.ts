import assert from "assert";
import path from "path";
import { describe, test } from "node:test";
import { getRemoteUrl } from "../index.ts";

describe("open remote URL", () => {
  test("converts Git SSH and HTTPS remotes into browser URLs", async () => {
    const directory = await Deno.makeTempDir();
    const previousPath = Deno.env.get("PATH");
    const previousUrl = Deno.env.get("DEV_OPEN_TEST_URL");
    try {
      const git = path.join(directory, "git");
      await Deno.writeTextFile(git, '#!/bin/sh\necho "$DEV_OPEN_TEST_URL"\n');
      await Deno.chmod(git, 0o755);
      Deno.env.set("PATH", `${directory}:${previousPath ?? ""}`);

      Deno.env.set("DEV_OPEN_TEST_URL", "git@github.com:amir-s/dev.git");
      assert.equal(await getRemoteUrl(), "https://github.com/amir-s/dev");

      Deno.env.set("DEV_OPEN_TEST_URL", "https://github.com/amir-s/dev.git");
      assert.equal(await getRemoteUrl(), "https://github.com/amir-s/dev");
    } finally {
      if (previousPath === undefined) Deno.env.delete("PATH");
      else Deno.env.set("PATH", previousPath);
      if (previousUrl === undefined) Deno.env.delete("DEV_OPEN_TEST_URL");
      else Deno.env.set("DEV_OPEN_TEST_URL", previousUrl);
      await Deno.remove(directory, { recursive: true });
    }
  });
});
