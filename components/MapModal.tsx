"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { apiPath, config } from "@/lib/config";
import type { CityPick } from "@/lib/cities";

type Marker = CityPick & { population: number };

function minPopForZoom(z: number) {
  if (z <= 3) return 1000000;
  if (z <= 5) return 300000;
  if (z <= 7) return 100000;
  if (z <= 9) return 40000;
  return 15000;
}

function radiusFor(pop: number) {
  if (pop >= 2000000) return 10;
  if (pop >= 500000) return 8;
  if (pop >= 100000) return 6;
  return 5;
}

function Markers({ onPick }: { onPick: (c: CityPick) => void }) {
  const map = useMap();
  const [markers, setMarkers] = useState<Marker[]>([]);

  async function refresh() {
    const b = map.getBounds();
    const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].map((n) => n.toFixed(4)).join(",");
    const res = await fetch(`${apiPath("/api/cities/in-view")}?bbox=${bbox}&minPop=${minPopForZoom(map.getZoom())}`);
    if (res.ok) {
      const j = await res.json();
      setMarkers(j.results ?? []);
    }
  }

  useMapEvents({ moveend: refresh, zoomend: refresh });
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {markers.map((m) => (
        <CircleMarker
          key={m.id}
          center={[m.lat, m.lng]}
          radius={radiusFor(m.population)}
          pathOptions={{ color: "#FFFFFF", weight: 2, fillColor: "#2747D8", fillOpacity: 0.95 }}
          eventHandlers={{ click: () => onPick(m) }}
        >
          <Tooltip direction="top" offset={[0, -6]}>
            <span style={{ fontWeight: 600 }}>{m.name}</span>
            {m.region ? `, ${m.region}` : ""}
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}

function FlyTo({ target }: { target: CityPick | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 9), { duration: 0.6 });
  }, [target, map]);
  return null;
}

export function MapModal({ onClose, onPick, initial }: { onClose: () => void; onPick: (c: CityPick) => void; initial: CityPick | null }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<CityPick[]>([]);
  const [target, setTarget] = useState<CityPick | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (!term) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(`${apiPath("/api/cities")}?q=${encodeURIComponent(term)}`);
      if (res.ok) setResults((await res.json()).results ?? []);
    }, 150);
    return () => clearTimeout(t);
  }, [q]);

  const center: [number, number] = initial ? [initial.lat, initial.lng] : [41.5, -79.5];

  return (
    <div className="fixed inset-0 z-[1000] flex flex-col bg-ground" role="dialog" aria-modal="true" aria-label="Pick a city on the map">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <div className="flex min-h-[48px] flex-1 items-center gap-2.5 rounded-[14px] border-2 border-ink bg-card px-3.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5A5F67" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            autoFocus
            className="min-w-0 flex-1 border-0 bg-transparent text-[16px] outline-none"
            placeholder="Search to move the map"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search cities"
          />
        </div>
        <button type="button" onClick={onClose} className="btn btn-outline min-h-[48px]">
          Close
        </button>
      </div>
      {results.length > 0 && (
        <ul className="mx-4 mb-2 max-h-[40vh] list-none overflow-auto rounded-[14px] border border-line-soft bg-card p-0">
          {results.map((c, i) => (
            <li key={c.id} className="cursor-pointer px-3.5 py-2.5" style={{ borderTop: i ? "1px solid var(--line-soft)" : undefined }}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 border-0 bg-transparent p-0 text-left"
                onClick={() => {
                  setTarget(c);
                  setResults([]);
                  setQ("");
                }}
              >
                <span>
                  <span className="block text-[15px] font-semibold">{c.name}</span>
                  <span className="block text-[13px] text-muted">
                    {c.region ? `${c.region}, ` : ""}
                    {c.countryName}
                  </span>
                </span>
                <span
                  className="chip min-h-[34px] text-[13px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPick(c);
                  }}
                >
                  Choose
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="relative flex-1">
        <MapContainer center={center} zoom={initial ? 9 : 5} className="absolute inset-0" style={{ background: "#E9ECE6" }} zoomControl={false}>
          <TileLayer url={config.mapTileUrl} attribution={config.mapAttribution} />
          <Markers onPick={onPick} />
          <FlyTo target={target} />
        </MapContainer>
        <p className="pointer-events-none absolute bottom-3 left-0 right-0 z-[500] m-0 text-center text-[13px] text-body">
          <span className="rounded-full bg-card/90 px-3 py-1.5">Tap a city to choose it</span>
        </p>
      </div>
    </div>
  );
}
