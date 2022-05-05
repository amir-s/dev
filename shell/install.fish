function <$SHELL_FN_NAME$>
    set -l tempfile (mktemp -u)
    exec 9>$tempfile
    exec 8<$tempfile
    rm -f $tempfile
  
    set DEV_CLI_BIN_PATH <$SHELL_BIN_PATH$> <$SHELL_BIN_PATH$> $argv
    set -l exitcode $status
  
    while read cmd
        switch $cmd
            case "cd:*"
               cd (string replace -r "cd:" "" -- $cmd)
            case "*"
               # echo do nothing
        end
    end <&8
  
    exec 8<&-
    exec 9<&-
  
    return $exitcode
end
