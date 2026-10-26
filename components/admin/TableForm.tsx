import { templates } from "@/lib/templates";
import { tableStatuses, type TableRow } from "@/lib/types";
import { dateKeyIn, timeIn, formatSlot } from "@/lib/time";
import { AdminCityField } from "./AdminCityField";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {hint && <p className="helper">{hint}</p>}
    </div>
  );
}

export function TableForm({ table, action, submitLabel }: { table?: TableRow; action: (fd: FormData) => Promise<void>; submitLabel: string }) {
  const tz = table?.timezone ?? "America/New_York";
  const opts = table?.time_options ?? [];
  const slot = (i: number) => {
    const o = opts[i];
    return o ? { d: dateKeyIn(new Date(o.startsAtUtc), tz), t: timeIn(new Date(o.startsAtUtc), tz) } : { d: "", t: "" };
  };
  const finalMatches = table?.final_starts_at_utc ? opts.find((o) => o.startsAtUtc === table.final_starts_at_utc) : null;
  const finalPick = !table?.final_starts_at_utc ? "none" : finalMatches ? finalMatches.startsAtUtc : "custom";
  const finalD = table?.final_starts_at_utc ? dateKeyIn(new Date(table.final_starts_at_utc), tz) : "";
  const finalT = table?.final_starts_at_utc ? timeIn(new Date(table.final_starts_at_utc), tz) : "";

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-2">
      <section className="card flex flex-col gap-4 p-5">
        <h2 className="m-0 font-heading text-lg font-bold">Topic</h2>
        <Field label="Template">
          <select name="template_id" className="input" defaultValue={table?.template_id ?? ""}>
            <option value="">Custom</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.tag}: {t.title}</option>
            ))}
          </select>
        </Field>
        <Field label="Title (80)">
          <input name="title" className="input" maxLength={80} required defaultValue={table?.title ?? ""} />
        </Field>
        <Field label="About (300)">
          <textarea name="about" className="input" maxLength={300} defaultValue={table?.about ?? ""} />
        </Field>
        <Field label="Who (200)">
          <input name="who" className="input" maxLength={200} defaultValue={table?.who ?? ""} />
        </Field>
        <h2 className="m-0 mt-2 font-heading text-lg font-bold">City</h2>
        <AdminCityField
          initial={table ? { name: table.city_name, region: table.city_region ?? "", countryCode: table.country_code ?? "", lat: table.lat, lng: table.lng, timezone: table.timezone } : null}
        />
        <h2 className="m-0 mt-2 font-heading text-lg font-bold">Status and seats</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Status">
            <select name="status" className="input" defaultValue={table?.status ?? "requested"}>
              {tableStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Seat target (incl. host)">
            <input name="seat_target" type="number" min={2} max={20} className="input" defaultValue={table?.seat_target ?? 7} />
          </Field>
        </div>
      </section>

      <section className="card flex flex-col gap-4 p-5">
        <h2 className="m-0 font-heading text-lg font-bold">When</h2>
        <p className="helper m-0">Offered times, in the city&apos;s timezone ({tz}).</p>
        {[0, 1, 2].map((i) => (
          <div key={i} className="grid grid-cols-2 gap-3">
            <input name={`date${i + 1}`} type="date" className="input" defaultValue={slot(i).d} aria-label={`Date ${i + 1}`} />
            <input name={`time${i + 1}`} type="time" className="input" defaultValue={slot(i).t} aria-label={`Time ${i + 1}`} />
          </div>
        ))}
        <Field label="Duration (minutes)">
          <input name="duration_min" type="number" min={30} max={240} step={15} className="input" defaultValue={table?.duration_min ?? 90} />
        </Field>
        {table && (
          <>
            <Field label="Final time" hint="Pick one offered time, or enter a new one below.">
              <select name="final_pick" className="input" defaultValue={finalPick}>
                <option value="none">Not set yet</option>
                {opts.map((o) => (
                  <option key={o.startsAtUtc} value={o.startsAtUtc}>{formatSlot(o.startsAtUtc, tz)}</option>
                ))}
                <option value="custom">Other (use the date and time below)</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <input name="final_date" type="date" className="input" defaultValue={finalD} aria-label="Final date" />
              <input name="final_time" type="time" className="input" defaultValue={finalT} aria-label="Final time of day" />
            </div>
          </>
        )}
        <h2 className="m-0 mt-2 font-heading text-lg font-bold">Where</h2>
        <Field label="Venue">
          <select name="venue_mode" className="input" defaultValue={table?.venue_mode ?? "we_pick"}>
            <option value="we_pick">We choose a place</option>
            <option value="own">Host has a place</option>
          </select>
        </Field>
        <Field label="Venue name" hint="Shown to guests once set, whichever mode.">
          <input name="venue_name" className="input" defaultValue={table?.venue_name ?? ""} />
        </Field>
        <Field label="Address">
          <input name="venue_address" className="input" defaultValue={table?.venue_address ?? ""} />
        </Field>
        <h2 className="m-0 mt-2 font-heading text-lg font-bold">Host</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name"><input name="host_name" className="input" defaultValue={table?.host_name ?? ""} /></Field>
          <Field label="Email"><input name="host_email" type="email" className="input" defaultValue={table?.host_email ?? ""} /></Field>
          <Field label="Company"><input name="host_company" className="input" required defaultValue={table?.host_company ?? ""} /></Field>
          <Field label="Role"><input name="host_role" className="input" defaultValue={table?.host_role ?? ""} /></Field>
          <Field label="Phone"><input name="host_phone" className="input" defaultValue={table?.host_phone ?? ""} /></Field>
          <Field label="LinkedIn"><input name="host_linkedin" className="input" defaultValue={table?.host_linkedin ?? ""} /></Field>
        </div>
        {!table && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="notify_host" /> Send the host the &quot;table requested&quot; email
          </label>
        )}
        <button type="submit" className="btn btn-primary self-start">{submitLabel}</button>
      </section>
    </form>
  );
}
