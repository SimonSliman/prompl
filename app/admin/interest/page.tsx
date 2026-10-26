import { AdminShell } from "@/components/admin/AdminShell";
import { addInterestToTableAction, requireAdmin } from "@/lib/admin-actions";
import { query } from "@/lib/db";
import { listTables } from "@/lib/tables";
import type { InterestRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function InterestPage() {
  await requireAdmin();
  const rows = await query<InterestRow>(`SELECT * FROM sr_interest ORDER BY created_at DESC`);
  const tables = await listTables();
  return (
    <AdminShell title="Interest list">
      {rows.length === 0 ? (
        <p className="m-0 text-body">Nobody has left their name yet.</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.06em] text-muted">
                {["Name", "Email", "LinkedIn", "City", "Topics", "Added", "Add to table"].map((h) => (
                  <th key={h} className="border-b border-line-soft px-3 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="border-b border-line-soft px-3 py-3 font-semibold">{r.name}</td>
                  <td className="border-b border-line-soft px-3 py-3">{r.email}</td>
                  <td className="border-b border-line-soft px-3 py-3 text-body">{r.linkedin ?? ""}</td>
                  <td className="border-b border-line-soft px-3 py-3 text-body">{r.city ?? ""}</td>
                  <td className="border-b border-line-soft px-3 py-3 text-body">{r.topics.join(", ")}</td>
                  <td className="border-b border-line-soft px-3 py-3 text-xs text-muted">{new Date(r.created_at).toLocaleDateString("en-US")}</td>
                  <td className="border-b border-line-soft px-3 py-3">
                    <form action={addInterestToTableAction} className="flex gap-2">
                      <input type="hidden" name="interest_id" value={r.id} />
                      <select name="table_id" className="input min-h-[36px] w-[220px] text-sm" defaultValue="">
                        <option value="" disabled>Choose a table</option>
                        {tables.map((t) => (
                          <option key={t.id} value={t.id}>{t.city_name}: {t.title}</option>
                        ))}
                      </select>
                      <button type="submit" className="btn btn-ink min-h-[36px] text-sm">Add</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}
