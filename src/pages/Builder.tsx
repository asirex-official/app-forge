import { useEffect, useMemo, useState } from "react";
import {
  Hammer, Smartphone, Globe, Palette, Shield, Package, Loader2, CheckCircle2, XCircle,
  Download, Image as ImageIcon, FolderOpen, KeyRound, Sparkles, Settings2, FileCode, Copy, Maximize2, Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Layout from "@/components/site/Layout";
import { FileTree, fetchFile } from "@/components/builder/FileTree";
import { KeysPanel } from "@/components/builder/KeysPanel";
import { AICommandPanel } from "@/components/builder/AICommandPanel";
import { loadProjects, type TrackedProject } from "@/lib/projectStore";

type AppConfig = {
  appName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  sourceType: "url" | "html";
  url: string;
  html: string;
  themeColor: string;
  bgColor: string;
  iconDataUrl: string | null;
  permissions: { internet: boolean; camera: boolean; location: boolean; notifications: boolean; storage: boolean };
  buildType: "debug" | "release";
  sourceRoot: string;
  activeProjectId: string;
};

const DEFAULT_CONFIG: AppConfig = {
  appName: "My First App",
  packageName: "com.myforge.firstapp",
  versionName: "1.0.0",
  versionCode: 1,
  sourceType: "url",
  url: "https://example.com",
  html: "<!doctype html><html><body style='font-family:sans-serif;display:grid;place-items:center;height:100vh;margin:0;background:#0f172a;color:#fff'><div><h1>Hello from APKForge 👋</h1></div></body></html>",
  themeColor: "#22c55e",
  bgColor: "#0f172a",
  iconDataUrl: null,
  permissions: { internet: true, camera: false, location: false, notifications: false, storage: false },
  buildType: "debug",
  sourceRoot: "",
  activeProjectId: "default",
};

const SERVER_URL = (import.meta.env.VITE_BUILD_SERVER_URL as string) || "http://localhost:5174";

type BuildState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "building"; jobId: string; logs: string[]; progress: number }
  | { status: "done"; jobId: string; apkUrl: string; logs: string[] }
  | { status: "error"; message: string; logs?: string[] };

