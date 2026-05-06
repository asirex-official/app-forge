import { Link } from "react-router-dom";
import { ArrowRight, Hammer, Cpu, Smartphone, Shield, Zap, Code2, Download, Terminal, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Layout from "@/components/site/Layout";
import heroImg from "@/assets/hero-android.jpg";

const features = [
  { icon: Cpu, title: "100% Local Build", desc: "APK compile aapke Mac pe hota hai — Gradle + Android SDK directly chalte hain. Koi cloud nahi." },
  { icon: Shield, title: "Privacy First", desc: "Aapka source code, assets, signing keys — sab kuch sirf aapke machine pe rehte hain." },
  { icon: Zap, title: "Real APK Output", desc: "Capacitor pipeline se signed-debug ya release APK directly download ho jaata hai." },
  { icon: Palette, title: "Visual Configurator", desc: "App name, icon, colors, splash, permissions — sab kuch ek beautiful UI me set karein." },
  { icon: Code2, title: "Web → Native", desc: "Apni website URL ya custom HTML do, hum WebView wrapper banake native app me convert karte hain." },
  { icon: Terminal, title: "Open Pipeline", desc: "Generated Capacitor project bhi save hota hai — chaaho toh Android Studio me open karke aage badhao." },
];

const steps = [
  { n: "01", title: "Install karo", desc: "JDK 17 + Android SDK + ye repo. Ek-baar setup, baar-baar use." },
  { n: "02", title: "Server chalao", desc: "npm run server — local build engine 5174 port pe live ho jata hai." },
  { n: "03", title: "App configure karo", desc: "Builder page pe naam, icon, URL, theme — sab kuch fill karo." },
  { n: "04", title: "Build & Download", desc: "Build APK click karo, 1-2 min me .apk file ready — download lo, phone me install." },
];

const Index = () => (
  <Layout>
    {/* HERO */}
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="container relative py-24 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs font-mono text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
            LOCAL FIRST · NO CLOUD · MAC NATIVE
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
            Build real <span className="text-gradient">Android APKs</span>
            <br />right on your Mac.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            APKForge ek beautiful no-code interface deta hai jo aapke local Capacitor + Gradle pipeline
            ko drive karta hai. Configure karo, click karo, real <span className="font-mono text-foreground">.apk</span> file download karo.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="hero" size="xl">
              <Link to="/builder">
                <Hammer className="h-5 w-5" />
                Open Builder
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link to="/server">
                <Terminal className="h-5 w-5" />
                Setup Local Server
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> No signup</div>
            <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> ~2 min builds</div>
            <div className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-primary" /> Real .apk</div>
          </div>
        </div>
        <div className="relative animate-float">
          <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
          <img
            src={heroImg}
            alt="Glowing Android mascot building APK files"
            width={1280}
            height={1280}
            className="relative rounded-3xl shadow-elegant"
          />
        </div>
      </div>
    </section>

    {/* FEATURES */}
    <section className="container py-24">
      <div className="max-w-2xl mx-auto text-center mb-16 space-y-4">
        <p className="text-sm font-mono text-primary uppercase tracking-widest">Why APKForge</p>
        <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
          Everything you need, <span className="text-gradient">nothing you don't</span>
        </h2>
        <p className="text-muted-foreground text-lg">
          Cloud APK builders pe limits, queues, paid plans, aur privacy issues hote hain. APKForge sab aapke control me deta hai.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <Card
            key={f.title}
            className="relative p-6 bg-gradient-card border-border/60 hover:border-primary/40 transition-smooth glow-border group animate-fade-in-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:shadow-glow transition-smooth">
              <f.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </Card>
        ))}
      </div>
    </section>

    {/* HOW IT WORKS */}
    <section className="container py-24">
      <div className="max-w-2xl mx-auto text-center mb-16 space-y-4">
        <p className="text-sm font-mono text-accent uppercase tracking-widest">How it works</p>
        <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">From idea to <span className="text-gradient">.apk</span> in 4 steps</h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((s, i) => (
          <div key={s.n} className="relative">
            <Card className="p-6 h-full bg-gradient-card border-border/60 hover:border-accent/40 transition-smooth">
              <div className="text-5xl font-extrabold text-gradient mb-4 font-mono">{s.n}</div>
              <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </Card>
            {i < steps.length - 1 && (
              <ArrowRight className="hidden lg:block absolute top-1/2 -right-4 h-6 w-6 text-primary/40 -translate-y-1/2" />
            )}
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="container py-24">
      <Card className="relative overflow-hidden p-12 lg:p-16 bg-gradient-card border-primary/30 text-center glow-border">
        <div className="absolute inset-0 bg-gradient-primary opacity-10" />
        <div className="relative space-y-6 max-w-2xl mx-auto">
          <Download className="h-12 w-12 mx-auto text-primary" />
          <h2 className="text-4xl lg:text-5xl font-bold">Ready to forge your first APK?</h2>
          <p className="text-muted-foreground text-lg">
            Builder open karo, app details bharo, aur 2 minute me real Android app aapke haath me.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button asChild variant="hero" size="xl">
              <Link to="/builder">
                Start Building <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link to="/docs">Read the docs</Link>
            </Button>
          </div>
        </div>
      </Card>
    </section>
  </Layout>
);

export default Index;
