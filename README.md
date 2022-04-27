# dev-cli

I made the `dev` (`dev-cli`) tool to make my life easier. The goal is for `dev-cli` to help me navigate different git projects and automate some processes that I do a lot!


## Install
This tool does not live on the npm registery just yet. But you can install it with

```
npm i -g amir-s/dev-cli
```

To unlock the full potential of `dev-cli`, you might want to install the shell module too, simply run

```
dev-cli shell install
```

This would automatically add the following line to your shell profile file (`~/.zshrc` or `~/.bashrc`):
```
eval "$(dev-cli shell init)"
```

After restarting your shell (or running equivalent of `source ~/.zshrc`), `dev-cli` creates a function for you called `dev`, which you can use instead of `dev-cli`. You can also [customize the name of the function](https://github.com/amir-s/dev-cli/#global-configs).


## Commands


### `clone <repo>`

`dev clone <repo>` clones a git repo locally into `~/src/<org>/<user>/<repo>`.
By default, it'll use `ssh` and also it `cd`s into that said directory (only if shell-module is installed).

`<repo>` can be either full git URL or just the username and repo name:
+ `dev clone https://github.com/amir-s/dev-cli`
+ `dev clone amir-s/dev-cli` (`github.com` will be used as the default host)


#### configs

+ `clone.path` (default: `"<home>/src/<org>/<user>/<repo>"`)
  The clone path.
+ `clone.cd` (default: `true`)
  If `dev-cli` needs to `cd` into the cloned project after it is done.
+ `clone.ssh` (default: `true`)
  If `dev-cli` is forced to use `ssh` to clone the repo. If set to `false`, it'll use `https`.

### `cd <name>` (*Only works if [shell module](https://github.com/amir-s/dev-cli/#install) is installed*)

`dev cd <name>` changes the current working directory to a cloned repo by fuzzy matching the input name.

### `config`
You can set overrides for the configuration of `dev-cli`. The configuration files lives in `~/.dev.config.json`.

Example: `dev config set clone.cd false` sets `clone.cd` to `false`. You can unset the value by providing empty value for a key: `dev config set clone.cd`.

You can also read the config file with `dev config read`.

#### Global Configs

+ `shell.function` (default: `dev`): You can rename the [shell module](https://github.com/amir-s/dev-cli/#install) function with `dev config set shell.function whatever`. After restarting your shell, you can use `whatever` instead of `dev`.
  Do not rename the function to `dev-cli`. It'll conflict with the binary in `npm` and causes function to call itself recursively. It doesn't break your system, but it makes `dev-cli` not work.

### `update`
Run `dev update` to check for updates. You can select to automatially apply the updates, or do it manually with `npm install dev-cli -g`.

## TODO

+ [ ] More documentation! and have help commands for the current modules.
+ [ ] Notify the user about shell module not being installed when using `dev cd`.
+ [ ] `dev open pr` ask to push the current branch to remote and open a browser to create a PR.
+ [ ] Separate config keys to another method so user can see all possible config keys with `dev config list`.
+ [ ] Have a `dev shell local` command to point the current installation version to the local copy for development and testing purposes.
