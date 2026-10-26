"use client";

import { useState, useTransition } from "react";

type Result = { error?: string; sent?: number; failed?: number; skipped?: number; results?: Record<string, string>; ok?: boolean } | void;

/** Runs a server action and shows its result inline. */
export function ActionButton({ action, label, className = "btn btn-outline", confirm }: { action: () => Promise<Result>; label: string; className?: string; confirm?: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string>("");
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        className={className}
        disabled={pending}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          start(async () => {
            const r = await action();
            if (!r) setMsg("Done");
            else if (r.error) setMsg(r.error);
            else if (r.results) setMsg(Object.entries(r.results).map(([k, v]) => `${k}: ${v}`).join(" · "));
            else if (typeof r.sent === "number") setMsg(`Sent ${r.sent}, failed ${r.failed}, skipped ${r.skipped}`);
            else setMsg("Done");
          });
        }}
      >
        {pending ? "Working" : label}
      </button>
      {msg && <span className="text-xs text-body">{msg}</span>}
    </span>
  );
}
