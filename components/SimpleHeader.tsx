import { Wordmark } from "./Wordmark";

/** Compact header used on inner pages (host flow, guest, join, legal). */
export function SimpleHeader({ right }: { right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <Wordmark />
      {right}
    </div>
  );
}
