import {
  BookOpen, Cpu, Cloud, Smartphone, Code2, Server as ServerIcon,
  CheckCircle2, AlertCircle, AlertTriangle, Github, FolderInput,
  Package, Wand2, FileCode, Sparkles, ShieldAlert,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Layout from "@/components/site/Layout";

/**
 * MASTER PROMPT PAGE
 * ------------------
 * Ye page permanent reference hai. AI / user kabhi bhi kholke padh sakta hai.
 * Pura plan, source code kaise lete hain, kya karte hain, kya NAHI karte —
 * sab yahan likha hai. Isse delete mat karna.
 */

const Master = () => (
  <Layout>
    <section className="container py-12 max-w-4xl">
      {/* Header */}
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

      {/* 🚨 BIG WARNING — sabse upar */}
      <Card className="p-6 mb-8 bg-red-500/10 border-2 border-red-500/40">
        <div className="flex gap-4">
          <ShieldAlert className="h-8 w-8 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-xl font-bold text-red-300 mb-2">
              ⚠️ SABSE ZAROORI RULE — ISKO MAT BHOOLNA
            </h2>
            <p className="text-foreground leading-relaxed mb-3">
              User <strong className="text-red-300">APK ka code edit karwana chahta hai</strong> —
              uski <strong className="text-red-300">website ka code CHEDNA NAHI hai</strong>.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Matlab: User apni working website (Binance clone, Zepto clone, etc.) ka source code dega.
              Wo website <strong>untouched</strong> rahegi. Hum sirf uska <strong>mobile wrapper</strong>
              (Capacitor config, manifest, icons, permissions, splash screen) edit karenge —
              taaki APK ban sake. Website ka original code, components, pages, backend calls — kuch nahi badlega.
            </p>
            <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-red-500/5 border border-red-500/30 p-3">
                <div className="font-semibold text-red-300 mb-1">❌ MAT KARO</div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Website ke React components badalna</li>
                  <li>• Backend API calls modify karna</li>
                  <li>• Login/auth flow chedna</li>
                  <li>• UI/UX redesign karna</li>
                  <li>• Naye pages add karna website me</li>
                </ul>
              </div>
              <div className="rounded-lg bg-green-500/5 border border-green-500/30 p-3">
                <div className="font-semibold text-green-400 mb-1">✅ KARO</div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• <code>capacitor.config.ts</code> setup</li>
                  <li>• App icon, splash screen</li>
                  <li>• Android permissions</li>
                  <li>• Package name, version</li>
                  <li>• Build config (Gradle/Xcode)</li>
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
          User ke paas already <strong className="text-foreground">working websites ka source code</strong> hai —
          backend, login, database, OTP, Google sign-in, payments — sab kaam karta hai.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Mujhe chahiye: us source code ko <strong className="text-foreground">jaisa hai waisa</strong> rakh ke,
          uske upar Capacitor wrapper laga ke <strong className="text-foreground">real Android APK + iOS .ipa</strong>
          bana dena — Amazon, Zepto, Binance ki actual native apps jaisi.
        </p>
      </Card>

      {/* SOURCE CODE — KAHAN SE LETE HAIN */}
      <Card className="p-6 bg-gradient-card border-border/60 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FolderInput className="h-6 w-6 text-primary" /> Source Code Kahan Se Lete Hain?
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          User 4 me se kisi bhi tarike se source code de sakta hai. AI ko <strong>poochna chahiye</strong>
          aur jis tarike se mile, usi se uthana hai.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <SourceMethod
            icon={<Github className="h-5 w-5" />}
            title="1. GitHub link"
            desc="https://github.com/user/repo — sabse easy. AI bata sakta hai user ko: 'git clone <link>' Mac pe chalao."
          />
          <SourceMethod
            icon={<Package className="h-5 w-5" />}
            title="2. ZIP upload"
            desc="User ZIP file chat me drag-drop kar de. AI use unzip karke padh sakta hai."
          />
          <SourceMethod
            icon={<Sparkles className="h-5 w-5" />}
            title="3. Doosra Lovable project"
            desc="Agar source code bhi Lovable pe hai → @mention karke ya project ka naam batake AI cross_project tools se directly access kar leta hai."
          />
          <SourceMethod
            icon={<FileCode className="h-5 w-5" />}
            title="4. Folder path on Mac"
            desc="Source code already Mac pe hai (e.g. ~/projects/binance). User path bata de, AI build server use karke usse pick kar lega."
          />
        </div>
      </Card>

      {/* HOW WE DO IT — STEP BY STEP */}
      <Card className="p-6 bg-gradient-card border-border/60 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-primary" /> Kaise Karte Hain (Step by Step)
        </h2>
        <ol className="space-y-4">
          <Step n={1} title="User source code ka location deta hai">
            GitHub link / ZIP / Lovable project naam / Mac folder path. AI poochta hai sirf yahi 4 me se ek.
          </Step>
          <Step n={2} title="AI source code 'read-only' mode me padhta hai">
            Sirf <strong>samajhne</strong> ke liye — kaunse pages hain, kaunse routes,
            backend kahan hai, login kaisa hai. <strong className="text-red-300">Kuch edit nahi karta us code me.</strong>
          </Step>
          <Step n={3} title="AI APKForge me Capacitor wrapper banata hai">
            Yahan <strong>is</strong> project (APKForge) ke andar, ek build job create hota hai jisme:
            app name, package name (com.you.app), icon, splash, permissions, version — sab set hote hain.
            <strong className="text-foreground"> User ki website ka code touch nahi hota.</strong>
          </Step>
          <Step n={4} title="Mac pe local server build chalata hai">
            APKForge ka Express server (port 5174) Mac pe pehle se chal raha hai (one-time setup).
            Wo user ki website ko Capacitor me wrap karta hai aur Gradle/Xcode se compile karta hai.
          </Step>
          <Step n={5} title="Real .apk / .ipa file ban jaati hai">
            Pehli build 5-10 min, baad me 30-90 sec. APK browser me download link aata hai.
          </Step>
          <Step n={6} title="Phone pe install → real working app">
            Wahi backend, wahi login, wahi sab features — bas ab native app me. Play Store / App Store ready.
          </Step>
        </ol>
      </Card>

      {/* WHO DOES WHAT */}
      <Card className="p-6 bg-gradient-card border-border/60 mb-6">
        <h2 className="text-2xl font-bold mb-4">👥 Kiska Kya Role Hai</h2>
        <div className="grid gap-4">
          <Role
            icon={<Cloud className="h-5 w-5" />}
            title="Lovable (cloud server)"
            color="text-blue-400"
            does={[
              "Chat (AI ke saath baat)",
              "Live preview website host karna (APKForge UI)",
              "Code edits karna (sirf APKForge ka, user ki website ka NAHI)",
            ]}
            doesNot={[
              "APK build NAHI karta — RAM/CPU nahi deta uske liye",
              "User ki original website ka code NAHI badalta",
            ]}
          />
          <Role
            icon={<Cpu className="h-5 w-5" />}
            title="User ki MacBook (local)"
            color="text-green-400"
            does={[
              "Local build server chalata hai (port 5174)",
              "Capacitor + Gradle + Xcode run karta hai",
              "CPU / RAM / GPU yahan use hota hai",
              "Real .apk / .ipa file generate karta hai",
              "Source code yahan rahega (clone karke)",
            ]}
            doesNot={[
              "UI host nahi karta — wo Lovable preview se aata hai",
            ]}
          />
          <Role
            icon={<Code2 className="h-5 w-5" />}
            title="Lovable AI (main, ye chat)"
            color="text-primary"
            does={[
              "User ka source code padhna aur samajhna (read-only)",
              "APKForge ka Capacitor config tweak karna",
              "Build commands Mac pe trigger karne ke liye batana",
              "Errors troubleshoot karna",
            ]}
            doesNot={[
              "User ki website ka code edit NAHI karta",
              "Khud APK build nahi karta — wo Mac pe hota hai",
            ]}
          />
        </div>
      </Card>

      {/* RULES */}
      <Card className="p-6 bg-gradient-card border-border/60 mb-6">
        <h2 className="text-2xl font-bold mb-4">📜 Rules (AI ke liye — yaad rakhna)</h2>
        <div className="space-y-3">
          <Rule ok>
            User ke paas <strong>already working source code</strong> hai —
            naya backend / login / DB mat banao.
          </Rule>
          <Rule ok>
            Source code mile toh <strong>read-only</strong> mode me padho — sirf samjhne ke liye.
          </Rule>
          <Rule ok>
            APK build <strong>user ki Mac pe</strong> hoti hai (APKForge server). Lovable pe nahi.
          </Rule>
          <Rule ok>
            Live preview = Lovable. Build/RAM/CPU = Mac. Capacitor <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">server.url</code> dono ko link karta hai.
          </Rule>
          <Rule bad>
            <strong>User ki website ka code NEVER edit</strong> — sirf APK wrapper config edit karo.
          </Rule>
          <Rule bad>
            <strong>PWA / React Native rewrite</strong> mat suggest karo. Capacitor + existing website hi chahiye.
          </Rule>
          <Rule bad>
            <strong>Pricing pages, marketing fluff</strong> mat banao jab tak user na bole.
          </Rule>
          <Rule bad>
            <strong>"Lovable backend / Supabase setup"</strong> mat suggest karo —
            user ke source code me already backend hai.
          </Rule>
          <Rule bad>
            English me lambi explanations mat do — user <strong>Hinglish</strong> me baat karta hai.
          </Rule>
        </div>
      </Card>

      {/* TECH STACK */}
      <Card className="p-6 bg-gradient-card border-border/60 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <ServerIcon className="h-5 w-5" /> Tech Stack
        </h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <Tech label="APKForge frontend" value="React + Vite + Tailwind" />
          <Tech label="Mobile wrapper" value="Capacitor 6" />
          <Tech label="Android build" value="Gradle (assembleDebug/Release)" />
          <Tech label="iOS build" value="Xcode (xcodebuild)" />
          <Tech label="Local server" value="Express on port 5174" />
          <Tech label="Project storage" value="~/.apkforge/projects/" />
          <Tech label="APK output" value="~/.apkforge/outputs/" />
          <Tech label="Hot reload" value="Capacitor server.url → Lovable preview" />
        </div>
      </Card>

      {/* TL;DR */}
      <Card className="p-6 bg-primary/5 border-primary/30">
        <div className="flex gap-3">
          <Smartphone className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-foreground mb-2">TL;DR — agar bhool jaaye:</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              User ke paas <strong>working website</strong> hai → wo <strong>source code dega</strong> (GitHub/ZIP/Lovable/folder) →
              main usse <strong>read-only padhunga</strong>, <strong>chedunga nahi</strong> →
              APKForge me <strong>Capacitor wrapper</strong> banaunga →
              user Mac pe <strong>"Build APK"</strong> dabayega → real APK ban jayegi.
              <br /><br />
              <strong className="text-red-300">User ki website ka code NEVER edit. Sirf APK wrapper edit.</strong>
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
    <div className={`flex items-center gap-2 font-semibold mb-3 ${color}`}>
      {icon} {title}
    </div>
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
    <div className="h-7 w-7 rounded-full bg-gradient-primary flex items-center justify-center font-bold text-xs text-primary-foreground flex-shrink-0">
      {n}
    </div>
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
