import { NextResponse } from "next/server";
import { getHermesStorageStatus, loadHermesBacklinkStore } from "@/lib/hermes-ingest";

export const runtime = "nodejs";

export async function GET() {
  const store = await loadHermesBacklinkStore();
  const records = [...store.records].sort((a, b) => +new Date(b.recordedAt || b.updatedAt) - +new Date(a.recordedAt || a.updatedAt));

  return NextResponse.json({
    ok: true,
    records,
    total: records.length,
    storage: getHermesStorageStatus(),
  });
}
