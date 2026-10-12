import assert from "assert";
import path from "path";
import { describe, test } from "node:test";
import { watchForSync } from "../index.ts";

describe("lan sync watcher", () => {
  test("skips initial files and reports new files", async () => {
    const directory = await Deno.makeTempDir();
    const existing = path.join(directory, "existing.txt");
    const added = path.join(directory, "added.txt");
    await Deno.writeTextFile(existing, "old");

    const events: Array<{ event: string; file: string }> = [];
    let ready = false;
    const watcher = watchForSync(
      directory,
      ["**/.*", "**/node_modules/**"],
      (event, file) => events.push({ event, file }),
      () => {
        ready = true;
      },
      { usePolling: true },
    );

    try {
      await new Promise<void>((resolve, reject) => {
        watcher.once("ready", resolve);
        watcher.once("error", reject);
      });
      assert.equal(ready, true);
      assert.deepEqual(events, []);

      await Deno.writeTextFile(added, "new");
      const deadline = Date.now() + 3000;
      while (
        !events.some(({ event, file }) => event === "add" && file === added)
      ) {
        if (Date.now() > deadline) {
          throw new Error(
            `new file was not observed: ${JSON.stringify(events)}`,
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
      assert.equal(events.some(({ file }) => file === existing), false);
    } finally {
      await watcher.close();
      await Deno.remove(directory, { recursive: true });
    }
  });
});
