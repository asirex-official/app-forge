import { useEffect, useMemo, useState } from "react";
import {
  FolderKanban, Plus, Trash2, CheckCircle2, Circle, Loader2, Ban,
  AlertCircle, MessageSquare, Bot, User as UserIcon, Package, ExternalLink,
  Github, Folder, Globe, Sparkles, Server as ServerIcon, Save,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Layout from "@/components/site/Layout";
import {
  TrackedProject, TaskStatus, SourceType, loadProjects, saveProjects,
  createProject, newId,
} from "@/lib/projectStore";

const statusColor: Record<TrackedProject["status"], string> = {
  planning: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  building: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  ready:    "bg-green-500/15 text-green-400 border-green-500/30",
  shipped:  "bg-purple-500/15 text-purple-400 border-purple-500/30",
};

const taskIcon: Record<TaskStatus, React.ReactNode> = {
  todo:    <Circle className="h-4 w-4 text-muted-foreground" />,
  doing:   <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />,
  done:    <CheckCircle2 className="h-4 w-4 text-green-500" />,
  blocked: <Ban className="h-4 w-4 text-red-500" />,
};

const Projects = () => {
  const [projects, setProjects] = useState<TrackedProject[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const p = loadProjects();
    setProjects(p);
    if (p.length && !activeId) setActiveId(p[0].id);
  }, []);

  const persist = (next: TrackedProject[]) => {
    setProjects(next);
    saveProjects(next);
  };

  const updateProject = (id: string, patch: Partial<TrackedProject>) => {
    persist(projects.map((p) => p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p));
  };

  const removeProject = (id: string) => {
    if (!confirm("Ye project delete kar dein?")) return;
    const next = projects.filter((p) => p.id !== id);
    persist(next);
    if (activeId === id) setActiveId(next[0]?.id ?? null);
    toast.success("Project deleted");
  };

  const active = useMemo(() => projects.find((p) => p.id === activeId) ?? null, [projects, activeId]);

  return (
    <Layout>
      <section className="container py-12 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <FolderKanban className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Project <span className="text-gradient">Tracker</span>
              </h1>
              <p className="text-sm text-muted-foreground">
                Har app ka record — kya banaya, kya errors, kya pending hai.
              </p>
            </div>
          </div>
          <NewProjectDialog
            onCreate={(p) => {
              const next = [createProject(p), ...projects];
              persist(next);
              setActiveId(next[0].id);
              toast.success("Project added");
            }}
          />
        </div>

        {projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar — project list */}
            <div className="space-y-2">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActiveId(p.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-smooth ${
                    activeId === p.id
                      ? "bg-secondary border-primary/40"
                      : "bg-background/40 border-border/60 hover:bg-secondary/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="font-semibold text-sm truncate">{p.name}</span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${statusColor[p.status]}`}>
                    {p.status}
                  </Badge>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {p.tasks.filter((t) => t.status === "done").length}/{p.tasks.length} tasks
                    {p.errors.filter((e) => !e.fixed).length > 0 && (
                      <span className="text-red-400 ml-2">
                        • {p.errors.filter((e) => !e.fixed).length} errors
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Detail */}
            {active && (
              <ProjectDetail
                project={active}
                onUpdate={(patch) => updateProject(active.id, patch)}
                onDelete={() => removeProject(active.id)}
              />
            )}
          </div>
        )}
      </section>
    </Layout>
  );
};

const EmptyState = () => (
  <Card className="p-12 text-center bg-gradient-card border-border/60">
    <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
    <h3 className="text-lg font-semibold mb-2">Abhi koi project track nahi ho raha</h3>
    <p className="text-sm text-muted-foreground mb-4">
      Upar "New Project" dabao — har app ka pura record rakh sakte ho yahan.
    </p>
  </Card>
);

const NewProjectDialog = ({
  onCreate,
}: {
  onCreate: (p: {
    name: string; packageName: string; sourceType: SourceType; sourceLocation: string;
  }) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pkg, setPkg] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("github");
  const [src, setSrc] = useState("");

  const reset = () => { setName(""); setPkg(""); setSourceType("github"); setSrc(""); };

  const placeholder: Record<SourceType, string> = {
    github:  "https://github.com/you/repo",
    lovable: "my-binance-clone (Lovable project naam)",
    folder:  "/Users/you/projects/binance",
    zip:     "binance-source.zip (path / chat me upload karo)",
    url:     "https://your-site.lovable.app",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero">
          <Plus className="h-4 w-4 mr-1" /> New Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Naya project track karo</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">App name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Binance Clone" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Package name</label>
            <Input value={pkg} onChange={(e) => setPkg(e.target.value)} placeholder="com.you.binance" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Source kahan se?</label>
            <Select value={sourceType} onValueChange={(v) => setSourceType(v as SourceType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="github">GitHub link</SelectItem>
                <SelectItem value="lovable">Doosra Lovable project</SelectItem>
                <SelectItem value="folder">Mac folder path</SelectItem>
                <SelectItem value="zip">ZIP upload</SelectItem>
                <SelectItem value="url">Live URL only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Source location</label>
            <Input value={src} onChange={(e) => setSrc(e.target.value)} placeholder={placeholder[sourceType]} />
            <p className="text-[11px] text-muted-foreground mt-1">
              Aur details (port, build cmd, live URL) project banane ke baad add kar sakte ho.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => { setOpen(false); reset(); }}>Cancel</Button>
          <Button
            variant="hero"
            disabled={!name || !pkg}
            onClick={() => {
              onCreate({ name, packageName: pkg, sourceType, sourceLocation: src });
              setOpen(false); reset();
            }}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ProjectDetail = ({
  project, onUpdate, onDelete,
}: {
  project: TrackedProject;
  onUpdate: (patch: Partial<TrackedProject>) => void;
  onDelete: () => void;
}) => {
  const [taskText, setTaskText] = useState("");
  const [errorText, setErrorText] = useState("");
  const [noteText, setNoteText] = useState("");

  const addTask = () => {
    if (!taskText.trim()) return;
    onUpdate({
      tasks: [...project.tasks, { id: newId(), text: taskText.trim(), status: "todo", createdAt: Date.now() }],
    });
    setTaskText("");
  };

  const setTaskStatus = (id: string, status: TaskStatus) => {
    onUpdate({ tasks: project.tasks.map((t) => t.id === id ? { ...t, status } : t) });
  };

  const removeTask = (id: string) => {
    onUpdate({ tasks: project.tasks.filter((t) => t.id !== id) });
  };

  const addError = () => {
    if (!errorText.trim()) return;
    onUpdate({
      errors: [...project.errors, { id: newId(), text: errorText.trim(), fixed: false, createdAt: Date.now() }],
    });
    setErrorText("");
  };

  const toggleError = (id: string) => {
    onUpdate({ errors: project.errors.map((e) => e.id === id ? { ...e, fixed: !e.fixed } : e) });
  };

  const removeError = (id: string) => {
    onUpdate({ errors: project.errors.filter((e) => e.id !== id) });
  };

  const addNote = (author: "user" | "ai") => {
    if (!noteText.trim()) return;
    onUpdate({
      notes: [...project.notes, { id: newId(), text: noteText.trim(), author, createdAt: Date.now() }],
    });
    setNoteText("");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-5 bg-gradient-card border-border/60">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold mb-1">{project.name}</h2>
            <code className="text-xs text-muted-foreground">{project.packageName}</code>
            {project.sourceLocation && (
              <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                <ExternalLink className="h-3 w-3" />
                <span className="truncate">{project.sourceLocation}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={project.status}
              onValueChange={(v) => onUpdate({ status: v as TrackedProject["status"] })}
            >
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="building">Building</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Source Config — full editable */}
      <SourceConfigCard project={project} onUpdate={onUpdate} />

      {/* Tasks */}
      <Card className="p-5 bg-gradient-card border-border/60">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" /> Tasks
          <span className="text-xs text-muted-foreground font-normal">
            ({project.tasks.filter((t) => t.status === "done").length}/{project.tasks.length})
          </span>
        </h3>
        <div className="space-y-1.5 mb-3">
          {project.tasks.length === 0 && (
            <p className="text-xs text-muted-foreground italic">Koi task nahi — neeche add karo.</p>
          )}
          {project.tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg bg-background/40 border border-border/40">
              <Select value={t.status} onValueChange={(v) => setTaskStatus(t.id, v as TaskStatus)}>
                <SelectTrigger className="w-[110px] h-7 text-xs">
                  <div className="flex items-center gap-1.5">{taskIcon[t.status]} {t.status}</div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">todo</SelectItem>
                  <SelectItem value="doing">doing</SelectItem>
                  <SelectItem value="done">done</SelectItem>
                  <SelectItem value="blocked">blocked</SelectItem>
                </SelectContent>
              </Select>
              <span className={`text-sm flex-1 ${t.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                {t.text}
              </span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeTask(t.id)}>
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Naya task — e.g. 'Cleanup pricing page'"
          />
          <Button onClick={addTask}><Plus className="h-4 w-4" /></Button>
        </div>
      </Card>

      {/* Errors */}
      <Card className="p-5 bg-gradient-card border-border/60">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400" /> Errors / Issues
          <span className="text-xs text-muted-foreground font-normal">
            ({project.errors.filter((e) => !e.fixed).length} open)
          </span>
        </h3>
        <div className="space-y-1.5 mb-3">
          {project.errors.length === 0 && (
            <p className="text-xs text-muted-foreground italic">Koi error nahi 🎉</p>
          )}
          {project.errors.map((e) => (
            <div key={e.id} className="flex items-center gap-2 p-2 rounded-lg bg-background/40 border border-border/40">
              <button onClick={() => toggleError(e.id)}>
                {e.fixed
                  ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                  : <Circle className="h-4 w-4 text-red-400" />}
              </button>
              <span className={`text-sm flex-1 ${e.fixed ? "line-through text-muted-foreground" : ""}`}>
                {e.text}
              </span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeError(e.id)}>
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={errorText}
            onChange={(e) => setErrorText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addError()}
            placeholder="Naya error — e.g. 'Gradle build fails on M1'"
          />
          <Button variant="destructive" onClick={addError}><Plus className="h-4 w-4" /></Button>
        </div>
      </Card>

      {/* Notes */}
      <Card className="p-5 bg-gradient-card border-border/60">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" /> Notes (User + AI)
        </h3>
        <div className="space-y-2 mb-3 max-h-80 overflow-y-auto">
          {project.notes.length === 0 && (
            <p className="text-xs text-muted-foreground italic">Koi note nahi.</p>
          )}
          {project.notes.map((n) => (
            <div key={n.id} className={`p-2.5 rounded-lg border text-sm ${
              n.author === "ai"
                ? "bg-primary/5 border-primary/20"
                : "bg-background/40 border-border/40"
            }`}>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                {n.author === "ai" ? <Bot className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                {n.author === "ai" ? "AI" : "You"} • {new Date(n.createdAt).toLocaleString()}
              </div>
              <p className="whitespace-pre-wrap">{n.text}</p>
            </div>
          ))}
        </div>
        <Textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Note likho — kahan ruke ho, kya yaad rakhna hai..."
          rows={3}
        />
        <div className="flex gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={() => addNote("user")}>
            <UserIcon className="h-3.5 w-3.5 mr-1" /> Add as You
          </Button>
          <Button variant="outline" size="sm" onClick={() => addNote("ai")}>
            <Bot className="h-3.5 w-3.5 mr-1" /> Add as AI
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Projects;

/* ─────────────────────────────────────────────────────────────────
 * Source Config Card — yahan user source code ka link / port /
 * folder / live URL sab daal sakta hai. Sab fields editable hain.
 * ───────────────────────────────────────────────────────────────── */
const SourceConfigCard = ({
  project, onUpdate,
}: {
  project: TrackedProject;
  onUpdate: (patch: Partial<TrackedProject>) => void;
}) => {
  const [draft, setDraft] = useState({
    sourceType: project.sourceType,
    sourceLocation: project.sourceLocation || "",
    githubUrl: project.githubUrl || "",
    lovableProject: project.lovableProject || "",
    folderPath: project.folderPath || "",
    liveUrl: project.liveUrl || "",
    devPort: project.devPort?.toString() || "",
    buildCommand: project.buildCommand || "",
    outputDir: project.outputDir || "",
  });

  useEffect(() => {
    setDraft({
      sourceType: project.sourceType,
      sourceLocation: project.sourceLocation || "",
      githubUrl: project.githubUrl || "",
      lovableProject: project.lovableProject || "",
      folderPath: project.folderPath || "",
      liveUrl: project.liveUrl || "",
      devPort: project.devPort?.toString() || "",
      buildCommand: project.buildCommand || "",
      outputDir: project.outputDir || "",
    });
  }, [project.id]);

  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const save = () => {
    onUpdate({
      sourceType: draft.sourceType,
      sourceLocation: draft.sourceLocation,
      githubUrl: draft.githubUrl || undefined,
      lovableProject: draft.lovableProject || undefined,
      folderPath: draft.folderPath || undefined,
      liveUrl: draft.liveUrl || undefined,
      devPort: draft.devPort ? Number(draft.devPort) : undefined,
      buildCommand: draft.buildCommand || undefined,
      outputDir: draft.outputDir || undefined,
    });
    toast.success("Source config saved");
  };

  return (
    <Card className="p-5 bg-gradient-card border-border/60">
      <h3 className="font-semibold mb-1 flex items-center gap-2">
        <ServerIcon className="h-4 w-4 text-primary" /> Source Config
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        Yahan source code ka link, port, folder path, build command — sab daal do.
        AI yahi se uthayega.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Source type">
          <Select value={draft.sourceType} onValueChange={(v) => set("sourceType", v as SourceType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="github">GitHub link</SelectItem>
              <SelectItem value="lovable">Doosra Lovable project</SelectItem>
              <SelectItem value="folder">Mac folder path</SelectItem>
              <SelectItem value="zip">ZIP upload</SelectItem>
              <SelectItem value="url">Live URL only</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Primary source location" icon={<ExternalLink className="h-3.5 w-3.5" />}>
          <Input
            value={draft.sourceLocation}
            onChange={(e) => set("sourceLocation", e.target.value)}
            placeholder="Main link / path / project name"
          />
        </Field>

        <Field label="GitHub URL" icon={<Github className="h-3.5 w-3.5" />}>
          <Input
            value={draft.githubUrl}
            onChange={(e) => set("githubUrl", e.target.value)}
            placeholder="https://github.com/you/repo"
          />
        </Field>

        <Field label="Lovable project name" icon={<Sparkles className="h-3.5 w-3.5" />}>
          <Input
            value={draft.lovableProject}
            onChange={(e) => set("lovableProject", e.target.value)}
            placeholder="my-binance-clone"
          />
        </Field>

        <Field label="Mac folder path" icon={<Folder className="h-3.5 w-3.5" />}>
          <Input
            value={draft.folderPath}
            onChange={(e) => set("folderPath", e.target.value)}
            placeholder="/Users/you/projects/binance"
          />
        </Field>

        <Field label="Live URL (Capacitor server.url)" icon={<Globe className="h-3.5 w-3.5" />}>
          <Input
            value={draft.liveUrl}
            onChange={(e) => set("liveUrl", e.target.value)}
            placeholder="https://your-site.lovable.app"
          />
        </Field>

        <Field label="Dev server port" icon={<ServerIcon className="h-3.5 w-3.5" />} hint="Vite=5173, CRA=3000, Lovable=8080. Jo terminal me dikhe wahi.">
          <Input
            value={draft.devPort}
            onChange={(e) => set("devPort", e.target.value)}
            placeholder="5173"
            inputMode="numeric"
          />
        </Field>

        <Field label="Build command">
          <Input
            value={draft.buildCommand}
            onChange={(e) => set("buildCommand", e.target.value)}
            placeholder="npm run build"
          />
        </Field>

        <Field label="Output directory">
          <Input
            value={draft.outputDir}
            onChange={(e) => set("outputDir", e.target.value)}
            placeholder="dist"
          />
        </Field>
      </div>

      <div className="flex justify-end mt-4">
        <Button variant="hero" onClick={save}>
          <Save className="h-4 w-4 mr-1" /> Save Source Config
        </Button>
      </div>
    </Card>
  );
};

const Field = ({
  label, icon, hint, children,
}: { label: string; icon?: React.ReactNode; hint?: string; children: React.ReactNode }) => (
  <div>
    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-1">
      {icon} {label}
    </label>
    {children}
    {hint && <p className="text-[10px] text-muted-foreground mt-1">{hint}</p>}
  </div>
);

