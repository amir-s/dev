#!/bin/bash

GITHUB_USER="amir-s"
REPO_NAME="dev"

# Fetch the latest version tag from GitHub
echo -n "🔍 Fetching tha latest version information "
VERSION=$(curl -s "https://api.github.com/repos/${GITHUB_USER}/${REPO_NAME}/releases/latest" | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')

if [ -z "$VERSION" ]; then
  echo "❌ Error: Unable to fetch the latest version information from GitHub."
  exit 1
fi
echo "✅ $VERSION"

# Detect OS and architecture
echo -n "🔍 Detecting OS and architecture... "
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
echo "✅ $OS-$ARCH using $SHELL_NAME"

BINARY_NAME="dev-${OS}-${ARCH}"
DOWNLOAD_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}/releases/download/${VERSION}/${BINARY_NAME}"

# Download the binary
echo -n "⬇️  Downloading ${BINARY_NAME}... "
curl -sL -o "${BINARY_NAME}" "${DOWNLOAD_URL}"
if [ $? -ne 0 ]; then
    echo "❌ Download failed!"
    exit 1
fi
echo "✅"

# Define the install path in ~/.local/bin
INSTALL_PATH="$HOME/.local/bin"
mkdir -p "${INSTALL_PATH}"

echo -n "🚚 Moving binaries to ${INSTALL_PATH}"
mv "${BINARY_NAME}" "${INSTALL_PATH}/dev-cli"
chmod +x "${INSTALL_PATH}/dev-cli"
echo " ✅"

# Add ~/.local/bin to PATH if it's not already there
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


# add eval "$(dev-cli shell init zsh)" to the shell profile if it doesn't exist
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

echo ""
echo "✅ Installation completed"
echo "🎉 Restart your shell to start using dev-cli"

# print the source command for the user
case "$SHELL_NAME" in
    bash | zsh)
        echo "👉 Run this command to start using dev-cli:"
        echo "source $PROFILE_FILE"
        ;;
    fish)
        echo "👉 Run this command to start using dev-cli:"
        echo "source $PROFILE_FILE"
        ;;
esac