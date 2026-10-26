import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin-actions";
import { listTables } from "@/lib/tables";
import { formatSlot } from "@/lib/time";
import { StatusPill } from "@/components/admin/StatusPill";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  await requireAdmin();
  const tables = await listTables();
  return (
    <AdminShell
      title="Tables"
      actions={
        <Link href="/admin/tables/new" className="btn btn-ink">
          New table
        </Link>
      }
    >
      {tables.length === 0 ? (
        <p className="m-0 text-body">No tables yet.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.06em] text-muted">
                {["City", "Title", "Host company", "Times", "Status", "Seats"].map((h) => (
                  <th key={h} className="border-b border-line-soft px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tables.map((t) => (
                <tr key={t.id} className="align-top hover:bg-ground">
                  <td className="border-b border-line-soft px-4 py-3 font-semibold">{t.city_name}</td>
                  <td className="border-b border-line-soft px-4 py-3">
                    <Link href={`/admin/tables/${t.id}`} className="font-semibold text-ink hover:text-accent">{t.title}</Link>
                  </td>
                  <td className="border-b border-line-soft px-4 py-3">{t.host_company}</td>
                  <td className="border-b border-line-soft px-4 py-3 text-body">
                    {t.final_starts_at_utc ? (
                      <strong>{formatSlot(t.final_starts_at_utc, t.timezone)}</strong>
                    ) : (
                      t.time_options.map((o) => <div key={o.startsAtUtc}>{formatSlot(o.startsAtUtc, t.timezone)}</div>)
                    )}
                  </td>
                  <td className="border-b border-line-soft px-4 py-3"><StatusPill status={t.status} /></td>
                  <td className="border-b border-line-soft px-4 py-3 font-semibold">{t.accepted + 1} / {t.seat_target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
