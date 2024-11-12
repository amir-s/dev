export const script = `
function <$SHELL_FN_NAME$>
    set -l tempfile (mktemp -u)
  
    env DEV_CLI_BIN_PATH="<$SHELL_BIN_PATH$>" DEV_CLI_CMD_EXEC_FILE="$tempfile" DEV_CLI_SHELL_TYPE="<$SHELL_TYPE$>" <$SHELL_BIN_PATH$> $argv
    set -l exitcode $status
  
    if test -f $tempfile
        while read cmd
            switch $cmd
                case "cd:*"
                cd (string replace -r "cd:" "" -- $cmd)
                case "source:*"
                source (string replace -r "source:" "" -- $cmd)
                case "env:*"
                set cmd (string replace -r "env:" "" -- $cmd)
                case "*"
                # echo do nothing
            end
        end <$tempfile
    end
    
    # add an empty line to the end of the output
    echo ""

    rm -f $tempfile
    return $exitcode
end
`;
