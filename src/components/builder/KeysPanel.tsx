import { useEffect, useState } from "react";
import { KeyRound, Plus, Trash2, Eye, EyeOff, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export type KeyEntry = { id: string; name: string; value: string };

const STORAGE = "apkforge.keys.v1";

const load = (projectId: string): KeyEntry[] => {
  try {
    const raw = localStorage.getItem(`${STORAGE}.${projectId}`);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};
const save = (projectId: string, list: KeyEntry[]) => {
  localStorage.setItem(`${STORAGE}.${projectId}`, JSON.stringify(list));
};

export const KeysPanel = ({ projectId }: { projectId: string }) => {
  const [keys, setKeys] = useState<KeyEntry[]>([]);
  const [reveal, setReveal] = useState<Set<string>>(new Set());
  const [draftName, setDraftName] = useState("");
  const [draftValue, setDraftValue] = useState("");

  useEffect(() => { setKeys(load(projectId)); }, [projectId]);

  const persist = (list: KeyEntry[]) => { setKeys(list); save(projectId, list); };

  const add = () => {
    const name = draftName.trim().toUpperCase().replace(/\s+/g, "_");
    if (!name) return toast.error("Name zaroori hai");
    if (!draftValue.trim()) return toast.error("Value zaroori hai");
    if (keys.some(k => k.name === name)) return toast.error("Same name pehle se hai");
    persist([...keys, { id: Math.random().toString(36).slice(2, 9), name, value: draftValue.trim() }]);
    setDraftName(""); setDraftValue("");
    toast.success("Key saved (browser only)");
  };

  const remove = (id: string) => persist(keys.filter(k => k.id !== id));

  const toggleReveal = (id: string) => {
    const n = new Set(reveal);
    n.has(id) ? n.delete(id) : n.add(id);
    setReveal(n);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <KeyRound className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Backend Keys & Secrets</h3>
      </div>
      <p className="text-[11px] text-muted-foreground -mt-2">
        Sirf is browser me saved hote hain (localStorage). Build ke time Mac server ko bhej sakte hain.
      </p>

      <div className="space-y-2">
        {keys.length === 0 && (
          <div className="text-xs text-muted-foreground p-4 border border-dashed border-border rounded-lg text-center">
            Koi key nahi. Niche add karo.
          </div>
        )}
        {keys.map(k => (
          <div key={k.id} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-secondary/40">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-mono font-semibold truncate">{k.name}</div>
              <div className="text-[10px] font-mono text-muted-foreground truncate">
                {reveal.has(k.id) ? k.value : "•".repeat(Math.min(24, k.value.length))}
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => toggleReveal(k.id)} className="h-7 w-7 p-0">
              {reveal.has(k.id) ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(k.value); toast.success("Copied"); }} className="h-7 w-7 p-0">
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => remove(k.id)} className="h-7 w-7 p-0 text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-2 pt-2 border-t border-border">
        <Input
          placeholder="KEY_NAME (e.g. SUPABASE_URL)"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          className="font-mono text-xs"
        />
        <Input
          placeholder="value"
          value={draftValue}
          onChange={(e) => setDraftValue(e.target.value)}
          className="font-mono text-xs"
          type="password"
        />
        <Button onClick={add} variant="hero" size="sm" className="w-full">
          <Plus className="h-3.5 w-3.5" /> Add Key
        </Button>
      </div>
    </div>
  );
};
