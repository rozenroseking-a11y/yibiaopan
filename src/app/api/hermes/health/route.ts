import { NextResponse } from "next/server";
import { getHermesStorageStatus } from "@/lib/hermes-ingest";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({ ok: true, storage: getHermesStorageStatus() });
}
