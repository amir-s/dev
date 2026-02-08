import fs from "fs";
import path from "path";
import { $ } from "zx";

$.verbose = false;

export const TOOLS_REQUIRING_APPROVAL = [
  "write_file",
  "edit_file",
  "run_command",
];

export const toolDefinitions = [
  {
    type: "function" as const,
    function: {
      name: "read_file",
      description:
        "Read the contents of a file. Returns content with line numbers. Always use this before editing a file.",
      parameters: {
        type: "object" as const,
        properties: {
          path: {
            type: "string",
            description:
              "File path, relative to the working directory or absolute.",
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_directory",
      description: "List files and directories at the given path.",
      parameters: {
        type: "object" as const,
        properties: {
          path: {
            type: "string",
            description:
              "Directory path, relative to the working directory or absolute. Use '.' for the current directory.",
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "write_file",
      description:
        "Create a new file or completely overwrite an existing file. Use for new files or full rewrites. Requires user approval.",
      parameters: {
        type: "object" as const,
        properties: {
          path: { type: "string", description: "File path." },
          content: {
            type: "string",
            description: "The complete file content to write.",
          },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "edit_file",
      description:
        "Edit a file by finding and replacing an exact string. The old_string must match exactly (including whitespace and indentation). Always read the file first. Requires user approval.",
      parameters: {
        type: "object" as const,
        properties: {
          path: { type: "string", description: "File path." },
          old_string: {
            type: "string",
            description: "The exact string to find in the file.",
          },
          new_string: {
            type: "string",
            description: "The string to replace it with.",
          },
        },
        required: ["path", "old_string", "new_string"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "run_command",
      description:
        "Run a shell command and return its output. Requires user approval.",
      parameters: {
        type: "object" as const,
        properties: {
          command: {
            type: "string",
            description: "The shell command to execute.",
          },
        },
        required: ["command"],
      },
    },
  },
];

// --- Tool implementations ---

function readFile(args: { path: string }): string {
  try {
    const filePath = path.resolve(args.path);
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    return lines.map((line, i) => `${i + 1}|${line}`).join("\n");
  } catch (err: unknown) {
    return `Error: ${err instanceof Error ? err.message : String(err)}`;
  }
}

function listDirectory(args: { path: string }): string {
  try {
    const dirPath = path.resolve(args.path);
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    return entries
      .map((e) => `${e.isDirectory() ? "[dir] " : "      "}${e.name}`)
      .join("\n");
  } catch (err: unknown) {
    return `Error: ${err instanceof Error ? err.message : String(err)}`;
  }
}

function writeFile(args: {
  path: string;
  content: string;
}): string {
  try {
    const filePath = path.resolve(args.path);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, args.content);
    return `Successfully wrote ${filePath}`;
  } catch (err: unknown) {
    return `Error: ${err instanceof Error ? err.message : String(err)}`;
  }
}

function editFile(args: {
  path: string;
  old_string: string;
  new_string: string;
}): string {
  try {
    const filePath = path.resolve(args.path);
    const content = fs.readFileSync(filePath, "utf-8");
    if (!content.includes(args.old_string)) {
      return "Error: old_string not found in file. Make sure it matches exactly, including whitespace and indentation.";
    }
    const occurrences = content.split(args.old_string).length - 1;
    if (occurrences > 1) {
      return `Error: old_string found ${occurrences} times. Provide a more unique string to avoid ambiguity.`;
    }
    const newContent = content.replace(args.old_string, args.new_string);
    fs.writeFileSync(filePath, newContent);
    return `Successfully edited ${filePath}`;
  } catch (err: unknown) {
    return `Error: ${err instanceof Error ? err.message : String(err)}`;
  }
}

async function runCommand(args: { command: string }): Promise<string> {
  try {
    const result = await $`bash -c ${args.command}`.nothrow();
    let output = "";
    if (result.stdout) output += result.stdout;
    if (result.stderr) output += (output ? "\n" : "") + result.stderr;
    if (result.exitCode !== 0) {
      output += `\nProcess exited with code ${result.exitCode}`;
    }
    if (output.length > 20000) {
      output = output.slice(0, 20000) + "\n...(output truncated)";
    }
    return output || "(no output)";
  } catch (err: unknown) {
    return `Error: ${err instanceof Error ? err.message : String(err)}`;
  }
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
): Promise<string> {
  switch (name) {
    case "read_file":
      return readFile(args as { path: string });
    case "list_directory":
      return listDirectory(args as { path: string });
    case "write_file":
      return writeFile(args as { path: string; content: string });
    case "edit_file":
      return editFile(
        args as { path: string; old_string: string; new_string: string },
      );
    case "run_command":
      return await runCommand(args as { command: string });
    default:
      return `Error: Unknown tool "${name}"`;
  }
}
