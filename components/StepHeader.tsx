import { Wordmark } from "./Wordmark";

export function StepHeader({ step, total = 3 }: { step: number; total?: number }) {
  return (
    <div className="flex items-center justify-between">
      <Wordmark />
      <div className="flex gap-1.5" aria-label={`Step ${step} of ${total}`} role="img">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="h-1 w-7 rounded" style={{ background: i < step ? "var(--accent)" : "var(--line)" }} />
        ))}
      </div>
    </div>
  );
}
