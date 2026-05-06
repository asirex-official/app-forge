import { useEffect, useState } from "react";
import {
  Folder, FolderOpen, FileCode, ChevronRight, ChevronDown,
  AlertCircle, Loader2, Copy, ArrowLeft,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Layout from "@/components/site/Layout";
import { macFetch, pingMac } from "@/lib/macConnection";

type FsItem = { name: string; isDir: boolean; path: string };

const Files = () => {
  const [root, setRoot] = useState<string>(() => localStorage.getItem("apkforge.fs.root") || "");
  const [draftRoot, setDraftRoot] = useState(root);
  const [tree, setTree] = useState<Record<string, FsItem[]>>({});
  const [open, setOpen] = useState<Set<string>>(new Set([""]));
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [loadingFile, setLoadingFile] = useState(false);
  const [serverOk, setServerOk] = useState<boolean | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    pingMac().then((r) => setServerOk(Boolean(r?.ok))).catch(() => setServerOk(false));
  }, []);

  const loadDir = async (rel: string) => {
    if (!root) return;
    try {
      const r = await macFetch(`/fs/list?root=${encodeURIComponent(root)}&path=${encodeURIComponent(rel)}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed");
      setTree((t) => ({ ...t, [rel]: j.items }));
      setErr(null);
    } catch (e: any) {
      setErr(e.message);
    }
  };

  const setRootAndLoad = (path: string) => {
    setRoot(path);
    localStorage.setItem("apkforge.fs.root", path);
    setTree({});
    setOpen(new Set([""]));
    setActiveFile(null);
    setFileContent("");
    setTimeout(() => loadDir(""), 50);
  };

  useEffect(() => { if (root && serverOk) loadDir(""); }, [root, serverOk]);

  const toggleDir = (p: string) => {
    const next = new Set(open);
    if (next.has(p)) next.delete(p);
    else { next.add(p); if (!tree[p]) loadDir(p); }
    setOpen(next);
  };

  const openFile = async (p: string) => {
    setActiveFile(p);
    setLoadingFile(true);
    setFileContent("");
    try {
      const r = await macFetch(`/fs/read?root=${encodeURIComponent(root)}&path=${encodeURIComponent(p)}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed");
      setFileContent(j.content);
    } catch (e: any) {
      setFileContent(`// Error: ${e.message}`);
    } finally {
      setLoadingFile(false);
    }
  };

  return (
    <Layout>
      <section className="container py-12 max-w-7xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
            <FolderOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Source <span className="text-gradient">Files</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Mac pe rakhe source code ka pura folder dekho — har file click karke code padho (read-only).
            </p>
          </div>
        </div>

        {/* Server status */}
        {serverOk === false && (
          <Card className="p-4 bg-red-500/10 border-red-500/30 mb-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <div className="text-sm">
              <strong className="text-red-300">APKForge server offline.</strong>
              {" "}Mac pe terminal me <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">cd server && npm start</code> chalao.
            </div>
          </Card>
        )}

        {/* Root picker */}
        <Card className="p-4 bg-gradient-card border-border/60 mb-4">
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Source folder root path (Mac pe)
          </label>
          <div className="flex gap-2">
            <Input
              value={draftRoot}
              onChange={(e) => setDraftRoot(e.target.value)}
              placeholder="/Users/you/projects/binance-clone"
              className="font-mono text-sm"
            />
            <Button
              variant="hero"
              disabled={!draftRoot || !serverOk}
              onClick={() => { setRootAndLoad(draftRoot); toast.success("Root set"); }}
            >
              Load
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            ⚠️ Read-only — yahan se kuch edit nahi hota. Source code safe rahega.
          </p>
        </Card>

        {err && (
          <Card className="p-3 bg-red-500/10 border-red-500/30 mb-4 text-sm text-red-300">
            {err}
          </Card>
        )}

        {/* Browser */}
        {root && serverOk && (
          <div className="grid lg:grid-cols-[300px_1fr] gap-4">
            {/* Tree */}
            <Card className="p-3 bg-gradient-card border-border/60 max-h-[70vh] overflow-auto">
              <div className="text-[11px] text-muted-foreground font-mono mb-2 truncate">
                {root}
              </div>
              <Tree
                items={tree[""] || []}
                tree={tree}
                open={open}
                activeFile={activeFile}
                onToggle={toggleDir}
                onOpen={openFile}
                depth={0}
              />
              {!tree[""] && <div className="text-xs text-muted-foreground p-2">Loading...</div>}
            </Card>

            {/* Code viewer */}
            <Card className="p-0 bg-gradient-card border-border/60 overflow-hidden">
              {!activeFile ? (
                <div className="p-12 text-center text-sm text-muted-foreground">
                  ← Left me file pe click karo
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between px-4 py-2 border-b border-border/60 bg-background/40">
                    <div className="flex items-center gap-2 text-sm font-mono truncate">
                      <FileCode className="h-4 w-4 text-primary flex-shrink-0" />
                      {activeFile}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { navigator.clipboard.writeText(fileContent); toast.success("Copied"); }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {loadingFile ? (
                    <div className="p-8 flex items-center justify-center text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading...
                    </div>
                  ) : (
                    <pre className="p-4 text-xs font-mono overflow-auto max-h-[65vh] leading-relaxed">
                      {fileContent.split("\n").map((line, i) => (
                        <div key={i} className="flex">
                          <span className="text-muted-foreground/50 select-none w-10 flex-shrink-0 text-right pr-3">
                            {i + 1}
                          </span>
                          <span className="text-foreground whitespace-pre">{line}</span>
                        </div>
                      ))}
                    </pre>
                  )}
                </>
              )}
            </Card>
          </div>
        )}

        {!root && (
          <Card className="p-12 text-center bg-gradient-card border-border/60">
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="font-semibold mb-1">Source folder set karo</h3>
            <p className="text-sm text-muted-foreground">
              Upar Mac ka full path daalo (e.g. <code className="bg-secondary px-1.5 py-0.5 rounded text-xs">/Users/you/projects/binance</code>) — folder tree dikh jayega.
            </p>
          </Card>
        )}
      </section>
    </Layout>
  );
};

