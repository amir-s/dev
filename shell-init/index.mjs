import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { fs } from "zx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const run = async ({ config }) => {
  const functionName = config("shell.function", "dev");

  const script = fs
    .readFileSync(path.join(__dirname, "./install.sh"), "utf8")
    .replace("<$SHELL_FN_NAME$>", functionName);

  console.log(script);
};
