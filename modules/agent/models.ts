import "colors";
import OpenAI from "openai";
import inquirer from "inquirer";
import { spinner } from "../../utils/spinner.ts";
import type { ConfigFN, WriteConfigFN } from "../config/index.ts";

export async function handleModelSelection(
  apiKey: string,
  config: ConfigFN,
  writeConfig: WriteConfigFN,
) {
  const client = new OpenAI({ apiKey });
  const current = config("agent.model", "gpt-4o")!;

  const availableModels = await spinner(
    "Fetching models",
    async () => {
      const models = await client.models.list();
      const NON_CHAT = ["instruct", "realtime", "audio", "search", "transcribe"];
      const ids: string[] = [];
      for (const m of models.data) {
        if (
          m.id.startsWith("gpt-") &&
          !NON_CHAT.some((k) => m.id.includes(k))
        ) {
          ids.push(m.id);
        }
      }
      return ids.sort();
    },
  );

  if (availableModels.length === 0) {
    console.log("  No gpt-* models found.".red);
    return;
  }

  const { selectedModel } = await inquirer.prompt<{
    selectedModel: string;
  }>([
    {
      type: "list",
      name: "selectedModel",
      message: "Select a model:",
      choices: availableModels.map((id: string) => ({
        name: id === current ? `${id} ${'(current)'.gray}` : id,
        value: id,
      })),
      default: current,
    },
  ]);

  writeConfig("agent.model", selectedModel);
  console.log(`\n  ${'✓'.green} Model set to ${selectedModel.cyan}`);
}
