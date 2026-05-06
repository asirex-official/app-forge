import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck, Send, Copy, Sparkles, FolderOpen, Brain, Wand2,
  CheckCircle2, X, Package, FileCode, ListTodo, AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Layout from "@/components/site/Layout";
import { loadProjects, TrackedProject } from "@/lib/projectStore";

/**
 * ADMIN PANEL — Single command center
 * -----------------------------------
 * User = admin (decisions le raha hai). AI (main) = coder (jo bole wahi karta hai).
 * Sab kuch ek jagah:
 *  - Active project context
 *  - Brain (memory — kya yaad rakhna hai)
 *  - Capabilities (kya kar sakta / nahi)
 *  - Command box (prompt → clipboard → chat me paste → main edit karunga)
 */

type ActionPreset = {
  id: string;
  label: string;
  icon: React.ReactNode;
  template: string;
};

const PRESETS: ActionPreset[] = [
  {
    id: "wrap",
    label: "Wrap website in APK",
    icon: <Package className="h-3.5 w-3.5" />,
    template:
      "Iss project ke liye APK wrapper banao:\n- App naam: {NAME}\n- Package: {PKG}\n- Source: {SRC}\n- Live URL: {URL}\nWebsite ka code MAT chedo. Sirf APKForge wrapper config (capacitor.config, manifest, icon, permissions) set karo.",
  },
  {
    id: "icon",
    label: "Change app icon",
    icon: <Wand2 className="h-3.5 w-3.5" />,
    template:
      "App icon update karo {NAME} ke liye. Sirf APKForge ka mipmap icon files update karna — website touch nahi.",
  },
  {
    id: "perms",
    label: "Set Android permissions",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
    template:
      "{NAME} ke liye Android permissions set karo: camera, location, notifications. Sirf AndroidManifest patch — website code untouched.",
  },
  {
    id: "build",
    label: "Trigger Mac build",
    icon: <Sparkles className="h-3.5 w-3.5" />,
    template:
      "{NAME} ki APK build trigger karne ke commands batao. Mac pe local APKForge server (port 5174) chal raha hai.",
  },
  {
    id: "fix",
    label: "Fix a bug",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    template:
      "Bug: <yahan likho>\nProject: {NAME}\nFile/line (agar pata hai): \nFix karo — sirf APK wrapper, website code MAT chedo.",
  },
  {
    id: "custom",
    label: "Custom request",
    icon: <Brain className="h-3.5 w-3.5" />,
    template: "Project: {NAME} ({PKG})\nSource: {SRC}\n\nKaam: <yahan likho>\n\nReminder: User ki website ka code NEVER edit. Sirf APKForge wrapper.",
  },
];

const CAN_DO = [
  "APKForge ke andar Capacitor wrapper config edit karna",
  "App name, package name, version set karna",
  "Icon, splash screen update karna",
  "Android permissions configure karna (manifest patch)",
  "Build commands batana / Mac server pe trigger karna",
  "User ka source code padhna (read-only) aur samajhna",
  "Project tracker me tasks / errors / notes manage karna",
  "Bugs diagnose karna aur fix suggest karna",
];

const CANNOT_DO = [
  "User ki website ka source code edit karna ❌",
  "Mac pe khud build chalana (user ko trigger karna padega)",
  "Backend / DB rebuild karna (user ke source me already hai)",
  "Lovable Cloud / Supabase setup suggest karna",
  "PWA ya React Native rewrite suggest karna",
  "Pricing / marketing pages bina maange banana",
];

