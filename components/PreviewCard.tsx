import { summarizeDates, formatSlot } from "@/lib/time";

export type PreviewData = {
  cityName: string;
  hostCompany: string;
  title: string;
  about: string;
  who: string;
  timeOptions: string[];
  finalStartsAt?: string | null;
  timezone: string;
  durationMin: number;
  venueLabel: string;
  seatTarget: number;
  seatsTaken: number;
};

function withWhoSentence(who: string) {
  if (!who.trim()) return "";
  const w = who.trim().replace(/\.$/, "");
  return ` With ${w.charAt(0).toLowerCase()}${w.slice(1)}.`;
}

export function PreviewCard({ data, action }: { data: PreviewData; action?: React.ReactNode }) {
  const seats = Math.max(1, data.seatTarget);
  const spacing = 320 / seats;
  const dateLabel = data.finalStartsAt ? formatSlot(data.finalStartsAt, data.timezone) : summarizeDates(data.timeOptions, data.timezone) || "Dates to come";
  return (
    <div className="flex flex-col gap-4 rounded-[20px] bg-ink p-5 text-ground">
      <div className="flex items-center justify-between gap-3">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-dark-secondary">{data.cityName || "Your city"}</p>
        <p className="m-0 text-xs text-dark-body">Hosted by {data.hostCompany || "you"}</p>
      </div>
      <p className="m-0 font-heading text-2xl font-bold leading-[1.15] tracking-[-0.01em]">{data.title || "Your topic"}</p>
      <p className="m-0 text-[15px] leading-[1.5] text-dark-body">
        {data.about}
        {withWhoSentence(data.who)}
      </p>
      <div className="flex flex-wrap gap-2">
        {[dateLabel, `${data.durationMin} min`, data.venueLabel, `${data.seatTarget} seats`].map((p) => (
          <span key={p} className="rounded-full bg-dark-pill px-2.5 py-1.5 text-[13px]">
            {p}
          </span>
        ))}
      </div>
      <svg viewBox="0 0 320 70" className="h-auto w-full" aria-hidden="true">
        {Array.from({ length: seats }).map((_, i) => {
          const cx = spacing / 2 + i * spacing;
          const taken = i < data.seatsTaken;
          return taken ? (
            <circle key={i} cx={cx} cy="35" r="16" fill={i === 0 ? "#2747D8" : "#F6F6F3"} />
          ) : (
            <circle key={i} cx={cx} cy="35" r="16" fill="none" stroke="#C9CCD2" strokeWidth="2" strokeDasharray="4 4" />
          );
        })}
      </svg>
      {action}
    </div>
  );
}
