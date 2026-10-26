import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const name = String(body.name ?? "").trim().slice(0, 120);
  const email = String(body.email ?? "").trim().slice(0, 200);
  const linkedin = String(body.linkedin ?? "").trim().slice(0, 300) || null;
  const city = String(body.city ?? "").trim().slice(0, 160) || null;
  const topics = Array.isArray(body.topics) ? body.topics.map((t: unknown) => String(t).slice(0, 80)).slice(0, 20) : [];
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "Please add your name and a valid email." }, { status: 400 });
  }
  await query(`INSERT INTO sr_interest (name, email, linkedin, city, topics) VALUES ($1, $2, $3, $4, $5)`, [name, email, linkedin, city, topics]);
  return NextResponse.json({ ok: true });
}
