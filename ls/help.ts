export const cmd = "ls";
export const description =
  "list all available contextual commands for the current project";

export const help = (DEV: string) => ({
  description: [
    `You can run ${
      `${DEV} ls`.yellow
    } to get a list of all available contextual commands.`,
  ],
  commands: [
    {
      cmd: "ls",
      description: "list all available contextual commands",
    },
  ],
});
