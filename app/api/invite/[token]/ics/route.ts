import { getInvitationByToken, getTableById } from "@/lib/tables";
import { buildIcs } from "@/lib/ics";
import { config } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await getInvitationByToken(token);
  const table = inv ? await getTableById(inv.table_id) : null;
  if (!inv || !table || !table.final_starts_at_utc) return new Response("No final time yet", { status: 404 });
  const location = table.venue_name ? `${table.venue_name}${table.venue_address ? ", " + table.venue_address : ""}` : `${table.city_name} (address to follow)`;
  const ics = buildIcs({
    uid: `${table.id}-${inv.id}`,
    title: `Smallroom: ${table.title}`,
    description: `A table of seven in ${table.city_name}, hosted by ${table.host_company}. No pitching.`,
    location,
    startsAt: new Date(table.final_starts_at_utc),
    durationMin: table.duration_min,
    organizerEmail: config.mailReplyTo || undefined,
  });
  return new Response(ics, { headers: { "content-type": "text/calendar; charset=utf-8", "content-disposition": 'attachment; filename="smallroom.ics"' } });
}
