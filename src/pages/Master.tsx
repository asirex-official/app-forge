import {
  BookOpen, Cpu, Cloud, Smartphone, Code2, Server as ServerIcon,
  CheckCircle2, AlertCircle, AlertTriangle, Github, Package,
  Wand2, FileCode, Sparkles, ShieldAlert, Terminal, GitBranch, Layers,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Layout from "@/components/site/Layout";

/**
 * MASTER PROMPT PAGE — v3 (Native pivot, full reference)
 * ------------------------------------------------------
 * Permanent reference. AI / user kabhi bhi padh sakta hai.
 * Sab kuch yahan — Mac setup, server endpoints, Kotlin rules, file structure.
 */

const Master = () => (
  <Layout>
    <section className="container py-12 max-w-4xl">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Master <span className="text-gradient">Prompt</span>
        </h1>
      </div>
      <p className="text-muted-foreground mb-8">
        Ek hi page pe sab kuch. AI ya user bhool jaye toh isse padh ke turant yaad aa jayega.
      </p>

      {/* PIVOT NOTE */}
      <Card className="p-6 mb-8 bg-yellow-500/10 border-2 border-yellow-500/40">
        <div className="flex gap-4">
          <ShieldAlert className="h-8 w-8 text-yellow-300 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-xl font-bold text-yellow-200 mb-2">
              ⚡ BIG PIVOT — Capacitor OUT, Native Kotlin IN
            </h2>
            <p className="text-foreground leading-relaxed mb-3">
              APKForge ab <strong className="text-yellow-200">Capacitor wrapper nahi banata</strong>.
              Ab <strong className="text-yellow-200">REAL NATIVE Android app</strong> banata hai —
              Kotlin + Jetpack Compose me, scratch se.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-red-500/5 border border-red-500/30 p-3">
                <div className="font-semibold text-red-300 mb-1">❌ PURANA (delete)</div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Capacitor / WebView wrapper</li>
                  <li>• Website ko APK me wrap karna</li>
                  <li>• Wrapper config edit karna</li>
                </ul>
              </div>
              <div className="rounded-lg bg-green-500/5 border border-green-500/30 p-3">
                <div className="font-semibold text-green-400 mb-1">✅ NAYA</div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• AI website read kare (read-only)</li>
                  <li>• AI Kotlin Compose code likhe scratch se</li>
                  <li>• Mac pe Gradle se native APK build</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* THE BIG IDEA */}
      <Card className="p-6 bg-gradient-card border-border/60 mb-6">
        <h2 className="text-2xl font-bold mb-4">🎯 The Big Idea</h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          User ke paas <strong className="text-foreground">working website</strong> hai (React/Next/etc) —
          backend, login, OTP, payments sab kaam karta hai.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Hum us website ka source <strong className="text-foreground">read-only</strong> padhte hain →
          AI usse equivalent <strong className="text-foreground">Kotlin + Jetpack Compose</strong> me likhta hai →
          Mac pe Gradle build karta hai → <strong className="text-foreground">real native Android APK</strong>.
          Backend wahi rahega — Kotlin app Retrofit se same APIs call karega.
        </p>
      </Card>

      {/* MAC SETUP — fully spelled out */}
      <Card className="p-6 bg-gradient-card border-border/60 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Terminal className="h-6 w-6 text-primary" /> Mac Setup (one time)
        </h2>
        <ol className="space-y-4 text-sm">
          <li>
            <div className="font-semibold text-foreground mb-1">1. Install tools:</div>
            <CodeBlock>{`# Node.js 18+: https://nodejs.org
brew install openjdk@17 gradle
brew install --cask android-commandlinetools`}</CodeBlock>
          </li>
          <li>
            <div className="font-semibold text-foreground mb-1">2. Add to ~/.zshrc:</div>
            <CodeBlock>{`export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin`}</CodeBlock>
            <p className="text-xs text-muted-foreground mt-1">Phir <code className="bg-secondary px-1 rounded">source ~/.zshrc</code></p>
          </li>
          <li>
            <div className="font-semibold text-foreground mb-1">3. Android SDK packages:</div>
            <CodeBlock>{`sdkmanager "platforms;android-34" "build-tools;34.0.0"`}</CodeBlock>
            <p className="text-xs text-muted-foreground mt-1">Ya Android Studio → SDK Manager → Platform 34 + Build Tools 34.x install.</p>
          </li>
          <li>
            <div className="font-semibold text-foreground mb-1">4. APKForge install:</div>
            <CodeBlock>{`git clone <this-repo>
cd <this-repo>
npm install
cd server && npm install && cd ..`}</CodeBlock>
          </li>
          <li>
            <div className="font-semibold text-foreground mb-1">5. Run (2 terminals):</div>
            <CodeBlock>{`# Terminal 1 — local native build server (port 5174)
cd server && npm start

# Terminal 2 — web UI (port 8080)
npm run dev`}</CodeBlock>
          </li>
        </ol>
      </Card>

      {/* SOURCE INPUT */}
      <Card className="p-6 bg-gradient-card border-border/60 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" /> Source Code Input — sirf 2 tarike
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <SourceMethod
            icon={<Github className="h-5 w-5" />}
            title="1. GitHub URL"
            desc="Builder → Import → GitHub URL paste → server git clone karke ~/.apkforge/sources/<id> me daal deta hai."
          />
          <SourceMethod
            icon={<Package className="h-5 w-5" />}
            title="2. ZIP upload"
            desc="Builder → Import → ZIP drag-drop → server extract karke same folder me daal deta hai. Max 100MB."
          />
        </div>
      </Card>

      {/* WORKFLOW */}
      <Card className="p-6 bg-gradient-card border-border/60 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-primary" /> Step by Step Workflow
        </h2>
        <ol className="space-y-4">
          <Step n={1} title="Project banao /projects pe">
            App name + package name (com.you.app) daalo.
          </Step>
          <Step n={2} title="Builder → Source import">
            GitHub URL ya ZIP upload. Server clone/extract karega Mac pe.
          </Step>
          <Step n={3} title="Chat me bolo: AI source padho">
            Main (Lovable editor AI) source files padhunga, framework detect karunga, screens/routes/API list banaunga.
          </Step>
          <Step n={4} title="Chat me bolo: Kotlin generate karo">
            Main Kotlin Activities + Compose screens + Retrofit interfaces likhunga, files <code className="bg-secondary px-1 rounded text-xs">project.kotlinFiles</code> me daal dunga.
          </Step>
          <Step n={5} title="Builder → Build Native APK">
            Mac server scaffold create karega, AI files overlay karega, <code className="bg-secondary px-1 rounded text-xs">./gradlew assembleDebug</code> chalayega.
          </Step>
          <Step n={6} title="Real native APK download">
            Pehli build 10-15 min (Gradle dependencies download). Baad me 1-2 min.
          </Step>
        </ol>
      </Card>

      {/* SERVER ENDPOINTS */}
      <Card className="p-6 bg-gradient-card border-border/60 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <ServerIcon className="h-6 w-6 text-primary" /> Mac Server Endpoints (port 5174)
        </h2>
        <div className="space-y-2 text-xs font-mono">
          <Endpoint method="GET"  path="/health" desc="Server status + JAVA_HOME + ANDROID_HOME check" />
          <Endpoint method="POST" path="/import/github" desc="Body: { url } → git clone → returns { id, dir, framework, deps }" />
          <Endpoint method="POST" path="/import/zip"    desc="multipart 'file' → extract → returns { id, dir, framework }" />
          <Endpoint method="GET"  path="/sources" desc="List all imported sources" />
          <Endpoint method="GET"  path="/source/:id/list?path=" desc="Browse imported source files (read-only)" />
          <Endpoint method="GET"  path="/source/:id/read?path=" desc="Read a single file (max 2MB)" />
          <Endpoint method="POST" path="/build" desc="Body: spec with kotlinFiles[] → scaffold + gradle assembleDebug → returns { jobId }" />
          <Endpoint method="GET"  path="/build/:jobId" desc="Poll job status, logs, progress" />
          <Endpoint method="GET"  path="/apk/:jobId" desc="Download finished APK" />
        </div>
      </Card>

      {/* KOTLIN GENERATION RULES */}
      <Card className="p-6 bg-gradient-card border-border/60 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FileCode className="h-6 w-6 text-primary" /> Kotlin Generation Rules (AI ke liye)
        </h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div>
            <div className="font-semibold text-foreground mb-1">🎯 Stack to use:</div>
            <ul className="list-disc list-inside space-y-1">
              <li>Kotlin 1.9 + Jetpack Compose (BOM 2024.02.00)</li>
              <li>Material 3 components (<code className="bg-secondary px-1 rounded text-xs">androidx.compose.material3</code>)</li>
              <li>Navigation Compose for routing (mirror website routes)</li>
              <li>Retrofit + Gson for API calls (same backend URLs as website)</li>
              <li>Coil for image loading (if needed)</li>
              <li>DataStore for local prefs (if website uses localStorage)</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-foreground mb-1">📁 File path convention:</div>
            <CodeBlock>{`app/src/main/java/<package-as-path>/MainActivity.kt
app/src/main/java/<package-as-path>/ui/screens/HomeScreen.kt
app/src/main/java/<package-as-path>/ui/screens/LoginScreen.kt
app/src/main/java/<package-as-path>/data/api/ApiService.kt
app/src/main/java/<package-as-path>/data/model/User.kt
app/src/main/java/<package-as-path>/ui/theme/Theme.kt`}</CodeBlock>
          </div>
          <div>
            <div className="font-semibold text-foreground mb-1">📝 Process:</div>
            <ol className="list-decimal list-inside space-y-1">
              <li>Source padho — har route/page list karo (e.g. <code>/login</code>, <code>/home</code>)</li>
              <li>Har page ke liye ek <code>@Composable</code> screen banao</li>
              <li>Website ke API calls (fetch/axios) → Retrofit interface me convert</li>
              <li>Auth state → ViewModel + DataStore</li>
              <li>NavHost me saare screens register karo</li>
              <li>Files <code>project.kotlinFiles[]</code> me push karo via <code>patchActiveProject</code></li>
            </ol>
          </div>
          <div>
            <div className="font-semibold text-foreground mb-1">⚠️ Don't:</div>
            <ul className="list-disc list-inside space-y-1">
              <li>WebView use mat karo — sab native Compose</li>
              <li>JS code transpile mat karo — features samajhke Kotlin se naya likho</li>
              <li>Backend rewrite mat karo — same API URLs hit karo</li>
              <li>User ki website ka source NEVER edit</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* FILE LAYOUT ON MAC */}
      <Card className="p-6 bg-gradient-card border-border/60 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Layers className="h-6 w-6 text-primary" /> Mac File Layout
        </h2>
        <CodeBlock>{`~/.apkforge/
├── sources/                  # Imported user websites (read-only)
│   └── <id>/                 # one folder per import
│       └── (cloned repo or extracted ZIP)
├── native-projects/          # Generated Android Studio projects
│   └── com.you.app/
│       ├── app/
│       │   ├── build.gradle.kts
│       │   └── src/main/
│       │       ├── AndroidManifest.xml
│       │       ├── java/com/you/app/MainActivity.kt
│       │       └── res/
│       ├── build.gradle.kts
│       ├── settings.gradle.kts
│       └── gradlew
└── outputs/                  # Built APKs
    └── <jobId>-app-v1.0-debug.apk`}</CodeBlock>
      </Card>

      {/* WHO DOES WHAT */}
      <Card className="p-6 bg-gradient-card border-border/60 mb-6">
        <h2 className="text-2xl font-bold mb-4">👥 Roles</h2>
        <div className="grid gap-4">
          <Role
            icon={<Cloud className="h-5 w-5" />}
            title="Lovable (cloud)"
            color="text-blue-400"
            does={[
              "Chat (mere saath baat)",
              "Builder UI host karta hai",
              "Project state (localStorage) hold karta hai",
            ]}
            doesNot={["Code generate NAHI karta khud — main karta hu", "APK build NAHI karta"]}
          />
          <Role
            icon={<Cpu className="h-5 w-5" />}
            title="User ki Mac"
            color="text-green-400"
            does={[
              "Express server port 5174 chalata hai",
              "Source clone/extract",
              "Native Android Studio project scaffold",
              "Gradle build (CPU/RAM/disk yahan use)",
              "Real .apk file generate",
            ]}
            doesNot={["UI host nahi karta", "AI nahi chalata"]}
          />
          <Role
            icon={<Code2 className="h-5 w-5" />}
            title="Lovable Editor AI (main)"
            color="text-primary"
            does={[
              "Source code padhna (read-only) — server ke /source endpoints se",
              "Kotlin + Compose files generate karna",
              "Builder config update karna",
              "Errors troubleshoot",
            ]}
            doesNot={[
              "User ki website code edit NAHI — sirf padhna",
              "Khud APK build nahi karta — Mac pe hota hai",
              "App ke andar koi end-user AI feature nahi banata",
            ]}
          />
        </div>
      </Card>

      {/* RULES */}
      <Card className="p-6 bg-gradient-card border-border/60 mb-6">
        <h2 className="text-2xl font-bold mb-4">📜 Rules (yaad rakhna)</h2>
        <div className="space-y-3">
          <Rule ok>Native Kotlin + Jetpack Compose only. NO Capacitor, NO WebView.</Rule>
          <Rule ok>Source code <strong>read-only</strong> — sirf samajhne ke liye.</Rule>
          <Rule ok>User ka backend untouched — Kotlin app same APIs call kare Retrofit se.</Rule>
          <Rule ok>Build = Mac. UI/Chat = Lovable.</Rule>
          <Rule ok>Android only abhi. iOS Swift baad me.</Rule>
          <Rule bad>NO Cloud / Lovable AI Gateway. Coding main (chat AI) karta hu directly.</Rule>
          <Rule bad>NO PWA, NO React Native, NO Capacitor suggestions.</Rule>
          <Rule bad>NO Supabase / backend rebuild — user ke paas already hai.</Rule>
          <Rule bad>NO marketing/pricing pages.</Rule>
          <Rule bad>English mat lambe paragraphs likho — Hinglish, short.</Rule>
        </div>
      </Card>

      {/* TECH STACK */}
      <Card className="p-6 bg-gradient-card border-border/60 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <ServerIcon className="h-5 w-5" /> Tech Stack
        </h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <Tech label="APKForge frontend" value="React + Vite + Tailwind" />
          <Tech label="App language" value="Kotlin 1.9 + Jetpack Compose" />
          <Tech label="Compose BOM" value="2024.02.00 + Material 3" />
          <Tech label="Min / Target SDK" value="24 / 34" />
          <Tech label="Build system" value="Gradle 8.5 + AGP 8.2" />
          <Tech label="Local server" value="Express on port 5174" />
          <Tech label="Sources storage" value="~/.apkforge/sources/<id>" />
          <Tech label="Native projects" value="~/.apkforge/native-projects/" />
          <Tech label="APK output" value="~/.apkforge/outputs/" />
          <Tech label="HTTP client (in app)" value="Retrofit 2.9 + Gson" />
        </div>
      </Card>

      {/* COMMON COMMANDS USER MAY ASK */}
      <Card className="p-6 bg-gradient-card border-border/60 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-primary" /> Common Chat Commands (user → me)
        </h2>
        <div className="space-y-2 text-sm">
          <Cmd>"Imported source padho aur summary do"</Cmd>
          <Cmd>"Login screen Compose me banao"</Cmd>
          <Cmd>"Saare screens generate karo aur navigation set karo"</Cmd>
          <Cmd>"Retrofit interfaces banao mere API endpoints ke liye"</Cmd>
          <Cmd>"Theme colors update karo website ke hisaab se"</Cmd>
          <Cmd>"Build error aaya — fix karo"</Cmd>
          <Cmd>"Permission XYZ add karo"</Cmd>
        </div>
      </Card>

      {/* TL;DR */}
      <Card className="p-6 bg-primary/5 border-primary/30">
        <div className="flex gap-3">
          <Smartphone className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-foreground mb-2">TL;DR</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              User website ka source de (GitHub/ZIP) → Mac pe import ho → main (chat AI) usse Kotlin Compose code likhu → Mac pe Gradle build → real native APK.
              <br /><br />
              <strong className="text-yellow-200">Capacitor delete. Pure native. Coding main karta hu, build Mac karta hai.</strong>
            </p>
          </div>
        </div>
      </Card>
    </section>
  </Layout>
);

