import process from "process";
import { createInterface } from "node:readline";
import "colors";
import OpenAI from "openai";

import {
  toolDefinitions,
  responsesToolDefinitions,
  executeTool,
  TOOLS_REQUIRING_APPROVAL,
} from "./tools.ts";
import { handleModelSelection } from "./models.ts";
import {
  displayToolHeader,
  displayEditDiff,
  displayWritePreview,
  displayCommandResult,
  displaySuccess,
  displayError,
  messageBoxTop,
  messageBoxPrefix,
  messageBoxBottom,
  messageBoxText,
  createStreamWriter,
} from "./ui.ts";
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

// --- Chat Completions streaming (for chat models) ---

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
  const toolCallMap = new Map<number, ToolCallAccumulator>();
  const writer = createStreamWriter();
  const prefix = messageBoxPrefix();

  for await (const chunk of stream) {
    const choice = chunk.choices[0];
    if (!choice) continue;

    const delta = choice.delta;

    if (delta?.content) {
      if (!writer.hasContent()) {
        console.log("");
        messageBoxTop("agent");
        process.stdout.write(prefix);
      }
      writer.write(delta.content);
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

  if (writer.hasContent()) {
    writer.finish();
    messageBoxBottom();
  }

  return {
    content,
    toolCalls: Array.from(toolCallMap.values()),
  };
}

// --- Agent loop ---

async function chatAgentLoop(
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

      const needsApproval = TOOLS_REQUIRING_APPROVAL.includes(tc.name);

      // Phase 1: Preview
      switch (tc.name) {
        case "read_file":
          displayToolHeader("read_file", String(args.path), false);
          break;
        case "list_directory":
          displayToolHeader("list_directory", String(args.path), false);
          break;
        case "write_file":
          displayToolHeader("write_file", String(args.path), true);
          displayWritePreview(String(args.path), String(args.content));
          break;
        case "edit_file":
          displayToolHeader("edit_file", String(args.path), true);
          displayEditDiff(
            String(args.path),
            String(args.old_string),
            String(args.new_string),
          );
          break;
        case "run_command":
          displayToolHeader(
            "run_command",
            `${"$".gray} ${String(args.command)}`,
            true,
          );
          break;
      }

      // Phase 2: Approval
      if (needsApproval) {
        const answer = await ask(
          rl,
          `  ${"allow?".yellow} [${"Y".bold}/n] `,
        );
        if (answer.trim().toLowerCase() === "n") {
          displayError("denied");
          messages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: "Action denied by the user.",
          });
          continue;
        }
      }

      // Phase 3: Execute
      const result = await executeTool(tc.name, args);

      // Phase 4: Result
      switch (tc.name) {
        case "run_command":
          displayCommandResult(result.content, result.exitCode ?? 0);
          break;
        case "write_file":
        case "edit_file":
          if (result.success) {
            displaySuccess("done");
          } else {
            displayError(result.content);
          }
          break;
      }

      messages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: result.content,
      });
    }
  }
}

// --- Entry point ---

// --- Model capability detection ---

function isResponsesOnlyModel(model: string): boolean {
  return model.includes("codex");
}

// --- Responses API (for Codex and responses-only models) ---

