import { useState } from "react";
import { Sparkles, Copy, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const PRESETS = [
  { label: "Wrap website in APK", prompt: "Mere existing website ko Capacitor se wrap karke APK banao. Website code chedo mat — sirf wrapper config." },
  { label: "Change app icon", prompt: "App icon update karo (mai builder me icon upload kar diya hai). Android resources me apply karo." },
  { label: "Set Android permissions", prompt: "AndroidManifest.xml me ye permissions enable karo: " },
  { label: "Add splash screen", prompt: "Capacitor splash screen plugin set up karo with theme color." },
  { label: "Fix build error", prompt: "Last build me ye error aaya — fix karo (sirf wrapper level pe, source touch mat karna):\n\n" },
];

export const AICommandPanel = ({
  projectName,
  packageName,
  sourceLocation,
  liveUrl,
}: {
  projectName?: string;
  packageName?: string;
  sourceLocation?: string;
  liveUrl?: string;
  selectedFile?: string | null;
}) => {
  const [prompt, setPrompt] = useState("");

  const buildPrompt = () => {
    const ctx = [
      "## Project Context",
      projectName && `- Name: ${projectName}`,
      packageName && `- Package: ${packageName}`,
      sourceLocation && `- Source: ${sourceLocation}`,
      liveUrl && `- Live URL: ${liveUrl}`,
      "",
      "## Request",
      prompt.trim() || "(no request yet)",
      "",
      "## Rules",
      "- 🚨 NEVER edit website source code. Only APK wrapper config.",
      "- Build runs on Mac (port 5174). Lovable only edits wrapper.",
    ].filter(Boolean).join("\n");
    return ctx;
  };

  const copyAndOpen = async () => {
    const text = buildPrompt();
    await navigator.clipboard.writeText(text);
    toast.success("Prompt copied — chat me paste karo!");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">AI Command (clipboard)</h3>
      </div>

      <div className="grid grid-cols-1 gap-1.5">
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => setPrompt(p.prompt)}
            className="text-left text-xs px-2.5 py-1.5 rounded-md border border-border bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground transition-smooth"
          >
            {p.label}
          </button>
        ))}
      </div>

      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="AI ko kya karwana hai? (e.g. permissions add karo, icon change karo)…"
        rows={5}
        className="font-mono text-xs"
      />

      <Button onClick={copyAndOpen} variant="hero" className="w-full" disabled={!prompt.trim()}>
        <Copy className="h-4 w-4" /> Copy & paste in chat
      </Button>

      <p className="text-[10px] text-muted-foreground leading-relaxed">
        <Wand2 className="h-3 w-3 inline mr-1" />
        Prompt clipboard me copy hota hai. Chat me paste karke bhejo — main wrapper config edit kar dunga.
      </p>
    </div>
  );
};
