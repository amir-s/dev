const decoder = new TextDecoder();

// Check if version argument is provided
if (Deno.args.length < 1) {
  console.error("Please provide a version number (e.g., v1.0.0).");
  Deno.exit(1);
}

const version = Deno.args[0];

// Run the git commit command
const commitCommand = new Deno.Command("git", {
  args: ["commit", "--allow-empty", "-am", `Release ${version}`],
  stdout: "piped",
  stderr: "piped",
});

const {
  code: commitCode,
  stdout: commitOutput,
  stderr: commitError,
} = await commitCommand.output();

if (commitCode !== 0 || commitError.length > 0) {
  console.error(`exit code: ${commitCode}`);
  console.error(decoder.decode(commitError));
  Deno.exit(1);
}

console.log(decoder.decode(commitOutput));

const tagCommand = new Deno.Command("git", {
  args: ["tag", "-a", version, "-m", `Version ${version} release`],
  stdout: "piped",
  stderr: "piped",
});

const {
  code: tagCode,
  stdout: tagOutput,
  stderr: tagError,
} = await tagCommand.output();

if (tagCode !== 0 || tagError.length > 0) {
  console.error(`exit code: ${tagCode}`);
  console.error(decoder.decode(tagError));
  Deno.exit(1);
}

console.log(decoder.decode(tagOutput));
const pushCommand = new Deno.Command("git", {
  args: ["push", "origin", "main", "--tags"],
  stdout: "piped",
  stderr: "piped",
});

const {
  code: pushCode,
  stdout: pushOutput,
  stderr: pushError,
} = await pushCommand.output();

if (pushCode !== 0 || pushError.length > 0) {
  console.error(`exit code: ${pushCode}`);
  console.error(decoder.decode(pushError));
  Deno.exit(1);
}

console.log(decoder.decode(pushOutput));

console.log(`Successfully tagged and pushed ${version}`);
