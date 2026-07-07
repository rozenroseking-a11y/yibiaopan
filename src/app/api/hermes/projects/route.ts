import { NextResponse } from "next/server";
import { getHermesStorageStatus, loadHermesProjects } from "@/lib/hermes-ingest";

export const runtime = "nodejs";

export async function GET() {
  const projects = await loadHermesProjects();

  return NextResponse.json({
    ok: true,
    projects,
    storage: getHermesStorageStatus(),
  });
}
