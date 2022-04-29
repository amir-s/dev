<$SHELL_FN_NAME$>() {
  export DEV_CLI_BIN_PATH="<$SHELL_BIN_PATH$>"

  local tempfile exitcode cmd

  tempfile="$(mktemp -u)"
  exec 9>"${tempfile}"
  exec 8<"${tempfile}"
  rm -f "${tempfile}"

  <$SHELL_BIN_PATH$> "$@"
  exitcode=$?

  while read -r cmd; do
    case "${cmd}" in
      cd:*) cd "${cmd//cd:/}" ;;
      *) ;;
    esac
  done <&8

  exec 8<&-
  exec 9<&-

  return ${exitcode}
}
