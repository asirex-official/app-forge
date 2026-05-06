import { Terminal, CheckCircle2, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Layout from "@/components/site/Layout";

const SetupCmd = ({ children }: { children: string }) => (
  <div className="relative group">
    <pre className="rounded-xl bg-background border border-border p-4 overflow-x-auto text-sm font-mono text-foreground"><code>{children}</code></pre>
    <Button
      variant="ghost"
      size="icon"
      onClick={() => { navigator.clipboard.writeText(children); toast.success("Copied!"); }}
      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-smooth"
    >
      <Copy className="h-4 w-4" />
    </Button>
  </div>
);

const Server = () => (
  <Layout>
    <section className="container py-12 max-w-3xl">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
          <Terminal className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Local Build <span className="text-gradient">Server</span></h1>
      </div>
      <p className="text-muted-foreground mb-10">
        Ye website sirf UI hai — actual APK build aapke Mac pe ek small Node server karta hai jo
        Capacitor + Gradle chalata hai. Ek baar setup karo, baar-baar use karo.
      </p>

      <Card className="p-6 bg-gradient-card border-border/60 space-y-6">
        <Step n={1} title="Prerequisites install karo (one time)">
          <p className="text-sm text-muted-foreground mb-3">Mac pe ye 3 cheezein chahiye:</p>
          <ul className="text-sm space-y-2 mb-4">
            <li>✅ <span className="font-mono">Node.js 18+</span> — <a className="text-primary hover:underline" href="https://nodejs.org" target="_blank" rel="noreferrer">nodejs.org</a></li>
            <li>✅ <span className="font-mono">JDK 17</span> — <code className="bg-secondary px-2 py-0.5 rounded">brew install openjdk@17</code></li>
            <li>✅ <span className="font-mono">Android SDK</span> — Android Studio install karke ek baar khol lo, ya <code className="bg-secondary px-2 py-0.5 rounded">brew install --cask android-commandlinetools</code></li>
          </ul>
          <p className="text-xs text-muted-foreground">Ek baar Android Studio open karke "SDK Manager" → Android SDK Platform 34 + Build Tools install kar lo.</p>
        </Step>

        <Step n={2} title="Environment variables set karo">
          <p className="text-sm text-muted-foreground mb-3">Apni <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">~/.zshrc</code> me add karo:</p>
          <SetupCmd>{`export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin`}</SetupCmd>
          <p className="text-xs text-muted-foreground mt-2">Phir <code className="bg-secondary px-1.5 py-0.5 rounded">source ~/.zshrc</code> chalao.</p>
        </Step>

        <Step n={3} title="APKForge repo clone & install">
          <SetupCmd>{`# is project ko apne Mac pe clone karke:
npm install
npm run server:install   # build server ki dependencies`}</SetupCmd>
        </Step>

        <Step n={4} title="Server start karo">
          <SetupCmd>{`npm run server`}</SetupCmd>
          <p className="text-xs text-muted-foreground mt-2">
            Server <code className="bg-secondary px-1.5 py-0.5 rounded">http://localhost:5174</code> pe live ho jaayega.
            Frontend automatically detect kar lega — Builder page pe green dot dikhega.
          </p>
        </Step>

        <Step n={5} title="Frontend chalao (alag terminal me)">
          <SetupCmd>{`npm run dev`}</SetupCmd>
          <p className="text-xs text-muted-foreground mt-2">Phir browser me <code className="bg-secondary px-1.5 py-0.5 rounded">http://localhost:8080/builder</code> kholo aur APK build karo!</p>
        </Step>
      </Card>

      <Card className="mt-6 p-6 bg-primary/5 border-primary/30">
        <div className="flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Pehli build slow hogi (~5-10 min)</span> — Gradle pehli baar saari Android dependencies download karta hai. Uske baad har build sirf 30-90 seconds me complete hogi.
          </div>
        </div>
      </Card>
    </section>
  </Layout>
);

const Step = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center font-bold text-sm text-primary-foreground">{n}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <div className="pl-11">{children}</div>
  </div>
);

export default Server;
