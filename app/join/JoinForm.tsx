"use client";

import { useState } from "react";
import { templates } from "@/lib/templates";
import { apiPath } from "@/lib/config";
import { CitySearch, type CityPick } from "@/components/CitySearch";

const tags = Array.from(new Set(templates.map((t) => t.tag)));

export function JoinForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [city, setCity] = useState<CityPick | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [error, setError] = useState("");

  function toggle(tag: string) {
    setTopics((t) => (t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    setError("");
    const res = await fetch(apiPath("/api/join"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, linkedin, city: city ? `${city.name}, ${city.region ? city.region + ", " : ""}${city.countryName}` : "", topics }),
    });
    if (res.ok) setState("done");
    else {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Something went wrong. Please try again.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="card flex flex-col gap-2 p-5">
        <p className="m-0 font-heading text-xl font-bold">Thanks, you are on the list.</p>
        <p className="m-0 text-[15px] text-body">We will reach out when there is a table near you on a topic you care about.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <label className="label" htmlFor="j-name">Full name</label>
        <input id="j-name" className="input" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
      </div>
      <div>
        <label className="label" htmlFor="j-email">Email</label>
        <input id="j-email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="j-linkedin">LinkedIn <span className="font-normal text-muted">(optional)</span></label>
        <input id="j-linkedin" className="input" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="linkedin.com/in/you" inputMode="url" />
      </div>
      <div>
        <label className="label">Your city</label>
        <CitySearch value={city} onChange={setCity} showQuickChips={false} showMapLink={false} />
      </div>
      <div>
        <p className="label">Topics you care about</p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button key={tag} type="button" className="chip" aria-pressed={topics.includes(tag)} onClick={() => toggle(tag)}>
              {tag}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="m-0 text-sm text-[#B42318]">{error}</p>}
      <button type="submit" className="btn btn-primary btn-block mt-2" disabled={state === "busy"}>
        {state === "busy" ? "Saving" : "Leave my name"}
      </button>
    </form>
  );
}
