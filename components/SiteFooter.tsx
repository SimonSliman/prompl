import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-dark-body">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-end justify-between gap-8 px-5 py-12">
        <div className="flex flex-col gap-3">
          <p className="m-0 font-heading text-2xl font-bold text-white">smallroom</p>
          <p className="m-0 text-[0.9375rem]">
            Want a seat at a future table?{" "}
            <Link href="/join" className="text-dark-secondary hover:text-white">
              Leave your name.
            </Link>
          </p>
        </div>
        <div className="flex flex-col gap-1 text-sm">
          <p className="m-0">
            Smallroom by FoundryDocs ·{" "}
            <Link href="/terms" className="text-dark-body hover:text-white">
              Terms
            </Link>{" "}
            ·{" "}
            <Link href="/privacy" className="text-dark-body hover:text-white">
              Privacy
            </Link>
          </p>
          <p className="m-0 text-xs text-[#8A8F98]">
            City data from{" "}
            <a href="https://www.geonames.org/" className="text-[#8A8F98] hover:text-white" rel="noreferrer">
              GeoNames
            </a>{" "}
            (CC BY 4.0). Map tiles by OpenStreetMap contributors.
          </p>
        </div>
      </div>
    </footer>
  );
}
