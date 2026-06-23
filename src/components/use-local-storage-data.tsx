"use client";

import { useEffect, useState } from "react";
import { DEFAULT_BACKLINKS, DEFAULT_PROJECTS, loadBacklinks, loadProjects, saveBacklinks, saveProjects } from "@/lib/mock-data";
import { BacklinkRecord, Project } from "@/lib/types";

export function useStoredProjects() {
  const [projects, setProjects] = useState<Project[]>(() => (typeof window === "undefined" ? DEFAULT_PROJECTS : loadProjects()));

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  return [projects, setProjects] as const;
}

export function useStoredBacklinks() {
  const [records, setRecords] = useState<BacklinkRecord[]>(() => (typeof window === "undefined" ? DEFAULT_BACKLINKS : loadBacklinks()));

  useEffect(() => {
    saveBacklinks(records);
  }, [records]);

  return [records, setRecords] as const;
}
