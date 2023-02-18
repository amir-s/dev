import path from "path";
import report from "yurnalist";

const tests = [];
let testNamePrefix = "";
function test(name, fn) {
  tests.push({
    prefix: testNamePrefix,
    name,
    fn,
  });
}

function describe(name, fn) {
  testNamePrefix = name;
  fn();
  testNamePrefix = "";
}

const failed = [];

async function run() {
  for (const { prefix, name, fn } of tests) {
    try {
      await fn();
      report.success(`${prefix ? `${prefix.blue} ` : ""}${name} ✅`);
    } catch (e) {
      failed.push({ prefix, name, e });
      report.error(`${prefix ? `${prefix.blue} ` : ""}${name} 💥`);
    }
  }
}

const files = process.argv.slice(2);

global.test = test;
global.describe = describe;

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
