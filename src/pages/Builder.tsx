import { useEffect, useMemo, useState } from "react";
import { Hammer, Smartphone, Globe, Palette, Shield, Package, Loader2, CheckCircle2, XCircle, Download, Image as ImageIcon } from "lucide-react";
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
};

const DEFAULT_CONFIG: AppConfig = {
  appName: "My First App",
  packageName: "com.myforge.firstapp",
  versionName: "1.0.0",
  versionCode: 1,
  sourceType: "url",
  url: "https://example.com",
  html: "<!doctype html><html><body style='font-family:sans-serif;display:grid;place-items:center;height:100vh;margin:0;background:#0f172a;color:#fff'><div><h1>Hello from APKForge 👋</h1><p>Edit this HTML in the builder.</p></div></body></html>",
  themeColor: "#22c55e",
  bgColor: "#0f172a",
  iconDataUrl: null,
  permissions: { internet: true, camera: false, location: false, notifications: false, storage: false },
  buildType: "debug",
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
    } catch {
      return DEFAULT_CONFIG;
    }
  });
  const [build, setBuild] = useState<BuildState>({ status: "idle" });
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  useEffect(() => {
    localStorage.setItem("apkforge:config", JSON.stringify(cfg));
  }, [cfg]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${SERVER_URL}/health`).then(r => r.ok ? r.json() : null).then(() => !cancelled && setServerOnline(true)).catch(() => !cancelled && setServerOnline(false));
    return () => { cancelled = true; };
  }, []);

  const update = <K extends keyof AppConfig>(k: K, v: AppConfig[K]) => setCfg(p => ({ ...p, [k]: v }));

  const onIcon = (file: File) => {
    if (file.size > 2 * 1024 * 1024) return toast.error("Icon should be under 2MB");
    const r = new FileReader();
    r.onload = () => update("iconDataUrl", r.result as string);
    r.readAsDataURL(file);
  };

  const validate = (): string | null => {
    if (!/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(cfg.packageName))
      return "Package name format galat hai (eg: com.example.app)";
    if (!cfg.appName.trim()) return "App name zaroori hai";
    if (cfg.sourceType === "url" && !/^https?:\/\//.test(cfg.url)) return "URL http(s):// se shuru hona chahiye";
    return null;
  };

  const startBuild = async () => {
    const err = validate();
    if (err) return toast.error(err);
    if (!serverOnline) return toast.error("Local build server offline hai. /server page dekho.");

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

  return (
    <Layout>
      <section className="container py-12">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">App <span className="text-gradient">Builder</span></h1>
            <p className="text-muted-foreground mt-1">Configure your Android app — fields auto-save in browser.</p>
          </div>
          <ServerStatus online={serverOnline} />
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          {/* LEFT: form */}
          <Card className="p-6 bg-gradient-card border-border/60">
            <Tabs defaultValue="general">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="general"><Smartphone className="h-4 w-4 mr-2" />General</TabsTrigger>
                <TabsTrigger value="content"><Globe className="h-4 w-4 mr-2" />Content</TabsTrigger>
                <TabsTrigger value="design"><Palette className="h-4 w-4 mr-2" />Design</TabsTrigger>
                <TabsTrigger value="perms"><Shield className="h-4 w-4 mr-2" />Permissions</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-5">
                <Field label="App Name" hint="Phone pe yahi naam dikhega">
                  <Input value={cfg.appName} onChange={e => update("appName", e.target.value)} placeholder="My Awesome App" />
                </Field>
                <Field label="Package Name" hint="Unique ID (eg: com.yourname.appname)">
                  <Input className="font-mono" value={cfg.packageName} onChange={e => update("packageName", e.target.value.toLowerCase())} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Version Name"><Input value={cfg.versionName} onChange={e => update("versionName", e.target.value)} /></Field>
                  <Field label="Version Code"><Input type="number" min={1} value={cfg.versionCode} onChange={e => update("versionCode", parseInt(e.target.value) || 1)} /></Field>
                </div>
                <Field label="Build Type">
                  <div className="flex gap-3">
                    {(["debug", "release"] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => update("buildType", t)}
                        className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-smooth ${cfg.buildType === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"}`}
                      >
                        {t === "debug" ? "Debug (fast, signed-debug)" : "Release (unsigned)"}
                      </button>
                    ))}
                  </div>
                </Field>
              </TabsContent>

              <TabsContent value="content" className="space-y-5">
                <Field label="Source Type">
                  <div className="flex gap-3">
                    {(["url", "html"] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => update("sourceType", t)}
                        className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-smooth ${cfg.sourceType === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"}`}
                      >
                        {t === "url" ? "Wrap a Website URL" : "Custom HTML"}
                      </button>
                    ))}
                  </div>
                </Field>
                {cfg.sourceType === "url" ? (
                  <Field label="Website URL" hint="App khulte hi ye URL load hoga">
                    <Input type="url" value={cfg.url} onChange={e => update("url", e.target.value)} placeholder="https://yourwebsite.com" />
                  </Field>
                ) : (
                  <Field label="HTML Content" hint="Pura HTML page yahan paste karo">
                    <Textarea rows={10} className="font-mono text-xs" value={cfg.html} onChange={e => update("html", e.target.value)} />
                  </Field>
                )}
              </TabsContent>

              <TabsContent value="design" className="space-y-5">
                <Field label="App Icon" hint="PNG/JPG, square recommended (1024x1024)">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-2xl border-2 border-dashed border-border bg-secondary/50 flex items-center justify-center overflow-hidden">
                      {cfg.iconDataUrl
                        ? <img src={cfg.iconDataUrl} alt="App icon" className="h-full w-full object-cover" />
                        : <ImageIcon className="h-8 w-8 text-muted-foreground" />}
                    </div>
                    <Input type="file" accept="image/*" onChange={e => e.target.files?.[0] && onIcon(e.target.files[0])} />
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Theme Color">
                    <div className="flex items-center gap-2">
                      <input type="color" value={cfg.themeColor} onChange={e => update("themeColor", e.target.value)} className="h-10 w-14 rounded-lg bg-transparent border border-border cursor-pointer" />
                      <Input className="font-mono" value={cfg.themeColor} onChange={e => update("themeColor", e.target.value)} />
                    </div>
                  </Field>
                  <Field label="Splash Background">
                    <div className="flex items-center gap-2">
                      <input type="color" value={cfg.bgColor} onChange={e => update("bgColor", e.target.value)} className="h-10 w-14 rounded-lg bg-transparent border border-border cursor-pointer" />
                      <Input className="font-mono" value={cfg.bgColor} onChange={e => update("bgColor", e.target.value)} />
                    </div>
                  </Field>
                </div>
              </TabsContent>

              <TabsContent value="perms" className="space-y-3">
                <p className="text-sm text-muted-foreground mb-2">Sirf wahi permissions enable karo jo aapki app ko chahiye.</p>
                {Object.entries(cfg.permissions).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between p-4 rounded-xl border border-border bg-secondary/40">
                    <div>
                      <div className="font-medium capitalize">{k}</div>
                      <div className="text-xs text-muted-foreground">{PERM_HINT[k as keyof typeof PERM_HINT]}</div>
                    </div>
                    <Switch checked={v} onCheckedChange={(val) => update("permissions", { ...cfg.permissions, [k]: val })} />
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </Card>

          {/* RIGHT: preview + build */}
          <div className="space-y-6">
            <PhonePreview cfg={cfg} />
            <Card className="p-6 bg-gradient-card border-border/60 space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Build APK</h3>
              </div>
              <div className="text-xs text-muted-foreground font-mono space-y-1">
                <div>📦 {cfg.packageName}</div>
                <div>🏷  {cfg.appName} · v{cfg.versionName} ({cfg.versionCode})</div>
                <div>🎯 {cfg.buildType.toUpperCase()}</div>
              </div>
              <Button onClick={startBuild} variant="hero" size="lg" className="w-full" disabled={isBuilding || serverOnline === false}>
                {isBuilding ? <><Loader2 className="h-5 w-5 animate-spin" /> Building…</> : <><Hammer className="h-5 w-5" /> Build APK</>}
              </Button>
              <BuildPanel build={build} />
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

const PERM_HINT = {
  internet: "Network access (lagbhag har app ko chahiye)",
  camera: "Camera use karne ke liye",
  location: "GPS / location access",
  notifications: "Push notifications dikhane ke liye",
  storage: "Files read/write karne ke liye",
};

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium">{label}</Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const ServerStatus = ({ online }: { online: boolean | null }) => {
  const cfg = online === null
    ? { c: "border-muted-foreground/30 bg-muted/30 text-muted-foreground", t: "Checking server…" }
    : online
      ? { c: "border-primary/40 bg-primary/10 text-primary", t: "Build server online" }
      : { c: "border-destructive/40 bg-destructive/10 text-destructive", t: "Build server offline" };
  return (
    <Badge variant="outline" className={`${cfg.c} px-3 py-1.5 font-mono text-xs`}>
      <span className={`h-2 w-2 rounded-full mr-2 ${online ? "bg-primary animate-pulse-glow" : online === false ? "bg-destructive" : "bg-muted-foreground"}`} />
      {cfg.t}
    </Badge>
  );
};

