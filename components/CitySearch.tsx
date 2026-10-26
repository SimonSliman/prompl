"use client";

import { useEffect, useId, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { apiPath, config } from "@/lib/config";
import type { CityPick } from "@/lib/cities";

export type { CityPick };

const MapModal = dynamic(() => import("./MapModal").then((m) => m.MapModal), { ssr: false });

type Props = {
  value: CityPick | null;
  onChange: (city: CityPick | null) => void;
  showQuickChips?: boolean;
  showMapLink?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
};

export function CitySearch({ value, onChange, showQuickChips = true, showMapLink = true, autoFocus, placeholder = "Search for a city" }: Props) {
  const [q, setQ] = useState(value?.name ?? "");
  const [results, setResults] = useState<CityPick[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [mapOpen, setMapOpen] = useState(false);
  const listId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const skipNext = useRef(false);

  useEffect(() => {
    if (value) {
      skipNext.current = true;
      setQ(value.name);
    }
  }, [value]);

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    const term = q.trim();
    if (!term) {
      setResults([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${apiPath("/api/cities")}?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        if (!res.ok) return;
        const j = await res.json();
        setResults(j.results ?? []);
        setActive(0);
        setOpen(true);
      } catch {
        /* aborted */
      }
    }, 150);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(c: CityPick) {
    onChange(c);
    skipNext.current = true;
    setQ(c.name);
    setResults([]);
    setOpen(false);
  }

  async function pickByName(name: string) {
    const res = await fetch(`${apiPath("/api/cities")}?q=${encodeURIComponent(name)}`);
    const j = await res.json();
    const first = (j.results ?? []).find((c: CityPick) => c.name === name) ?? j.results?.[0];
    if (first) pick(first);
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || !results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      pick(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className="flex flex-col gap-2.5">
      <div
        className="flex min-h-[52px] items-center gap-2.5 rounded-[14px] bg-card px-3.5"
        style={{ border: `2px solid ${value ? "var(--accent)" : "var(--ink)"}` }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5A5F67" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label="City"
          autoFocus={autoFocus}
          autoComplete="off"
          className="min-w-0 flex-1 border-0 bg-transparent text-[17px] outline-none"
          placeholder={placeholder}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            if (value) onChange(null);
          }}
          onFocus={() => results.length && setOpen(true)}
          onKeyDown={onKey}
        />
        {value && (
          <span className="shrink-0 text-[13px] text-muted">
            {value.region ? `${value.region}, ` : ""}
            {value.countryName}
          </span>
        )}
      </div>

      {open && results.length > 0 && (
        <ul id={listId} role="listbox" className="m-0 list-none overflow-hidden rounded-[14px] border border-line-soft bg-card p-0">
          {results.map((c, i) => (
            <li
              key={c.id}
              role="option"
              aria-selected={i === active}
              className="cursor-pointer px-3.5 py-3"
              style={{ background: i === active ? "var(--accent-tint)" : undefined, borderTop: i ? "1px solid var(--line-soft)" : undefined }}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(c)}
            >
              <p className="m-0 text-[15px] font-semibold">{c.name}</p>
              <p className="m-0 text-[13px] text-muted">
                {c.region ? `${c.region}, ` : ""}
                {c.countryName}
              </p>
            </li>
          ))}
        </ul>
      )}

      {(showQuickChips || showMapLink) && (
        <div className="flex flex-wrap items-center gap-2">
          {showQuickChips &&
            config.quickCities.map((name) => (
              <button key={name} type="button" className="chip" aria-pressed={value?.name === name} onClick={() => pickByName(name)}>
                {name}
              </button>
            ))}
          {showMapLink && (
            <button type="button" onClick={() => setMapOpen(true)} className="inline-flex min-h-[40px] items-center border-0 bg-transparent px-1.5 text-sm font-semibold text-accent hover:text-accent-hover">
              Pick on a map
            </button>
          )}
        </div>
      )}

      {mapOpen && <MapModal onClose={() => setMapOpen(false)} onPick={(c) => { pick(c); setMapOpen(false); }} initial={value} />}
    </div>
  );
}
