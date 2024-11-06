import fs from "fs";
import { $ } from "zx";

$.verbose = false;

interface TaskInfo {
  name: string;
  command: string;
  source: string;
}

const readTasks = () => {
  const files = ["package.json", "deno.json"];
  const all: {
    [key: string]: TaskInfo;
  } = {};
  for (const file of files) {
    if (fs.existsSync(file)) {
      const pkg = JSON.parse(fs.readFileSync(file, "utf8"));
      const tasks = pkg.scripts || pkg.tasks;
      if (tasks) {
        for (const name in tasks) {
          const command = tasks[name];
          const source = file;
          all[name] = { name, command, source };
        }
      }
    }
  }
  return all;
};

export const list = async (): Promise<string[]> => {
  const tasks = await readTasks();
  return tasks ? Object.keys(tasks) : [];
};

export const commands = async () => {
  const tasks = await readTasks();
  return tasks || {};
};
