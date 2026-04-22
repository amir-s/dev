import { report } from "./logger.ts";

export const spinner = async <T>(
  title: string,
  fn: () => Promise<T>,
): Promise<T> => {
  const spinner = report.activity();
  spinner.tick(title);
  try {
    return await fn();
  } finally {
    spinner.end();
  }
};
