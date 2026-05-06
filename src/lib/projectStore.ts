/**
 * Project Tracker Store
 * ---------------------
 * Har app build ka record rakhta hai — localStorage me persist hota hai.
 * AI aur user dono iska use karte hain taaki kuch bhoole nahi.
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

export type TrackedProject = {
  id: string;
  name: string;            // "Binance Clone", "Zepto Clone" etc.
  packageName: string;     // com.example.binance

  // Source code info
  sourceType: SourceType;       // kahan se aa raha hai
  sourceLocation: string;       // link / path / project name
  githubUrl?: string;           // optional explicit github
  lovableProject?: string;      // doosre Lovable project ka naam
  folderPath?: string;          // Mac pe folder path
  liveUrl?: string;             // running website URL (Capacitor server.url ke liye)

  // Dev server config
  devPort?: number;             // jaise 5173, 3000, 8080
  buildCommand?: string;        // "npm run build"
  outputDir?: string;           // "dist" / "build"

  status: "planning" | "building" | "ready" | "shipped";
  tasks: ProjectTask[];
  errors: ProjectError[];
  notes: ProjectNote[];
  lastBuildAt?: number;
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = "apkforge.projects.v1";

export const loadProjects = (): TrackedProject[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveProjects = (projects: TrackedProject[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const newId = () => Math.random().toString(36).slice(2, 10);

export const createProject = (
  partial: Pick<TrackedProject, "name" | "packageName" | "sourceType" | "sourceLocation"> &
    Partial<Pick<TrackedProject, "githubUrl" | "lovableProject" | "folderPath" | "liveUrl" | "devPort" | "buildCommand" | "outputDir">>,
): TrackedProject => ({
  id: newId(),
  status: "planning",
  tasks: [],
  errors: [],
  notes: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...partial,
});
