import { BacklinkRecord } from "./types";

function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function recordsToCsv(records: BacklinkRecord[]) {
  const headers = [
    "projectName",
    "platformDomain",
    "platformType",
    "executionStatus",
    "reviewStatus",
    "publishedAt",
    "recordedAt",
    "sourcePageUrl",
    "indexedUrl",
    "notes",
  ];
  const rows = records.map((record) => [
    record.projectName,
    record.platformDomain,
    record.platformType,
    record.executionStatus,
    record.reviewStatus,
    record.publishedAt,
    record.recordedAt,
    record.sourcePageUrl,
    record.indexedUrl,
    record.notes,
  ]);
  return [headers.join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join("\n");
}

export function downloadText(filename: string, content: string, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
