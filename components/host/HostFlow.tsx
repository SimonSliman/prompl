"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StepHeader } from "@/components/StepHeader";
import { CitySearch, type CityPick } from "@/components/CitySearch";
import { PreviewCard } from "@/components/PreviewCard";
import { templates, templateById, fillCity, withWho } from "@/lib/templates";
import { config, formatMoney, apiPath, type TimePreset } from "@/lib/config";
import { nextDays, zonedToUtc, formatSlot, tzLabel } from "@/lib/time";
import { dialCodes, dialFor } from "@/lib/phone";

const Check = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2747D8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12l5 5L20 7" />
  </svg>
);

type TopicChoice = string | "custom" | null;

export function HostFlow({ presetTemplateId }: { presetTemplateId: string | null }) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1
  const [topic, setTopic] = useState<TopicChoice>(presetTemplateId);
  const [reword, setReword] = useState(false);
  const preset = templateById(presetTemplateId);
  const [title, setTitle] = useState(preset?.title ?? "");
  const [about, setAbout] = useState(preset?.about ?? "");
  const [who, setWho] = useState(preset?.who ?? "");
  const [city, setCity] = useState<CityPick | null>(null);

  // Step 2
  const [slots, setSlots] = useState<string[]>([]);
  const [timePreset, setTimePreset] = useState<TimePreset | "other">(preset?.time ?? "after_work");
  const [otherTime, setOtherTime] = useState("18:30");
  const [duration, setDuration] = useState<number>(preset?.duration ?? 90);
  const [durationOther, setDurationOther] = useState(false);
  const [venueMode, setVenueMode] = useState<"we_pick" | "own">("we_pick");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [hostName, setHostName] = useState("");
  const [hostEmail, setHostEmail] = useState("");
  const [hostCompany, setHostCompany] = useState("");
  const [hostRole, setHostRole] = useState("");
  const [dial, setDial] = useState("+1");
  const [phone, setPhone] = useState("");
  const [hostLinkedin, setHostLinkedin] = useState("");
  const [dialTouched, setDialTouched] = useState(false);

  // Step 3
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const tz = city?.timezone ?? "America/New_York";
  const days = useMemo(() => nextDays(21, tz), [tz]);

  useEffect(() => {
    if (city && !dialTouched) setDial(dialFor(city.countryCode));
  }, [city, dialTouched]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  function chooseTemplate(id: string) {
    const t = templateById(id)!;
    setTopic(id);
    setReword(false);
    setTitle(t.title);
    setAbout(t.about);
    setWho(t.who);
    setTimePreset(t.time);
    setDuration(t.duration);
    setDurationOther(false);
  }

  function chooseCustom() {
    setTopic("custom");
    setReword(true);
    setTitle("");
    setAbout("");
    setWho("");
  }

  const finalTitle = fillCity(title, city?.name);
  const step1Ok = !!topic && finalTitle.trim().length > 0 && !!city;

  function timeForPreset() {
    return timePreset === "other" ? otherTime : config.timePresets[timePreset].time;
  }

  function toggleDay(key: string) {
    const time = timeForPreset();
    if (!time) return;
    const iso = zonedToUtc(key, time, tz).toISOString();
    setSlots((s) => {
      if (s.includes(iso)) return s.filter((x) => x !== iso);
      if (s.length >= 3) return s;
      return [...s, iso].sort();
    });
  }

  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(hostEmail);
  const step2Ok = slots.length > 0 && hostName.trim() && emailOk && hostCompany.trim() && (venueMode === "we_pick" || venueName.trim());

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(apiPath("/api/tables"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          templateId: topic === "custom" ? null : topic,
          title: finalTitle,
          about,
          who,
          city,
          timeOptions: slots,
          durationMin: duration,
          venueMode,
          venueName,
          venueAddress,
          hostName,
          hostEmail,
          hostCompany,
          hostRole,
          hostPhone: phone ? `${dial} ${phone}`.trim() : "",
          hostLinkedin,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Something went wrong");
      router.push(`/host/done/${j.manageToken}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  const selectedDayKeys = useMemo(() => {
    const set = new Set<string>();
    for (const iso of slots) {
      const d = new Date(iso);
      set.add(new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(d));
    }
    return set;
  }, [slots, tz]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col gap-5 px-5 pb-7 pt-5">
      <StepHeader step={step} />

      {step === 1 && (
        <>
          <h1 className="m-0 font-heading text-[28px] font-bold leading-[1.1] tracking-[-0.02em]">What should your table talk about?</h1>

          <div className="flex flex-col gap-2.5">
            {templates.map((t) => {
              const selected = topic === t.id;
              return (
                <button key={t.id} type="button" className="option-card" aria-pressed={selected} onClick={() => chooseTemplate(t.id)}>
                  <span className="flex w-full items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.06em]" style={{ color: selected ? "var(--accent)" : "var(--muted)" }}>
                      {t.tag}
                    </span>
                    {selected && <Check />}
                  </span>
                  <span className="font-heading text-[17px] font-semibold">{fillCity(t.title, city?.name)}</span>
                  <span className="text-sm text-body">{withWho(t.who)}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={chooseCustom}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-[14px] border border-dashed bg-transparent text-[15px] font-semibold text-ink"
              style={{ borderColor: topic === "custom" ? "var(--accent)" : "var(--dashed)", borderWidth: topic === "custom" ? 2 : 1, color: topic === "custom" ? "var(--accent)" : undefined }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Write my own
            </button>
            {topic && topic !== "custom" && !reword && (
              <p className="m-0 text-[13px] text-muted">
                You can reword anything later.{" "}
                <button type="button" onClick={() => setReword(true)} className="border-0 bg-transparent p-0 text-[13px] font-semibold text-accent">
                  Reword it
                </button>
              </p>
            )}
            {!topic && <p className="m-0 text-[13px] text-muted">You can reword anything later.</p>}

            {topic && reword && (
              <div className="card flex flex-col gap-3.5 p-4">
                <div>
                  <label className="label" htmlFor="t-title">Title</label>
                  <input id="t-title" className="input" maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What is working with AI in claims" />
                </div>
                <div>
                  <label className="label" htmlFor="t-about">What it is about</label>
                  <textarea id="t-about" className="input" maxLength={300} value={about} onChange={(e) => setAbout(e.target.value)} />
                  <p className="helper text-right">{about.length} / 300</p>
                </div>
                <div>
                  <label className="label" htmlFor="t-who">Who you would like across the table</label>
                  <input id="t-who" className="input" maxLength={200} value={who} onChange={(e) => setWho(e.target.value)} placeholder="Heads of claims at regional insurers" />
                  <p className="helper">We invite people as close to this as we can. We do not promise exact titles or companies.</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            <h2 className="m-0 font-heading text-[22px] font-bold tracking-[-0.01em]">In which city?</h2>
            <CitySearch value={city} onChange={setCity} />
          </div>

          <button type="button" className="btn btn-primary btn-block mt-auto" disabled={!step1Ok} onClick={() => setStep(2)}>
            Continue
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 font-heading text-[28px] font-bold leading-[1.1] tracking-[-0.02em]">When works for you?</h1>
            <p className="m-0 text-[15px] text-body">Offer up to three times. We confirm the one that fills first.</p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
              {days.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  className="chip shrink-0"
                  disabled={d.isToday || (slots.length >= 3 && !selectedDayKeys.has(d.key))}
                  aria-pressed={selectedDayKeys.has(d.key)}
                  onClick={() => toggleDay(d.key)}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(config.timePresets) as TimePreset[]).map((k) => (
                <button key={k} type="button" className="chip" aria-pressed={timePreset === k} onClick={() => setTimePreset(k)}>
                  {config.timePresets[k].label} {config.timePresets[k].time.replace(/^0/, "")}
                </button>
              ))}
              <button type="button" className="chip" aria-pressed={timePreset === "other"} onClick={() => setTimePreset("other")}>
                Other
              </button>
              {timePreset === "other" && (
                <input type="time" className="input w-auto min-h-[40px] px-3 text-sm" value={otherTime} onChange={(e) => setOtherTime(e.target.value)} aria-label="Other time" />
              )}
            </div>
            <p className="m-0 text-[13px] text-muted">Tap a day to add it with the time above. {tzLabel(tz)}.</p>

            {slots.length > 0 && (
              <div className="flex flex-col gap-2">
                {slots.map((iso) => (
                  <div key={iso} className="flex min-h-[48px] items-center justify-between rounded-[14px] border border-line bg-card px-4 text-[15px] font-semibold">
                    {formatSlot(iso, tz)}
                    <button type="button" aria-label="Remove" onClick={() => setSlots((s) => s.filter((x) => x !== iso))} className="flex h-8 w-8 items-center justify-center rounded-full border-0 bg-transparent text-muted hover:text-ink">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p className="label m-0">How long</p>
            <div className="segmented">
              {[60, 75, 90].map((d) => (
                <button key={d} type="button" aria-pressed={!durationOther && duration === d} onClick={() => { setDuration(d); setDurationOther(false); }}>
                  {d}
                </button>
              ))}
              <button type="button" aria-pressed={durationOther} onClick={() => setDurationOther(true)}>
                Other
              </button>
            </div>
            {durationOther && (
              <input type="number" min={30} max={240} step={15} className="input" value={duration} onChange={(e) => setDuration(Number(e.target.value))} aria-label="Duration in minutes" />
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            <h2 className="m-0 font-heading text-[22px] font-bold tracking-[-0.01em]">Where?</h2>
            <div className="segmented">
              <button type="button" aria-pressed={venueMode === "we_pick"} onClick={() => setVenueMode("we_pick")}>Choose a place for me</button>
              <button type="button" aria-pressed={venueMode === "own"} onClick={() => setVenueMode("own")}>I have a place</button>
            </div>
            {venueMode === "we_pick" ? (
              <p className="helper m-0">A good café or quiet restaurant downtown, easy for most guests to reach.</p>
            ) : (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="label" htmlFor="v-name">Venue name</label>
                  <input id="v-name" className="input" value={venueName} onChange={(e) => setVenueName(e.target.value)} />
                </div>
                <div>
                  <label className="label" htmlFor="v-addr">Address</label>
                  <input id="v-addr" className="input" value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="m-0 font-heading text-[22px] font-bold tracking-[-0.01em]">About you</h2>
            <div>
              <label className="label" htmlFor="h-name">Full name</label>
              <input id="h-name" className="input" autoComplete="name" value={hostName} onChange={(e) => setHostName(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="h-email">Work email</label>
              <input id="h-email" type="email" className="input" autoComplete="email" value={hostEmail} onChange={(e) => setHostEmail(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="h-company">Company</label>
              <input id="h-company" className="input" autoComplete="organization" value={hostCompany} onChange={(e) => setHostCompany(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="h-role">Your role</label>
              <input id="h-role" className="input" autoComplete="organization-title" value={hostRole} onChange={(e) => setHostRole(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="h-phone">Mobile</label>
              <div className="flex gap-2">
                <select className="input w-[110px] shrink-0" aria-label="Country code" value={dial} onChange={(e) => { setDial(e.target.value); setDialTouched(true); }}>
                  {dialCodes.map((d) => (
                    <option key={d.cc} value={d.dial}>
                      {d.cc} {d.dial}
                    </option>
                  ))}
                </select>
                <input id="h-phone" type="tel" className="input" autoComplete="tel-national" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <p className="helper">Only used to coordinate this table.</p>
            </div>
            <div>
              <label className="label" htmlFor="h-li">LinkedIn <span className="font-normal text-muted">(optional)</span></label>
              <input id="h-li" className="input" inputMode="url" value={hostLinkedin} onChange={(e) => setHostLinkedin(e.target.value)} placeholder="linkedin.com/in/you" />
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-2.5 pt-2">
            <button type="button" className="btn btn-primary btn-block" disabled={!step2Ok} onClick={() => setStep(3)}>
              Continue
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
              Back
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 font-heading text-[28px] font-bold leading-[1.1] tracking-[-0.02em]">Your table is ready</h1>
            <p className="m-0 text-[15px] text-body">This is what your guests will see.</p>
          </div>

          <PreviewCard
            data={{
              cityName: city?.name ?? "",
              hostCompany,
              title: finalTitle,
              about,
              who,
              timeOptions: slots,
              timezone: tz,
              durationMin: duration,
              venueLabel: venueMode === "own" && venueName ? venueName : "Downtown",
              seatTarget: config.seatTarget,
              seatsTaken: 1,
            }}
            action={
              <button type="button" onClick={() => setStep(1)} className="self-start border-0 bg-transparent p-0 text-sm font-semibold text-dark-secondary hover:text-white">
                Change something
              </button>
            }
          />

          <div className="card flex flex-col gap-2.5 px-4 py-[18px]">
            <div className="flex justify-between text-[15px]">
              <p className="m-0">One table</p>
              <p className="m-0 font-medium text-muted line-through">{formatMoney(config.priceCents)}</p>
            </div>
            <div className="flex justify-between text-[15px] text-success">
              <p className="m-0">Founding host offer</p>
              <p className="m-0 font-medium">-{formatMoney(config.foundingDiscountCents)}</p>
            </div>
            <div className="h-px bg-line-soft" />
            <div className="flex items-baseline justify-between">
              <p className="m-0 text-base font-semibold">Due today</p>
              <p className="m-0 font-heading text-[30px] font-bold">{formatMoney(Math.max(0, config.priceCents - config.foundingDiscountCents))}</p>
            </div>
            <div className="flex items-start gap-2.5 rounded-[12px] bg-accent-tint p-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2747D8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-px shrink-0">
                <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <p className="m-0 text-sm leading-[1.45] text-promise-text">
                <strong>Full table promise.</strong> At least five of the right people take their seat, or the table is on us.
              </p>
            </div>
          </div>

          {error && <p className="m-0 text-sm text-[#B42318]">{error}</p>}

          <div className="mt-auto flex flex-col gap-3">
            <button type="button" className="btn btn-primary btn-block" disabled={busy} onClick={submit}>
              {busy ? "Creating your table" : "Create my table"}
            </button>
            <p className="m-0 text-center text-[13px] text-muted">
              By creating a table you agree to the <Link href="/terms">Terms</Link>. We confirm the time, place and first guests within two business days.
            </p>
            <button type="button" className="btn btn-ghost" onClick={() => setStep(2)}>
              Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}