async function responsesAgentTurn(
  client: OpenAI,
  prevResponseId: string | null,
  rl: RL,
  model: string,
  userInput: string,
): Promise<string | null> {
  // Build input: just the new user message (previous context via previous_response_id)
  const input: { role: "user"; content: string }[] = [
    { role: "user", content: userInput },
  ];

  let currentResponseId = prevResponseId;

  while (true) {
    // deno-lint-ignore no-explicit-any
    const response: any = await client.responses.create({
      model,
      instructions: SYSTEM_PROMPT.replace("{{CWD}}", process.cwd()),
      input: currentResponseId ? input : input,
      tools: responsesToolDefinitions,
      previous_response_id: currentResponseId ?? undefined,
      truncation: "auto",
    });

    currentResponseId = response.id;

    // Collect function calls from output
    const toolCalls = (response.output ?? []).filter(
      // deno-lint-ignore no-explicit-any
      (item: any) => item.type === "function_call",
    );

    if (toolCalls.length === 0) {
      const text: string = response.output_text ?? "";
      if (text) {
        console.log("");
        messageBoxTop("agent");
        messageBoxText(text);
        messageBoxBottom();
      }
      return currentResponseId;
    }

    // Preview + approval + execute tool calls, then submit outputs as a new turn
    // deno-lint-ignore no-explicit-any
    const toolOutputs: any[] = [];

    // deno-lint-ignore no-explicit-any
    for (const tc of toolCalls as any[]) {
      const name: string = tc.name;
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(tc.arguments);
      } catch {
        toolOutputs.push({
          type: "function_call_output",
          call_id: tc.call_id,
          output: "Error: bad tool arguments",
        });
        continue;
      }

      const needsApproval = TOOLS_REQUIRING_APPROVAL.includes(name);

      // Preview
      switch (name) {
        case "read_file":
          displayToolHeader("read_file", String(args.path), false);
          break;
        case "list_directory":
          displayToolHeader("list_directory", String(args.path), false);
          break;
        case "write_file":
          displayToolHeader("write_file", String(args.path), true);
          displayWritePreview(String(args.path), String(args.content));
          break;
        case "edit_file":
          displayToolHeader("edit_file", String(args.path), true);
          displayEditDiff(
            String(args.path),
            String(args.old_string),
            String(args.new_string),
          );
          break;
        case "run_command":
          displayToolHeader(
            "run_command",
            `${"$".gray} ${String(args.command)}`,
            true,
          );
          break;
      }

      // Approval
      if (needsApproval) {
        const answer = await ask(
          rl,
          `  ${"allow?".yellow} [${"Y".bold}/n] `,
        );
        if (answer.trim().toLowerCase() === "n") {
          displayError("denied");
          toolOutputs.push({
            type: "function_call_output",
            call_id: tc.call_id,
            output: "Action denied by the user.",
          });
          continue;
        }
      }

      // Execute
      const result = await executeTool(name, args);

      // Results UI
      if (name === "run_command") {
        displayCommandResult(result.content, result.exitCode ?? 0);
      } else if (name === "write_file" || name === "edit_file") {
        result.success ? displaySuccess("done") : displayError(result.content);
      }

      toolOutputs.push({
        type: "function_call_output",
        call_id: tc.call_id,
        output: result.content,
      });
    }

    // Submit tool outputs as a new response turn using previous_response_id
    input.length = 0;
    input.push(
      // deno-lint-ignore no-explicit-any
      ...(toolOutputs as any),
    );
  }
}

export const run = async ({ args, config, writeConfig }: ModuleRunOptions) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log(
      `\n  ${"OPENAI_API_KEY".bold} is not set. Set it to use ${"dev agent".green}:\n\n` +
        `  ${"export OPENAI_API_KEY=sk-...".yellow}\n`,
    );
    return;
  }

  if (args[0] === "model") {
    await handleModelSelection(apiKey, config, writeConfig);
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
  let prevResponseId: string | null = null;

  while (true) {
    console.log("");
    messageBoxTop("you");
    const input = await ask(rl, messageBoxPrefix());
    messageBoxBottom();
    if (!input.trim()) continue;

    const msgCount = messages.length;

    try {
      if (isResponsesOnlyModel(model)) {
        prevResponseId = await responsesAgentTurn(
          client,
          prevResponseId,
          rl,
          model,
          input,
        );
      } else {
        messages.push({ role: "user", content: input });
        await chatAgentLoop(client, messages, rl, model);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`\n  ${"error".red.bold}: ${msg}`);
      // Roll back to clean state so next turn isn't broken
      messages.length = msgCount;
    }
  }
};
