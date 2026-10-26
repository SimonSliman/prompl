"use client";

import { useState } from "react";
import { Wordmark } from "@/components/Wordmark";
import { SeatList } from "@/components/SeatList";
import { apiPath } from "@/lib/config";
import type { Seat } from "@/lib/types";

const Check = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2747D8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12l5 5L20 7" />
  </svg>
);

type Props = {
  token: string;
  firstName: string;
  guest: { name: string; title: string; company: string; isAnchor: boolean };
  initialStatus: string;
  initialSlots: string[];
  initialQuestion: string;
  table: {
    title: string;
    city: string;
    hostCompany: string;
    durationMin: number;
    seatTarget: number;
    status: string;
    finalLabel: string | null;
    options: { iso: string; label: string }[];
    placeLine: string;
  };
  seats: Seat[];
  isSeated: boolean;
};

export function GuestView({ token, firstName, guest, initialStatus, initialSlots, initialQuestion, table, seats, isSeated }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [slots, setSlots] = useState<string[]>(initialSlots);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState(initialQuestion);
  const [questionSent, setQuestionSent] = useState(!!initialQuestion);
  const [futureSent, setFutureSent] = useState(false);
  const [seatsShown, setSeatsShown] = useState(seats);

  const multi = !table.finalLabel && table.options.length > 1;
  const canConfirm = !multi || slots.length > 0;
  const seated = status === "accepted" || status === "attended";
  const seatsTaken = seatsShown.length;

  async function post(body: Record<string, unknown>) {
    const res = await fetch(apiPath(`/api/invite/${token}`), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.error ?? "Something went wrong");
    return j;
  }

  async function confirm() {
    setBusy(true);
    setError("");
    try {
      const j = await post({ action: "accept", slots: multi ? slots : table.options.map((o) => o.iso) });
      setStatus(j.status);
      if (j.status === "accepted" && !isSeated) {
        setSeatsShown((s) => (guest.isAnchor ? [{ ...guest, isHost: false }, ...s] : [...s, { ...guest, isHost: false }]));
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function decline() {
    setBusy(true);
    setError("");
    try {
      await post({ action: "decline" });
      setStatus("declined");
      if (isSeated) setSeatsShown((s) => s.filter((x) => x.isHost || x.name !== guest.name));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function sendQuestion() {
    setBusy(true);
    try {
      await post({ action: "question", question });
      setQuestionSent(true);
    } finally {
      setBusy(false);
    }
  }

  async function future() {
    setBusy(true);
    try {
      await post({ action: "future" });
      setFutureSent(true);
    } finally {
      setBusy(false);
    }
  }

  const cancelled = table.status === "cancelled";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col gap-[18px] px-5 pb-7 pt-5">
      <Wordmark />

      <div className="flex flex-col gap-2">
        <p className="eyebrow text-accent" style={{ fontSize: 13 }}>{firstName}, you are invited</p>
        <h1 className="m-0 font-heading text-[30px] font-bold leading-[1.1] tracking-[-0.02em]">{table.title}</h1>
        <p className="m-0 text-[15px] leading-[1.5] text-body">
          A table of {table.seatTarget === 7 ? "seven" : table.seatTarget} in {table.city}, hosted by {table.hostCompany}. About {table.durationMin} minutes. No pitching.
        </p>
      </div>

      <div className="card flex flex-col gap-3.5 p-4">
        <div className="flex items-center justify-between">
          <p className="m-0 text-[13px] text-muted">At the table</p>
          <p className="m-0 text-[13px] font-semibold">
            {Math.min(seatsTaken, table.seatTarget)} of {table.seatTarget} seats taken
          </p>
        </div>
        <SeatList seats={seatsShown} seatTarget={table.seatTarget} yoursHint={!seated && status !== "declined"} />
      </div>

      {cancelled ? (
        <div className="card p-4">
          <p className="m-0 text-[15px] text-body">This table was cancelled. Thank you for your interest.</p>
        </div>
      ) : seated ? (
        <>
          <div className="card flex flex-col gap-3 p-4">
            <p className="m-0 font-heading text-[22px] font-bold">You are in.</p>
            {table.finalLabel ? (
              <>
                <p className="m-0 text-[15px] font-semibold">{table.finalLabel}</p>
                <p className="m-0 text-[13px] text-muted">{table.placeLine}</p>
                <a href={apiPath(`/api/invite/${token}/ics`)} className="btn btn-outline self-start">
                  Add to calendar
                </a>
              </>
            ) : (
              <p className="m-0 text-[15px] text-body">We will send the final time and address soon.</p>
            )}
          </div>
          <div className="card flex flex-col gap-2.5 p-4">
            <label className="label m-0" htmlFor="q">Anything you would like the table to talk about?</label>
            {questionSent ? (
              <p className="m-0 text-[15px] text-body">Thanks, noted{question ? `: ${question}` : ""}.</p>
            ) : (
              <>
                <textarea id="q" className="input" maxLength={300} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Optional" />
                <button type="button" className="btn btn-ink self-start" disabled={busy || !question.trim()} onClick={sendQuestion}>
                  Send
                </button>
              </>
            )}
          </div>
        </>
      ) : status === "waitlist" ? (
        <div className="card flex flex-col gap-2 p-4">
          <p className="m-0 font-heading text-[22px] font-bold">This table is full.</p>
          <p className="m-0 text-[15px] text-body">You are first in line if a seat opens. We will email you if one does.</p>
        </div>
      ) : status === "declined" ? (
        <div className="card flex flex-col gap-3 p-4">
          <p className="m-0 font-heading text-[22px] font-bold">Thanks for letting us know.</p>
          {futureSent ? (
            <p className="m-0 text-[15px] text-body">Noted. We will reach out for the next one on this topic.</p>
          ) : (
            <button type="button" className="btn btn-outline self-start" disabled={busy} onClick={future}>
              Invite me to a future table on this topic
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2.5">
            {table.finalLabel ? (
              <p className="m-0 text-[15px] font-semibold">{table.finalLabel}</p>
            ) : (
              <>
                {multi && <p className="m-0 text-[13px] text-muted">Which times work for you? Tap all that do.</p>}
                {table.options.map((o) => {
                  const on = multi ? slots.includes(o.iso) : true;
                  return multi ? (
                    <button
                      key={o.iso}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setSlots((s) => (s.includes(o.iso) ? s.filter((x) => x !== o.iso) : [...s, o.iso]))}
                      className="flex min-h-[52px] items-center justify-between rounded-[14px] bg-card px-4 text-[15px] text-ink"
                      style={{ border: on ? "2px solid var(--accent)" : "1px solid var(--line)", fontWeight: on ? 600 : 500, padding: on ? "0 15px" : "0 16px" }}
                    >
                      {o.label}
                      {on && <Check />}
                    </button>
                  ) : (
                    <p key={o.iso} className="m-0 text-[15px] font-semibold">{o.label}</p>
                  );
                })}
              </>
            )}
            <p className="m-0 text-[13px] text-muted">{table.placeLine}</p>
          </div>

          {error && <p className="m-0 text-sm text-[#B42318]">{error}</p>}

          <div className="mt-auto flex flex-col gap-2.5">
            <button type="button" className="btn btn-primary btn-block min-h-[56px]" disabled={busy || !canConfirm} onClick={confirm}>
              I&apos;ll be there
            </button>
            <button type="button" className="btn btn-ghost min-h-[48px] text-[15px] font-medium text-body" disabled={busy} onClick={decline}>
              I can&apos;t make it
            </button>
            <p className="m-0 text-center text-xs leading-[1.5] text-muted">Once you confirm, your name, title and company appear here for the other guests.</p>
          </div>
        </>
      )}
    </div>
  );
}
