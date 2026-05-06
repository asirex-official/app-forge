import { Check, X, Smartphone, Apple, IndianRupee, AlertCircle, Sparkles, ArrowRight, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Layout from "@/components/site/Layout";

const Pricing = () => (
  <Layout>
    {/* HERO */}
    <section className="container py-16">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-mono text-primary mb-4">
          <Sparkles className="h-3 w-3" />
          PRICING & PROCESS GUIDE
        </div>
        <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
          Apps banao, <span className="text-gradient">paisa kamao</span>
        </h1>
        <p className="text-muted-foreground text-lg mt-4 leading-relaxed">
          Ye guide aap ke liye hai (aur aap ke clients ke liye bhi). Ek page me sab clear —
          Android APK aur iOS app banane ka kya cost, kya time, kya process, aur clients se kya price lena chahiye.
        </p>
      </div>
    </section>

    {/* WHAT YOU CAN OFFER */}
    <section className="container pb-12">
      <h2 className="text-2xl font-bold mb-6">📦 Aap clients ko kya offer kar sakte ho?</h2>
      <div className="grid md:grid-cols-2 gap-5">
        <Card className="p-6 bg-gradient-card border-border/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Smartphone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Android APK</h3>
              <p className="text-xs text-muted-foreground">.apk file — Play Store ya direct install</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm">
            {androidFeatures.map(f => <Feat key={f} text={f} />)}
          </ul>
        </Card>

        <Card className="p-6 bg-gradient-card border-border/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-11 w-11 rounded-xl bg-accent/10 border border-accent/30 flex items-center justify-center">
              <Apple className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold">iOS App</h3>
              <p className="text-xs text-muted-foreground">.ipa file — App Store ya TestFlight</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm">
            {iosFeatures.map(f => <Feat key={f} text={f} />)}
          </ul>
        </Card>
      </div>
    </section>

    {/* COSTS YOU PAY */}
    <section className="container py-12">
      <h2 className="text-2xl font-bold mb-2">💸 One-time costs jo aap ko (ya client ko) pay karne hain</h2>
      <p className="text-muted-foreground mb-6 text-sm">Ye Lovable / APKForge ki nahi — ye Apple/Google ki fees hain. Without these, app phone me install hi nahi hogi.</p>
      <div className="grid md:grid-cols-2 gap-5">
        {costs.map(c => (
          <Card key={c.title} className="p-6 bg-gradient-card border-border/60">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold">{c.title}</h3>
              <span className="text-2xl font-extrabold text-gradient">{c.price}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">{c.desc}</p>
            <div className="text-xs text-muted-foreground border-t border-border/60 pt-3">
              <strong className="text-foreground">Kab chahiye:</strong> {c.when}
            </div>
          </Card>
        ))}
      </div>
    </section>

    {/* CLIENT PRICING */}
    <section className="container py-12">
      <h2 className="text-2xl font-bold mb-2">💰 Aap clients se kitna le sakte ho?</h2>
      <p className="text-muted-foreground mb-6 text-sm">Ye sirf suggested rates hain — market me ye normal hai. Aap apne hisaab se adjust karo.</p>

      <div className="grid md:grid-cols-3 gap-5">
        {packages.map((p, i) => (
          <Card
            key={p.title}
            className={`p-6 relative ${p.popular ? "bg-gradient-card border-primary/40 glow-border shadow-glow" : "bg-gradient-card border-border/60"}`}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-gradient-primary text-primary-foreground">
                MOST POPULAR
              </span>
            )}
            <h3 className="font-semibold text-lg">{p.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{p.subtitle}</p>
            <div className="mt-4 mb-5">
              <span className="text-4xl font-extrabold">{p.price}</span>
              <span className="text-sm text-muted-foreground ml-1">{p.unit}</span>
            </div>
            <ul className="space-y-2 text-sm mb-5">
              {p.features.map(f => <Feat key={f} text={f} />)}
            </ul>
            <p className="text-xs text-muted-foreground border-t border-border/60 pt-3">
              <strong className="text-foreground">Time:</strong> {p.time}
            </p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-5 bg-warning/5 border-warning/30">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Important:</strong> Apple Developer ($99/year) aur Play Console ($25 one-time) ki fees client ko alag se batao —
            ye aap ke charges me include nahi hain. Ya toh client khud apna account banaye, ya aap unke paise se kharidkar dedo.
          </div>
        </div>
      </Card>
    </section>

    {/* PROCESS */}
    <section className="container py-12">
      <h2 className="text-2xl font-bold mb-6">🔄 Pura process kaisa hoga?</h2>
      <div className="space-y-4">
        {process.map((s, i) => (
          <Card key={s.title} className="p-5 bg-gradient-card border-border/60 flex gap-5 items-start">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center font-bold text-primary-foreground flex-shrink-0">
              {i + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                <h3 className="font-semibold">{s.title}</h3>
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {s.time}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          </Card>
        ))}
      </div>
    </section>

    {/* FAQ */}
    <section className="container py-12">
      <h2 className="text-2xl font-bold mb-6">❓ Common questions clients pucchte hain</h2>
      <div className="space-y-3">
        {faq.map(f => (
          <Card key={f.q} className="p-5 bg-gradient-card border-border/60">
            <h3 className="font-semibold mb-2 text-foreground">Q: {f.q}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">A: {f.a}</p>
          </Card>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="container py-16">
      <Card className="p-10 bg-gradient-card border-primary/30 text-center glow-border">
        <Zap className="h-10 w-10 mx-auto text-primary mb-4" />
        <h2 className="text-3xl font-bold mb-3">Ready to start?</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Apni ya client ki ready Lovable website mujhe do — main usse APK + iOS app me convert kar dunga.
        </p>
        <Button asChild variant="hero" size="lg">
          <Link to="/builder">Open Builder <ArrowRight className="h-5 w-5" /></Link>
        </Button>
      </Card>
    </section>
  </Layout>
);

const Feat = ({ text }: { text: string }) => (
  <li className="flex items-start gap-2">
    <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
    <span className="text-muted-foreground">{text}</span>
  </li>
);

const androidFeatures = [
  "Real .apk file (Java/Kotlin native shell)",
  "Direct install (WhatsApp se bhejo, install karein)",
  "Play Store me upload kar sakte ho",
  "Google Sign-In, Email, OTP — sab chalega",
  "Push notifications, Camera, GPS, Share — sab",
  "Aap ke Mac pe build hoga (no cloud)",
];

const iosFeatures = [
  "Real .ipa file (Swift native shell)",
  "TestFlight pe testing ke liye bhejo",
  "App Store me upload kar sakte ho",
  "Same backend, same login, same UI",
  "iPhone-specific features access",
  "Mac + Xcode chahiye build ke liye",
];

const costs = [
  {
    title: "🤖 Google Play Console",
    price: "$25",
    desc: "One-time fee. Bina iske Android app Play Store pe nahi daal sakte. APK direct install ke liye ye nahi chahiye.",
    when: "Sirf jab Play Store pe publish karna ho",
  },
  {
    title: "🍎 Apple Developer Account",
    price: "$99/year",
    desc: "Apple ki yearly fee. Bina iske iOS app kisi bhi iPhone me install nahi hoti (sirf aap ke testing iPhone pe 7 din ke liye chalegi).",
    when: "Har iOS app ke liye zaroori — chahe App Store ho ya nahi",
  },
  {
    title: "💻 Mac + Xcode (iOS ke liye)",
    price: "₹0",
    desc: "Aap ke paas already MacBook hai ✅. Xcode App Store se free download kar lo (10+ GB space lega).",
    when: "Sirf iOS apps banane ke liye — Android ke liye nahi chahiye",
  },
  {
    title: "☁️ Lovable + Cloud + APKForge",
    price: "₹0 - existing",
    desc: "Aap pehle se Lovable use kar rahe ho. APKForge aap ke Mac pe free chalta hai. Lovable Cloud ka monthly free tier hai.",
    when: "Already aap ke paas hai",
  },
];

const packages = [
  {
    title: "Starter",
    subtitle: "Sirf Android APK",
    price: "₹8,000",
    unit: "/ project",
    time: "1-2 din",
    features: [
      "Working website → APK convert",
      "App icon + splash screen",
      "Same login, same backend",
      "APK file deliver",
      "1 round of revision",
    ],
  },
  {
    title: "Pro",
    subtitle: "Android + iOS dono",
    price: "₹20,000",
    unit: "/ project",
    time: "3-4 din",
    popular: true,
    features: [
      "Sab kuch Starter wala +",
      "iOS .ipa file bhi",
      "Push notifications setup",
      "Mobile-responsive tweaks",
      "Play Store / TestFlight upload help",
      "2 rounds of revision",
    ],
  },
  {
    title: "Premium",
    subtitle: "Full publish + maintenance",
    price: "₹40,000+",
    unit: "/ project",
    time: "1 week",
    features: [
      "Sab kuch Pro wala +",
      "Play Store + App Store full upload",
      "Native features (Camera, GPS, etc.)",
      "Custom splash + animations",
      "3 months maintenance free",
      "Unlimited revisions in scope",
    ],
  },
];

const process = [
  { title: "Client se requirements lo", time: "1 hour", desc: "Client se puchho: kya app banani hai, website ka URL/code hai kya, kya features chahiye, Android-only ya iOS bhi, Play Store pe daalna hai kya. 50% advance lo." },
  { title: "Website ready check karo", time: "30 min", desc: "Agar website already Lovable pe ya React me bani hai — perfect. Agar nahi, pehle website banao. Mobile responsive hai ki nahi check karo." },
  { title: "APKForge me convert", time: "30 min", desc: "Source code mujhe (Lovable AI ko) do — main Capacitor add kar dunga. App icon, name, splash screen configure karo Builder me." },
  { title: "APK / iOS build karo", time: "5-10 min", desc: "Aap ke Mac pe APKForge server chalakar Build APK click karo. iOS ke liye Xcode open karke 'Archive → Export'." },
  { title: "Client ko test karne do", time: "1-2 din", desc: "APK file WhatsApp/Email se bhejo. iOS ke liye TestFlight invite bhejo. Client phone pe install karke test karega." },
  { title: "Revisions + final delivery", time: "1 day", desc: "Client ki feedback ke hisaab se changes karo. Final APK + iOS file deliver karo. Baaki 50% payment lo." },
  { title: "(Optional) Play Store / App Store upload", time: "1-2 din", desc: "Client ke account se upload karo (ya apne developer account se publish karo). Review me Apple ko 1-3 din lagte hain, Google ko 1-2 din." },
];

const faq = [
  { q: "App phone me kaisi dikhegi — same as website?", a: "Haan, bilkul same UI dikhegi. Lekin mobile screen choti hoti hai, isliye agar website desktop ke liye design ki gayi hai toh thodi tweaks karne padenge taaki mobile pe achi lage." },
  { q: "Login (Google, Email) chalega kya app me?", a: "Haan 100%. Same Supabase / backend use hota hai. Sirf Google ka redirect URL settings me add karna padta hai (5 min ka kaam)." },
  { q: "Android user APK kaise install karega?", a: "Aap WhatsApp ya email se .apk file bhejo. User ko bas 'Install from unknown sources' enable karna padega ek baar (Settings me). Phir double-tap karke install ho jata hai. Ya direct Play Store pe upload karo — fir search karke install karein." },
  { q: "iOS me APK chalegi kya?", a: "Nahi. iOS me .ipa file alag banti hai. Ek hi code se dono ban sakti hain — APKForge dono support karta hai (iOS ke liye Mac + Xcode chahiye)." },
  { q: "Update kaise dunga client ko?", a: "Code me change karo, dobara build karo, nayi APK/IPA bhejo. Ya advanced setup me 'live updates' bhi setup ho sakte hain (code change → app me automatic update without rebuild)." },
  { q: "App fast chalegi ki slow?", a: "Modern phones pe bilkul fast. Capacitor based apps me Instagram-Lite, BMW, Burger King, MetaMask jaise apps hain — lakhs users use karte hain. Kisi ko pata nahi chalta ki ye native nahi hai." },
  { q: "Agar website me kuch break ho toh app me bhi break hoga?", a: "Haan, kyunki same code hai. Isliye website ko stable rakho. Lekin app ke andar 'old version cache' bhi rehta hai — toh totally crash nahi hota, sirf naya feature update nahi milta jab tak rebuild na karo." },
];

export default Pricing;
