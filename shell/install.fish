function <$SHELL_FN_NAME$>
    set -l tempfile (mktemp -u)
  
    env DEV_CLI_BIN_PATH=<$SHELL_BIN_PATH$>, DEV_CLI_CMD_EXEC_FILE=$tempfile <$SHELL_BIN_PATH$> $argv
    set -l exitcode $status
  
    while read cmd
        echo $cmd
        switch $cmd
            case "cd:*"
               cd (string replace -r "cd:" "" -- $cmd)
            case "*"
               # echo do nothing
        end
    end <$tempfile

    rm -f $tempfile
    return $exitcode
end
