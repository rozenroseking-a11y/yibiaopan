import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "backlink-dashboard",
    version: "1.0.0",
  });
}
