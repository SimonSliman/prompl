import { NextResponse } from "next/server";
import { searchCities } from "@/lib/cities";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").slice(0, 80);
  const results = q.trim().length ? searchCities(q, 8) : [];
  return NextResponse.json({ results }, { headers: { "cache-control": "public, max-age=3600" } });
}
