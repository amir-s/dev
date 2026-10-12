#!/bin/bash

legacy_checksum() {
    case "$1:$2" in
        v1.3.0:dev-linux-arm64) echo "9b2730cc1d1cbcdb72e8b34b02fcc0df46aff0d559f795ee511f10037f061b0b";;
        v1.3.0:dev-linux-x86_64) echo "4209b131ef8c91bfc3a3959b87827d87abe76ecf0f13d85f59744f35babca45d";;
        v1.3.0:dev-macos-arm64) echo "0ef1c5298711eb9e4ad7a29d71300e73c20c894234fa52582719a561384bb71b";;
        v1.3.0:dev-macos-x86_64) echo "f44a30478f5eec27992e51aad1fb3302ed904be4d1ded4595845ae7f2f28146d";;
        *) return 1;;
    esac
}

verify_sha256() {
    local binary="$1" expected="$2" actual
    [[ "$expected" =~ ^[0-9a-f]{64}$ ]] || return 1
    if command -v sha256sum >/dev/null 2>&1; then
        actual=$(sha256sum "$binary" | awk '{print $1}') || return 1
    elif command -v shasum >/dev/null 2>&1; then
        actual=$(shasum -a 256 "$binary" | awk '{print $1}') || return 1
    else
        echo "❌ SHA-256 checksum tool not found." >&2
        return 1
    fi
    [ "$actual" = "$expected" ]
}

if [ "${DEV_INSTALL_FUNCTIONS_ONLY:-0}" = 1 ]; then
    return 0
fi

GITHUB_USER="amir-s"
REPO_NAME="dev"

# Fetch the latest version tag from GitHub
echo -n "🔍 Fetching the latest version"
VERSION=$(curl -fsSL "https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')

if [ -z "$VERSION" ]; then
  echo "❌ Error: Unable to fetch the latest version information from GitHub."
  exit 1
fi
echo -e "\r✅ Latest version available: $VERSION               "

# Detect OS and architecture
echo -n "🔍 Detecting OS and architecture "
OS=""
ARCH=""
case "$(uname -s)" in
    Linux*)     OS="linux";;
    Darwin*)    OS="macos";;
    *)          echo "❌ Unsupported OS"; exit 1;;
esac

case "$(uname -m)" in
    x86_64)     ARCH="x86_64";;
    arm64|aarch64) ARCH="arm64";;
    *)          echo "❌ Unsupported architecture"; exit 1;;
esac

SHELL_NAME=$(basename "$SHELL")
PROFILE_FILE=""

case "$SHELL_NAME" in
    bash)
        PROFILE_FILE="$HOME/.bashrc"
        ;;
    zsh)
        PROFILE_FILE="$HOME/.zshrc"
        ;;
    fish)
        PROFILE_FILE="$HOME/.config/fish/config.fish"
        ;;
    *)
        echo "❌ Unsupported shell: $SHELL_NAME. Please add $INSTALL_PATH to your PATH manually."
        exit 1
        ;;
esac
echo -e "\r✅ Detected $OS-$ARCH using $SHELL_NAME        "

BINARY_NAME="dev-${OS}-${ARCH}"
DOWNLOAD_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}/releases/download/${VERSION}/${BINARY_NAME}"
DOWNLOAD_DIR=$(mktemp -d) || exit 1
trap 'rm -rf "$DOWNLOAD_DIR"' EXIT
BINARY_PATH="${DOWNLOAD_DIR}/${BINARY_NAME}"
CHECKSUM_PATH="${DOWNLOAD_DIR}/${BINARY_NAME}.sha256"

# Download the binary
echo -n "⬇️  Downloading ${BINARY_NAME} "
if ! curl -fsSL -o "${BINARY_PATH}" "${DOWNLOAD_URL}"; then
    echo "❌ Download failed!"
    exit 1
fi
echo -e "\r✅ Downloaded ${BINARY_NAME}               "

if curl -fsSL -o "${CHECKSUM_PATH}" "${DOWNLOAD_URL}.sha256"; then
    EXPECTED_SHA256=$(awk -v name="$BINARY_NAME" '$2 == name { print $1 }' "$CHECKSUM_PATH")
else
    EXPECTED_SHA256=$(legacy_checksum "$VERSION" "$BINARY_NAME") || {
        echo "❌ Unable to download checksum for ${BINARY_NAME}."
        exit 1
    }
fi

if ! verify_sha256 "$BINARY_PATH" "$EXPECTED_SHA256"; then
    echo "❌ Download checksum mismatch!"
    exit 1
fi
echo "✅ Download checksum verified"

# Define the install path in ~/.local/bin
INSTALL_PATH="$HOME/.local/bin"
if ! mkdir -p "${INSTALL_PATH}"; then
    echo "❌ Unable to create install directory!"
    exit 1
fi

echo -n "🚚 Moving binaries to ${INSTALL_PATH}"
if ! chmod +x "${BINARY_PATH}" || ! mv "${BINARY_PATH}" "${INSTALL_PATH}/dev-cli"; then
    echo "❌ Unable to install binary!"
    exit 1
fi
echo -e "\r✅ Moving binaries to ${INSTALL_PATH}"

# Add ~/.local/bin to PATH if it's not already there
echo -n "🔧 Adding ${INSTALL_PATH} to PATH"
if ! grep -q "export PATH=\"$INSTALL_PATH:\$PATH\"" "$PROFILE_FILE"; then
    case "$SHELL_NAME" in
        bash | zsh)
            echo "" >> "$PROFILE_FILE"
            echo "export PATH=\"$INSTALL_PATH:\$PATH\"" >> "$PROFILE_FILE"
            ;;
        fish)
            echo "" >> "$PROFILE_FILE"
            echo "set -gx PATH $INSTALL_PATH \$PATH" >> "$PROFILE_FILE"
            ;;
    esac
fi
echo -e "\r✅ Added ${INSTALL_PATH} to PATH              "


# add eval "$(dev-cli shell init zsh)" to the shell profile if it doesn't exist
echo -n "🔧 Adding init script to $SHELL_NAME"
if ! grep -q "eval \"\$(dev-cli shell init $SHELL_NAME)\"" "$PROFILE_FILE"; then
    case "$SHELL_NAME" in
        bash | zsh)
            echo "" >> "$PROFILE_FILE"
            echo "eval \"\$(dev-cli shell init $SHELL_NAME)\"" >> "$PROFILE_FILE"
            ;;
        fish)
            echo "" >> "$PROFILE_FILE"
            echo "eval (dev-cli shell init $SHELL_NAME)" >> "$PROFILE_FILE"
            ;;
    esac
fi
echo -e "\r✅ Added init script to $SHELL_NAME      "
echo -e "\n✅ DONE"

echo ""
echo "✅ Installation completed"
echo "🎉 Restart your shell to use dev"