const PhonePreview = ({ cfg }: { cfg: AppConfig }) => {
  const src = useMemo(() => {
    if (cfg.sourceType === "url") return cfg.url;
    return `data:text/html;charset=utf-8,${encodeURIComponent(cfg.html)}`;
  }, [cfg.sourceType, cfg.url, cfg.html]);
  return (
    <Card className="p-4 bg-gradient-card border-border/60">
      <div className="text-xs text-muted-foreground mb-2 font-mono">Live Preview</div>
      <div className="mx-auto w-[260px] h-[480px] rounded-[2rem] border-4 border-secondary p-2 shadow-card relative" style={{ background: cfg.bgColor }}>
        <div className="h-6 flex items-center justify-center">
          <div className="h-1 w-16 rounded-full bg-foreground/20" />
        </div>
        <div className="h-8 px-3 flex items-center gap-2 text-xs text-white" style={{ background: cfg.themeColor }}>
          {cfg.iconDataUrl && <img src={cfg.iconDataUrl} className="h-5 w-5 rounded" alt="" />}
          <span className="truncate font-semibold">{cfg.appName}</span>
        </div>
        <iframe src={src} title="preview" className="w-full h-[400px] bg-background rounded-b-md" sandbox="allow-scripts allow-same-origin" />
      </div>
    </Card>
  );
};

