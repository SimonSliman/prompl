import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { logoutAction } from "@/lib/admin-actions";

export function AdminShell({ children, title, actions }: { children: React.ReactNode; title?: string; actions?: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1120px] flex-col gap-6 px-5 pb-16 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Wordmark />
          <span className="rounded-full bg-line-soft px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.06em] text-muted">Admin</span>
          <nav className="flex gap-3 text-sm font-semibold">
            <Link href="/admin" className="text-ink hover:text-accent">Tables</Link>
            <Link href="/admin/interest" className="text-ink hover:text-accent">Interest list</Link>
          </nav>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="btn btn-ghost min-h-[36px] text-sm">Log out</button>
        </form>
      </div>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {title && <h1 className="m-0 font-heading text-[26px] font-bold tracking-[-0.02em]">{title}</h1>}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
