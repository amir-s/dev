import "colors";

export const cmd = "create <name> [--public|--private]";
export const description = "create a GitHub repository and clone it locally";

export const help = (DEV: string) => ({
  description: [
    `${`${DEV} create <name>`.yellow} creates a GitHub repository (via ${
      "gh api".green
    }) and then runs ${"dev clone".green} on it.`,
    `If visibility is not provided, you'll be prompted to choose between ${
      "public".green
    } and ${"private".green}.`,
  ],
  commands: [
    {
      cmd: "create my-repo --public",
      description:
        "create a public repo under your GitHub account and clone it",
    },
    {
      cmd: "create my-org/cool-repo --private",
      description: "create a private repo under an organization and clone it",
    },
  ],
});

export const generic = () => {
  console.log("No command specified.".gray);
};
