# APKForge — Native Edition

Convert your **existing website source code** into a **REAL NATIVE Android app**
(Kotlin + Jetpack Compose) — built on your own Mac.

> **Not Capacitor. Not WebView.** Lovable AI reads your website source, generates
> equivalent Kotlin Compose code from scratch, and Gradle compiles a real native
> APK locally on your machine.

## Quick start

### 1. Install prerequisites (one time)

```bash
# Node.js 18+: https://nodejs.org
brew install openjdk@17 gradle
brew install --cask android-commandlinetools
```

Add to `~/.zshrc`:

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin
```

`source ~/.zshrc`. In Android Studio → SDK Manager install **Platform 34** + **Build Tools 34.x**.

### 2. Install APKForge

```bash
git clone <this-repo>
cd <this-repo>
npm install
cd server && npm install && cd ..
```

### 3. Run it (two terminals)

```bash
# Terminal 1 — local native build server
cd server && npm start

# Terminal 2 — web UI
npm run dev
```

Open http://localhost:8080/builder.

## How it works

```
1. Builder → Source import
   - Paste GitHub URL  →  server git clone   →  ~/.apkforge/sources/<id>
   - OR upload ZIP     →  server extract     →  same place

2. Chat with Lovable AI:  "Padho ye source aur Kotlin Compose me convert karo"
   - AI reads source via the server's read-only /source endpoints
   - AI writes Kotlin files into project.kotlinFiles[]
   - You see them in Builder → "Generated Kotlin"

3. Builder → Build Native APK
   - Mac server scaffolds an Android Studio project under
     ~/.apkforge/native-projects/<package>
   - Overlays AI-generated Kotlin files
   - Runs ./gradlew assembleDebug
   - Real .apk → /apk/:jobId → browser download
```

First build: 10–15 min (Gradle downloads everything). After that: 1–2 min.

The generated Android Studio projects are normal — open any of them in Android
Studio for further customization.

## Roadmap

- iOS Swift generator
- APK signing for release builds
- One-click `adb install` to a connected device
- Per-density icon resizing

— Built with Lovable.
