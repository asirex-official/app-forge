/**
 * Project Tracker Store — REACTIVE & SHARED
 * ------------------------------------------
 * Single source of truth across Builder, Projects, Admin, Files.
 * Subscribers get live updates. Cross-tab sync via 'storage' event.
 * Persisted in localStorage.
 */

export type TaskStatus = "todo" | "doing" | "done" | "blocked";

export type ProjectTask = {
  id: string;
  text: string;
  status: TaskStatus;
  createdAt: number;
};

export type ProjectError = {
  id: string;
  text: string;
  fixed: boolean;
  createdAt: number;
};

export type ProjectNote = {
  id: string;
  text: string;
  author: "user" | "ai";
  createdAt: number;
};

export type SourceType = "github" | "lovable" | "folder" | "zip" | "url";

export type AppPermissions = {
  internet: boolean;
  camera: boolean;
  location: boolean;
  notifications: boolean;
  storage: boolean;
};

export type BackendKey = {
  id: string;
  name: string;   // SUPABASE_URL etc.
  value: string;
};

export type TrackedProject = {
  id: string;
  name: string;
  packageName: string;

  // Source code info
  sourceType: SourceType;
  sourceLocation: string;
  githubUrl?: string;
  lovableProject?: string;
  folderPath?: string;
  liveUrl?: string;

  // Dev server config
  devPort?: number;
  buildCommand?: string;
  outputDir?: string;

  // === APK wrapper config (NEW — unified with Builder) ===
  versionName?: string;        // "1.0.0"
  versionCode?: number;        // 1
  themeColor?: string;         // "#22c55e"
  bgColor?: string;            // "#0f172a"
  iconDataUrl?: string | null; // base64 icon
  permissions?: AppPermissions;
  buildType?: "debug" | "release";
  sourceWebsiteType?: "url" | "html"; // for builder preview
  htmlContent?: string;        // custom HTML if not URL
  backendKeys?: BackendKey[];  // API keys / secrets (browser only)

  status: "planning" | "building" | "ready" | "shipped";
  tasks: ProjectTask[];
  errors: ProjectError[];
  notes: ProjectNote[];
  lastBuildAt?: number;
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = "apkforge.projects.v1";
const ACTIVE_KEY = "apkforge.activeProjectId";

// In-memory cache + listeners for live reactive updates
let cache: TrackedProject[] | null = null;
let activeIdCache: string | null = null;
const listeners = new Set<() => void>();

const readLS = (): TrackedProject[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const readActiveLS = (): string | null => {
  try { return localStorage.getItem(ACTIVE_KEY); } catch { return null; }
};

// Initialize cache
if (typeof window !== "undefined") {
  cache = readLS();
  activeIdCache = readActiveLS();
  // Cross-tab sync
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      cache = readLS();
      listeners.forEach((fn) => fn());
    } else if (e.key === ACTIVE_KEY) {
      activeIdCache = readActiveLS();
      listeners.forEach((fn) => fn());
    }
  });
}

const notify = () => listeners.forEach((fn) => fn());

export const subscribe = (fn: () => void): (() => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

// ===== Public API =====
export const loadProjects = (): TrackedProject[] => {
  if (cache === null) cache = readLS();
  return cache;
};

export const saveProjects = (projects: TrackedProject[]) => {
  cache = projects;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(projects)); } catch {}
  notify();
};

export const getActiveProjectId = (): string | null => {
  if (activeIdCache === null) activeIdCache = readActiveLS();
  return activeIdCache;
};

export const setActiveProjectId = (id: string | null) => {
  activeIdCache = id;
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  } catch {}
  notify();
};

export const getActiveProject = (): TrackedProject | null => {
  const id = getActiveProjectId();
  if (!id) return null;
  return loadProjects().find((p) => p.id === id) ?? null;
};

export const updateProject = (id: string, patch: Partial<TrackedProject>) => {
  const next = loadProjects().map((p) =>
    p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p
  );
  saveProjects(next);
};

export const newId = () => Math.random().toString(36).slice(2, 10);

export const createProject = (
  partial: Pick<TrackedProject, "name" | "packageName" | "sourceType" | "sourceLocation"> &
    Partial<Pick<TrackedProject,
      "githubUrl" | "lovableProject" | "folderPath" | "liveUrl" |
      "devPort" | "buildCommand" | "outputDir" |
      "versionName" | "versionCode" | "themeColor" | "bgColor" |
      "iconDataUrl" | "permissions" | "buildType" |
      "sourceWebsiteType" | "htmlContent" | "backendKeys"
    >>,
): TrackedProject => ({
  id: newId(),
  status: "planning",
  tasks: [],
  errors: [],
  notes: [],
  versionName: "1.0.0",
  versionCode: 1,
  themeColor: "#22c55e",
  bgColor: "#0f172a",
  iconDataUrl: null,
  permissions: { internet: true, camera: false, location: false, notifications: false, storage: false },
  buildType: "debug",
  sourceWebsiteType: "url",
  htmlContent: "",
  backendKeys: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...partial,
});
