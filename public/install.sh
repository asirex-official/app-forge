#!/usr/bin/env bash
# APKForge — One-line installer for macOS
# Usage:  curl -fsSL https://<your-domain>/install.sh | bash
# What it does:
#   1. Installs Homebrew (if missing)
#   2. Installs JDK 17, Gradle, Android command-line tools, cloudflared, git, node
#   3. Sets JAVA_HOME / ANDROID_HOME in ~/.zshrc
#   4. Downloads APKForge server to ~/.apkforge/server
#   5. Starts server + Cloudflare Tunnel
#   6. Prints the 6-digit pairing code

set -e

GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
say() { echo -e "${CYAN}▶${NC} $*"; }
ok()  { echo -e "${GREEN}✓${NC} $*"; }
warn(){ echo -e "${YELLOW}!${NC} $*"; }
err() { echo -e "${RED}✗${NC} $*" >&2; }

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   APKForge — Native Android Build Server (one-time)      ║"
echo "║   Builds REAL Kotlin + Jetpack Compose APKs on your Mac  ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ---------- 1. Homebrew ----------
if ! command -v brew >/dev/null 2>&1; then
  say "Installing Homebrew (Mac package manager)…"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  # add to PATH for Intel + Apple Silicon
  if [ -x /opt/homebrew/bin/brew ]; then eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [ -x /usr/local/bin/brew ]; then eval "$(/usr/local/bin/brew shellenv)"
  fi
else
  ok "Homebrew already installed"
fi

# ---------- 2. Brew packages ----------
say "Installing JDK 17, Gradle, Android SDK, cloudflared, git, node…"
brew install --quiet openjdk@17 gradle node git cloudflared || true
brew install --cask --quiet android-commandlinetools || true

# ---------- 3. env vars ----------
JAVA_HOME_PATH="$(brew --prefix openjdk@17)/libexec/openjdk.jdk/Contents/Home"
ANDROID_SDK_PATH="$HOME/Library/Android/sdk"
mkdir -p "$ANDROID_SDK_PATH"

# Symlink cmdline-tools into ANDROID_SDK_ROOT layout sdkmanager expects
BREW_CMDLINE="$(brew --prefix)/share/android-commandlinetools/cmdline-tools/latest"
if [ -d "$BREW_CMDLINE" ] && [ ! -d "$ANDROID_SDK_PATH/cmdline-tools/latest" ]; then
  mkdir -p "$ANDROID_SDK_PATH/cmdline-tools"
  ln -sfn "$BREW_CMDLINE" "$ANDROID_SDK_PATH/cmdline-tools/latest"
fi

export JAVA_HOME="$JAVA_HOME_PATH"
export ANDROID_HOME="$ANDROID_SDK_PATH"
export ANDROID_SDK_ROOT="$ANDROID_SDK_PATH"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

# Persist to ~/.zshrc once
ZRC="$HOME/.zshrc"
touch "$ZRC"
if ! grep -q "# >>> APKForge >>>" "$ZRC"; then
  cat >> "$ZRC" <<EOF

# >>> APKForge >>>
export JAVA_HOME="$JAVA_HOME_PATH"
export ANDROID_HOME="$ANDROID_SDK_PATH"
export ANDROID_SDK_ROOT="$ANDROID_SDK_PATH"
export PATH="\$JAVA_HOME/bin:\$ANDROID_HOME/cmdline-tools/latest/bin:\$ANDROID_HOME/platform-tools:\$PATH"
# <<< APKForge <<<
EOF
  ok "Added env vars to ~/.zshrc"
fi

# ---------- 4. Android SDK packages + license ----------
if command -v sdkmanager >/dev/null 2>&1; then
  say "Accepting Android SDK licenses + installing platform-tools, build-tools, platform-34…"
  yes | sdkmanager --licenses >/dev/null 2>&1 || true
  sdkmanager --install "platform-tools" "build-tools;34.0.0" "platforms;android-34" >/dev/null
  ok "Android SDK ready"
else
  warn "sdkmanager not found — open a NEW terminal and re-run this installer."
fi

# ---------- 5. APKForge server ----------
SERVER_DIR="$HOME/.apkforge/server"
mkdir -p "$SERVER_DIR"
say "Downloading APKForge server to $SERVER_DIR…"

# These URLs are templated by the deployed install.sh hosting (Lovable preview).
# Default: pull from APKFORGE_SERVER_URL env (set by the curl command), or a packed bundle.
if [ -n "$APKFORGE_SERVER_URL" ]; then
  curl -fsSL "$APKFORGE_SERVER_URL" -o "$SERVER_DIR/server.tar.gz"
  tar -xzf "$SERVER_DIR/server.tar.gz" -C "$SERVER_DIR"
  rm "$SERVER_DIR/server.tar.gz"
fi

# Fallback: if the user pre-cloned it, just cd in.
if [ ! -f "$SERVER_DIR/index.js" ]; then
  err "Server files missing. Set APKFORGE_SERVER_URL or copy server/ into $SERVER_DIR"
  exit 1
fi

cd "$SERVER_DIR"
say "Installing node deps…"
npm install --silent --no-audit --no-fund

# ---------- 6. Run ----------
echo ""
ok "Setup complete. Starting server + Cloudflare Tunnel…"
echo ""
exec node index.js
