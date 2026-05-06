import { useEffect, useState, useSyncExternalStore } from "react";
import {
  loadProjects, subscribe, getActiveProjectId, getActiveProject,
  setActiveProjectId, updateProject, type TrackedProject,
} from "./projectStore";

/** Live list of all projects — re-renders on any change in any tab. */
export const useProjects = (): TrackedProject[] => {
  return useSyncExternalStore(
    (cb) => subscribe(cb),
    () => loadProjects(),
    () => [],
  );
};

/** Live active project id. */
export const useActiveProjectId = (): string | null => {
  return useSyncExternalStore(
    (cb) => subscribe(cb),
    () => getActiveProjectId(),
    () => null,
  );
};

/** Live active project. */
export const useActiveProject = (): TrackedProject | null => {
  return useSyncExternalStore(
    (cb) => subscribe(cb),
    () => getActiveProject(),
    () => null,
  );
};

/** Helper: patch active project's fields. No-op if no active. */
export const patchActiveProject = (patch: Partial<TrackedProject>) => {
  const id = getActiveProjectId();
  if (!id) return;
  updateProject(id, patch);
};

export { setActiveProjectId };
