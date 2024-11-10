import path from "path";
import report from "yurnalist";
import process from "process";

interface Test {
  prefix: string;
  name: string;
  fn: () => unknown;
}
type FailedTest = Omit<Test & { e: Error }, "fn">;

const tests: Test[] = [];

let testNamePrefix = "";
export function test(name: string, fn: () => unknown) {
  tests.push({
    prefix: testNamePrefix,
    name,
    fn,
  });
}

export function describe(name: string, fn: () => void) {
  testNamePrefix = name;
  fn();
  testNamePrefix = "";
}

const failed: FailedTest[] = [];

async function run() {
  for (const { prefix, name, fn } of tests) {
    try {
      await fn();
      report.success(`${prefix ? `${prefix.blue} ` : ""}${name} ✅`);
    } catch (e) {
      failed.push({ prefix, name, e: e as Error });
      report.error(`${prefix ? `${prefix.blue} ` : ""}${name} 💥`);
    }
  }
}

const files = process.argv.slice(2);

async function runFiles() {
  for (const file of files) {
    await import(path.resolve(file));
  }
  return run();
}

runFiles()
  .then(() => {
    if (failed.length > 0) {
      console.log("\n\n\n\n");
      report.info(`${failed.length} test(s) failed:\n`);
      failed.forEach(({ prefix, name, e }) => {
        report.error(`${prefix ? `${prefix.blue} ` : ""}${name}`);
        report.error(e);
        console.log("\n");
      });
      process.exit(1);
    }
  })
  .catch(console.error);
