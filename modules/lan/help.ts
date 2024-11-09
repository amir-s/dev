import "colors";
import type { HelpDocFN } from "../help/help.ts";

export const cmd = ["lan scan", "lan sync <local> <remote>"];
export const description =
  "scan the local network for devices or sync files in the network";

export const help: HelpDocFN = () => ({
  description: [
    `provides functionality to scan the local network for devices or sync files in the network.`,
  ],
  commands: [
    {
      cmd: "lan scan [--no-mac] [--no-mdns] [--list | -l | ls] [--services | -s]",
      description:
        "scan the local network for devices and lookup their mac address vendors. it also does a reverse mDNS lookup on the IP addresses and shows the local domain if there is any.",
      examples: [
        {
          cmd: "lan scan",
          description:
            "scan the local network for devices, group by their mac vendors.",
        },
        {
          cmd: "lan scan --no-mac",
          description:
            "scan the local network for devices, don't lookup mac vendors.",
        },
        {
          cmd: "lan scan --no-mdns",
          description:
            "scan the local network for devices, don't do reverse mDNS lookup.",
        },
        {
          cmd: "lan scan --list",
          description:
            "scan the local network for devices, list the results instead of grouping them.",
        },
        {
          cmd: "lan scan --services",
          description:
            "scan the local network for devices, list the services of each device.",
        },
      ],
    },
    {
      cmd: "lan sync <local> <remote> [--dot] [--node_modules]",
      description: `syncs a local folder with a remote folder with ${
        "rsync".green
      }. it watches for changes and sync them automatically.`,
      examples: [
        {
          cmd: "lan sync ./src amir@rpi.local:/home/amir/src",
          description:
            "syncs the local src folder with the remote src folder on rpi.local.",
        },
        {
          cmd: "lan sync ./src amir@rpi.local:/home/amir/src --dot",
          description: "including dot files when doing the sync.",
        },
        {
          cmd: "lan sync ./src amir@rpi.local:/home/amir/src --node_modules",
          description: "including node_modules folder when doing the sync.",
        },
      ],
    },
  ],
});

export const generic = () => {
  console.log("no command specified.".gray);
};
