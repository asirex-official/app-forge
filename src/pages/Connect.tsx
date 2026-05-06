import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Copy, Cpu, Link2, Loader2, RefreshCw, Wifi, WifiOff, Terminal } from "lucide-react";
import { toast } from "sonner";
import {
  clearMacConnection, getMacConnection, pairWithMac, pingMac,
} from "@/lib/macConnection";

// 3 simple commands. No curl-pipe-bash. No mystery.
const CMD_BREW = `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`;
const CMD_TOOLS = `brew install openjdk@17 gradle node git cloudflared && brew install --cask android-commandlinetools`;
const CMD_ENV = `cat >> ~/.zshrc <<'EOF'
export JAVA_HOME="$(brew --prefix openjdk@17)/libexec/openjdk.jdk/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
EOF
source ~/.zshrc
mkdir -p "$ANDROID_HOME/cmdline-tools" && ln -sfn "$(brew --prefix)/share/android-commandlinetools/cmdline-tools/latest" "$ANDROID_HOME/cmdline-tools/latest"
yes | sdkmanager --licenses >/dev/null && sdkmanager "platform-tools" "build-tools;34.0.0" "platforms;android-34"`;
const CMD_SERVER = `mkdir -p ~/.apkforge && cd ~/.apkforge && (git clone https://github.com/asirex-official/app-forge.git server 2>/dev/null || (cd server && git pull))
cd ~/.apkforge/server/server && npm install && npm start`;

const Connect = () => {
  const [conn, setConn] = useState(() => getMacConnection());
  const [tunnelUrl, setTunnelUrl] = useState("");
  const [code, setCode] = useState("");
  const [pairing, setPairing] = useState(false);
  const [status, setStatus] = useState<"idle" | "online" | "offline">("idle");

  // Probe paired Mac on mount + every 15s
  useEffect(() => {
    if (!conn) return;
    let alive = true;
    const probe = async () => {
      const r = await pingMac();
      if (alive) setStatus(r ? "online" : "offline");
    };
    probe();
    const t = setInterval(probe, 15000);
    return () => { alive = false; clearInterval(t); };
  }, [conn]);

  const copy = (text: string, label = "Copied") => {
    navigator.clipboard.writeText(text);
    toast.success(label);
  };

  const handlePair = async () => {
    if (!tunnelUrl.trim() || !/^\d{6}$/.test(code.trim())) {
      toast.error("Enter the tunnel URL and 6-digit code from your Mac terminal");
      return;
    }
    setPairing(true);
    try {
      const c = await pairWithMac(tunnelUrl.trim(), code.trim());
      setConn(c);
      setStatus("online");
      toast.success("Mac connected! 🎉");
    } catch (e: any) {
      toast.error(e.message || "Pairing failed");
    } finally {
      setPairing(false);
    }
  };

  const handleDisconnect = () => {
    clearMacConnection();
    setConn(null);
    setStatus("idle");
    toast.success("Disconnected");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60 bg-card/40 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            <span className="font-semibold">Connect your Mac</span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-3xl space-y-6">
        {/* STATUS BANNER */}
        {conn ? (
          <Card className="border-primary/40 bg-primary/5">
            <CardContent className="pt-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {status === "online" ? (
                  <Wifi className="h-6 w-6 text-primary" />
                ) : status === "offline" ? (
                  <WifiOff className="h-6 w-6 text-destructive" />
                ) : (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                )}
                <div>
                  <div className="font-semibold">
                    Mac is {status === "online" ? "online ✅" : status === "offline" ? "offline ⚠️" : "checking…"}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">{conn.tunnelUrl}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => pingMac().then(r => setStatus(r ? "online" : "offline"))}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 flex items-center gap-3 text-muted-foreground">
              <WifiOff className="h-5 w-5" />
              <span>No Mac paired yet. Follow the 2 steps below.</span>
            </CardContent>
          </Card>
        )}

        {/* STEP 1 — Manual install, broken into clear copyable commands */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge>Step 1</Badge>
              <CardTitle>Setup karo apne Mac me (ek baar)</CardTitle>
            </div>
            <CardDescription>
              Mac ka Terminal kholo (Cmd+Space → "Terminal"). Niche di gayi 4 commands
              ek-ek karke paste karo. Pehli baar ~10 min lagenge — sab download hoga.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { n: "1", label: "Homebrew install karo (skip if already installed)", cmd: CMD_BREW },
              { n: "2", label: "Java, Gradle, Android SDK, Cloudflare tunnel install karo", cmd: CMD_TOOLS },
              { n: "3", label: "Environment variables set karo + Android SDK packages", cmd: CMD_ENV },
              { n: "4", label: "APKForge server clone karke chalao", cmd: CMD_SERVER },
            ].map((step) => (
              <div key={step.n} className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {step.n}
                  </span>
                  <span className="font-medium">{step.label}</span>
                </div>
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3 font-mono text-xs flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <Terminal className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                    <pre className="whitespace-pre-wrap break-all">{step.cmd}</pre>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => copy(step.cmd, `Command ${step.n} copied`)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-2">
              ⚠️ <b>Step 4 me <code>YOUR_GITHUB</code> replace karna padega</b> — pehle is project ko GitHub se connect karo
              (top-right me GitHub button), phir us repo ka URL daalo. Last command chalne ke baad terminal me
              <b> Tunnel URL</b> + <b>6-digit code</b> print hoga.
            </p>
          </CardContent>
        </Card>

        {/* STEP 2 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge>Step 2</Badge>
              <CardTitle>Enter what your Mac printed</CardTitle>
            </div>
            <CardDescription>
              When the installer finishes, your terminal shows a <b>Tunnel URL</b> (https://…trycloudflare.com)
              and a <b>6-digit Pair Code</b>. Paste both here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tunnel">Tunnel URL</Label>
              <Input
                id="tunnel"
                placeholder="https://abc-def-ghi.trycloudflare.com"
                value={tunnelUrl}
                onChange={(e) => setTunnelUrl(e.target.value)}
                disabled={pairing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Pair Code (6 digits)</Label>
              <Input
                id="code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                maxLength={6}
                disabled={pairing}
                className="font-mono text-lg tracking-widest"
              />
            </div>
            <Button onClick={handlePair} disabled={pairing} className="w-full">
              {pairing ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Pairing…</>
              ) : (
                <><Link2 className="h-4 w-4 mr-2" /> Pair my Mac</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* FOOTER */}
        <Card className="bg-muted/20">
          <CardContent className="pt-6 text-xs text-muted-foreground space-y-2">
            <div className="flex items-start gap-2"><Check className="h-3.5 w-3.5 mt-0.5 text-primary" /> Pair once, build forever — token saved in this browser.</div>
            <div className="flex items-start gap-2"><Check className="h-3.5 w-3.5 mt-0.5 text-primary" /> Cloudflare Tunnel is free, no signup, no account.</div>
            <div className="flex items-start gap-2"><Check className="h-3.5 w-3.5 mt-0.5 text-primary" /> Tunnel URL changes every server restart — re-pair if it stops working.</div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Connect;
