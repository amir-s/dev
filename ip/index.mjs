import report from "yurnalist";
import fetch from "node-fetch";
import { isIP } from "net";
import { spinner } from "../utils/spinner.mjs";

export const run = async ({ config, args }) => {
  const ApiToken = config("ip.ipinfoio.token", null);

  const lookupIP = args[0];

  if (lookupIP) {
    if (!isIP(lookupIP)) {
      return report.error(`${lookupIP} is not a valid IP address`);
    }
  }

  const info = await spinner("Fetching IP information", async () => {
    let url = `https://ipinfo.io/`;
    if (lookupIP) {
      url += `${lookupIP}/`;
    }
    url += "json";
    if (ApiToken) {
      url += `?token=${ApiToken}`;
    }

    const result = await fetch(url);
    return result.json();
  });

  delete info.readme;

  let maxWidth = Object.keys(info).reduce((max, key) => {
    return Math.max(max, key.length);
  }, 0);

  console.log();

  for (let key in info) {
    const value = info[key];
    console.log(
      ` ▸ ${key.padEnd(maxWidth, " ").green}  ${value.toString().bold}`
    );
  }

  process.exit(0);
};
