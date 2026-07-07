import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { randomUUID } from "node:crypto";

export type HermesBacklinkRecordInput = {
  externalId?: string;
  project: string;
  projectName: string;
  promotionWebsite: string;
  submitName: string;
  submitEmail: string;
  platformDomain: string;
  sourcePageUrl: string;
  platformType: string;
  generatedContent: string;
  executionStatus?: string;
  reviewStatus?: string;
  publishedAt: string;
  recordedAt: string;
  indexedUrl?: string;
  notes?: string;
  rawStatus?: string;
  confidence?: string;
  evidence?: string;
  source?: string;
  recommendedMethod?: string;
};

export type HermesBulkPayload = {
  source?: string;
  records?: HermesBacklinkRecordInput[];
};

export type StoredHermesBacklinkRecord = HermesBacklinkRecordInput & {
  id: string;
  source: string;
  dedupeKey: string;
  recommendedMethod: string;
  executionStatus: string;
  reviewStatus: string;
  indexedUrl: string;
  notes: string;
  rawStatus: string;
  confidence: string;
  evidence: string;
  createdAt: string;
  updatedAt: string;
};

export type HermesProjectSummary = {
  id: string;
  name: string;
  websiteUrl: string;
  projectType: string;
  defaultSubmitName: string;
  defaultSubmitEmail: string;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalBacklinks: number;
  submittedCount: number;
  approvedCount: number;
  reviewingCount: number;
  failedCount: number;
  lastRecordedAt: string;
};

type HermesStoreFile = {
  version: number;
  records: StoredHermesBacklinkRecord[];
};

export type HermesBulkResult = {
  inserted: number;
  updated: number;
  skipped: number;
};

const STORE_DIR = process.env.HERMES_INGEST_STORE_DIR || path.join(os.tmpdir(), "hermes-backlink-dashboard");
const STORE_FILE = process.env.HERMES_INGEST_STORE_PATH || path.join(STORE_DIR, "hermes-backlinks.json");
const KV_REST_API_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const KV_STORE_KEY = process.env.HERMES_INGEST_KV_KEY || "hermes:backlink-dashboard:backlinks";
const IS_PRODUCTION_RUNTIME = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";

export function getHermesStorageStatus() {
  const persistent = Boolean(KV_REST_API_URL && KV_REST_API_TOKEN);
  return {
    backend: persistent ? "upstash-redis" : "temporary-file",
    persistent,
    key: KV_STORE_KEY,
  };
}

const KNOWN_EXECUTION_STATUSES = new Set([
  "待填写",
  "已填写待确认",
  "已提交",
  "已提交待确认",
  "待审核",
  "失败",
]);

const KNOWN_REVIEW_STATUSES = new Set(["未检查", "审核中", "通过", "拒绝", "不确定"]);

