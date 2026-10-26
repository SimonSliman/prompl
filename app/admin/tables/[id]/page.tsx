import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { TableForm } from "@/components/admin/TableForm";
import { StatusPill } from "@/components/admin/StatusPill";
import { CopyButton } from "@/components/admin/CopyButton";
import { ActionButton } from "@/components/admin/ActionButton";
import { SendInviteForm } from "@/components/admin/SendInviteForm";
import {
  addGuestAction, addGuestsCsvAction, adminUpdateTableAction, deleteGuestAction, requireAdmin, sendFinalDetailsAction, sendInviteAction,
  sendReminderAction, sendTestEmailsAction, setGuestStatusAction, updateGuestAction,
} from "@/lib/admin-actions";
import { getTableById, listInvitations } from "@/lib/tables";
import { appUrl, config } from "@/lib/config";
import { formatSlot } from "@/lib/time";
import { inviteStatuses } from "@/lib/types";
import { query } from "@/lib/db";
import type { EmailLogRow } from "@/lib/types";

export const dynamic = "force-dynamic";

function when(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function TableDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const table = await getTableById(id);
  if (!table) notFound();
  const guests = await listInvitations(id);
  const log = await query<EmailLogRow>(`SELECT * FROM sr_email_log WHERE table_id = $1 ORDER BY created_at DESC LIMIT 30`, [id]);
  const seated = guests.filter((g) => ["accepted", "attended"].includes(g.status)).length + 1;
  const previewGuest = guests[0];

  const updateTable = adminUpdateTableAction.bind(null, id);
  const addGuest = addGuestAction.bind(null, id);
  const addCsv = async (fd: FormData) => {
    "use server";
    await addGuestsCsvAction(id, fd);
  };

  return (
    <AdminShell
      title={table.title}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={table.status} />
          <span className="text-sm font-semibold">{seated} / {table.seat_target} seats</span>
          {previewGuest ? (
            <a href={`${config.basePath}/i/${previewGuest.token}?preview=1`} target="_blank" rel="noreferrer" className="btn btn-outline min-h-[36px] text-sm">
              Open guest preview
            </a>
          ) : (
            <span className="text-xs text-muted">Add a guest to preview</span>
          )}
          <Link href={`/m/${table.manage_token}`} target="_blank" className="btn btn-outline min-h-[36px] text-sm">
            Host view
          </Link>
        </div>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <ActionButton action={sendFinalDetailsAction.bind(null, id)} label="Send final details to confirmed guests" className="btn btn-ink min-h-[40px] text-sm" confirm={table.final_starts_at_utc ? "Send final details to every confirmed guest with an email?" : "No final time is set yet. Send anyway?"} />
        <ActionButton action={sendReminderAction.bind(null, id)} label="Send reminder to confirmed guests" className="btn btn-ink min-h-[40px] text-sm" confirm="Send a reminder to every confirmed guest with an email?" />
        <ActionButton action={sendTestEmailsAction.bind(null, id)} label="Send test email" className="btn btn-outline min-h-[40px] text-sm" />
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="m-0 font-heading text-xl font-bold">Guests</h2>
          <p className="m-0 text-sm text-muted">{guests.length} on the list</p>
        </div>

        {guests.length > 0 && (
          <div className="card overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.06em] text-muted">
                  {["Guest", "Status", "Times picked", "Question", "Invite", "Timestamps", ""].map((h, i) => (
                    <th key={i} className="border-b border-line-soft px-3 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {guests.map((g) => (
                  <tr key={g.id} className="align-top">
                    <td className="border-b border-line-soft px-3 py-3">
                      <p className="m-0 font-semibold">
                        {g.name}
                        {g.is_anchor && <span className="ml-1 rounded-full bg-accent-tint px-2 py-0.5 text-xs font-semibold text-accent">Guest of honor</span>}
                      </p>
                      <p className="m-0 text-body">{[g.title, g.company].filter(Boolean).join(", ")}</p>
                      <p className="m-0 text-xs text-muted">{g.email ?? "no email"}{g.linkedin ? ` · ${g.linkedin}` : ""}</p>
                      {g.private_note && <p className="m-0 mt-1 text-xs italic text-muted">{g.private_note}</p>}
                      <details className="mt-1">
                        <summary className="cursor-pointer text-xs font-semibold text-accent">Edit</summary>
                        <form action={updateGuestAction.bind(null, g.id)} className="mt-2 flex w-[280px] flex-col gap-2">
                          <input name="name" className="input min-h-[36px] text-sm" defaultValue={g.name} placeholder="Name" />
                          <input name="email" className="input min-h-[36px] text-sm" defaultValue={g.email ?? ""} placeholder="Email" />
                          <input name="title" className="input min-h-[36px] text-sm" defaultValue={g.title ?? ""} placeholder="Title" />
                          <input name="company" className="input min-h-[36px] text-sm" defaultValue={g.company ?? ""} placeholder="Company" />
                          <input name="linkedin" className="input min-h-[36px] text-sm" defaultValue={g.linkedin ?? ""} placeholder="LinkedIn" />
                          <textarea name="private_note" className="input text-sm" style={{ minHeight: 56 }} defaultValue={g.private_note ?? ""} placeholder="Private note" />
                          <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="is_anchor" defaultChecked={g.is_anchor} /> Guest of honor (anchor)</label>
                          <select name="status" className="input min-h-[36px] text-sm" defaultValue={g.status}>
                            {inviteStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <button type="submit" className="btn btn-ink min-h-[34px] self-start text-[13px]">Save</button>
                        </form>
                      </details>
                    </td>
                    <td className="border-b border-line-soft px-3 py-3">
                      <StatusPill status={g.status} />
                      {["accepted", "attended", "no_show"].includes(g.status) && (
                        <div className="mt-2 flex gap-1">
                          <form action={setGuestStatusAction.bind(null, g.id, "attended")}><button className="chip min-h-[28px] px-2 text-xs" type="submit" aria-pressed={g.status === "attended"}>Attended</button></form>
                          <form action={setGuestStatusAction.bind(null, g.id, "no_show")}><button className="chip min-h-[28px] px-2 text-xs" type="submit" aria-pressed={g.status === "no_show"}>No show</button></form>
                        </div>
                      )}
                    </td>
                    <td className="border-b border-line-soft px-3 py-3 text-body">
                      {g.slot_choices.length ? g.slot_choices.map((s) => <div key={s}>{formatSlot(s, table.timezone)}</div>) : <span className="text-muted">none yet</span>}
                    </td>
                    <td className="max-w-[220px] border-b border-line-soft px-3 py-3 text-body">{g.question ?? ""}</td>
                    <td className="border-b border-line-soft px-3 py-3">
                      <div className="flex min-w-[220px] flex-col items-start gap-2">
                        <CopyButton text={appUrl(`/i/${g.token}`)} />
                        <SendInviteForm action={sendInviteAction.bind(null, g.id)} hasEmail={!!g.email} alreadySent={!!g.invited_at} />
                      </div>
                    </td>
                    <td className="border-b border-line-soft px-3 py-3 text-xs text-muted">
                      {g.invited_at && <div>Invited {when(g.invited_at)}</div>}
                      {g.responded_at && <div>Responded {when(g.responded_at)}</div>}
                      {g.final_details_sent_at && <div>Final details {when(g.final_details_sent_at)}</div>}
                      {g.reminder_sent_at && <div>Reminder {when(g.reminder_sent_at)}</div>}
                      <div>Added {when(g.created_at)}</div>
                    </td>
                    <td className="border-b border-line-soft px-3 py-3">
                      <form action={deleteGuestAction.bind(null, g.id)}>
                        <button type="submit" className="border-0 bg-transparent p-0 text-xs text-muted hover:text-[#B42318]">Remove</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <form action={addGuest} className="card flex flex-col gap-3 p-5">
            <h3 className="m-0 font-heading text-base font-bold">Add a guest</h3>
            <div className="grid grid-cols-2 gap-3">
              <input name="name" className="input" placeholder="Full name" required />
              <input name="email" type="email" className="input" placeholder="Email (optional)" />
              <input name="title" className="input" placeholder="Title" />
              <input name="company" className="input" placeholder="Company" />
              <input name="linkedin" className="input col-span-2" placeholder="LinkedIn" />
            </div>
            <textarea name="private_note" className="input" style={{ minHeight: 60 }} placeholder="Private note (never shown to guests)" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_anchor" /> Guest of honor (anchor, listed first)</label>
            <button type="submit" className="btn btn-ink self-start">Add guest</button>
          </form>
          <form action={addCsv} className="card flex flex-col gap-3 p-5">
            <h3 className="m-0 font-heading text-base font-bold">Paste CSV</h3>
            <p className="helper m-0">One guest per line: <code>name,email,title,company,linkedin</code>. Email and the rest are optional.</p>
            <textarea name="csv" className="input font-mono text-[13px]" style={{ minHeight: 140 }} placeholder={"Jordan Lee,jordan@example.com,VP Claims,Regional Insurer,linkedin.com/in/jordanlee"} />
            <button type="submit" className="btn btn-ink self-start">Add guests</button>
          </form>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="m-0 font-heading text-xl font-bold">Table details</h2>
        <TableForm table={table} action={updateTable} submitLabel="Save table" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 font-heading text-xl font-bold">Email log</h2>
        {log.length === 0 ? (
          <p className="m-0 text-sm text-muted">Nothing sent yet.</p>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <tbody>
                {log.map((l) => (
                  <tr key={l.id}>
                    <td className="border-b border-line-soft px-3 py-2 text-muted">{when(l.created_at)}</td>
                    <td className="border-b border-line-soft px-3 py-2 font-semibold">{l.template}</td>
                    <td className="border-b border-line-soft px-3 py-2">{l.to}</td>
                    <td className="border-b border-line-soft px-3 py-2" style={{ color: l.error ? "#B42318" : "var(--success)" }}>{l.error ?? `sent ${l.resend_id ?? ""}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
