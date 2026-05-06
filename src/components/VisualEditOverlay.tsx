import { useEffect, useRef, useState } from "react";
import { MousePointerClick, X, Send, FileCode, Hash, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

/**
 * VisualEditOverlay
 * -----------------
 * Floating button bottom-right corner pe. Click karo → "select mode" on.
 * Page pe koi bhi element pe hover karo — outline dikhega. Click karo —
 * us element ka info panel khulta hai jisme:
 *   - element ka tag (div, h1, button, etc.)
 *   - text content
 *   - data-loc / data-source attribute (agar ho) → file:line
 *   - prompt box (kya change karna chahte ho)
 *
 * "Send to AI" button prompt + selector ko clipboard me copy kar deta hai
 * (taaki user chat me paste karke AI ko bhej sake — backend nahi banaya).
 */
const VisualEditOverlay = () => {
  const [enabled, setEnabled] = useState(false);
  const [hovered, setHovered] = useState<HTMLElement | null>(null);
  const [selected, setSelected] = useState<HTMLElement | null>(null);
  const [prompt, setPrompt] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) {
      setHovered(null); setSelected(null);
      return;
    }

    const isOurUI = (el: HTMLElement | null) =>
      !!el && (
        overlayRef.current?.contains(el) ||
        panelRef.current?.contains(el) ||
        el.closest("[data-ve-ui]")
      );

    const onMove = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (isOurUI(t)) { setHovered(null); return; }
      setHovered(t);
    };

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (isOurUI(t)) return;
      e.preventDefault();
      e.stopPropagation();
      setSelected(t);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("click", onClick, true);
    };
  }, [enabled]);

  const rect = (el: HTMLElement | null) => el?.getBoundingClientRect();
  const hRect = rect(hovered);
  const sRect = rect(selected);

  const cssSelector = (el: HTMLElement): string => {
    if (!el || el === document.body) return "body";
    if (el.id) return `#${el.id}`;
    const parts: string[] = [];
    let cur: HTMLElement | null = el;
    let depth = 0;
    while (cur && cur !== document.body && depth < 4) {
      let part = cur.tagName.toLowerCase();
      const cls = cur.className && typeof cur.className === "string"
        ? cur.className.trim().split(/\s+/).slice(0, 2).join(".")
        : "";
      if (cls) part += `.${cls}`;
      parts.unshift(part);
      cur = cur.parentElement;
      depth++;
    }
    return parts.join(" > ");
  };

  const sourceLoc = selected?.getAttribute("data-loc")
    || selected?.getAttribute("data-source")
    || null;

  const sendToAI = () => {
    if (!selected) return;
    const sel = cssSelector(selected);
    const text = (selected.innerText || "").trim().slice(0, 200);
    const msg = [
      `🎯 Visual Edit request:`,
      sourceLoc ? `📁 Source: ${sourceLoc}` : `📍 Selector: ${sel}`,
      `🏷  Tag: <${selected.tagName.toLowerCase()}>`,
      text && `📝 Current text: "${text}"`,
      ``,
      `✏️ Change request: ${prompt}`,
    ].filter(Boolean).join("\n");
    navigator.clipboard.writeText(msg);
    toast.success("Copied! Ab chat me paste karke bhej do AI ko.");
    setPrompt("");
    setSelected(null);
  };

  return (
    <>
      {/* Floating toggle button */}
      <div ref={overlayRef} data-ve-ui className="fixed bottom-6 right-6 z-[9999]">
        <Button
          size="lg"
          variant={enabled ? "destructive" : "hero"}
          onClick={() => setEnabled((v) => !v)}
          className="shadow-lg rounded-full h-14 w-14 p-0"
          title={enabled ? "Visual edit off" : "Visual edit on"}
        >
          {enabled ? <X className="h-5 w-5" /> : <MousePointerClick className="h-5 w-5" />}
        </Button>
        {enabled && (
          <div className="absolute bottom-16 right-0 bg-background/95 backdrop-blur border border-border rounded-lg px-3 py-1.5 text-xs whitespace-nowrap shadow-lg">
            Click any element to edit
          </div>
        )}
      </div>

      {/* Hover outline */}
      {enabled && hRect && !selected && (
        <div
          data-ve-ui
          className="fixed pointer-events-none z-[9998] border-2 border-primary/60 bg-primary/10 rounded-sm transition-none"
          style={{ top: hRect.top, left: hRect.left, width: hRect.width, height: hRect.height }}
        />
      )}

      {/* Selected outline */}
      {selected && sRect && (
        <div
          data-ve-ui
          className="fixed pointer-events-none z-[9998] border-2 border-primary bg-primary/15 rounded-sm shadow-glow"
          style={{ top: sRect.top, left: sRect.left, width: sRect.width, height: sRect.height }}
        />
      )}

      {/* Edit panel */}
      {selected && (
        <Card
          ref={panelRef as any}
          data-ve-ui
          className="fixed bottom-24 right-6 z-[9999] w-[360px] p-4 bg-background/95 backdrop-blur border-primary/40 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Sparkles className="h-4 w-4 text-primary" /> Visual Edit
            </div>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelected(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2 text-xs mb-3">
            <Row icon={<Hash className="h-3 w-3" />} label="Tag">
              <code className="text-primary">&lt;{selected.tagName.toLowerCase()}&gt;</code>
            </Row>
            {sourceLoc ? (
              <Row icon={<FileCode className="h-3 w-3" />} label="Source">
                <code className="text-green-400">{sourceLoc}</code>
              </Row>
            ) : (
              <Row icon={<FileCode className="h-3 w-3" />} label="Source">
                <span className="text-muted-foreground italic">
                  Not tagged — selector use hoga
                </span>
              </Row>
            )}
            {selected.innerText && (
              <Row icon={<MousePointerClick className="h-3 w-3" />} label="Text">
                <span className="text-foreground truncate block max-w-[240px]">
                  "{selected.innerText.trim().slice(0, 60)}"
                </span>
              </Row>
            )}
          </div>

          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Kya change karna hai? e.g. 'Color blue kar do, font bada'"
            rows={3}
            className="text-sm mb-2"
            autoFocus
          />
          <Button
            variant="hero"
            size="sm"
            className="w-full"
            disabled={!prompt.trim()}
            onClick={sendToAI}
          >
            <Send className="h-3.5 w-3.5 mr-1.5" /> Send to AI (copies to clipboard)
          </Button>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            Prompt clipboard me copy hoga — chat me paste karke bhej do.
          </p>
        </Card>
      )}
    </>
  );
};

const Row = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
  <div className="flex items-start gap-2">
    <div className="flex items-center gap-1 text-muted-foreground w-14 flex-shrink-0">
      {icon} {label}
    </div>
    <div className="flex-1 min-w-0">{children}</div>
  </div>
);

export default VisualEditOverlay;
