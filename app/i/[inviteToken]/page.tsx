import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getInvitationByToken, getTableById, listInvitations, seatsFor } from "@/lib/tables";
import { formatSlot, formatSlotLong, tzLabel } from "@/lib/time";
import { GuestView } from "./GuestView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ inviteToken: string }> }): Promise<Metadata> {
  const { inviteToken } = await params;
  const inv = await getInvitationByToken(inviteToken);
  const table = inv ? await getTableById(inv.table_id) : null;
  return { title: table ? `${table.title}: you are invited` : "Invitation", robots: { index: false, follow: false } };
}

export default async function InvitePage({ params }: { params: Promise<{ inviteToken: string }> }) {
  const { inviteToken } = await params;
  const inv = await getInvitationByToken(inviteToken);
  if (!inv) notFound();
  const table = await getTableById(inv.table_id);
  if (!table) notFound();
  const invitations = await listInvitations(table.id);
  const seats = seatsFor(table, invitations);
  const tz = table.timezone;
  const placeLine = table.venue_name
    ? `${tzLabel(tz)} · ${table.venue_name}${table.venue_address ? `, ${table.venue_address}` : ""}`
    : `${tzLabel(tz)} · downtown ${table.city_name} · address sent with the final time`;

  return (
    <GuestView
      token={inv.token}
      firstName={inv.first_name}
      guest={{ name: inv.name, title: inv.title ?? "", company: inv.company ?? "", isAnchor: inv.is_anchor }}
      initialStatus={inv.status}
      initialSlots={inv.slot_choices}
      initialQuestion={inv.question ?? ""}
      table={{
        title: table.title,
        city: table.city_name,
        hostCompany: table.host_company,
        durationMin: table.duration_min,
        seatTarget: table.seat_target,
        status: table.status,
        finalLabel: table.final_starts_at_utc ? formatSlotLong(table.final_starts_at_utc, tz) : null,
        options: table.time_options.map((o) => ({ iso: o.startsAtUtc, label: formatSlot(o.startsAtUtc, tz) })),
        placeLine,
      }}
      seats={seats}
      isSeated={["accepted", "attended"].includes(inv.status)}
    />
  );
}
