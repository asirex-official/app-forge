import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Folder, FileCode, Loader2 } from "lucide-react";

const SERVER = "http://localhost:5174";

export type FsItem = { name: string; isDir: boolean; path: string };

export const FileTree = ({
  root,
  serverOk,
  activeFile,
  onOpenFile,
}: {
  root: string;
  serverOk: boolean | null;
  activeFile: string | null;
  onOpenFile: (path: string) => void;
}) => {
  const [tree, setTree] = useState<Record<string, FsItem[]>>({});
  const [open, setOpen] = useState<Set<string>>(new Set([""]));
  const [err, setErr] = useState<string | null>(null);

  const loadDir = async (rel: string) => {
    if (!root) return;
    try {
      const r = await fetch(`${SERVER}/fs/list?root=${encodeURIComponent(root)}&path=${encodeURIComponent(rel)}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed");
      setTree((t) => ({ ...t, [rel]: j.items }));
      setErr(null);
    } catch (e: any) {
      setErr(e.message);
    }
  };

  useEffect(() => {
    if (root && serverOk) {
      setTree({});
      setOpen(new Set([""]));
      loadDir("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, serverOk]);

  const toggleDir = (p: string) => {
    const next = new Set(open);
    if (next.has(p)) next.delete(p);
    else { next.add(p); if (!tree[p]) loadDir(p); }
    setOpen(next);
  };

  if (!root) return <div className="text-xs text-muted-foreground p-3">Set source root in Config tab.</div>;
  if (serverOk === false) return <div className="text-xs text-destructive p-3">Mac server offline. /server check karo.</div>;
  if (err) return <div className="text-xs text-destructive p-3">{err}</div>;
  if (!tree[""]) return <div className="text-xs text-muted-foreground p-3 flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" />Loading…</div>;

  return (
    <Branch
      items={tree[""]}
      tree={tree}
      open={open}
      activeFile={activeFile}
      onToggle={toggleDir}
      onOpen={onOpenFile}
      depth={0}
    />
  );
};

const Branch = ({
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
            style={{ paddingLeft: depth * 10 + 4 }}
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
            <Branch
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

export const fetchFile = async (root: string, path: string): Promise<string> => {
  const r = await fetch(`${SERVER}/fs/read?root=${encodeURIComponent(root)}&path=${encodeURIComponent(path)}`);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || "Failed");
  return j.content as string;
};
