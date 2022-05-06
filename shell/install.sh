<$SHELL_FN_NAME$>() {
  local tempfile exitcode cmd

  tempfile="$(mktemp -u)"
  exec 9>"${tempfile}"
  exec 8<"${tempfile}"
  rm -f "${tempfile}"

  DEV_CLI_BIN_PATH="<$SHELL_BIN_PATH$>" DEV_CLI_SHELL_TYPE="<$SHELL_TYPE$>" <$SHELL_BIN_PATH$> "$@"
  exitcode=$?

  while read -r cmd; do
    case "${cmd}" in
      cd:*) cd "${cmd//cd:/}" ;;
      source:*) source "${cmd//source:/}" ;;
      *) ;;
    esac
  done <&8

  exec 8<&-
  exec 9<&-

  return ${exitcode}
}
