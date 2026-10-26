import { NextResponse } from "next/server";
import { citiesInView } from "@/lib/cities";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const bbox = (url.searchParams.get("bbox") ?? "").split(",").map(Number);
  const minPop = Math.max(15000, Number(url.searchParams.get("minPop") ?? 100000) || 100000);
  if (bbox.length !== 4 || bbox.some((n) => Number.isNaN(n))) {
    return NextResponse.json({ error: "bbox=west,south,east,north required" }, { status: 400 });
  }
  const results = citiesInView(bbox as [number, number, number, number], minPop);
  return NextResponse.json({ results }, { headers: { "cache-control": "public, max-age=3600" } });
}
