"use client";

import { useState, useTransition } from "react";

export function SendInviteForm({ action, hasEmail, alreadySent }: { action: (fd: FormData) => Promise<{ ok?: boolean; error?: string } | void>; hasEmail: boolean; alreadySent: boolean }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  if (!hasEmail) return <span className="text-xs text-muted">No email: copy the link</span>;
  if (!open)
    return (
      <span className="inline-flex items-center gap-2">
        <button type="button" className="btn btn-ink min-h-[34px] px-3 text-[13px]" onClick={() => setOpen(true)}>
          {alreadySent ? "Send invite again" : "Send invite"}
        </button>
        {msg && <span className="text-xs text-body">{msg}</span>}
      </span>
    );
  return (
    <div className="flex w-full flex-col gap-2 rounded-[12px] bg-ground p-3">
      <label className="label m-0">Personal note (optional, goes above the standard text)</label>
      <textarea className="input" style={{ minHeight: 72 }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Great to meet you at the conference last month." />
      <div className="flex gap-2">
        <button
          type="button"
          className="btn btn-primary min-h-[40px] px-4 text-sm"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const fd = new FormData();
              fd.set("note", note);
              const r = await action(fd);
              setMsg(r && "error" in r && r.error ? r.error : "Invite sent");
              setOpen(false);
            })
          }
        >
          {pending ? "Sending" : "Send now"}
        </button>
        <button type="button" className="btn btn-ghost min-h-[40px] text-sm" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}
