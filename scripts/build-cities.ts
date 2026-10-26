/**
 * Builds data/cities.json: every city with population >= 15,000.
 *
 * Source: GeoNames cities15000 (CC BY 4.0, https://www.geonames.org/).
 *   1. download.geonames.org/export/dump/cities15000.zip when reachable,
 *   2. otherwise the copy bundled in the npm package cities-15000-structured.
 * Region names: GeoNames admin1CodesASCII.txt when reachable, otherwise the
 * datasets/world-cities mirror (also GeoNames-derived) joined on geonameid.
 * Country names: Intl.DisplayNames (no dependency).
 *
 * Run: npm run build-cities
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const out = join(root, "data", "cities.json");

export type City = {
  id: number;
  name: string;
  asciiName: string;
  region: string;
  countryCode: string;
  countryName: string;
  lat: number;
  lng: number;
  population: number;
  timezone: string;
};

async function fetchText(url: string, timeoutMs = 30000): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function loadCitiesTsv(): Promise<string> {
  const zipUrl = "https://download.geonames.org/export/dump/cities15000.zip";
  try {
    const res = await fetch(zipUrl, { signal: AbortSignal.timeout(60000) });
    if (res.ok) {
      const tmp = join(root, "data", ".cities15000.zip");
      writeFileSync(tmp, Buffer.from(await res.arrayBuffer()));
      const txt = execSync(`unzip -p "${tmp}" cities15000.txt`, { maxBuffer: 64 * 1024 * 1024 }).toString("utf8");
      console.log("cities: download.geonames.org");
      return txt;
    }
  } catch {
    /* fall through */
  }
  const txt = readFileSync(join(root, "node_modules", "cities-15000-structured", "dist", "cities15000.txt"), "utf8");
  console.log("cities: npm cities-15000-structured (GeoNames mirror)");
  return txt;
}

async function loadAdmin1(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const txt = await fetchText("https://download.geonames.org/export/dump/admin1CodesASCII.txt");
  if (txt) {
    for (const line of txt.split("\n")) {
      const [code, name] = line.split("\t");
      if (code && name) map.set(code, name);
    }
    console.log(`admin1: geonames (${map.size})`);
  }
  return map;
}

/** geonameid -> region name, from the datasets/world-cities mirror. */
async function loadWorldCitiesRegions(): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  const csv = await fetchText("https://raw.githubusercontent.com/datasets/world-cities/master/data/world-cities.csv", 60000);
  if (!csv) return map;
  const lines = csv.split("\n");
  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    if (row.length < 4) continue;
    const id = Number(row[3]);
    if (id && row[2]) map.set(id, row[2]);
  }
  console.log(`regions: world-cities mirror (${map.size})`);
  return map;
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

async function main() {
  const [tsv, admin1, worldRegions] = await Promise.all([loadCitiesTsv(), loadAdmin1(), loadWorldCitiesRegions()]);
  const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
  const cities: City[] = [];
  for (const line of tsv.split("\n")) {
    if (!line) continue;
    const f = line.split("\t");
    // geonameid, name, asciiname, alternatenames, lat, lng, fclass, fcode, country, cc2, admin1, admin2, admin3, admin4, population, elevation, dem, timezone, moddate
    const id = Number(f[0]);
    const population = Number(f[14]) || 0;
    if (population < 15000) continue;
    const countryCode = f[8];
    let countryName = countryCode;
    try { countryName = countryNames.of(countryCode) ?? countryCode; } catch { /* keep code */ }
    const region = admin1.get(`${countryCode}.${f[10]}`) ?? worldRegions.get(id) ?? "";
    cities.push({
      id,
      name: f[1],
      asciiName: f[2],
      region,
      countryCode,
      countryName,
      lat: Number(f[4]),
      lng: Number(f[5]),
      population,
      timezone: f[17] || "UTC",
    });
  }
  cities.sort((a, b) => b.population - a.population);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(cities));
  const withRegion = cities.filter((c) => c.region).length;
  console.log(`wrote ${cities.length} cities (${withRegion} with region) to ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