const BuildPanel = ({ build }: { build: BuildState }) => {
  if (build.status === "idle") return null;
  if (build.status === "done") {
    return (
      <div className="space-y-3 pt-2 border-t border-border">
        <div className="flex items-center gap-2 text-primary"><CheckCircle2 className="h-5 w-5" /><span className="font-medium">Build successful</span></div>
        <Button asChild variant="glow" className="w-full">
          <a href={build.apkUrl} download><Download className="h-4 w-4" /> Download APK</a>
        </Button>
        <LogBox logs={build.logs} />
      </div>
    );
  }
  if (build.status === "error") {
    return (
      <div className="space-y-3 pt-2 border-t border-border">
        <div className="flex items-center gap-2 text-destructive"><XCircle className="h-5 w-5" /><span className="font-medium">Build failed</span></div>
        <p className="text-xs text-destructive font-mono">{build.message}</p>
        {build.logs && <LogBox logs={build.logs} />}
      </div>
    );
  }
  const progress = build.status === "building" ? build.progress : 5;
  const logs = build.status === "building" ? build.logs : [];
  return (
    <div className="space-y-3 pt-2 border-t border-border">
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className="h-full bg-gradient-primary transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-xs text-muted-foreground font-mono">⏳ Building… ye 1-3 minute le sakta hai (pehli baar Gradle ko 5+ min lag sakte hain).</p>
      <LogBox logs={logs} />
    </div>
  );
};

const LogBox = ({ logs }: { logs: string[] }) => (
  <div className="rounded-lg bg-background border border-border p-3 max-h-48 overflow-auto font-mono text-[10px] text-muted-foreground space-y-0.5">
    {logs.length === 0 ? <div>Waiting for output…</div> : logs.slice(-50).map((l, i) => <div key={i}>{l}</div>)}
  </div>
);

export default Builder;
