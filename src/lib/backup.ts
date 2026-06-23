import { BacklinkRecord, Project } from "./types";

export type AppBackup = {
  version: 1;
  exportedAt: string;
  projects: Project[];
  backlinks: BacklinkRecord[];
};

export function buildBackup(projects: Project[], backlinks: BacklinkRecord[]): AppBackup {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    projects,
    backlinks,
  };
}

export function isAppBackup(value: unknown): value is AppBackup {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AppBackup>;
  return candidate.version === 1 && Array.isArray(candidate.projects) && Array.isArray(candidate.backlinks);
}

export async function readJsonFile(file: File) {
  const text = await file.text();
  return JSON.parse(text) as unknown;
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
