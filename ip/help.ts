export const cmd = "ip <ip>";
export const description =
  "show information about an IP address or the current IP address";

export const help = (DEV) => ({
  description: [
    `get information about your own IP address or any other IP address.`,
  ],
  commands: [
    {
      cmd: "ip <IP>",
      description: "show information about an IP address.",
      examples: [
        {
          cmd: "ip 4.2.2.4",
          description: "show information about 4.2.2.4",
        },
      ],
    },
    {
      cmd: "ip",
      description: "show information about your own IP address",
    },
  ],
  configs: [
    {
      key: "ip.ipinfoio.token",
      description: `the token to use to access ipinfo.io API. You can get one from ${
        "https://ipinfo.io".green
      }`,
      def: "null",
    },
  ],
});
