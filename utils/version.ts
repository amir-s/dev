import fs from "fs";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

export const getCurrentVersion = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const packageFile = path.resolve(__dirname, "../package.json");
  const { version } = JSON.parse(fs.readFileSync(packageFile, "utf-8"));
  return version;
};
