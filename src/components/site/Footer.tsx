import { Hammer } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border/50 bg-background/50 mt-24">
    <div className="container py-10 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Hammer className="h-4 w-4 text-primary" />
        <span>APKForge — built to run on <span className="text-foreground font-medium">your Mac</span>, not the cloud.</span>
      </div>
      <p className="text-xs text-muted-foreground font-mono">
        Capacitor · Gradle · Android SDK · v0.1.0
      </p>
    </div>
  </footer>
);

export default Footer;
