import { NextResponse } from "next/server";
import { createTable } from "@/lib/tables";
import { emails, sendMail } from "@/lib/email";
import { config } from "@/lib/config";

export const dynamic = "force-dynamic";

const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const title = str(b.title, 80);
  const about = str(b.about, 300);
  const who = str(b.who, 200);
  const city = b.city ?? {};
  const timeOptions: { startsAtUtc: string }[] = Array.isArray(b.timeOptions)
    ? b.timeOptions.map((t: unknown) => ({ startsAtUtc: new Date(String(t)).toISOString() })).filter((t: { startsAtUtc: string }) => t.startsAtUtc !== "Invalid Date").slice(0, 3)
    : [];
  const host_email = str(b.hostEmail, 200);
  const errors: string[] = [];
  if (!title) errors.push("title");
  if (!city?.name) errors.push("city");
  if (!timeOptions.length) errors.push("times");
  if (!str(b.hostName, 120)) errors.push("name");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(host_email)) errors.push("email");
  if (!str(b.hostCompany, 120)) errors.push("company");
  if (errors.length) return NextResponse.json({ error: `Missing or invalid: ${errors.join(", ")}` }, { status: 400 });

  const duration = Number(b.durationMin);
  const table = await createTable({
    template_id: str(b.templateId, 60) || null,
    title,
    about,
    who,
    city_name: str(city.name, 120),
    city_region: str(city.region, 120) || null,
    country_code: str(city.countryCode, 2) || null,
    lat: Number.isFinite(Number(city.lat)) ? Number(city.lat) : null,
    lng: Number.isFinite(Number(city.lng)) ? Number(city.lng) : null,
    timezone: str(city.timezone, 60) || "America/New_York",
    time_options: timeOptions,
    duration_min: Number.isFinite(duration) && duration >= 15 && duration <= 480 ? Math.round(duration) : 90,
    venue_mode: b.venueMode === "own" ? "own" : "we_pick",
    venue_name: b.venueMode === "own" ? str(b.venueName, 160) || null : null,
    venue_address: b.venueMode === "own" ? str(b.venueAddress, 300) || null : null,
    host_name: str(b.hostName, 120),
    host_email,
    host_company: str(b.hostCompany, 120),
    host_role: str(b.hostRole, 120) || null,
    host_phone: str(b.hostPhone, 40) || null,
    host_linkedin: str(b.hostLinkedin, 300) || null,
    price_cents: config.priceCents,
    discount_cents: config.foundingDiscountCents,
    terms_accepted: true,
  });

  // Emails are best effort; the table exists either way.
  await sendMail("host_created", emails.host_created(table), { tableId: table.id });
  if (config.adminNotifyEmail) await sendMail("admin_new_table", emails.admin_new_table(table), { tableId: table.id });

  return NextResponse.json({ ok: true, manageToken: table.manage_token });
}
