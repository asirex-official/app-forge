import { Link, useLocation } from "react-router-dom";
import { Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/master", label: "Master" },
  { to: "/studio", label: "Studio" },
  { to: "/builder", label: "Builder" },
  { to: "/docs", label: "Docs" },
  { to: "/server", label: "Server" },
];

const Navbar = () => {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow transition-bounce group-hover:scale-110">
            <Hammer className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            APK<span className="text-gradient">Forge</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-smooth",
                pathname === l.to
                  ? "text-primary bg-secondary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Button asChild variant="hero" size="sm">
          <Link to="/builder">Start Building</Link>
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
