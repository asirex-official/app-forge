import { Smartphone, Sparkles, Home as HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Default starter screen for every new app built in APKForge.
 * Yahi screen phone preview me dikhti hai aur APK build me jaati hai.
 *
 * VISUAL EDITS FRIENDLY: Har static element (h1, p, button text) ko
 * Visual Edits se directly badla ja sakta hai.
 *
 * Aap mujhe batao kya add/remove/change karna hai — main yahan code update karunga.
 */
const HomeScreen = () => {
  return (
    <div className="h-full w-full overflow-y-auto bg-background text-foreground">
      {/* Status bar spacer */}
      <div className="h-6" />

      {/* App header */}
      <header className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">My App</span>
        </div>
      </header>

      {/* Hero block */}
      <section className="px-5 pt-8 pb-6">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight">
          Welcome to<br />
          <span className="text-gradient">your new app</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          Ye aapki blank starter screen hai. Lovable chat me batao kya
          add karna hai — naye buttons, screens, login, kuch bhi.
        </p>
      </section>

      {/* Action card */}
      <section className="px-5 pb-6">
        <div className="rounded-2xl bg-gradient-card border border-border/60 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <HomeIcon className="h-4 w-4 text-primary" />
            <span className="text-xs font-mono uppercase tracking-wider text-primary">Get started</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            Visual Edits se kisi bhi text ko click karke directly badlo,
            ya chat me likho: <span className="font-mono text-xs bg-secondary px-2 py-0.5 rounded">"Login screen add karo"</span>
          </p>
          <Button variant="hero" className="w-full">
            Tap to begin
          </Button>
        </div>
      </section>

      {/* Bottom nav placeholder */}
      <nav className="fixed-mock-nav px-5 py-3 border-t border-border/60 bg-background/80 backdrop-blur flex justify-around text-xs text-muted-foreground">
        <div className="flex flex-col items-center gap-1 text-primary">
          <HomeIcon className="h-5 w-5" />
          <span>Home</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <Smartphone className="h-5 w-5" />
          <span>More</span>
        </div>
      </nav>
    </div>
  );
};

export default HomeScreen;
