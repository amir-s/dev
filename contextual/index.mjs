import { $ } from "zx";

$.verbose = true;

export const run = async ({ args, config }) => {
  const useYarn = config("contextual.node.yarn", false);

  if (useYarn) {
    await $`yarn run ${args}`;
  } else {
    await $`npm run ${args}`;
  }
};
