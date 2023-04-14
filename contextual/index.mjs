import { $ } from "zx";

$.verbose = true;

export const run = async ({ args, config }) => {
  process.env.FORCE_COLOR = "1";

  const useYarn = config("contextual.node.yarn", false);

  try {
    if (useYarn) {
      await $`yarn run ${args}`;
    } else {
      await $`npm run ${args}`;
    }
  } catch (e) {
    process.exit(e.exitCode);
  }
};
