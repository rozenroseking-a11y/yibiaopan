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

type StoredHermesBacklinkRecord = HermesBacklinkRecordInput & {
  id: string;
  source: string;
  dedupeKey: string;
  recommendedMethod: string;
  createdAt: string;
  updatedAt: string;
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
  const externalId = trimOrEmpty(record.externalId);
  if (externalId) return `externalId:${externalId}`;
  return `fallback:${trimOrEmpty(record.project)}|${trimOrEmpty(record.sourcePageUrl)}|${trimOrEmpty(record.publishedAt)}`;
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
  await fs.mkdir(path.dirname(STORE_FILE), { recursive: true });
  const tmpPath = `${STORE_FILE}.tmp-${randomUUID()}`;
  await fs.writeFile(tmpPath, JSON.stringify(store, null, 2), "utf8");
  await fs.rename(tmpPath, STORE_FILE);
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
  return loadStore();
}
