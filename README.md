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

### `dev clone <repo>`

`dev clone <repo>` clones a git repo locally into `~/src/<org>/<user>/<repo>`.
By default, it'll use `ssh` and also it `cd`s into that said directory (only if shell-module is installed).

`<repo>` can be either full git URL or just the username and repo name:

- `dev clone https://github.com/amir-s/dev`
- `dev clone amir-s/dev` (`github.com` will be used as the default host)

#### configs

- `clone.path` (default: `"<home>/src/<org>/<user>/<repo>"`)
  The clone path.
- `clone.cd` (default: `true`)
  If `dev` needs to `cd` into the cloned project after it is done.
- `clone.ssh` (default: `true`)
  If `dev` is forced to use `ssh` to clone the repo. If set to `false`, it'll use `https`.

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

After restarting your terminal (or `source`ing your shell profile file), `dev` would point to your local copy across your system. You can verify this by running `dev` by itself.

To reset and use production binary run:

```
dev shell use prod
```

## TODO

- [ ] More documentation! and have help commands for the current modules.
- [ ] Make sure `dev` has correct exit codes and actually fails when it should.
- [ ] Notify the user about shell module not being installed when using `dev cd`.
- [ ] Separate config keys to another method so user can see all possible config keys with `dev config list`.
- [ ] Run project specific commands, reading scripts from `package.json` or some sort of custom scripts file like `.dev.json`, or a `dev` section in package.json.
- [ ] Make color of the output lines more consistent.
- [ ] Use [terminal-link](https://github.com/sindresorhus/terminal-link) for links in the terminal.
- [ ] Use [yn](https://github.com/sindresorhus/yn) to parse yes/no responses.
- [ ] Integrate with [insight](https://github.com/yeoman/insight) for telemetry.
- [ ] Use [omelette](https://github.com/f/omelette) for autocomplete
- [ ] Use [sudo-block](https://github.com/sindresorhus/sudo-block)
- [ ] Periodically check for updates and print "update available" messages, with options to suppress it for a version or forever.
- [ ] Make the website https://amir-s.github.io/dev better! Include examples, configuration and help.
