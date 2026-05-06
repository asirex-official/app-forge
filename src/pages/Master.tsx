import {
  BookOpen, Cpu, Cloud, Smartphone, Code2, Server as ServerIcon,
  CheckCircle2, AlertCircle, AlertTriangle, Github, Package,
  Wand2, FileCode, Sparkles, ShieldAlert,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Layout from "@/components/site/Layout";

/**
 * MASTER PROMPT PAGE — v2 (Native pivot)
 * Permanent reference. AI / user kabhi bhi padh sakta hai.
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
        Permanent reference. AI ya user bhool jaye toh isse padh ke turant yaad aa jayega.
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
              Ab ye <strong className="text-yellow-200">REAL NATIVE Android app</strong> banata hai —
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
            desc="Builder → Import → ZIP drag-drop → server extract karke same folder me daal deta hai."
          />
        </div>
      </Card>

      {/* HOW WE DO IT */}
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
          <Tech label="Min / Target SDK" value="24 / 34" />
          <Tech label="Build system" value="Gradle 8.5 + AGP 8.2" />
          <Tech label="Local server" value="Express on port 5174" />
          <Tech label="Sources storage" value="~/.apkforge/sources/<id>" />
          <Tech label="Native projects" value="~/.apkforge/native-projects/" />
          <Tech label="APK output" value="~/.apkforge/outputs/" />
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

export default Master;
