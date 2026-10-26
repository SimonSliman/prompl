import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SimpleHeader } from "@/components/SimpleHeader";
import { PreviewCard } from "@/components/PreviewCard";
import { getTableByManageToken, listInvitations, seatsFor, venueLabel } from "@/lib/tables";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your table is requested" };

export default async function DonePage({ params }: { params: Promise<{ manageToken: string }> }) {
  const { manageToken } = await params;
  const table = await getTableByManageToken(manageToken);
  if (!table) notFound();
  const seats = seatsFor(table, await listInvitations(table.id));
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col gap-5 px-5 pb-7 pt-5">
      <SimpleHeader />
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 font-heading text-[28px] font-bold leading-[1.1] tracking-[-0.02em]">Your table is requested.</h1>
        <p className="m-0 text-[15px] leading-[1.5] text-body">
          We sent a copy to {table.host_email}. We confirm the time, place and first guests within two business days.
        </p>
      </div>
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
      <p className="m-0 text-[15px] text-body">
        Keep this link to follow who is coming:{" "}
        <Link href={`/m/${table.manage_token}`} className="font-semibold">
          your table
        </Link>
        .
      </p>
    </div>
  );
}