const SourceMethod = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="rounded-xl border border-border/60 p-4 bg-background/40">
    <div className="flex items-center gap-2 font-semibold text-primary mb-2">{icon} {title}</div>
    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
  </div>
);

const Role = ({ icon, title, color, does, doesNot }: {
  icon: React.ReactNode; title: string; color: string;
  does: string[]; doesNot: string[];
}) => (
  <div className="rounded-xl border border-border/60 p-4 bg-background/40">
    <div className={`flex items-center gap-2 font-semibold mb-3 ${color}`}>{icon} {title}</div>
    <div className="space-y-1.5 text-sm">
      {does.map((d) => (
        <div key={d} className="flex gap-2 text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" /> {d}
        </div>
      ))}
      {doesNot.map((d) => (
        <div key={d} className="flex gap-2 text-muted-foreground">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" /> {d}
        </div>
      ))}
    </div>
  </div>
);

const Step = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <li className="flex gap-3">
    <div className="h-7 w-7 rounded-full bg-gradient-primary flex items-center justify-center font-bold text-xs text-primary-foreground flex-shrink-0">{n}</div>
    <div>
      <div className="font-semibold text-foreground">{title}</div>
      <div className="text-sm text-muted-foreground mt-0.5">{children}</div>
    </div>
  </li>
);