function trimOrEmpty(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeExecutionStatus(record: HermesBacklinkRecordInput) {
  const provided = trimOrEmpty(record.executionStatus);
  if (KNOWN_EXECUTION_STATUSES.has(provided)) return provided;

  const raw = trimOrEmpty(record.rawStatus).toLowerCase();
  const confidence = trimOrEmpty(record.confidence).toLowerCase();

  if (raw === "fail" || raw === "captcha" || raw === "login" || raw === "blocked") return "失败";
  if (raw === "pending") return "待审核";
  if (raw === "submitted") {
    if (confidence === "visible_or_public_url") return "已提交";
    return "已提交待确认";
  }

  return "已提交待确认";
}

function normalizeReviewStatus(record: HermesBacklinkRecordInput) {
  const provided = trimOrEmpty(record.reviewStatus);
  if (KNOWN_REVIEW_STATUSES.has(provided)) return provided;

  const raw = trimOrEmpty(record.rawStatus).toLowerCase();
  const confidence = trimOrEmpty(record.confidence).toLowerCase();

  if (raw === "fail" || raw === "captcha" || raw === "login" || raw === "blocked") return "拒绝";
  if (raw === "pending") return "审核中";
  if (raw === "submitted") {
    if (confidence === "visible_or_public_url") return "通过";
    return "审核中";
  }

  return "未检查";
}

function dedupeKeyFor(record: HermesBacklinkRecordInput) {
  return `externalId:${trimOrEmpty(record.externalId)}`;
}

function normalizeRecord(record: HermesBacklinkRecordInput, source: string, existing?: StoredHermesBacklinkRecord): StoredHermesBacklinkRecord {
  const now = new Date().toISOString();
  const dedupeKey = dedupeKeyFor(record);

  return {
    id: existing?.id ?? randomUUID(),
    dedupeKey,
    source: trimOrEmpty(record.source) || source || existing?.source || "hermes-growth-agent",
    externalId: trimOrEmpty(record.externalId),
    project: trimOrEmpty(record.project),
    projectName: trimOrEmpty(record.projectName),
    promotionWebsite: trimOrEmpty(record.promotionWebsite),
    submitName: trimOrEmpty(record.submitName),
    submitEmail: trimOrEmpty(record.submitEmail),
    platformDomain: trimOrEmpty(record.platformDomain),
    sourcePageUrl: trimOrEmpty(record.sourcePageUrl),
    platformType: trimOrEmpty(record.platformType),
    recommendedMethod: trimOrEmpty(record.recommendedMethod) || "Hermes 自动同步",
    generatedContent: typeof record.generatedContent === "string" ? record.generatedContent : "",
    executionStatus: normalizeExecutionStatus(record),
    reviewStatus: normalizeReviewStatus(record),
    publishedAt: trimOrEmpty(record.publishedAt),
    recordedAt: trimOrEmpty(record.recordedAt),
    indexedUrl: trimOrEmpty(record.indexedUrl),
    notes: typeof record.notes === "string" ? record.notes : "",
    rawStatus: trimOrEmpty(record.rawStatus),
    confidence: trimOrEmpty(record.confidence),
    evidence: typeof record.evidence === "string" ? record.evidence : "",
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

function isSameRecord(a: StoredHermesBacklinkRecord, b: StoredHermesBacklinkRecord) {
  const comparableKeys: (keyof StoredHermesBacklinkRecord)[] = [
    "dedupeKey",
    "source",
    "externalId",
    "project",
    "projectName",
    "promotionWebsite",
    "submitName",
    "submitEmail",
    "platformDomain",
    "sourcePageUrl",
    "platformType",
    "generatedContent",
    "executionStatus",
    "reviewStatus",
    "publishedAt",
    "recordedAt",
    "indexedUrl",
    "notes",
    "rawStatus",
    "confidence",
    "evidence",
  ];

  return comparableKeys.every((key) => a[key] === b[key]);
}

async function loadStore(): Promise<HermesStoreFile> {
  const kvStore = await loadStoreFromKv();
  if (kvStore) return kvStore;

  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<HermesStoreFile>;
    if (!parsed || !Array.isArray(parsed.records)) {
      return { version: 1, records: [] };
    }
    return { version: parsed.version ?? 1, records: parsed.records as StoredHermesBacklinkRecord[] };
  } catch {
    return { version: 1, records: [] };
  }
}

async function saveStore(store: HermesStoreFile) {
  if (await saveStoreToKv(store)) return;

  if (IS_PRODUCTION_RUNTIME) {
    throw new Error("persistent_storage_not_configured: set KV_REST_API_URL and KV_REST_API_TOKEN, or UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN");
  }

  await fs.mkdir(path.dirname(STORE_FILE), { recursive: true });
  const tmpPath = `${STORE_FILE}.tmp-${randomUUID()}`;
  await fs.writeFile(tmpPath, JSON.stringify(store, null, 2), "utf8");
  await fs.rename(tmpPath, STORE_FILE);
}

async function kvCommand<T>(command: unknown[]): Promise<T | null> {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) return null;

  const response = await fetch(KV_REST_API_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${KV_REST_API_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    throw new Error(`KV command failed: ${response.status}`);
  }

  const payload = (await response.json()) as { result?: T | null };
  return payload.result ?? null;
}

async function loadStoreFromKv(): Promise<HermesStoreFile | null> {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) return null;

  try {
    const raw = await kvCommand<string | HermesStoreFile>(["GET", KV_STORE_KEY]);
    if (!raw) return { version: 1, records: [] };
    const parsed = typeof raw === "string" ? (JSON.parse(raw) as Partial<HermesStoreFile>) : raw;
    if (!parsed || !Array.isArray(parsed.records)) return { version: 1, records: [] };
    return { version: parsed.version ?? 1, records: parsed.records as StoredHermesBacklinkRecord[] };
  } catch (error) {
    console.error("Failed to load Hermes backlink store from KV, falling back to file store", error);
    return null;
  }
}

async function saveStoreToKv(store: HermesStoreFile): Promise<boolean> {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) return false;

  try {
    await kvCommand(["SET", KV_STORE_KEY, JSON.stringify(store)]);
    return true;
  } catch (error) {
    console.error("Failed to save Hermes backlink store to KV, falling back to file store", error);
    return false;
  }
}

