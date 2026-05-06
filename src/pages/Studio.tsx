import { useState } from "react";
import { Link } from "react-router-dom";
import { Hammer, Palette, MousePointerClick, Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Layout from "@/components/site/Layout";
import { appScreens } from "@/app-screens";

/**
 * App Studio — live mobile preview of the user's actual app.
 *
 * Whatever screens are registered in src/app-screens/index.ts will:
 *   1. Render here in a phone frame (with a screen switcher)
 *   2. Be exported into the Capacitor APK at build time
 *
 * User flow:
 *   - User says "Login screen add karo with X, Y, Z"
 *   - I create src/app-screens/LoginScreen.tsx and register it
 *   - It appears here instantly + ships in the next APK build
 */
const Studio = () => {
  const [activeId, setActiveId] = useState(
    appScreens.find(s => s.isDefault)?.id ?? appScreens[0]?.id,
  );
  const Active = appScreens.find(s => s.id === activeId)?.Component;

  return (
    <Layout>
      <section className="container py-12">
        <div className="max-w-2xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-xs font-mono text-accent mb-4">
            <Layers className="h-3 w-3" />
            APP STUDIO
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Aapki app, <span className="text-gradient">live preview</span>
          </h1>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            Ye aapki actual app hai jo APK me jaayegi. Chat me mujhe batao
            kya add/change karna hai, ya neeche <strong className="text-foreground">Visual Edits</strong> use karke
            kisi bhi text/button/color ko directly click karke badlo.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* Phone preview */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
              {/* Phone frame */}
              <div className="relative w-[340px] h-[700px] rounded-[3rem] border-[10px] border-secondary bg-background shadow-elegant overflow-hidden">
                {/* Notch */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 h-6 w-32 rounded-full bg-secondary z-10" />
                {Active ? <Active /> : <EmptyState />}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-5 bg-gradient-card border-border/60">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" /> Screens ({appScreens.length})
              </h3>
              <div className="space-y-2">
                {appScreens.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setActiveId(s.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-smooth border ${
                      activeId === s.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s.label}
                    {s.isDefault && <span className="ml-2 text-[10px] font-mono opacity-60">DEFAULT</span>}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
                Naya screen add karne ke liye chat me batao,<br />
                jaise: <span className="font-mono text-foreground">"Profile screen add karo"</span>
              </p>
            </Card>

            <Card className="p-5 bg-gradient-card border-border/60">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <MousePointerClick className="h-4 w-4 text-accent" /> Visual Edits
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Chat box ke neeche left me <strong className="text-foreground">Edit</strong> button dabao,
                fir phone preview me kisi bhi text/button pe click karke seedha edit karo.
                Free hai — credits nahi lagte!
              </p>
            </Card>

            <Card className="p-5 bg-gradient-card border-primary/30 glow-border">
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Hammer className="h-4 w-4 text-primary" /> Ready to test on phone?
              </h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Builder me jaake APK build karo, phone me install karke real app try karo.
              </p>
              <Button asChild variant="hero" className="w-full">
                <Link to="/builder">
                  Build APK <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

const EmptyState = () => (
  <div className="h-full flex flex-col items-center justify-center text-center px-6 text-muted-foreground">
    <Palette className="h-10 w-10 mb-3 opacity-50" />
    <p className="text-sm">Koi screen registered nahi.<br />Chat me batao kya banana hai!</p>
  </div>
);

export default Studio;
