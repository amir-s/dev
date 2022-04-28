import report from "yurnalist";

export const spinner = async (title, fn) => {
  const spinner = report.activity();
  spinner.tick(title);
  try {
    const result = await fn();
    spinner.end();
    return result;
  } catch (err) {
    spinner.end();
    throw err;
  }
};
