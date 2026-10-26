import { SimpleHeader } from "./SimpleHeader";
import { SiteFooter } from "./SiteFooter";

export function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="mx-auto w-full max-w-[720px] px-5 pt-5">
        <SimpleHeader />
      </div>
      <main className="prose-legal mx-auto w-full max-w-[720px] flex-1 px-5 pb-16 pt-8">{children}</main>
      <SiteFooter />
    </div>
  );
}
