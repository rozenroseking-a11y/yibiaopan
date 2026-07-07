import { NextResponse } from "next/server";
import { loadHermesProjects } from "@/lib/hermes-ingest";

export const runtime = "nodejs";

export async function GET() {
  const projects = await loadHermesProjects();

  return NextResponse.json({
    ok: true,
    projects,
  });
}
