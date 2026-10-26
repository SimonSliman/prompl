import { initialsOf, type Seat } from "@/lib/types";

export function SeatList({ seats, seatTarget, yoursHint = false }: { seats: Seat[]; seatTarget: number; yoursHint?: boolean }) {
  const open = Math.max(0, seatTarget - seats.length);
  return (
    <>
      {seats.map((s, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold text-white"
            style={{ background: s.isAnchor ? "var(--accent)" : "var(--ink)" }}
          >
            {initialsOf(s.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-[15px] font-semibold">
              {s.name}
              {s.isAnchor && <span className="ml-1 rounded-full bg-accent-tint px-2 py-0.5 text-xs font-semibold text-accent">Guest of honor</span>}
              {s.isHost && <span className="ml-1 rounded-full bg-line-soft px-2 py-0.5 text-xs font-semibold text-muted">Host</span>}
            </p>
            {(s.title || s.company) && <p className="m-0 text-sm text-body">{[s.title, s.company].filter(Boolean).join(", ")}</p>}
          </div>
        </div>
      ))}
      {open > 0 && (
        <div className="flex items-center gap-2">
          {Array.from({ length: Math.min(open, 6) }).map((_, i) => (
            <div
              key={i}
              className="h-11 w-11 shrink-0 rounded-full border-2 border-dashed"
              style={{ borderColor: yoursHint && i === 0 ? "var(--accent)" : "var(--dashed)" }}
            />
          ))}
          {yoursHint ? (
            <p className="m-0 ml-1 text-sm text-muted">One of these is yours</p>
          ) : (
            <p className="m-0 ml-1 text-sm text-muted">
              {open} open seat{open === 1 ? "" : "s"}
            </p>
          )}
        </div>
      )}
    </>
  );
}
