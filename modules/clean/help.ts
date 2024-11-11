import "colors";

export const cmd = "clean";
export const description = "clean up your project.";

export const help = (DEV: string) => ({
  description: [
    `${
      `${DEV} clean`.yellow
    } deletes selected branches that are already merged into the main branch.`,
  ],
  commands: [
    {
      cmd: "clean",
      description:
        "interactively selecte and delete branches that are already merged",
    },
  ],
});
