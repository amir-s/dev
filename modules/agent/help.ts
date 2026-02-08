import "colors";
import type { HelpDocFN } from "../help/help.ts";

export const cmd = "agent";
export const description = "AI-powered coding assistant";

export const help: HelpDocFN = () => ({
  description: [
    `Start an interactive AI coding assistant that can read files, make edits, and run commands.`,
    `Requires the ${"OPENAI_API_KEY".yellow} environment variable to be set.`,
  ],
  commands: [
    {
      cmd: "agent",
      description: "Start the AI coding assistant.",
    },
    {
      cmd: "agent model",
      description: "Select an OpenAI model from the API.",
    },
  ],
  configs: [
    {
      key: "agent.model",
      description: "The OpenAI model to use.",
      def: "gpt-4o",
    },
  ],
});
