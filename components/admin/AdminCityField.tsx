"use client";

import { useState } from "react";
import { CitySearch, type CityPick } from "@/components/CitySearch";

type Initial = { name: string; region: string; countryCode: string; lat: number | null; lng: number | null; timezone: string } | null;

export function AdminCityField({ initial }: { initial: Initial }) {
  const [city, setCity] = useState<CityPick | null>(
    initial ? { id: 0, name: initial.name, region: initial.region, countryCode: initial.countryCode, countryName: initial.countryCode, lat: initial.lat ?? 0, lng: initial.lng ?? 0, timezone: initial.timezone } : null,
  );
  const v = city ?? initial;
  return (
    <div className="flex flex-col gap-2">
      <CitySearch value={city} onChange={setCity} showQuickChips={false} showMapLink={false} />
      <input type="hidden" name="city_name" value={v?.name ?? ""} />
      <input type="hidden" name="city_region" value={v?.region ?? ""} />
      <input type="hidden" name="country_code" value={v?.countryCode ?? ""} />
      <input type="hidden" name="lat" value={v?.lat ?? ""} />
      <input type="hidden" name="lng" value={v?.lng ?? ""} />
      <input type="hidden" name="timezone" value={v?.timezone ?? "America/New_York"} />
      {v && <p className="helper m-0">{v.name}{v.region ? `, ${v.region}` : ""} · {v.timezone}</p>}
    </div>
  );
}
