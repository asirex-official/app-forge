// Mac connection — single source of truth for talking to the user's local
// APKForge build server through the Cloudflare Tunnel.
//
// One-time pairing flow:
//   1. User runs install.sh on Mac → server starts → cloudflared prints URL +
//      a 6-digit pair code in the terminal.
//   2. User visits /connect in this preview, enters the code.
//   3. We POST {code} to <tunnelUrl>/pair → server returns { token, tunnelUrl }.
//   4. We persist { tunnelUrl, token } in localStorage. Done forever.
//   5. All future calls go through `macFetch()` which adds the auth header.

const LS_KEY = "apkforge.mac.connection.v1";

export type MacConnection = {
  tunnelUrl: string;   // e.g. https://abc-def.trycloudflare.com
  token: string;       // long random token
  pairedAt: number;
  version?: string;
};

export function getMacConnection(): MacConnection | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as MacConnection) : null;
  } catch { return null; }
}

export function saveMacConnection(c: MacConnection) {
  localStorage.setItem(LS_KEY, JSON.stringify(c));
}

export function clearMacConnection() {
  localStorage.removeItem(LS_KEY);
}

/** Pair with a Mac. `tunnelUrl` is what cloudflared printed; `code` is 6 digits. */
export async function pairWithMac(tunnelUrl: string, code: string): Promise<MacConnection> {
  const url = tunnelUrl.replace(/\/+$/, "");
  const res = await fetch(`${url}/pair`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(e.error || `Pair failed (${res.status})`);
  }
  const data = await res.json();
  const conn: MacConnection = {
    tunnelUrl: url,
    token: data.token,
    pairedAt: Date.now(),
    version: data.version,
  };
  saveMacConnection(conn);
  return conn;
}

/** Authenticated fetch against the paired Mac. Throws if not paired. */
export async function macFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const c = getMacConnection();
  if (!c) throw new Error("Mac not connected. Visit /connect to pair.");
  const headers = new Headers(init.headers);
  headers.set("X-APKForge-Token", c.token);
  if (init.body && !headers.has("Content-Type") && typeof init.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${c.tunnelUrl}${path}`, { ...init, headers });
}

/** Quick health probe — returns null if Mac is offline. */
export async function pingMac(): Promise<{ ok: true; version?: string } | null> {
  const c = getMacConnection();
  if (!c) return null;
  try {
    const r = await fetch(`${c.tunnelUrl}/health`, { method: "GET" });
    if (!r.ok) return null;
    const j = await r.json();
    return { ok: true, version: j.version };
  } catch { return null; }
}
