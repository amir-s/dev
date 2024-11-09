#!/bin/bash

REPO="amir-s/dev"
INSTALL_DIR="$HOME/.dev-cli"
DEV_PATH="$INSTALL_DIR/dev"
RELEASE_URL="https://api.github.com/repos/$REPO/releases/latest"

# Check the current installed version
if [ -f "$DEV_PATH" ]; then
  INSTALLED_VERSION=$("$DEV_PATH" --version 2>/dev/null)
  echo "Installed version: $INSTALLED_VERSION"
else
  INSTALLED_VERSION="none"
  echo "No version of 'dev' is currently installed."
fi

# Get the latest release version from GitHub
LATEST_VERSION=$(curl -s "$RELEASE_URL" | grep -oP '"tag_name": "\K(.*)(?=")')
if [ -z "$LATEST_VERSION" ]; then
  echo "Error: Unable to fetch the latest version information from GitHub."
  exit 1
fi

# Compare versions
if [ "$INSTALLED_VERSION" = "$LATEST_VERSION" ]; then
  echo "'dev' is already up-to-date (version $INSTALLED_VERSION)."
  exit 0
else
  echo "A new version is available: $LATEST_VERSION"
fi

exit 0

# Determine the OS and architecture
OS=""
ARCH=""
case "$(uname -s)" in
  Linux*)   OS="linux";;
  Darwin*)  OS="macos";;
  *)        echo "Unsupported OS"; exit 1;;
esac

case "$(uname -m)" in
  x86_64)   ARCH="x86_64";;
  arm64)    ARCH="arm64";;
  *)        echo "Unsupported architecture"; exit 1;;
esac

# Construct the download URL for the binary
BINARY_NAME="dev-${OS}-${ARCH}"
DOWNLOAD_URL="https://github.com/$REPO/releases/download/$LATEST_VERSION/$BINARY_NAME"

# Download the new binary
echo "Downloading $BINARY_NAME from $DOWNLOAD_URL..."
mkdir -p "$INSTALL_DIR"
curl -L -o "$DEV_PATH" "$DOWNLOAD_URL"
if [ $? -ne 0 ]; then
  echo "Download failed!"
  exit 1
fi

# Make the binary executable
chmod +x "$DEV_PATH"

# Detect the current shell and run the post-install command accordingly
CURRENT_SHELL=$(basename "$SHELL")

echo "Detected shell: $CURRENT_SHELL"

case "$CURRENT_SHELL" in
  bash|zsh|fish)
    echo "Running post-install command for $CURRENT_SHELL..."
    "$DEV_PATH" shell install --shell "$CURRENT_SHELL"
    ;;
  *)
    echo "Unsupported shell for post-installation setup: $CURRENT_SHELL. Please run the setup manually."
    ;;
esac

echo "'dev' version $LATEST_VERSION has been installed successfully at $DEV_PATH"