const Admin = () => {
  const [projects, setProjects] = useState<TrackedProject[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [presetId, setPresetId] = useState<string>("custom");
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    const p = loadProjects();
    setProjects(p);
    if (p.length) setActiveId(p[0].id);
  }, []);

  const active = useMemo(() => projects.find((p) => p.id === activeId), [projects, activeId]);
  const preset = PRESETS.find((p) => p.id === presetId)!;

  // Apply preset → fill prompt with project context
  useEffect(() => {
    if (!preset) return;
    let t = preset.template;
    t = t.replaceAll("{NAME}", active?.name || "<app name>");
    t = t.replaceAll("{PKG}", active?.packageName || "<com.you.app>");
    t = t.replaceAll("{SRC}", active?.sourceLocation || "<source location>");
    t = t.replaceAll("{URL}", active?.liveUrl || "<live url>");
    setPrompt(t);
  }, [presetId, activeId]);

  const finalMessage = useMemo(() => {
    const ctx = active ? [
      `📦 Project: ${active.name} (${active.packageName})`,
      `🔗 Source: ${active.sourceType} → ${active.sourceLocation || "—"}`,
      active.liveUrl && `🌐 Live: ${active.liveUrl}`,
      active.devPort && `🔌 Port: ${active.devPort}`,
      active.folderPath && `📁 Mac path: ${active.folderPath}`,
    ].filter(Boolean).join("\n") : "";

    return [
      `🎯 [Admin Command — APKForge]`,
      ctx && `\n## Context\n${ctx}`,
      `\n## Request\n${prompt}`,
      `\n## Reminder\n⚠️ Website code NEVER edit. Sirf APK wrapper config.`,
    ].filter(Boolean).join("\n");
  }, [active, prompt]);

  const sendToChat = () => {
    navigator.clipboard.writeText(finalMessage);
    toast.success("Copied! Ab chat me paste karke bhej do.");
  };

  return (
    <Layout>
      <section className="container py-12 max-w-6xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Admin <span className="text-gradient">Panel</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Tu admin. Main coder. Sab yahin se chalega.
              </p>
            </div>
          </div>
          {projects.length > 0 && (
            <div className="min-w-[220px]">
              <label className="text-[11px] text-muted-foreground">Active Project</label>
              <Select value={activeId} onValueChange={setActiveId}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {projects.length === 0 ? (
          <Card className="p-8 bg-yellow-500/10 border-yellow-500/30 text-center">
            <Package className="h-10 w-10 text-yellow-400 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Pehle ek project add karo</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Projects page pe jaake "New Project" dabao — uske baad yahan command bheja jaa sakega.
            </p>
            <Button asChild variant="hero"><a href="/projects">Go to Projects</a></Button>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            {/* Left — Command center */}
            <div className="space-y-4">
              {/* Active context */}
              {active && (
                <Card className="p-4 bg-gradient-card border-border/60">
                  <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
                    <FolderOpen className="h-4 w-4 text-primary" /> Current Context
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    <Ctx label="App" value={active.name} />
                    <Ctx label="Package" value={active.packageName} mono />
                    <Ctx label="Source type" value={active.sourceType} />
                    <Ctx label="Source location" value={active.sourceLocation || "—"} mono />
                    {active.liveUrl && <Ctx label="Live URL" value={active.liveUrl} mono />}
                    {active.devPort && <Ctx label="Dev port" value={String(active.devPort)} mono />}
                    {active.folderPath && <Ctx label="Mac path" value={active.folderPath} mono />}
                    <Ctx label="Status" value={active.status} />
                  </div>
                  {(active.tasks.length > 0 || active.errors.length > 0) && (
                    <div className="flex gap-3 mt-3 text-[11px]">
                      <Badge variant="outline" className="gap-1">
                        <ListTodo className="h-3 w-3" />
                        {active.tasks.filter((t) => t.status !== "done").length} pending
                      </Badge>
                      {active.errors.filter((e) => !e.fixed).length > 0 && (
                        <Badge variant="outline" className="gap-1 text-red-400 border-red-500/30">
                          <AlertCircle className="h-3 w-3" />
                          {active.errors.filter((e) => !e.fixed).length} errors
                        </Badge>
                      )}
                    </div>
                  )}
                </Card>
              )}

              {/* Quick presets */}
              <Card className="p-4 bg-gradient-card border-border/60">
                <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
                  <Wand2 className="h-4 w-4 text-primary" /> Quick Action
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPresetId(p.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs text-left transition-smooth ${
                        presetId === p.id
                          ? "bg-primary/15 border-primary/40 text-foreground"
                          : "bg-background/40 border-border/60 hover:bg-secondary/50"
                      }`}
                    >
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Prompt */}
              <Card className="p-4 bg-gradient-card border-border/60">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Send className="h-4 w-4 text-primary" /> Command (Prompt)
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {prompt.length} chars
                  </span>
                </div>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                  placeholder="Kya karwana hai..."
                />
              </Card>

              {/* Final preview + send */}
              <Card className="p-4 bg-primary/5 border-primary/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" /> Final message to AI
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(finalMessage)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <pre className="text-[11px] font-mono bg-background/60 rounded-lg p-3 max-h-48 overflow-auto whitespace-pre-wrap text-muted-foreground">
                  {finalMessage}
                </pre>
                <Button
                  variant="hero"
                  className="w-full mt-3"
                  disabled={!prompt.trim()}
                  onClick={sendToChat}
                >
                  <Send className="h-4 w-4 mr-1.5" /> Copy & Send to AI Chat
                </Button>
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  Clipboard me copy hoga — chat me paste karke bhej do.
                </p>
              </Card>
            </div>

            {/* Right — Brain & Capabilities */}
            <div className="space-y-4">
              <Tabs defaultValue="can">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="can" className="text-xs">Can</TabsTrigger>
                  <TabsTrigger value="cant" className="text-xs">Can't</TabsTrigger>
                  <TabsTrigger value="brain" className="text-xs">Brain</TabsTrigger>
                </TabsList>

                <TabsContent value="can">
                  <Card className="p-4 bg-gradient-card border-border/60">
                    <div className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" /> AI kya kar sakta
                    </div>
                    <ul className="space-y-1.5 text-xs">
                      {CAN_DO.map((c) => (
                        <li key={c} className="flex gap-2 text-muted-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </TabsContent>

                <TabsContent value="cant">
                  <Card className="p-4 bg-gradient-card border-border/60">
                    <div className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1.5">
                      <X className="h-3.5 w-3.5" /> AI kya NAHI karega
                    </div>
                    <ul className="space-y-1.5 text-xs">
                      {CANNOT_DO.map((c) => (
                        <li key={c} className="flex gap-2 text-muted-foreground">
                          <X className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </TabsContent>

                <TabsContent value="brain">
                  <Card className="p-4 bg-gradient-card border-border/60">
                    <div className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5">
                      <Brain className="h-3.5 w-3.5" /> AI ki memory
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                      <li>✓ APKForge = website→APK wrapper tool</li>
                      <li>✓ User ki website code NEVER edit</li>
                      <li>✓ Mac pe build (port 5174), Lovable pe nahi</li>
                      <li>✓ Hinglish me reply, short & clear</li>
                      <li>✓ Source = GitHub / ZIP / Lovable / Mac folder</li>
                      <li>✓ Reference page: <code>/master</code></li>
                      <li>✓ Project tracker: <code>/projects</code></li>
                      <li>✓ File browser: <code>/files</code></li>
                    </ul>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Quick links */}
              <Card className="p-4 bg-gradient-card border-border/60">
                <div className="text-xs font-semibold mb-2">Shortcuts</div>
                <div className="space-y-1.5">
                  <QuickLink href="/projects" icon={<Package className="h-3.5 w-3.5" />}>Projects</QuickLink>
                  <QuickLink href="/files" icon={<FileCode className="h-3.5 w-3.5" />}>Source Files</QuickLink>
                  <QuickLink href="/master" icon={<Brain className="h-3.5 w-3.5" />}>Master Prompt</QuickLink>
                  <QuickLink href="/builder" icon={<Wand2 className="h-3.5 w-3.5" />}>APK Builder</QuickLink>
                </div>
              </Card>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
};

const Ctx = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div className="rounded-lg bg-background/40 border border-border/40 p-2">
    <div className="text-[10px] text-muted-foreground uppercase">{label}</div>
    <div className={`text-foreground truncate ${mono ? "font-mono text-[11px]" : "text-xs"}`}>
      {value}
    </div>
  </div>
);

const QuickLink = ({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <a
    href={href}
    className="flex items-center gap-2 text-xs px-2 py-1.5 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-smooth"
  >
    {icon} {children}
  </a>
);

export default Admin;
