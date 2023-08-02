export const cmd = "projects -p -u <user> -o <org>";
export const description = "list all cloned repositories for a user or org";

export const help = (DEV) => ({
  description: [
    `You can run ${
      `${DEV} projects`.yellow
    } to get a list of all cloned repositories.`,
  ],
  commands: [
    {
      cmd: "projects [-p] [-u <user> | --user <user>] [-o <org> | --org <org>]",
      description: "list all cloned repositories for a user or org",
      examples: [
        {
          cmd: "projects",
          description: "list all cloned repositories",
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
          cmd: "projects -o github.com",
          description: "list all cloned repositories from github.com",
        },
      ],
    },
  ],
});
