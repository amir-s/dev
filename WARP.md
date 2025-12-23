# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this
repository.

## Commonly used commands

- Build (DIY):
  ```bash
  deno compile --output dev-cli -A main.ts
  ```

- Build with explicit includes (matches CI for dynamic imports):
  ```bash
  INCLUDES=$(find modules -type f -name "*.ts" -exec echo --include={} \; | xargs); deno compile -A $INCLUDES --output dev-cli main.ts
  ```

- Run all tests:
  ```bash
  deno task test
  ```

- Run a single test file:
  ```bash
  deno run -A test.ts modules/{module}/tests/{file}.test.ts
  ```

- Format and lint:
  ```bash
  deno fmt
  deno fmt --check
  deno lint
  ```

- Release (bumps version, tags and pushes):
  ```bash
  deno task release
  ```
  Note: release scripts enforce being on the correct branch with a clean working
  tree.

- Shell integration (for the dev function and cd/source hand-off):
  ```bash
  dev-cli shell install
  ```
  Toggle local build vs prod binary:
  ```bash
  dev shell use local
  dev shell use prod
  ```

## High-level architecture

- **Entry and dispatch:** main.ts parses argv, fuzzy-matches subcommands, and
  dynamically imports ./modules/NAME/index.ts. It can also route to a contextual
  module when an exact task name exists in package.json or deno.json of the
  current project.

- **Module pattern:** Each module resides under modules/NAME. index.ts exports
  run(), and help.ts exports help metadata. Tests live in
  modules/NAME/tests/*.test.ts and are invoked by the custom test runner
  (test.ts).

- **Configuration:** modules/config loads and persists ~/.dev.config.json,
  exposing config(key, default?) and writeConfig(). Notable keys: clone.path,
  clone.cd, clone.ssh, contextual.node.deno, contextual.node.yarn,
  shell.function, lan.scan.lookup.timeout, ip.ipinfoio.token.

- **Shell integration:** modules/shell provides init, install, and use
  local|prod. At runtime, main.ts writes cd: and source: commands to
  DEV_CLI_CMD_EXEC_FILE for the shell shim to consume, and checks
  DEV_CLI_BIN_PATH to display whether local dev is active.

- **Contextual commands:** modules/contextual chooses deno task CMD by default
  when tasks come from deno.json, else npm run CMD (or yarn if configured) for
  package.json scripts.

- **_cd hooks:** If a project's dev.json defines scripts._cd, modules/_cd
  prompts on first run and records allow/deny in a project-local .dev.json
  (auto-added to common ignore files). Approved commands then run
  non-interactively on future cd.

- **Notable utilities:** utils/spinner.ts wraps yurnalist activity spinners.
  utils/version.ts stores the current version used by main and release.
  utils/release.ts contains release guardrails. utils/knownhosts.ts supports SSH
  known_hosts checks used by clone.

- **Networking and system modules:** modules/lan uses arp, dns-sd, dig,
  chokidar, and a MAC vendor lookup to scan and group devices. modules/ip calls
  ipinfo.io to fetch IP metadata. Several modules rely on git, ssh-keyscan,
  rsync, and related tools.

- **CI and distribution:** GitHub Actions runs tests with Deno 2.x and builds
  multi-OS binaries using deno compile with explicit --include flags. install.sh
  downloads the appropriate artifact for the host OS/arch, installs it as
  dev-cli, and wires the shell init line.

## Important notes

- Deno 2.x is required. Avoid running the CLI with sudo (sudo-block enforces
  this).
- deno compile with dynamic imports requires the explicit includes technique
  shown above; CI's release workflow demonstrates the correct pattern.
- dev up supports exactly one dependency file per project (package.json,
  Gemfile, or requirements.txt); it errors if multiple are present.
- dev open pr prevents PRs from protected branches and will offer to push the
  current branch if needed.
- clone will ssh-keyscan and append unknown hosts to ~/.ssh/known_hosts if
  clone.ssh is true.
