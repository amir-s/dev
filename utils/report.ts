import "colors";
import process from "process";

const message = (value: unknown) =>
  value instanceof Error ? value.stack ?? value.message : String(value);

let stopActivity: (() => void) | undefined;

const log = (
  name: string,
  colored: string,
  value: unknown,
  stream: typeof process.stdout | typeof process.stderr,
) => {
  stopActivity?.();
  stream.write(`${stream.isTTY ? colored : name} ${message(value)}\n`);
};

const report = {
  info(value: unknown) {
    log("info", "info".blue, value, process.stdout);
  },
  success(value: unknown) {
    log("success", "success".green, value, process.stdout);
  },
  warn(value: unknown) {
    log("warning", "warning".yellow, value, process.stderr);
  },
  error(value: unknown) {
    log("error", "error".red, value, process.stderr);
  },
  command(value: unknown) {
    log("command", "command".gray, value, process.stdout);
  },
  inspect(value: unknown) {
    stopActivity?.();
    console.log(Deno.inspect(value, { colors: process.stdout.isTTY }));
  },
  async question(prompt: string): Promise<string> {
    stopActivity?.();
    const { createInterface } = await import("node:readline/promises");
    const readline = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    try {
      return await readline.question(`${"?".blue} ${prompt} `);
    } finally {
      readline.close();
    }
  },
  activity() {
    const frames = ["⠁", "⠂", "⠄", "⡀", "⢀", "⠠", "⠐", "⠈"];
    let index = 0;
    let title = "";
    let ended = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    const render = () => {
      process.stderr.write(
        `\r\x1b[2K${frames[index++ % frames.length]} ${title}`,
      );
    };
    const activity = {
      tick(value: string) {
        if (ended) return;
        title = value;
        if (!process.stderr.isTTY) return;
        render();
        timer ??= setInterval(render, 80);
      },
      end() {
        if (ended) return;
        ended = true;
        if (timer) clearInterval(timer);
        if (process.stderr.isTTY) process.stderr.write("\r\x1b[2K");
        if (stopActivity === activity.end) stopActivity = undefined;
      },
    };
    stopActivity = activity.end;
    return activity;
  },
};

export default report;
