export const script = `
<$SHELL_FN_NAME$>() {
  local tempfile exitcode cmd

  tempfile="$(mktemp)" || return

  DEV_CLI_CMD_EXEC_FILE="$tempfile" DEV_CLI_BIN_PATH=<$SHELL_BIN_PATH$> DEV_CLI_SHELL_TYPE="<$SHELL_TYPE$>" <$SHELL_BIN_PATH$> "$@"
  exitcode=$?

  while IFS= read -r cmd; do
    case "\${cmd}" in
      cd:*) cd -- "\${cmd#cd:}" ;;
      source:*) source "\${cmd#source:}" ;;
      *) ;;
    esac
  done < "\${tempfile}"
  
  rm -f "\${tempfile}"

  return \${exitcode}
}

cd() {
  builtin cd "$@" || return

  if [[ -f "dev.json" ]]; then
    <$SHELL_FN_NAME$> _cd
  fi
}
`;