const Builder = () => {
  const [cfg, setCfg] = useState<AppConfig>(() => {
    try {
      const saved = localStorage.getItem("apkforge:config");
      return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
    } catch { return DEFAULT_CONFIG; }
  });
  const [build, setBuild] = useState<BuildState>({ status: "idle" });
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [projects, setProjects] = useState<TrackedProject[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [loadingFile, setLoadingFile] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [draftRoot, setDraftRoot] = useState(cfg.sourceRoot);

  useEffect(() => {
    localStorage.setItem("apkforge:config", JSON.stringify(cfg));
  }, [cfg]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${SERVER_URL}/health`).then(r => r.ok).then(ok => !cancelled && setServerOnline(!!ok)).catch(() => !cancelled && setServerOnline(false));
    setProjects(loadProjects());
    return () => { cancelled = true; };
  }, []);

  const update = <K extends keyof AppConfig>(k: K, v: AppConfig[K]) => setCfg(p => ({ ...p, [k]: v }));

  const onIcon = (file: File) => {
    if (file.size > 2 * 1024 * 1024) return toast.error("Icon under 2MB rakho");
    const r = new FileReader();
    r.onload = () => update("iconDataUrl", r.result as string);
    r.readAsDataURL(file);
  };

  const openFile = async (path: string) => {
    if (!cfg.sourceRoot) return;
    setActiveFile(path);
    setLoadingFile(true);
    setFileContent("");
    try {
      const c = await fetchFile(cfg.sourceRoot, path);
      setFileContent(c);
    } catch (e: any) {
      setFileContent(`// Error: ${e.message}`);
    } finally {
      setLoadingFile(false);
    }
  };

  const validate = (): string | null => {
    if (!/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(cfg.packageName))
      return "Package name format galat (e.g. com.example.app)";
    if (!cfg.appName.trim()) return "App name zaroori hai";
    if (cfg.sourceType === "url" && !/^https?:\/\//.test(cfg.url)) return "URL http(s):// se shuru hona chahiye";
    return null;
  };

  const startBuild = async () => {
    const err = validate();
    if (err) return toast.error(err);
    if (!serverOnline) return toast.error("Mac build server offline. /server check karo.");

    setBuild({ status: "submitting" });
    try {
      const res = await fetch(`${SERVER_URL}/build`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      if (!res.ok) throw new Error(await res.text());
      const { jobId } = await res.json();
      setBuild({ status: "building", jobId, logs: [], progress: 0 });
      pollJob(jobId);
    } catch (e: any) {
      setBuild({ status: "error", message: e?.message ?? "Build start fail" });
    }
  };

  const pollJob = async (jobId: string) => {
    const tick = async () => {
      try {
        const r = await fetch(`${SERVER_URL}/build/${jobId}`);
        const j = await r.json();
        if (j.status === "running") {
          setBuild({ status: "building", jobId, logs: j.logs ?? [], progress: j.progress ?? 0 });
          setTimeout(tick, 1500);
        } else if (j.status === "done") {
          setBuild({ status: "done", jobId, apkUrl: `${SERVER_URL}${j.apkUrl}`, logs: j.logs ?? [] });
          toast.success("APK build ho gayi! 🎉");
        } else {
          setBuild({ status: "error", message: j.error ?? "Build fail", logs: j.logs });
        }
      } catch (e: any) {
        setBuild({ status: "error", message: e?.message ?? "Poll error" });
      }
    };
    tick();
  };

  const isBuilding = build.status === "submitting" || build.status === "building";
  const activeProject = projects.find(p => p.id === cfg.activeProjectId);

  const previewSrc = useMemo(() => {
    if (cfg.sourceType === "url") return cfg.url;
    return `data:text/html;charset=utf-8,${encodeURIComponent(cfg.html)}`;
  }, [cfg.sourceType, cfg.url, cfg.html]);

  return (
    <Layout>
      <div className="container max-w-[1600px] py-6">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Hammer className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">App <span className="text-gradient">Builder</span></h1>
              <p className="text-xs text-muted-foreground">Lovable jaisa unified IDE — files, preview, AI, sab ek jagah.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {projects.length > 0 && (
              <select
                value={cfg.activeProjectId}
                onChange={(e) => {
                  const p = projects.find(x => x.id === e.target.value);
                  if (p) {
                    setCfg(c => ({
                      ...c,
                      activeProjectId: p.id,
                      appName: p.name,
                      packageName: p.packageName,
                      url: p.liveUrl || c.url,
                      sourceRoot: p.folderPath || c.sourceRoot,
                    }));
                    setDraftRoot(p.folderPath || "");
                    toast.success(`Switched to ${p.name}`);
                  }
                }}
                className="bg-secondary border border-border rounded-md px-3 py-1.5 text-xs font-mono"
              >
                <option value="default">— Select project —</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            )}
            <ServerStatus online={serverOnline} />
          </div>
        </div>

        {/* 3-PANEL IDE */}
        <div className="grid grid-cols-12 gap-3 h-[calc(100vh-180px)] min-h-[640px]">
          {/* LEFT: file tree + code viewer */}
          <Card className="col-span-3 bg-gradient-card border-border/60 flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-border/60 flex items-center gap-2 bg-background/40">
              <FolderOpen className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold">Source Files</span>
              <span className="text-[10px] text-muted-foreground ml-auto">read-only</span>
            </div>

            {!cfg.sourceRoot ? (
              <div className="p-3 space-y-2">
                <p className="text-[11px] text-muted-foreground">Mac pe source folder ka full path daalo:</p>
                <Input
                  value={draftRoot}
                  onChange={(e) => setDraftRoot(e.target.value)}
                  placeholder="/Users/you/projects/my-app"
                  className="font-mono text-xs h-8"
                />
                <Button
                  size="sm"
                  variant="hero"
                  className="w-full"
                  disabled={!draftRoot}
                  onClick={() => { update("sourceRoot", draftRoot); toast.success("Root set"); }}
                >
                  Load folder
                </Button>
              </div>
            ) : (
              <>
                <div className="px-3 py-1.5 text-[10px] text-muted-foreground font-mono border-b border-border/60 truncate flex items-center justify-between gap-2">
                  <span className="truncate">{cfg.sourceRoot}</span>
                  <button
                    onClick={() => { update("sourceRoot", ""); setDraftRoot(""); setActiveFile(null); setFileContent(""); }}
                    className="text-destructive hover:underline flex-shrink-0"
                  >clear</button>
                </div>
                <div className="flex-1 overflow-auto p-2">
                  <FileTree
                    root={cfg.sourceRoot}
                    serverOk={serverOnline}
                    activeFile={activeFile}
                    onOpenFile={openFile}
                  />
                </div>
                {activeFile && (
                  <div className="border-t border-border/60 max-h-[40%] flex flex-col">
                    <div className="px-3 py-1.5 flex items-center justify-between bg-background/40 border-b border-border/60">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono truncate">
                        <FileCode className="h-3 w-3 text-primary" />
                        <span className="truncate">{activeFile}</span>
                      </div>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => { navigator.clipboard.writeText(fileContent); toast.success("Copied"); }}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    {loadingFile ? (
                      <div className="p-4 text-center"><Loader2 className="h-4 w-4 animate-spin inline" /></div>
                    ) : (
                      <pre className="flex-1 overflow-auto p-2 text-[10px] font-mono leading-snug">
                        {fileContent.split("\n").map((line, i) => (
                          <div key={i} className="flex">
                            <span className="text-muted-foreground/40 select-none w-7 flex-shrink-0 text-right pr-2">{i + 1}</span>
                            <span className="whitespace-pre">{line}</span>
                          </div>
                        ))}
                      </pre>
                    )}
                  </div>
                )}
              </>
            )}
          </Card>

          {/* CENTER: live preview */}
          <Card className={`${previewExpanded ? "col-span-9" : "col-span-5"} bg-gradient-card border-border/60 flex flex-col overflow-hidden transition-all`}>
            <div className="px-3 py-2 border-b border-border/60 flex items-center justify-between bg-background/40">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold">Live Preview</span>
                <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[280px]">
                  {cfg.sourceType === "url" ? cfg.url : "custom HTML"}
                </span>
              </div>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setPreviewExpanded(v => !v)}>
                {previewExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </Button>
            </div>

            <div className="flex-1 flex items-center justify-center bg-background/20 p-4 overflow-auto">
              {/* Phone frame */}
              <div
                className="rounded-[2rem] border-4 border-secondary shadow-card overflow-hidden flex flex-col"
                style={{ background: cfg.bgColor, width: 320, height: 620, maxHeight: "100%" }}
              >
                <div className="h-6 flex items-center justify-center flex-shrink-0">
                  <div className="h-1 w-16 rounded-full bg-foreground/20" />
                </div>
                <div className="h-9 px-3 flex items-center gap-2 text-xs text-white flex-shrink-0" style={{ background: cfg.themeColor }}>
                  {cfg.iconDataUrl && <img src={cfg.iconDataUrl} className="h-5 w-5 rounded" alt="" />}
                  <span className="truncate font-semibold">{cfg.appName}</span>
                </div>
                <iframe
                  src={previewSrc}
                  title="preview"
                  className="flex-1 w-full bg-background"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            </div>

            {/* Build bar at bottom */}
            <div className="border-t border-border/60 p-3 bg-background/40 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] text-muted-foreground font-mono truncate">
                  📦 {cfg.packageName} · v{cfg.versionName} · {cfg.buildType}
                </div>
                <Button onClick={startBuild} variant="hero" size="sm" disabled={isBuilding || serverOnline === false}>
                  {isBuilding ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Building…</> : <><Hammer className="h-3.5 w-3.5" /> Build APK</>}
                </Button>
              </div>
              <BuildPanel build={build} />
            </div>
          </Card>

          {/* RIGHT: tabs (Config / Keys / AI) */}
          {!previewExpanded && (
            <Card className="col-span-4 bg-gradient-card border-border/60 flex flex-col overflow-hidden">
              <Tabs defaultValue="config" className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="grid grid-cols-3 m-2 mb-0">
                  <TabsTrigger value="config" className="text-xs"><Settings2 className="h-3.5 w-3.5 mr-1" />Config</TabsTrigger>
                  <TabsTrigger value="keys" className="text-xs"><KeyRound className="h-3.5 w-3.5 mr-1" />Keys</TabsTrigger>
                  <TabsTrigger value="ai" className="text-xs"><Sparkles className="h-3.5 w-3.5 mr-1" />AI</TabsTrigger>
                </TabsList>

                <TabsContent value="config" className="flex-1 overflow-auto p-3 mt-0 space-y-4">
                  <ConfigForm cfg={cfg} update={update} onIcon={onIcon} />
                </TabsContent>

                <TabsContent value="keys" className="flex-1 overflow-auto p-3 mt-0">
                  <KeysPanel projectId={cfg.activeProjectId} />
                </TabsContent>

                <TabsContent value="ai" className="flex-1 overflow-auto p-3 mt-0">
                  <AICommandPanel
                    projectName={activeProject?.name || cfg.appName}
                    packageName={cfg.packageName}
                    sourceLocation={cfg.sourceRoot || activeProject?.sourceLocation}
                    liveUrl={cfg.sourceType === "url" ? cfg.url : undefined}
                    selectedFile={activeFile}
                  />
                </TabsContent>
              </Tabs>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

const ConfigForm = ({
  cfg, update, onIcon,
}: {
  cfg: AppConfig;
  update: <K extends keyof AppConfig>(k: K, v: AppConfig[K]) => void;
  onIcon: (f: File) => void;
}) => (
  <Tabs defaultValue="general">
    <TabsList className="grid grid-cols-4 mb-3">
      <TabsTrigger value="general" className="text-[10px] px-1"><Smartphone className="h-3 w-3" /></TabsTrigger>
      <TabsTrigger value="content" className="text-[10px] px-1"><Globe className="h-3 w-3" /></TabsTrigger>
      <TabsTrigger value="design" className="text-[10px] px-1"><Palette className="h-3 w-3" /></TabsTrigger>
      <TabsTrigger value="perms" className="text-[10px] px-1"><Shield className="h-3 w-3" /></TabsTrigger>
    </TabsList>

    <TabsContent value="general" className="space-y-3">
      <Field label="App Name"><Input value={cfg.appName} onChange={e => update("appName", e.target.value)} className="h-8 text-xs" /></Field>
      <Field label="Package Name"><Input className="font-mono h-8 text-xs" value={cfg.packageName} onChange={e => update("packageName", e.target.value.toLowerCase())} /></Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Version"><Input value={cfg.versionName} onChange={e => update("versionName", e.target.value)} className="h-8 text-xs" /></Field>
        <Field label="Code"><Input type="number" min={1} value={cfg.versionCode} onChange={e => update("versionCode", parseInt(e.target.value) || 1)} className="h-8 text-xs" /></Field>
      </div>
      <Field label="Build Type">
        <div className="flex gap-2">
          {(["debug", "release"] as const).map(t => (
            <button key={t} onClick={() => update("buildType", t)}
              className={`flex-1 px-2 py-1.5 rounded-md border text-[11px] font-medium transition-smooth ${cfg.buildType === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/50 text-muted-foreground"}`}>
              {t}
            </button>
          ))}
        </div>
      </Field>
    </TabsContent>

    <TabsContent value="content" className="space-y-3">
      <Field label="Source Type">
        <div className="flex gap-2">
          {(["url", "html"] as const).map(t => (
            <button key={t} onClick={() => update("sourceType", t)}
              className={`flex-1 px-2 py-1.5 rounded-md border text-[11px] font-medium transition-smooth ${cfg.sourceType === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/50 text-muted-foreground"}`}>
              {t === "url" ? "Website URL" : "Custom HTML"}
            </button>
          ))}
        </div>
      </Field>
      {cfg.sourceType === "url" ? (
        <Field label="Website URL"><Input type="url" value={cfg.url} onChange={e => update("url", e.target.value)} className="h-8 text-xs" placeholder="https://..." /></Field>
      ) : (
        <Field label="HTML"><Textarea rows={8} className="font-mono text-[10px]" value={cfg.html} onChange={e => update("html", e.target.value)} /></Field>
      )}
    </TabsContent>

    <TabsContent value="design" className="space-y-3">
      <Field label="App Icon">
        <div className="flex items-center gap-2">
          <div className="h-12 w-12 rounded-xl border-2 border-dashed border-border bg-secondary/50 flex items-center justify-center overflow-hidden flex-shrink-0">
            {cfg.iconDataUrl
              ? <img src={cfg.iconDataUrl} alt="icon" className="h-full w-full object-cover" />
              : <ImageIcon className="h-5 w-5 text-muted-foreground" />}
          </div>
          <Input type="file" accept="image/*" onChange={e => e.target.files?.[0] && onIcon(e.target.files[0])} className="h-8 text-xs" />
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Theme">
          <div className="flex items-center gap-1">
            <input type="color" value={cfg.themeColor} onChange={e => update("themeColor", e.target.value)} className="h-8 w-8 rounded bg-transparent border border-border cursor-pointer" />
            <Input className="font-mono h-8 text-[10px]" value={cfg.themeColor} onChange={e => update("themeColor", e.target.value)} />
          </div>
        </Field>
        <Field label="Splash">
          <div className="flex items-center gap-1">
            <input type="color" value={cfg.bgColor} onChange={e => update("bgColor", e.target.value)} className="h-8 w-8 rounded bg-transparent border border-border cursor-pointer" />
            <Input className="font-mono h-8 text-[10px]" value={cfg.bgColor} onChange={e => update("bgColor", e.target.value)} />
          </div>
        </Field>
      </div>
    </TabsContent>

    <TabsContent value="perms" className="space-y-2">
      {Object.entries(cfg.permissions).map(([k, v]) => (
        <div key={k} className="flex items-center justify-between p-2 rounded-md border border-border bg-secondary/40">
          <div className="text-xs font-medium capitalize">{k}</div>
          <Switch checked={v} onCheckedChange={(val) => update("permissions", { ...cfg.permissions, [k]: val })} />
        </div>
      ))}
    </TabsContent>
  </Tabs>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <Label className="text-[11px] font-medium text-muted-foreground">{label}</Label>
    {children}
  </div>
);

const ServerStatus = ({ online }: { online: boolean | null }) => {
  const c = online === null
    ? { cls: "border-muted-foreground/30 bg-muted/30 text-muted-foreground", t: "Checking…" }
    : online
      ? { cls: "border-primary/40 bg-primary/10 text-primary", t: "Mac server online" }
      : { cls: "border-destructive/40 bg-destructive/10 text-destructive", t: "Mac server offline" };
  return (
    <Badge variant="outline" className={`${c.cls} px-2 py-1 font-mono text-[10px]`}>
      <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${online ? "bg-primary animate-pulse-glow" : online === false ? "bg-destructive" : "bg-muted-foreground"}`} />
      {c.t}
    </Badge>
  );
};

const BuildPanel = ({ build }: { build: BuildState }) => {
  if (build.status === "idle") return null;
  if (build.status === "done") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary text-xs"><CheckCircle2 className="h-4 w-4" /><span className="font-medium">Build successful</span></div>
        <Button asChild variant="glow" size="sm" className="w-full">
          <a href={build.apkUrl} download><Download className="h-3.5 w-3.5" /> Download APK</a>
        </Button>
      </div>
    );
  }
  if (build.status === "error") {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-destructive text-xs"><XCircle className="h-4 w-4" /><span className="font-medium">Build failed</span></div>
        <p className="text-[10px] text-destructive font-mono break-all">{build.message}</p>
      </div>
    );
  }
  const progress = build.status === "building" ? build.progress : 5;
  return (
    <div className="space-y-1">
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className="h-full bg-gradient-primary transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-[10px] text-muted-foreground font-mono">⏳ Building on Mac…</p>
    </div>
  );
};

export default Builder;
