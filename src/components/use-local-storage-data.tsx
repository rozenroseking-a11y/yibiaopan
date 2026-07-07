"use client";

import { useEffect, useState } from "react";
import { DEFAULT_BACKLINKS, DEFAULT_PROJECTS, loadBacklinks, loadProjects, saveBacklinks, saveProjects } from "@/lib/mock-data";
import { BacklinkRecord, PlatformType, Project } from "@/lib/types";

type HermesStoredRecord = {
  id: string;
  source?: string;
  externalId?: string;
  project: string;
  projectName: string;
  promotionWebsite: string;
  submitName: string;
  submitEmail: string;
  platformDomain: string;
  sourcePageUrl: string;
  platformType: string;
  recommendedMethod?: string;
  generatedContent: string;
  executionStatus: string;
  reviewStatus: string;
  publishedAt: string;
  recordedAt: string;
  indexedUrl: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

function normalizePlatformType(value: string): PlatformType {
  const allowed: PlatformType[] = ["博客评论", "Contact", "Submit Tool", "Profile", "论坛回复", "资源页", "其他"];
  return allowed.includes(value as PlatformType) ? (value as PlatformType) : "其他";
}

function normalizeHermesRecord(record: HermesStoredRecord): BacklinkRecord {
  return {
    id: record.id,
    projectId: record.project,
    projectName: record.projectName,
    promotionWebsite: record.promotionWebsite,
    submitName: record.submitName,
    submitEmail: record.submitEmail,
    platformDomain: record.platformDomain,
    sourcePageUrl: record.sourcePageUrl,
    platformType: normalizePlatformType(record.platformType),
    recommendedMethod: record.recommendedMethod ?? "Hermes 自动同步",
    generatedContent: record.generatedContent,
    executionStatus: record.executionStatus as BacklinkRecord["executionStatus"],
    reviewStatus: record.reviewStatus as BacklinkRecord["reviewStatus"],
    publishedAt: record.publishedAt,
    recordedAt: record.recordedAt,
    indexedUrl: record.indexedUrl,
    notes: record.notes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

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
    let cancelled = false;

    async function loadHermesBacklinks() {
      try {
        const response = await fetch("/api/hermes/backlinks", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { ok?: boolean; records?: HermesStoredRecord[]; total?: number };
        if (!payload.ok || !Array.isArray(payload.records) || payload.total === 0) return;
        if (cancelled) return;
        setRecords(payload.records.map(normalizeHermesRecord));
      } catch {
        // keep local demo data as fallback
      }
    }

    loadHermesBacklinks();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    saveBacklinks(records);
  }, [records]);

  return [records, setRecords] as const;
}
