#!/bin/bash
set -euo pipefail

DEV_INSTALL_FUNCTIONS_ONLY=1
source "$(dirname "$0")/../install.sh"

directory=$(mktemp -d)
trap 'rm -rf "$directory"' EXIT
printf 'test binary\n' > "$directory/dev-linux-x86_64"
if command -v sha256sum >/dev/null 2>&1; then
    expected=$(sha256sum "$directory/dev-linux-x86_64" | awk '{print $1}')
else
    expected=$(shasum -a 256 "$directory/dev-linux-x86_64" | awk '{print $1}')
fi

verify_sha256 "$directory/dev-linux-x86_64" "$expected"
wrong="0${expected:1}"
if [ "${expected:0:1}" = 0 ]; then wrong="1${expected:1}"; fi
if verify_sha256 "$directory/dev-linux-x86_64" "$wrong"; then
    echo "checksum mismatch was accepted" >&2
    exit 1
fi
if verify_sha256 "$directory/dev-linux-x86_64" "invalid"; then
    echo "invalid checksum was accepted" >&2
    exit 1
fi

[ "$(legacy_checksum v1.3.0 dev-linux-x86_64)" = "4209b131ef8c91bfc3a3959b87827d87abe76ecf0f13d85f59744f35babca45d" ]
if legacy_checksum v1.3.1 dev-linux-x86_64 >/dev/null; then
    echo "unknown release accepted without a checksum" >&2
    exit 1
fi

echo "installer checksum tests passed"