export async function ingestHermesBacklinks(payload: HermesBulkPayload): Promise<HermesBulkResult> {
  const source = trimOrEmpty(payload.source) || "hermes-growth-agent";
  const records = Array.isArray(payload.records) ? payload.records : [];
  const store = await loadStore();
  const indexByKey = new Map(store.records.map((item) => [item.dedupeKey, item] as const));

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const incoming of records) {
    if (!trimOrEmpty(incoming.externalId)) {
      skipped += 1;
      continue;
    }

    const dedupeKey = dedupeKeyFor(incoming);
    const existing = indexByKey.get(dedupeKey);
    const next = normalizeRecord(incoming, source, existing);

    if (!existing) {
      store.records.push(next);
      indexByKey.set(dedupeKey, next);
      inserted += 1;
      continue;
    }

    if (isSameRecord(existing, next)) {
      skipped += 1;
      continue;
    }

    const merged = { ...existing, ...next, id: existing.id, createdAt: existing.createdAt, updatedAt: next.updatedAt };
    const position = store.records.findIndex((item) => item.dedupeKey === dedupeKey);
    if (position >= 0) {
      store.records[position] = merged;
    }
    indexByKey.set(dedupeKey, merged);
    updated += 1;
  }

  await saveStore(store);
  return { inserted, updated, skipped };
}

export async function loadHermesBacklinkStore() {
  const store = await loadStore();
  return { ...store, records: getVisibleHermesRecords(store.records) };
}

export async function loadHermesProjects(): Promise<HermesProjectSummary[]> {
  const store = await loadHermesBacklinkStore();
  const projects = new Map<string, HermesProjectSummary>();

  for (const record of store.records) {
    const projectId = trimOrEmpty(record.project);
    if (!projectId) continue;

    const recordedAt = trimOrEmpty(record.recordedAt) || trimOrEmpty(record.updatedAt) || trimOrEmpty(record.createdAt);
    const existing = projects.get(projectId);
    const project: HermesProjectSummary = existing ?? {
      id: projectId,
      name: trimOrEmpty(record.projectName) || projectId,
      websiteUrl: trimOrEmpty(record.promotionWebsite),
      projectType: "Hermes 自动同步",
      defaultSubmitName: trimOrEmpty(record.submitName),
      defaultSubmitEmail: trimOrEmpty(record.submitEmail),
      notes: "从 Hermes backlink 记录自动聚合",
      isActive: true,
      createdAt: trimOrEmpty(record.createdAt) || recordedAt || new Date().toISOString(),
      updatedAt: trimOrEmpty(record.updatedAt) || recordedAt || new Date().toISOString(),
      totalBacklinks: 0,
      submittedCount: 0,
      approvedCount: 0,
      reviewingCount: 0,
      failedCount: 0,
      lastRecordedAt: "",
    };

    project.name = project.name || trimOrEmpty(record.projectName) || projectId;
    project.websiteUrl = project.websiteUrl || trimOrEmpty(record.promotionWebsite);
    project.defaultSubmitName = project.defaultSubmitName || trimOrEmpty(record.submitName);
    project.defaultSubmitEmail = project.defaultSubmitEmail || trimOrEmpty(record.submitEmail);
    project.totalBacklinks += 1;
    if (["已提交", "已提交待确认", "待审核"].includes(record.executionStatus)) project.submittedCount += 1;
    if (record.reviewStatus === "通过") project.approvedCount += 1;
    if (record.reviewStatus === "审核中" || record.executionStatus === "待审核" || record.executionStatus === "已提交待确认") project.reviewingCount += 1;
    if (record.executionStatus === "失败" || record.reviewStatus === "拒绝") project.failedCount += 1;
    if (recordedAt && (!project.lastRecordedAt || +new Date(recordedAt) > +new Date(project.lastRecordedAt))) {
      project.lastRecordedAt = recordedAt;
    }
    if (recordedAt && +new Date(recordedAt) > +new Date(project.updatedAt || 0)) {
      project.updatedAt = recordedAt;
    }

    projects.set(projectId, project);
  }

  return [...projects.values()].sort((a, b) => b.totalBacklinks - a.totalBacklinks || a.name.localeCompare(b.name));
}

function getVisibleHermesRecords(records: StoredHermesBacklinkRecord[]) {
  return records.filter((record) => !isInternalTestRecord(record));
}

function isInternalTestRecord(record: StoredHermesBacklinkRecord) {
  const externalId = trimOrEmpty(record.externalId).toLowerCase();
  const notes = trimOrEmpty(record.notes);
  return externalId.startsWith("health-test-") || notes === "接口联调测试记录";
}
