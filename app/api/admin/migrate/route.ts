import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { migrations, runMigrations } from "@/lib/migrations";

export const dynamic = "force-dynamic";

// POST /api/admin/migrate
// Auth: Authorization: Bearer <ADMIN_PASSWORD> (or x-admin-password header)
// Body (optional): { "names": ["sr_001_tables"] } to run a whitelisted subset.
export async function POST(req: Request) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let names: string[] | undefined;
  try {
    const body = await req.json().catch(() => null);
    if (body && Array.isArray(body.names)) names = body.names.map(String);
  } catch {
    names = undefined;
  }
  const known = new Set(migrations.map((m) => m.name));
  if (names) {
    const bad = names.filter((n) => !known.has(n));
    if (bad.length) return NextResponse.json({ error: "unknown migration", bad, known: [...known] }, { status: 400 });
  }
  try {
    const result = await runMigrations(names);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  if (!(await isAdminRequest(req))) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ known: migrations.map((m) => m.name) });
}
