import { useEffect, useMemo, useState } from "react";
import {
  Hammer, Smartphone, Globe, Loader2, CheckCircle2, XCircle,
  Download, FolderOpen, Github, Upload, Settings2, Sparkles, AlertCircle, FileCode, Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import Layout from "@/components/site/Layout";
import { KeysPanel } from "@/components/builder/KeysPanel";
import {
  useProjects, useActiveProject, useActiveProjectId,
  setActiveProjectId, patchActiveProject,
} from "@/lib/useProjectStore";
import type { TrackedProject } from "@/lib/projectStore";

const SERVER_URL = (import.meta.env.VITE_BUILD_SERVER_URL as string) || "http://localhost:5174";

type BuildState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "building"; jobId: string; logs: string[]; progress: number }
  | { status: "done"; jobId: string; apkUrl: string; logs: string[] }
  | { status: "error"; message: string; logs?: string[] };

const ANDROID_PERMS = [
  { id: "android.permission.INTERNET", label: "Internet", default: true },
  { id: "android.permission.CAMERA", label: "Camera", default: false },
  { id: "android.permission.ACCESS_FINE_LOCATION", label: "Location (fine)", default: false },
  { id: "android.permission.POST_NOTIFICATIONS", label: "Notifications", default: false },
  { id: "android.permission.READ_EXTERNAL_STORAGE", label: "Storage read", default: false },
];

