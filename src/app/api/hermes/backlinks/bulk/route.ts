import { NextResponse } from "next/server";
import { ingestHermesBacklinks, getHermesStorageStatus } from "@/lib/hermes-ingest";
import type { HermesBulkPayload } from "@/lib/hermes-ingest";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.HERMES_INGEST_TOKEN ?? ""}`;

  if (!process.env.HERMES_INGEST_TOKEN || auth !== expected) {
    return unauthorized();
  }

  let body: HermesBulkPayload;
  try {
    body = (await req.json()) as HermesBulkPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!body || !Array.isArray(body.records)) {
    return NextResponse.json({ ok: false, error: "records_must_be_array" }, { status: 400 });
  }

  try {
    const result = await ingestHermesBacklinks(body);
    return NextResponse.json({ ok: true, ...result, storage: getHermesStorageStatus() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ingest_failed";
    const storage = getHermesStorageStatus();
    const status = message.includes("persistent_storage_not_configured") ? 503 : 500;
    return NextResponse.json({ ok: false, error: message, storage }, { status });
  }
}
