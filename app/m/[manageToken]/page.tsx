import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SimpleHeader } from "@/components/SimpleHeader";
import { PreviewCard } from "@/components/PreviewCard";
import { SeatList } from "@/components/SeatList";
import { getTableByManageToken, listInvitations, seatsFor, venueLabel } from "@/lib/tables";
import { formatSlotLong, tzLabel } from "@/lib/time";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your table" };

const statusCopy: Record<string, string> = {
  requested: "Requested. We are confirming the time and place.",
  recruiting: "Inviting guests. Confirmed guests appear below as they say yes.",
  confirmed: "Confirmed.",
  done: "This table has happened.",
  cancelled: "This table was cancelled.",
};

export default async function ManagePage({ params }: { params: Promise<{ manageToken: string }> }) {
  const { manageToken } = await params;
  const table = await getTableByManageToken(manageToken);
  if (!table) notFound();
  const invitations = await listInvitations(table.id);
  const seats = seatsFor(table, invitations);
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col gap-5 px-5 pb-7 pt-5">
      <SimpleHeader />
      <div className="flex flex-col gap-1.5">
        <p className="eyebrow text-accent" style={{ fontSize: 13 }}>Your table</p>
        <h1 className="m-0 font-heading text-[28px] font-bold leading-[1.1] tracking-[-0.02em]">{table.title}</h1>
        <p className="m-0 text-[15px] leading-[1.5] text-body">{statusCopy[table.status] ?? table.status}</p>
      </div>

      {table.final_starts_at_utc && (
        <div className="card flex flex-col gap-1 p-4">
          <p className="m-0 text-[13px] text-muted">Confirmed time and place</p>
          <p className="m-0 text-[15px] font-semibold">
            {formatSlotLong(table.final_starts_at_utc, table.timezone)} · {tzLabel(table.timezone)}
          </p>
          <p className="m-0 text-sm text-body">
            {table.venue_name ?? `Downtown ${table.city_name}, address to follow`}
            {table.venue_address ? `, ${table.venue_address}` : ""}
          </p>
        </div>
      )}

      <PreviewCard
        data={{
          cityName: table.city_name,
          hostCompany: table.host_company,
          title: table.title,
          about: table.about,
          who: table.who,
          timeOptions: table.time_options.map((o) => o.startsAtUtc),
          finalStartsAt: table.final_starts_at_utc,
          timezone: table.timezone,
          durationMin: table.duration_min,
          venueLabel: venueLabel(table),
          seatTarget: table.seat_target,
          seatsTaken: seats.length,
        }}
      />

      <div className="card flex flex-col gap-3.5 p-4">
        <div className="flex items-center justify-between">
          <p className="m-0 text-[13px] text-muted">At the table</p>
          <p className="m-0 text-[13px] font-semibold">
            {seats.length} of {table.seat_target} seats taken
          </p>
        </div>
        <SeatList seats={seats} seatTarget={table.seat_target} />
      </div>
    </div>
  );
}