const Tree = ({
  items, tree, open, activeFile, onToggle, onOpen, depth,
}: {
  items: FsItem[];
  tree: Record<string, FsItem[]>;
  open: Set<string>;
  activeFile: string | null;
  onToggle: (p: string) => void;
  onOpen: (p: string) => void;
  depth: number;
}) => (
  <div>
    {items.map((it) => {
      const isOpen = open.has(it.path);
      const isActive = activeFile === it.path;
      return (
        <div key={it.path}>
          <button
            onClick={() => it.isDir ? onToggle(it.path) : onOpen(it.path)}
            className={`w-full flex items-center gap-1 text-xs py-1 px-1.5 rounded hover:bg-secondary/50 text-left ${
              isActive ? "bg-primary/10 text-primary" : "text-foreground"
            }`}
            style={{ paddingLeft: depth * 12 + 6 }}
          >
            {it.isDir ? (
              isOpen ? <ChevronDown className="h-3 w-3 flex-shrink-0" /> : <ChevronRight className="h-3 w-3 flex-shrink-0" />
            ) : <span className="w-3" />}
            {it.isDir
              ? <Folder className="h-3.5 w-3.5 text-blue-400 flex-shrink-0" />
              : <FileCode className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
            <span className="truncate">{it.name}</span>
          </button>
          {it.isDir && isOpen && tree[it.path] && (
            <Tree
              items={tree[it.path]}
              tree={tree}
              open={open}
              activeFile={activeFile}
              onToggle={onToggle}
              onOpen={onOpen}
              depth={depth + 1}
            />
          )}
        </div>
      );
    })}
  </div>
);

export default Files;