const Rule = ({ ok, bad, children }: { ok?: boolean; bad?: boolean; children: React.ReactNode }) => (
  <div className="flex gap-2 text-sm text-muted-foreground">
    {ok && <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />}
    {bad && <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />}
    <div>{children}</div>
  </div>
);

const Tech = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-border/60 p-3 bg-background/40">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="font-mono text-sm text-foreground mt-0.5">{value}</div>
  </div>
);

const CodeBlock = ({ children }: { children: string }) => (
  <pre className="rounded-lg bg-background border border-border p-3 overflow-x-auto text-xs font-mono text-foreground">
    <code>{children}</code>
  </pre>
);

const Endpoint = ({ method, path, desc }: { method: string; path: string; desc: string }) => {
  const colors: Record<string, string> = {
    GET: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    POST: "bg-green-500/15 text-green-400 border-green-500/30",
  };
  return (
    <div className="flex items-start gap-2 p-2 rounded border border-border/60 bg-background/40">
      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${colors[method] || ""}`}>{method}</span>
      <span className="text-foreground">{path}</span>
      <span className="text-muted-foreground ml-auto text-[11px]">{desc}</span>
    </div>
  );
};

const Cmd = ({ children }: { children: string }) => (
  <div className="rounded-lg border border-border/60 bg-background/40 p-2.5 text-xs font-mono text-foreground">
    💬 {children}
  </div>
);

export default Master;
