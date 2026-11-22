import { createHash } from "node:crypto";
import os from "os";
import path from "path";

// Trust decisions must never come from files supplied by the project itself.
export const createKV = (
  projectDirectory = Deno.cwd(),
  trustDirectory = path.join(os.homedir(), ".dev", "trust"),
) => {
  const project = Deno.realPathSync(projectDirectory);
  const id = createHash("sha256").update(project).digest("hex");
  const file = path.join(trustDirectory, `${id}.json`);

  const load = (): Record<string, Record<string, unknown>> => {
    try {
      return JSON.parse(Deno.readTextFileSync(file));
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) return {};
      throw error;
    }
  };

  return {
    read<T>(scope: string, key: string): T | null {
      const json = load();
      if (!Object.hasOwn(json, scope) || !Object.hasOwn(json[scope], key)) {
        return null;
      }
      return json[scope][key] as T;
    },
    write<T>(scope: string, key: string, value: T) {
      const json = load();
      const values = Object.hasOwn(json, scope) ? json[scope] : {};
      const updated = { ...json, [scope]: { ...values, [key]: value } };
      Deno.mkdirSync(trustDirectory, { recursive: true, mode: 0o700 });
      const temporary = Deno.makeTempFileSync({ dir: trustDirectory });
      try {
        Deno.writeTextFileSync(temporary, JSON.stringify(updated, null, 2));
        Deno.renameSync(temporary, file);
      } catch (error) {
        Deno.removeSync(temporary);
        throw error;
      }
    },
  };
};
