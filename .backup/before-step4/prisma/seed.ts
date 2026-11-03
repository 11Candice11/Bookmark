import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// The single .env lives in the repo root, two levels above this file.
config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

/**
 * Loads the store-locator data in prisma/data/branches.json into the "Branch" table.
 * Safe to re-run: rows are upserted by `storeCode`. Re-running refreshes the locator fields
 * but leaves booking settings (slotMinutes, closedDays, isActive) alone.
 */

// The file is grouped by the headings used in the source list. Map each heading to a province.
const SECTION_PROVINCE: Record<string, string> = {
  "Cape Town": "Western Cape",
  Gauteng: "Gauteng",
  Limpopo: "Limpopo",
  "Eastern Cape": "Eastern Cape",
  "Free state": "Free State",
  "KwaZulu-natal": "KwaZulu-Natal",
  Mpumalanga: "Mpumalanga",
  "Northern Cape": "Northern Cape",
  "North West": "North West",
  "Western Cape": "Western Cape",
};
const PROVINCES = [...new Set(Object.values(SECTION_PROVINCE))];

// `brand` is an opaque code in the locator data. This one is used by every full branch
// (attribute "Branch"); ATMs and business centres each have their own code.
const BRANCH_BRAND = "locator-over-acoustic";

// The locator gives one open/close pair per branch and nothing per weekday. Weekend hours are
// usually shorter, so new rows start closed on Saturday (6) and Sunday (0) rather than offering
// slots the branch may not staff. Change a branch's `closedDays` once its weekend hours are known.
const DEFAULT_CLOSED_DAYS = [0, 6];

const LOCAL_PAGE_BASE = "https://capitecpages.localpages.io/";

type SourceStore = {
  storeCode: string;
  slug: string;
  name: string;
  brand: string;
  primaryNumber: string | null;
  address: string;
  latitude: number;
  longitude: number;
  attributes: string[];
  tradingStatus: string | null;
  hours: [open: string, close: string] | null;
  placeId: string | null;
};

/** "8:00 AM" -> "08:00". A closing time of "12:00 AM" is midnight, stored as "24:00". */
function to24h(value: string, isClosing: boolean): string {
  const m = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(value);
  if (!m) throw new Error(`Unrecognised time "${value}"`);
  let hour = Number(m[1]) % 12;
  if (m[3] === "PM") hour += 12;
  if (hour === 0 && isClosing) return "24:00";
  return `${String(hour).padStart(2, "0")}:${m[2]}`;
}

/** Province: the province named in the address, falling back to the section heading. */
function provinceOf(parts: string[], sectionProvince: string, name: string): string {
  const fromAddress = PROVINCES.find((p) => parts.includes(p));
  if (fromAddress && fromAddress !== sectionProvince) {
    throw new Error(`${name}: address says ${fromAddress} but it is listed under ${sectionProvince}`);
  }
  return fromAddress ?? sectionProvince;
}

/** City: the element in front of the province / postcode / country at the end of the address. */
function cityOf(parts: string[], province: string, name: string): string {
  const rest = [...parts];
  if (rest.at(-1) === "South Africa") rest.pop();
  if (/^\d{4}$/.test(rest.at(-1) ?? "")) rest.pop();
  if (rest.at(-1) === province) rest.pop();
  const city = rest.at(-1);
  if (!city) throw new Error(`${name}: could not work out the city from "${parts.join(", ")}"`);
  return city;
}

function validate(store: SourceStore) {
  const problems: string[] = [];
  // Rough bounding box around South Africa, to catch typos in coordinates.
  if (!(store.latitude >= -35 && store.latitude <= -22)) problems.push(`latitude ${store.latitude}`);
  if (!(store.longitude >= 16 && store.longitude <= 33)) problems.push(`longitude ${store.longitude}`);
  if (store.placeId !== null && !/^ChIJ[\w-]{23}$/.test(store.placeId)) problems.push(`placeId ${store.placeId}`);
  if (problems.length) throw new Error(`${store.name}: suspicious ${problems.join(", ")}`);
}

function loadRows() {
  const file = new URL("./data/branches.json", import.meta.url);
  const sections = JSON.parse(readFileSync(file, "utf8")) as Record<string, SourceStore[]>;

  const seen = { storeCode: new Set<string>(), slug: new Set<string>() };
  const rows = [];

  for (const [section, stores] of Object.entries(sections)) {
    const sectionProvince = SECTION_PROVINCE[section];
    if (!sectionProvince) throw new Error(`Unknown section "${section}" in branches.json`);

    for (const s of stores) {
      for (const key of ["storeCode", "slug"] as const) {
        if (seen[key].has(s[key])) throw new Error(`Duplicate ${key} "${s[key]}"`);
        seen[key].add(s[key]);
      }
      validate(s);

      const parts = s.address.split(",").map((p) => p.trim());
      const province = provinceOf(parts, sectionProvince, s.name);

      rows.push({
        // locator fields
        storeCode: s.storeCode,
        slug: s.slug,
        name: s.name,
        brand: s.brand,
        primaryNumber: s.primaryNumber,
        address: s.address,
        country: "South Africa",
        latitude: s.latitude,
        longitude: s.longitude,
        attributes: s.attributes,
        tradingStatus: s.tradingStatus,
        opensAt: s.hours ? to24h(s.hours[0], false) : null,
        closesAt: s.hours ? to24h(s.hours[1], true) : null,
        localPageUrl: LOCAL_PAGE_BASE + s.slug,
        googleDirectionsLink: s.placeId
          ? "https://www.google.com/maps/dir/?" +
            new URLSearchParams({ api: "1", destination: s.name, destination_place_id: s.placeId })
          : null,
        // derived from the address
        province,
        city: cityOf(parts, province, s.name),
        // booking setting, only used when the row is first created
        isActive: s.brand === BRANCH_BRAND && s.tradingStatus === "Open",
      });
    }
  }
  return rows;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set (expected in the repo-root .env)");

  const rows = loadRows();
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    await prisma.$transaction(
      rows.map(({ isActive, ...locator }) =>
        prisma.branch.upsert({
          where: { storeCode: locator.storeCode },
          create: { ...locator, isActive, closedDays: DEFAULT_CLOSED_DAYS },
          update: locator,
        }),
      ),
    );

    const total = await prisma.branch.count();
    const active = await prisma.branch.count({ where: { isActive: true } });
    const byProvince = await prisma.branch.groupBy({
      by: ["province"],
      _count: { _all: true },
      orderBy: { province: "asc" },
    });
    console.log(`Seeded ${rows.length} locations (${total} in table, ${active} accepting bookings).`);
    for (const p of byProvince) console.log(`  ${p.province}: ${p._count._all}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
