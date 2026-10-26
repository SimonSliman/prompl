import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { SiteFooter } from "@/components/SiteFooter";
import { TableSvg } from "@/components/TableSvg";
import { templates, exampleCities, withWho } from "@/lib/templates";
import { config } from "@/lib/config";

const steps = [
  { n: "01", title: "Choose a city and a topic.", body: "Tell us what you want to talk about and who you would like across the table." },
  { n: "02", title: "We find and invite the people.", body: "Every guest is personally invited and confirmed. You see who is coming before you sit down." },
  { n: "03", title: "Sit down and talk.", body: "60 to 90 minutes in a good café or quiet restaurant. We handle the place, the invitations and the reminders." },
];

const uses = [
  { title: "Meet buyers before they are buyers.", body: "The people who will not take a sales call will join a good conversation." },
  { title: "Land in a new city.", body: "Arrive somewhere new and sit with the right people in your first week." },
  { title: "Hear the market.", body: "Six people in your field, one question, an honest answer." },
  { title: "Meet investors without pitching.", body: "A conversation first. The deck can wait." },
  { title: "Show up online.", body: "Photos and takeaways worth posting, with your guests' permission." },
];

export default function LandingPage() {
  const featured = templates.filter((t) => t.featured);
  return (
    <div className="text-ink">
      <header className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 px-5 py-5">
        <Wordmark size={22} />
        <Link href="/host" className="btn btn-ink">
          Host a table
        </Link>
      </header>

      <section id="top" className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-12 px-5 pb-16 pt-12">
        <div className="flex min-w-0 flex-[999_1_460px] flex-col gap-5">
          <p className="eyebrow text-accent">In person, on purpose</p>
          <h1 className="m-0 font-heading text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.03em]">
            One table.
            <br />
            The right people.
          </h1>
          <p className="m-0 max-w-[34rem] text-[1.1875rem] leading-[1.55] text-body">
            You choose the city and the topic. We bring six people worth meeting to the table with you. No stage, no badges, no pitch.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/host" className="btn btn-primary">
              Host a table
            </Link>
            <a href="#how" className="btn btn-ghost min-h-[52px] text-[1.0625rem]">
              How it works
            </a>
          </div>
          <p className="m-0 text-sm text-muted">Invited to a table? Open your invitation from the email we sent you.</p>
        </div>
        <div className="flex min-w-0 flex-[1_1_300px] justify-center">
          <TableSvg />
        </div>
      </section>

      <section className="bg-ink text-ground">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-5 px-5 py-16">
          <p className="eyebrow text-dark-secondary">Why one table</p>
          <p className="m-0 max-w-[52rem] font-heading text-[clamp(1.5rem,3.2vw,2.25rem)] font-semibold leading-[1.25] tracking-[-0.015em]">
            Big events put you in a room with 500 people and leave you with business cards. A table of seven gives you one real conversation, the kind that turns into a project, a partner or a friend.
          </p>
          <p className="m-0 max-w-[44rem] text-lg leading-[1.55] text-dark-body">The internet connected everyone. We put them back at the same table.</p>
        </div>
      </section>

      <section id="how" className="mx-auto flex max-w-[1120px] flex-col gap-8 px-5 pb-8 pt-[4.5rem]">
        <h2 className="m-0 font-heading text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold tracking-[-0.02em]">How it works</h2>
        <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(16rem,1fr))]">
          {steps.map((s) => (
            <div key={s.n} className="card flex flex-col gap-2.5 p-6">
              <p className="m-0 font-heading text-base font-bold text-accent">{s.n}</p>
              <h3 className="m-0 text-xl font-semibold">{s.title}</h3>
              <p className="m-0 text-base leading-[1.55] text-body">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto flex max-w-[1120px] flex-col gap-8 px-5 py-12">
        <h2 className="m-0 font-heading text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold tracking-[-0.02em]">What hosts use it for</h2>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))]">
          {uses.map((u) => (
            <div key={u.title} className="flex flex-col gap-2 rounded-[16px] border border-line p-[1.375rem]">
              <h3 className="m-0 text-lg font-semibold">{u.title}</h3>
              <p className="m-0 text-[0.9375rem] leading-[1.55] text-body">{u.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto flex max-w-[1120px] flex-col gap-5 px-5 pb-10 pt-4">
        <p className="eyebrow text-muted">Example tables</p>
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(15rem,1fr))]">
          {featured.map((t) => (
            <Link
              key={t.id}
              href={`/host?template=${t.id}`}
              className="flex flex-col gap-1.5 rounded-[14px] bg-card px-5 py-[1.125rem] text-ink no-underline hover:text-ink"
            >
              <span className="text-[0.8125rem] text-muted">
                {exampleCities[t.id]} · {config.timePresets[t.time].label} · {t.duration} min
              </span>
              <span className="font-heading text-lg font-semibold">{t.title}</span>
              <span className="text-sm text-body">{withWho(t.who)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1120px] px-5 pb-16 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-[20px] bg-card p-8">
          <div className="flex min-w-0 flex-[999_1_380px] flex-col gap-2">
            <p className="eyebrow text-accent">Founding hosts</p>
            <p className="m-0 font-heading text-[1.75rem] font-bold tracking-[-0.02em]">Your first table is on us.</p>
            <p className="m-0 text-base leading-[1.55] text-body">
              A table is $900. For our founding hosts, the first one is free. Full table promise: at least five of the right people take their seat, or the table is on us.
            </p>
          </div>
          <Link href="/host" className="btn btn-primary">
            Host a table
          </Link>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-x-8 gap-y-4 px-5 py-10">
          <p className="eyebrow text-muted">House rules</p>
          <p className="m-0 text-[1.0625rem] font-medium">No pitching. No slides. Phones down. What is said at the table stays at the table.</p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
