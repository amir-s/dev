import fs from "fs";
import report from "yurnalist";

const KV_FILE = ".dev.json";

const ignoreFile = (filename: string) => {
  return [".gitignore", ".npmignore", ".dockerignore"].filter((ignoreFile) => {
    if (!fs.existsSync(ignoreFile)) {
      return false;
    }
    const content = Deno.readTextFileSync(ignoreFile).split("\n");
    if (content.includes(filename)) {
      return false;
    }
    Deno.writeTextFileSync(ignoreFile, `${content.join("\n")}\n${filename}\n`);
    return true;
  });
};

const setupKV = () => {
  if (fs.existsSync(KV_FILE)) return;

  Deno.writeTextFileSync(KV_FILE, "{}");

  const addedTo = ignoreFile(KV_FILE);
  console.log();
  if (addedTo.length === 0) {
    report.info(`${KV_FILE.green} was created.`);
  } else {
    report.info(
      `${KV_FILE.green} was created and added to ${addedTo.join(", ")}.`
    );
  }
  report.info(
    `Please add ${KV_FILE.green} to the appropriate ignore file and commit it to git.`
  );
  report.info(
    `You will use this file to store your configuration for dev.json. You can modify it manually!`
  );
  console.log();
};

const readKV = function <T>(scope: string, key: string): T | null {
  if (!fs.existsSync(KV_FILE)) {
    return null;
  }
  const content = Deno.readTextFileSync(KV_FILE);
  const json = JSON.parse(content);
  return json[scope]?.[key] || null;
};

const writeKV = function <T>(scope: string, key: string, value: T) {
  setupKV();
  const content = Deno.readTextFileSync(KV_FILE);
  const json = JSON.parse(content);
  if (!json[scope]) {
    json[scope] = {};
  }
  json[scope][key] = value;
  Deno.writeTextFileSync(KV_FILE, JSON.stringify(json, null, 2));
  return kv;
};

export const kv = {
  read: readKV,
  write: writeKV,
};

export type KV = typeof kv;
