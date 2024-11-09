import type { ConfigFN, WriteConfigFN } from "../modules/config/index.ts";

export interface ModuleRunOptions {
  args: string[];
  config: ConfigFN;
  writeConfig: WriteConfigFN;
  cd: (path: string) => unknown;
  source: () => unknown;
}
