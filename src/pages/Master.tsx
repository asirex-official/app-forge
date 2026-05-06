import { BookOpen, Cpu, Cloud, Smartphone, Code2, Server as ServerIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import Layout from "@/components/site/Layout";

/**
 * MASTER PROMPT PAGE
 * ------------------
 * Ye page ek permanent reference hai — pura plan, setup, flow, aur rules
 * yahan likhe hain. Agar AI (Lovable) ya user bhool jaye toh isse padh ke
 * turant yaad aa jaye ki kaam kaise hota hai.
 *
 * Isse delete mat karna. Ye "single source of truth" hai is project ka.
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
      <p className="text-muted-foreground mb-10">
        Ye page <strong className="text-foreground">permanent reference</strong> hai —
        pura plan, kaam kaise hota hai, kiska kya role hai, sab yahan likha hai.
        AI ya tu bhool jaye toh isse padh ke yaad aa jayega.
      </p>

      {/* THE BIG IDEA */}
      <Card className="p-6 bg-gradient-card border-border/60 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          🎯 The Big Idea
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Main (user) ke paas already <strong className="text-foreground">working websites ka source code</strong> hai
          (Amazon clone, Zepto clone, Binance clone, WhatsApp clone — sab kuch).
          Backend, login, database, OTP, Google sign-in — sab kaam karta hai.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-3">
          Mujhe chahiye: <strong className="text-foreground">us source code se faltu pages hata ke,
          sirf zaroori features rakh ke, real Android APK + iOS .ipa file</strong> banana —
          jaisa Amazon, Zepto, Binance ki actual app hai.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          API keys, backend URLs, login flow — sab usi source code se uthaye jayenge.
          Naya kuch nahi banana, sirf wrap karna hai mobile app me.
        </p>
      </Card>

      {/* WHO DOES WHAT */}
      <Card className="p-6 bg-gradient-card border-border/60 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          👥 Kiska Kya Role Hai
        </h2>
        <div className="grid gap-4">
          <Role
            icon={<Cloud className="h-5 w-5" />}
            title="Lovable (cloud server)"
            color="text-blue-400"
            does={[
              "Chat (AI ke saath baat)",
              "Live preview website host karna",
              "Code edits karna (ye website ka code)",
            ]}
            doesNot={[
              "APK build NAHI karta (RAM/CPU nahi deta uske liye)",
              "Mobile app compile NAHI karta",
            ]}
          />
          <Role
            icon={<Cpu className="h-5 w-5" />}
            title="User ki MacBook (local)"
            color="text-green-400"
            does={[
              "Local build server chalata hai (port 5174)",
              "Capacitor + Gradle run karta hai (CPU/RAM/GPU yahan use hota hai)",
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
              "User ka source code padhna aur samajhna",
              "Faltu pages/features hatana",
              "APK config karna (package name, icon, permissions)",
              "User ko batana ki Mac pe kya command chalani hai",
            ]}
            doesNot={[
              "Khud APK build nahi karta — wo Mac pe hota hai",
            ]}
          />
        </div>
      </Card>

      {/* THE FLOW */}
      <Card className="p-6 bg-gradient-card border-border/60 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          🔄 Pura Flow (Step by Step)
        </h2>
        <ol className="space-y-4">
          <Step n={1} title="User source code deta hai">
            GitHub link, ZIP upload, ya doosre Lovable project ka naam — kuch bhi.
          </Step>
          <Step n={2} title="AI source code padhta hai">
            Samajhta hai kaunse pages/features zaroori hain, kaunse hatane hain.
            API keys, backend URLs, login config note karta hai.
          </Step>
          <Step n={3} title="AI cleanup + mobile-ready banata hai">
            Faltu pages delete, sirf zaroori screens rakhta hai. Mobile responsive
            check karta hai. Capacitor config bana deta hai.
          </Step>
          <Step n={4} title="User Mac pe command chalata hai">
            APKForge ka local server already chal raha hai (one-time setup).
            User ke liye sirf: <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">/builder</code> page
            kholo, "Build APK" dabao.
          </Step>
          <Step n={5} title="Mac pe APK build hoti hai">
            Capacitor + Gradle Mac ke CPU/RAM use karke real .apk file banate hain.
            Pehli baar 5-10 min, baad me 30-90 sec.
          </Step>
          <Step n={6} title="APK download → phone pe install">
            Browser me download link aata hai. APK phone pe install karo —
            real working app, Amazon/Zepto/Binance jaisa.
          </Step>
        </ol>
      </Card>

      {/* RULES */}
      <Card className="p-6 bg-gradient-card border-border/60 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          📜 Rules (AI ke liye — yaad rakhna)
        </h2>
        <div className="space-y-3">
          <Rule ok>
            User ke paas <strong>already working source code</strong> hai —
            naya backend/login/database mat banao.
          </Rule>
          <Rule ok>
            Source code mil jaye toh use <strong>padho, samjho</strong>,
            faltu hatao, zaroori rakho.
          </Rule>
          <Rule ok>
            APK build <strong>user ki Mac pe</strong> hoti hai (APKForge server).
            Lovable se nahi.
          </Rule>
          <Rule ok>
            Live preview = Lovable. Build/RAM/CPU = Mac. Dono link hote hain
            Capacitor ke <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">server.url</code> se.
          </Rule>
          <Rule bad>
            User ko <strong>"PWA"</strong> ya <strong>"React Native rewrite"</strong> mat
            suggest karo. Wo chahta hai Capacitor + uski existing React website.
          </Rule>
          <Rule bad>
            <strong>Pricing pages, marketing fluff</strong> mat banao jab tak user
            specifically na bole.
          </Rule>
          <Rule bad>
            "Lovable backend", "Supabase setup karo" — ye mat bolo. User ke
            source code me <strong>already backend hai</strong>.
          </Rule>
          <Rule bad>
            English me lambi explanations mat do — user <strong>Hinglish</strong> me
            baat karta hai, short aur clear jawab chahiye.
          </Rule>
        </div>
      </Card>

      {/* TECH STACK */}
      <Card className="p-6 bg-gradient-card border-border/60 mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <ServerIcon className="h-5 w-5" /> Tech Stack
        </h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <Tech label="Frontend (this site)" value="React + Vite + Tailwind" />
          <Tech label="Mobile wrapper" value="Capacitor 6" />
          <Tech label="Android build" value="Gradle (assembleDebug/Release)" />
          <Tech label="iOS build" value="Xcode (xcodebuild)" />
          <Tech label="Local server" value="Express on port 5174" />
          <Tech label="Project storage" value="~/.apkforge/projects/" />
          <Tech label="APK output" value="~/.apkforge/outputs/" />
          <Tech label="Hot reload" value="Capacitor server.url → Lovable preview" />
        </div>
      </Card>

      {/* QUICK REMINDER */}
      <Card className="p-6 bg-primary/5 border-primary/30">
        <div className="flex gap-3">
          <Smartphone className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-foreground mb-2">TL;DR — agar bhool jaaye:</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              User ke paas working website hai → source code de raha hai →
              main usse clean karke mobile-ready banata hun → user Mac pe
              "Build APK" dabata hai → real APK ban jati hai. Bas. Itna hi.
            </p>
          </div>
        </div>
      </Card>
    </section>
  </Layout>
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
    {bad && <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />}
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