const Builder = () => {
  const projects = useProjects();
  const activeId = useActiveProjectId();
  const project = useActiveProject();

  const [build, setBuild] = useState<BuildState>({ status: "idle" });
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [importing, setImporting] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");

  useEffect(() => {
    if (!activeId && projects.length > 0) setActiveProjectId(projects[0].id);
  }, [activeId, projects]);

  useEffect(() => {
    let cancelled = false;
    fetch(`${SERVER_URL}/health`)
      .then(r => r.json())
      .then(j => !cancelled && setServerOnline(j?.mode === "native-kotlin"))
      .catch(() => !cancelled && setServerOnline(false));
    return () => { cancelled = true; };
  }, []);

  const set = <K extends keyof TrackedProject>(k: K, v: TrackedProject[K]) => {
    if (!project) return;
    patchActiveProject({ [k]: v } as Partial<TrackedProject>);
  };

  const togglePerm = (id: string, on: boolean) => {
    if (!project) return;
    const cur = new Set(project.androidPermissions ?? ANDROID_PERMS.filter(p => p.default).map(p => p.id));
    if (on) cur.add(id); else cur.delete(id);
    set("androidPermissions", Array.from(cur));
  };

  const importGithub = async () => {
    if (!serverOnline) return toast.error("Mac server offline. /server check karo.");
    if (!/^https?:\/\/(github|gitlab)\.com\//i.test(githubUrl)) return toast.error("Valid GitHub URL daalo");
    setImporting(true);
    try {
      const r = await fetch(`${SERVER_URL}/import/github`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: githubUrl }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Import failed");
      patchActiveProject({
        sourceImportId: j.id,
        sourceImportPath: j.dir,
        sourceFramework: j.framework,
        liveUrl: githubUrl,
      });
      toast.success(`Imported! Framework: ${j.framework}`);
    } catch (e: any) { toast.error(e.message); }
    finally { setImporting(false); }
  };

  const importZip = async (file: File) => {
    if (!serverOnline) return toast.error("Mac server offline");
    if (file.size > 100 * 1024 * 1024) return toast.error("ZIP under 100MB rakho");
    setImporting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch(`${SERVER_URL}/import/zip`, { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Upload failed");
      patchActiveProject({
        sourceImportId: j.id,
        sourceImportPath: j.dir,
        sourceFramework: j.framework,
      });
      toast.success(`Uploaded! Framework: ${j.framework}`);
    } catch (e: any) { toast.error(e.message); }
    finally { setImporting(false); }
  };

  const startBuild = async () => {
    if (!project) return toast.error("Project select karo");
    if (!project.name?.trim()) return toast.error("App name daalo");
    if (!/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(project.packageName)) return toast.error("Package name galat (e.g. com.you.app)");
    if (!serverOnline) return toast.error("Mac server offline");
    if (!project.kotlinFiles?.length) {
      const ok = confirm("Abhi tak Kotlin code generate nahi hua. Default 'Hello World' Compose app build karein?");
      if (!ok) return;
    }

    setBuild({ status: "submitting" });
    try {
      const payload = {
        appName: project.name,
        packageName: project.packageName,
        versionName: project.versionName ?? "1.0.0",
        versionCode: project.versionCode ?? 1,
        themeColor: project.themeColor ?? "#22c55e",
        minSdk: 24,
        targetSdk: 34,
        permissions: project.androidPermissions ?? ANDROID_PERMS.filter(p => p.default).map(p => p.id),
        iconDataUrl: project.iconDataUrl ?? null,
        files: project.kotlinFiles ?? [],
        gradleDeps: project.kotlinGradleDeps ?? [],
      };
      const res = await fetch(`${SERVER_URL}/build`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
          if (project) patchActiveProject({ status: "ready", lastBuildAt: Date.now() });
          toast.success("Native APK ready! 🎉");
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
  const enabledPerms = useMemo(
    () => new Set(project?.androidPermissions ?? ANDROID_PERMS.filter(p => p.default).map(p => p.id)),
    [project?.androidPermissions]
  );

  return (
    <Layout>
      <div className="container max-w-[1400px] py-6">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Hammer className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Native <span className="text-gradient">Builder</span></h1>
              <p className="text-xs text-muted-foreground">Real Kotlin + Jetpack Compose. No WebView. No Capacitor.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={activeId ?? ""}
              onChange={(e) => setActiveProjectId(e.target.value || null)}
              className="bg-secondary border border-border rounded-md px-3 py-1.5 text-xs font-mono"
            >
              <option value="">— Select project —</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <ServerStatus online={serverOnline} />
          </div>
        </div>

        {!project && (
          <Card className="p-12 text-center bg-gradient-card border-border/60">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="font-semibold mb-1">Koi project select nahi</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Pehle <Link to="/projects" className="text-primary underline">/projects</Link> par jaake ek project banao.
            </p>
            <Button asChild variant="hero"><Link to="/projects">Go to Projects</Link></Button>
          </Card>
        )}

        {project && (
          <div className="grid grid-cols-12 gap-4">
            {/* LEFT: source import */}
            <Card className="col-span-12 lg:col-span-4 bg-gradient-card border-border/60 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">1. Website Source Import</h3>
              </div>

              {project.sourceImportId ? (
                <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 text-xs space-y-1">
                  <div className="flex items-center gap-2 text-green-400 font-semibold">
                    <CheckCircle2 className="h-4 w-4" /> Imported
                  </div>
                  <div className="font-mono text-muted-foreground truncate">{project.sourceImportPath}</div>
                  {project.sourceFramework && <Badge variant="secondary" className="text-[10px]">framework: {project.sourceFramework}</Badge>}
                  <button
                    onClick={() => patchActiveProject({ sourceImportId: undefined, sourceImportPath: undefined, sourceFramework: undefined })}
                    className="text-destructive hover:underline text-[11px] mt-1"
                  >clear & re-import</button>
                </div>
              ) : (
                <Tabs defaultValue="github">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="github" className="text-xs"><Github className="h-3 w-3 mr-1" />GitHub</TabsTrigger>
                    <TabsTrigger value="zip" className="text-xs"><Upload className="h-3 w-3 mr-1" />ZIP</TabsTrigger>
                  </TabsList>
                  <TabsContent value="github" className="space-y-2 pt-3">
                    <Input
                      placeholder="https://github.com/you/your-website"
                      value={githubUrl}
                      onChange={e => setGithubUrl(e.target.value)}
                      className="text-xs h-9 font-mono"
                    />
                    <Button onClick={importGithub} disabled={importing || !serverOnline} variant="hero" className="w-full" size="sm">
                      {importing ? <><Loader2 className="h-3 w-3 animate-spin" /> Cloning…</> : "Clone repo"}
                    </Button>
                  </TabsContent>
                  <TabsContent value="zip" className="space-y-2 pt-3">
                    <label className="block">
                      <input
                        type="file"
                        accept=".zip"
                        className="hidden"
                        disabled={importing || !serverOnline}
                        onChange={e => e.target.files?.[0] && importZip(e.target.files[0])}
                      />
                      <div className="rounded-lg border-2 border-dashed border-border/60 p-6 text-center cursor-pointer hover:bg-secondary/40 transition-smooth">
                        <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                        <div className="text-xs">Click to upload ZIP</div>
                        <div className="text-[10px] text-muted-foreground mt-1">Max 100MB</div>
                      </div>
                    </label>
                    {importing && <div className="text-center text-xs"><Loader2 className="h-3 w-3 animate-spin inline" /> Uploading…</div>}
                  </TabsContent>
                </Tabs>
              )}

              <div className="border-t border-border/60 pt-3 text-[11px] text-muted-foreground space-y-1.5">
                <div className="flex items-center gap-1.5"><Sparkles className="h-3 w-3 text-primary" /> Source imported = AI iska code padh sakta hai</div>
                <div>Mujhe chat me bolo: <em className="text-foreground">"Iss source ko padho aur Kotlin Compose me convert karo"</em></div>
              </div>
            </Card>

            {/* MIDDLE: app config */}
            <Card className="col-span-12 lg:col-span-4 bg-gradient-card border-border/60 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">2. App Config</h3>
              </div>
              <div className="space-y-3">
                <Field label="App name">
                  <Input value={project.name} onChange={e => set("name", e.target.value)} className="h-8 text-xs" />
                </Field>
                <Field label="Package name">
                  <Input value={project.packageName} onChange={e => set("packageName", e.target.value)} placeholder="com.you.app" className="h-8 text-xs font-mono" />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Version">
                    <Input value={project.versionName ?? "1.0.0"} onChange={e => set("versionName", e.target.value)} className="h-8 text-xs font-mono" />
                  </Field>
                  <Field label="Version code">
                    <Input type="number" value={project.versionCode ?? 1} onChange={e => set("versionCode", parseInt(e.target.value) || 1)} className="h-8 text-xs font-mono" />
                  </Field>
                </div>
                <Field label="Theme color">
                  <div className="flex gap-2">
                    <input type="color" value={project.themeColor ?? "#22c55e"} onChange={e => set("themeColor", e.target.value)} className="h-8 w-12 rounded border border-border bg-transparent" />
                    <Input value={project.themeColor ?? "#22c55e"} onChange={e => set("themeColor", e.target.value)} className="h-8 text-xs font-mono" />
                  </div>
                </Field>
                <Field label="App icon (PNG)">
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (f.size > 2 * 1024 * 1024) return toast.error("Icon under 2MB");
                      const r = new FileReader();
                      r.onload = () => set("iconDataUrl", r.result as string);
                      r.readAsDataURL(f);
                    }}
                    className="text-xs"
                  />
                  {project.iconDataUrl && <img src={project.iconDataUrl} alt="icon" className="h-12 w-12 rounded-lg mt-2 border border-border" />}
                </Field>

                <div>
                  <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">Android permissions</Label>
                  <div className="space-y-1.5 mt-2">
                    {ANDROID_PERMS.map(p => (
                      <div key={p.id} className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[11px] truncate">{p.label}</span>
                        <Switch checked={enabledPerms.has(p.id)} onCheckedChange={(v) => togglePerm(p.id, v)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* RIGHT: kotlin code + build */}
            <Card className="col-span-12 lg:col-span-4 bg-gradient-card border-border/60 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">3. Generated Kotlin</h3>
              </div>

              <div className="rounded-lg border border-border/60 bg-background/40 p-3 text-xs">
                {project.kotlinFiles?.length ? (
                  <div className="space-y-1 max-h-48 overflow-auto">
                    {project.kotlinFiles.map(f => (
                      <div key={f.path} className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
                        <FileCode className="h-3 w-3 text-primary flex-shrink-0" />
                        <span className="truncate">{f.path}</span>
                        <span className="ml-auto">{f.content.length}b</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 text-muted-foreground">
                    <Sparkles className="h-5 w-5 mx-auto mb-1 opacity-50" />
                    Abhi tak Kotlin generate nahi hua
                  </div>
                )}
              </div>

              <div className="text-[11px] text-muted-foreground p-3 rounded-lg bg-primary/5 border border-primary/20">
                💡 Mujhe (chat me) bolo: <em className="text-foreground">"Imported source ke saare screens dekho aur Kotlin Compose Activities banao"</em> — main yahan files daal dunga.
              </div>

              <Button onClick={startBuild} variant="hero" className="w-full" disabled={isBuilding || serverOnline === false}>
                {isBuilding ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Building native APK…</>
                ) : (
                  <><Hammer className="h-4 w-4" /> Build Native APK</>
                )}
              </Button>

              <BuildPanel build={build} />
            </Card>

            {/* FULL WIDTH: keys */}
            <Card className="col-span-12 bg-gradient-card border-border/60 p-4">
              <KeysPanel />
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</Label>
    <div className="mt-1">{children}</div>
  </div>
);

const ServerStatus = ({ online }: { online: boolean | null }) => {
  if (online === null) return <Badge variant="secondary" className="text-[10px]"><Loader2 className="h-2.5 w-2.5 animate-spin mr-1" />checking</Badge>;
  if (online) return <Badge className="text-[10px] bg-green-500/15 text-green-400 border-green-500/30"><span className="h-1.5 w-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse" />Mac server online</Badge>;
  return <Badge variant="destructive" className="text-[10px]"><XCircle className="h-3 w-3 mr-1" />server offline</Badge>;
};

const BuildPanel = ({ build }: { build: BuildState }) => {
  if (build.status === "idle") return null;
  if (build.status === "submitting") return <div className="text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin inline mr-1" />Submitting…</div>;
  if (build.status === "error") {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-destructive mb-1.5"><XCircle className="h-3.5 w-3.5" />Build failed</div>
        <div className="text-muted-foreground">{build.message}</div>
        {build.logs && <pre className="mt-2 max-h-32 overflow-auto text-[10px] font-mono text-muted-foreground">{build.logs.slice(-15).join("\n")}</pre>}
      </div>
    );
  }
  if (build.status === "done") {
    return (
      <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-green-400"><CheckCircle2 className="h-3.5 w-3.5" />APK built!</div>
        <Button asChild variant="hero" size="sm" className="w-full"><a href={build.apkUrl} download><Download className="h-3.5 w-3.5" />Download APK</a></Button>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin inline mr-1" />Building… {build.progress}%</span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-gradient-primary transition-all" style={{ width: `${build.progress}%` }} />
      </div>
      {build.logs.length > 0 && (
        <pre className="max-h-40 overflow-auto rounded-md border border-border/60 bg-background/60 p-2 text-[10px] font-mono text-muted-foreground">
          {build.logs.slice(-20).join("\n")}
        </pre>
      )}
    </div>
  );
};

export default Builder;
