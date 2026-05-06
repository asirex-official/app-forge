# APKForge

Build **real Android APK files locally on your Mac** from a beautiful no-code web interface.
No cloud, no signups, no cost — Capacitor + Gradle run on your machine.

## Quick start

### 1. Install prerequisites (one time)

```bash
# Node.js 18+: https://nodejs.org
# Java 17:
brew install openjdk@17
# Android SDK: install Android Studio and open it once,
# OR:
brew install --cask android-commandlinetools
```

Add to your `~/.zshrc`:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin
```

Then `source ~/.zshrc`.

In Android Studio → SDK Manager, install **Android Platform 34** + **Build Tools 34.x**.

### 2. Install APKForge

```bash
git clone <this-repo>
cd <this-repo>
npm install
cd server && npm install && cd ..
```

### 3. Run it (two terminals)

```bash
# Terminal 1 — local build engine
cd server && npm start

# Terminal 2 — web UI
npm run dev
```

Open http://localhost:8080/builder, configure your app, hit **Build APK**.

The first build takes 5–10 min (Gradle downloads Android dependencies). Subsequent builds: 30–90 seconds.

Generated Capacitor projects are saved to `~/.apkforge/projects/` and APKs to `~/.apkforge/outputs/` — you can open any project in Android Studio for further customization.

## How it works

```
Web UI (Vite + React)
        │ POST /build {appName, packageName, url|html, icon, perms, ...}
        ▼
Local server (Express, port 5174)
        │ scaffold Capacitor project on disk
        │ npm install
        │ npx cap sync android
        │ ./gradlew assembleDebug
        ▼
Real .apk → /apk/:jobId → browser download
```

## Roadmap

- Per-density icon resizing (currently same icon on all mipmaps)
- Splash screen image upload
- Release APK signing UI (currently outputs unsigned release)
- Saved app history / multi-project dashboard
- One-click `adb install` to a connected device

— Built with Lovable.
