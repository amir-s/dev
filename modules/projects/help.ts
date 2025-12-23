import type { HelpDocFN } from "../help/help.ts";

export const cmd = "projects [name] -p -u <user> -o <org>";
export const description =
  "search the name and list all cloned repositories for a user or org";

export const help: HelpDocFN = (DEV: string) => ({
  description: [
    `You can run ${
      `${DEV} projects`.yellow
    } to get a list of all cloned repositories.`,
  ],
  commands: [
    {
      cmd:
        "projects [name] [-p] [-u <user> | --user <user>] [-o <org> | --org <org>]",
      description:
        "search the name and list all cloned repositories for a user or org",
      examples: [
        {
          cmd: "projects",
          description: "list all cloned repositories",
        },
        {
          cmd: "projects rct",
          description: "list all cloned repositories that fuzzy match to rct",
        },
        {
          cmd: "projects -p",
          description: "list all cloned repositories with their paths",
        },
        {
          cmd: "projects -u amir-s",
          description: "list all cloned repositories for user amir-s",
        },
        {
          cmd: "projects nxt -u amir-s",
          description:
            "list all cloned repositories for user amir-s that fuzzy match to nxt",
        },
        {
          cmd: "projects -o github.com",
          description: "list all cloned repositories from github.com",
        },
      ],
    },
  ],
});
