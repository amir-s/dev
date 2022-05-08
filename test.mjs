import path from "path";
import report from "yurnalist";

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

const failed = [];

async function run() {
  for (const { name, fn } of tests) {
    try {
      await fn();
      report.success(`${name} ✅`);
    } catch (e) {
      failed.push({ name, e });
      report.error(`${name} 💥`);
    }
  }
}

const files = process.argv.slice(2);

global.test = test;

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
      failed.forEach(({ name, e }) => {
        report.error(`${name}`);
        report.error(e);
        console.log("\n");
      });
      process.exit(1);
    }
  })
  .catch(console.error);
