import process from "process";
import { createInterface } from "node:readline";
import "colors";
import OpenAI from "openai";

import {
  toolDefinitions,
  executeTool,
  TOOLS_REQUIRING_APPROVAL,
} from "./tools.ts";
import type { ModuleRunOptions } from "../../utils/types.ts";

const SYSTEM_PROMPT = `You are dev agent, a coding assistant running in the terminal.
You have tools to read files, edit files, list directories, and run shell commands.

Guidelines:
- Always read a file before editing it to understand its full context.
- Use edit_file for targeted changes to existing files (search and replace).
- Use write_file for creating new files or complete rewrites.
- Keep changes minimal and focused.
- Explain what you're doing briefly.

Working directory: {{CWD}}`;

// --- Helpers ---

type RL = ReturnType<typeof createInterface>;

const ask = (rl: RL, prompt: string): Promise<string> =>
  new Promise((resolve) => rl.question(prompt, resolve));

// --- Streaming ---

interface ToolCallAccumulator {
  id: string;
  name: string;
  arguments: string;
}

async function streamResponse(
  client: OpenAI,
  // deno-lint-ignore no-explicit-any
  messages: any[],
  model: string,
) {
  const stream = await client.chat.completions.create({
    model,
    messages,
    tools: toolDefinitions,
    stream: true,
  });

  let content = "";
  let startedContent = false;
  const toolCallMap = new Map<number, ToolCallAccumulator>();

  for await (const chunk of stream) {
    const choice = chunk.choices[0];
    if (!choice) continue;

    const delta = choice.delta;

    if (delta?.content) {
      if (!startedContent) {
        process.stdout.write("\n");
        startedContent = true;
      }
      process.stdout.write(delta.content);
      content += delta.content;
    }

    if (delta?.tool_calls) {
      for (const tc of delta.tool_calls) {
        if (!toolCallMap.has(tc.index)) {
          toolCallMap.set(tc.index, { id: "", name: "", arguments: "" });
        }
        const acc = toolCallMap.get(tc.index)!;
        if (tc.id) acc.id = tc.id;
        if (tc.function?.name) acc.name += tc.function.name;
        if (tc.function?.arguments) acc.arguments += tc.function.arguments;
      }
    }
  }

  if (startedContent) {
    process.stdout.write("\n");
  }

  return {
    content,
    toolCalls: Array.from(toolCallMap.values()),
  };
}

// --- Tool display ---

function displayToolCall(name: string, args: Record<string, unknown>) {
  const needsApproval = TOOLS_REQUIRING_APPROVAL.includes(name);
  const bullet = needsApproval ? "●".yellow : "●".gray;
  const label = needsApproval ? name.yellow : name.gray;

  switch (name) {
    case "read_file":
    case "list_directory":
      console.log(`\n  ${bullet} ${label} ${String(args.path)}`);
      break;

    case "write_file": {
      const lineCount = String(args.content).split("\n").length;
      console.log(
        `\n  ${bullet} ${label} ${String(args.path)} ${`(${lineCount} lines)`.gray}`,
      );
      break;
    }

    case "edit_file": {
      console.log(`\n  ${bullet} ${label} ${String(args.path)}`);
      const oldLines = String(args.old_string).split("\n");
      const newLines = String(args.new_string).split("\n");
      const MAX = 8;
      for (const line of oldLines.slice(0, MAX)) {
        console.log(`    ${"−".red} ${line.red}`);
      }
      if (oldLines.length > MAX) {
        console.log(`    ${"…".gray} (${oldLines.length - MAX} more)`);
      }
      for (const line of newLines.slice(0, MAX)) {
        console.log(`    ${"+".green} ${line.green}`);
      }
      if (newLines.length > MAX) {
        console.log(`    ${"…".gray} (${newLines.length - MAX} more)`);
      }
      break;
    }

    case "run_command":
      console.log(
        `\n  ${bullet} ${label} ${("$ " + String(args.command)).white}`,
      );
      break;
  }
}

// --- Agent loop ---

async function agentLoop(
  client: OpenAI,
  // deno-lint-ignore no-explicit-any
  messages: any[],
  rl: RL,
  model: string,
) {
  while (true) {
    const { content, toolCalls } = await streamResponse(
      client,
      messages,
      model,
    );

    if (toolCalls.length === 0) {
      if (content) {
        messages.push({ role: "assistant", content });
      }
      break;
    }

    // Assistant message with tool calls
    messages.push({
      role: "assistant",
      content: content || null,
      tool_calls: toolCalls.map((tc) => ({
        id: tc.id,
        type: "function",
        function: { name: tc.name, arguments: tc.arguments },
      })),
    });

    // Execute each tool
    for (const tc of toolCalls) {
      let args: Record<string, unknown>;
      try {
        args = JSON.parse(tc.arguments);
      } catch {
        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: "Error: Failed to parse tool arguments as JSON.",
        });
        continue;
      }

      displayToolCall(tc.name, args);

      let result: string;
      if (TOOLS_REQUIRING_APPROVAL.includes(tc.name)) {
        const answer = await ask(rl, `  ${"allow?".yellow} [${"Y".bold}/n] `);
        if (answer.trim().toLowerCase() === "n") {
          result = "Action denied by the user.";
          console.log(`  ${"denied".red}`);
        } else {
          result = await executeTool(tc.name, args);
        }
      } else {
        result = await executeTool(tc.name, args);
      }

      messages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: result,
      });
    }
  }
}

// --- Entry point ---

export const run = async ({ config }: ModuleRunOptions) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log(
      `\n  ${"OPENAI_API_KEY".bold} is not set. Set it to use ${"dev agent".green}:\n\n` +
        `  ${"export OPENAI_API_KEY=sk-...".yellow}\n`,
    );
    return;
  }

  const model = config("agent.model", "gpt-4o")!;
  const client = new OpenAI({ apiKey });
  const cwd = process.cwd();

  console.log(
    `\n  ${"dev agent".bold} ${"—".gray} AI coding assistant` +
      `\n  ${"model".gray} ${model.cyan}  ${"cwd".gray} ${cwd}` +
      `\n  Type a message or press ${"Ctrl+C".bold} to exit.\n`,
  );

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("close", () => {
    console.log("\n");
    process.exit(0);
  });

  // deno-lint-ignore no-explicit-any
  const messages: any[] = [
    {
      role: "system",
      content: SYSTEM_PROMPT.replace("{{CWD}}", cwd),
    },
  ];

  while (true) {
    const input = await ask(rl, `\n${"you".green.bold} ${"▸".green} `);
    if (!input.trim()) continue;

    const msgCount = messages.length;
    messages.push({ role: "user", content: input });

    try {
      await agentLoop(client, messages, rl, model);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`\n  ${"error".red.bold}: ${msg}`);
      // Roll back to clean state so next turn isn't broken
      messages.length = msgCount;
    }
  }
};
