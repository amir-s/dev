# TLDR

This is a command-line tool for you to do `dev clone user/repo` to clone repos into structured folders, do `dev cd repo` to go to those directories without navigating a million folders, `dev open pr` to open a browser window to open the recently pushed branch.

It's easy to add features and stuff to it too if you continue reading.

# dev

I made the `dev` tool to make my life easier. The goal is for `dev` to help me navigate different git projects and automate some processes that I do a lot!

## Install

You would need a recent version of `node` and `npm`. I would recommend using [nvm](https://github.com/nvm-sh/nvm) to install them.

This tool does not live on the npm registery just yet. But you can install it with

```
npm i -g amir-s/dev
```

To unlock the full potential of `dev` on bash, zsh or fish, you might want to install the shell module, simply run

```
dev shell install
```

This would automatically add the following line to your shell profile file:

```
eval "$(dev-cli shell init <shelltype>)"
```

After restarting your shell (or running equivalent of `source ~/.zshrc`), this allows commands like `dev cd` to work.

You can also [customize the name of the function](https://github.com/amir-s/dev/#global-configs).

## Commands

### `dev clone <repo> [forward args]`

`dev clone <repo>` clones a git repo locally into `~/src/<org>/<user>/<repo>` and then `cd`s into that said directory (only if shell-module is installed).
Any other provided arguments are forwarded to `git clone` command. For example to clone shallowly and only the single branch, you can run `dev clone amir-s/dev --depth 1 --single-branch`.

`<repo>` can be either full git URL or just the username and repo name:

- `dev clone https://github.com/amir-s/dev`
- `dev clone amir-s/dev` (`github.com` will be used as the default host)

#### configs

- `clone.path` (default: `"<home>/src/<org>/<user>/<repo>"`)
  The clone path.
- `clone.cd` (default: `true`)
  If `dev` needs to `cd` into the cloned project after it is done.
- `clone.ssh` (default: `true`)
  If `dev` is needs craft the remote url via `ssh` when a short format repo (example: `amir-s/dev`) is provided. If set to `false`, it'll use `https`.

### `dev open`

Opens the remote URL if the current working directory is a git repository.

### `dev open pr`

Opens the default browser to view or create the PR for the current git branch. If the current branch is not on remote yet, `dev` asks you if you want to push it automatically.
If a pull request is already made but you want to create a new one, you can run `dev open pr --new` to force create a pull request.

### `dev cd <name>` (_Only works if [shell module](https://github.com/amir-s/dev/#install) is installed_)

`dev cd <name>` changes the current working directory to a cloned repo by fuzzy matching the input name.

### `dev up`

Run `dev up` in your project to install dependencies, as long as you are using node (`package.json` via `yarn` or `npm`), ruby (`Gemfile` via `bundle`) or python (`requirements.txt` via `pip`).

### `dev <contextual-command>`

You can run any command that is available in the script section of `package.json` in the current working directory, if there is one. For example, if you have a `package.json` file like this:

```
{
  "scripts": {
    "build": "react-scripts build",
  }
}
```

then you can run `dev build` to execute it.

#### configs

- `contextual.node.yarn` (default: `false`) if `dev` is forced to run `yarn run` instead of `npm run` to execute the command.

### `dev ls`

List all the contextual commands.

### `dev projects`

Run `dev ps` (fuzzy matched to `projects`) to list all the cloned repos you have on your local machine.

#### arguments

- `-p` to show each project's path.
- `-u <user>`/`--user <user>` to filter projects by user.
- `-o <org>`/`--org <org>` to filter projects by organization.

### `dev lan scan`

Scan your local network for active devices and get a list of IP addresses, MAC addresses and their vendor. Plus, it does a reverse mDNS lookup on the IP addresses and shows the local domain if there is any.

#### arguments

By default `dev lan scan` groups the devices by vendor.

- `--no-mac` skip MAC address vendor check.
- `--no-mdns` skip reverse mDNS lookup.
- `--list | -l | ls` generates a list sorted by IP address.
- `--services | -s` use `dns-sd` to discover services on the network.

#### configs

- `lan.scan.lookup.timeout` (default: `3000`ms) the default timeout for reverse mDNS lookup and MAC address vendor check.

### `dev lan sync [local] [remote]` (experimental)

Syncs a local folder on a remote folder with `rsync`. It will watch for changes and sync them automatically.

#### arguments

- `--dot` force `rsync` to sync dot files.
- `--node_modules` force `rsync` to sync `node_modules` folder.

### `dev ip [ip address]`

Get information about an IP address. If no IP address is provided, it'll use the current IP address.

#### configs

- `ip.ipinfoio.token` (default: `null`) the token for the ipinfo.io API.

### `dev config`

You can set overrides for the configuration of `dev`. The configuration files lives in `~/.dev.config.json`.

Example: `dev config set clone.cd false` sets `clone.cd` to `false`. You can unset the value by providing empty value for a key: `dev config set clone.cd`.

You can also read the config file with `dev config read`.

#### Global Configs

- `shell.function` (default: `dev`): You can rename the [shell module](https://github.com/amir-s/dev/#install) function with `dev config set shell.function whatever`. After restarting your shell, you can use `whatever` instead of `dev`.

### `dev update`

Run `dev update` to check for updates. You can select to automatially apply the updates, or do it manually with `npm install amir-s/dev -g`.

## Development

You can clone this repo (using `dev` itself, of course) and make changes.
Assuming you have installed the [shell module](https://github.com/amir-s/dev/#install), you can swap out the production version with your local version of `dev` by `cd`ing into your local copy and running:

```
dev shell use local
```

`dev` will try to `source` your shell profile file by itself, but you may still need to restart your terminal. Then `dev` would point to your local copy across your system. You should verify this by running `dev` by itself.

To reset and use production binary run:

```
dev shell use prod
```

## TODO

- [ ] More documentation! and have help commands for the current modules.
- [ ] Make sure `dev` has correct exit codes and actually fails when it should.
- [ ] Separate config keys to another method so user can see all possible config keys with `dev config list`.
- [ ] Run project specific commands, reading scripts from `package.json` or some sort of custom scripts file like `.dev.json`, or a `dev` section in package.json.
- [ ] Make color of the output lines more consistent.
- [ ] Use [terminal-link](https://github.com/sindresorhus/terminal-link) for links in the terminal.
- [ ] Integrate with [insight](https://github.com/yeoman/insight) for telemetry.
- [ ] Use [omelette](https://github.com/f/omelette) for autocomplete
- [ ] Periodically check for updates and print "update available" messages, with options to suppress it for a version or forever.
- [ ] Make the website https://amir-s.github.io/dev better! Include examples, configuration and help.
- [ ] Make `dev <contextual-command>` work with interactive commands like `ssh`.
