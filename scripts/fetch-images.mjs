/**
 * Photo fetch.
 *
 * Pulls curated Unsplash photos for the Biteperk site. Each photo is
 * keyed by `slug` (filename) and an Unsplash photo ID. We hit the
 * `images.unsplash.com` CDN directly with width + quality params, so
 * no Unsplash API key is needed.
 *
 * Idempotent: a photo that already exists in public/images/raw/ is
 * skipped. Re-run to refresh after changing the catalogue.
 *
 * License note: Unsplash is free for commercial and non-commercial use.
 * We attribute photographers in public/images/CREDITS.txt anyway.
 *
 * Usage: node scripts/fetch-images.mjs
 */
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const RAW = join(ROOT, "public", "images", "raw");
const CREDITS = join(ROOT, "public", "images", "CREDITS.txt");

if (!existsSync(RAW)) mkdirSync(RAW, { recursive: true });

// Curated Unsplash photos. Each entry: slug, photoId, photographer, photographerUrl, brief.
// IDs verified against Unsplash hot-link CDN — these are stable, long-lived photos.
const catalogue = [
  {
    slug: "restaurant-evening",
    id: "photo-1517248135467-4c7edcad34c4",
    photographer: "Patrick Tomasso",
    url: "https://unsplash.com/photos/Oaqk7qqNh_c",
    brief: "Dim restaurant interior, candlelit tables",
  },
  {
    slug: "sydney-harbour-dusk",
    id: "photo-1506905925346-21bda4d32df4",
    photographer: "Photoholgic",
    url: "https://unsplash.com/photos/HwBNbWbjPpk",
    brief: "Sydney harbour at dusk with bridge silhouette",
  },
  {
    slug: "phone-on-bar",
    id: "photo-1556656793-08538906a9f8",
    photographer: "Jonas Leupe",
    url: "https://unsplash.com/photos/Em9SauavhKE",
    brief: "Mobile phone on a wooden bar counter",
  },
  {
    slug: "hands-headset",
    id: "photo-1521737604893-d14cc237f11d",
    photographer: "Mimi Thian",
    url: "https://unsplash.com/photos/ZKBzlifgkgw",
    brief: "Hands adjusting a headset, low key",
  },
  {
    slug: "reservation-book",
    id: "photo-1455390582262-044cdead277a",
    photographer: "Aaron Burden",
    url: "https://unsplash.com/photos/y02jEX_B0O0",
    brief: "Open notebook with pen, paper texture",
  },
  {
    slug: "restaurant-pass",
    id: "photo-1414235077428-338989a2e8c0",
    photographer: "Jay Wennington",
    url: "https://unsplash.com/photos/N_Y88TWmGwA",
    brief: "Kitchen pass with prepared dish",
  },
  {
    slug: "restaurant-host",
    id: "photo-1559339352-11d035aa65de",
    photographer: "Louis Hansel",
    url: "https://unsplash.com/photos/qREZGOkkOdY",
    brief: "Front-of-house host scene",
  },
  {
    slug: "kitchen-rush",
    id: "photo-1556910103-1c02745aae4d",
    photographer: "Louis Hansel",
    url: "https://unsplash.com/photos/dxIuhpkdHHM",
    brief: "Busy kitchen service moment",
  },
  {
    slug: "coffee-window",
    id: "photo-1554118811-1e0d58224f24",
    photographer: "Toa Heftiba",
    url: "https://unsplash.com/photos/rb-WrM5_3a4",
    brief: "Coffee shop service window with morning light",
  },
  {
    slug: "sydney-cafe-morning",
    id: "photo-1453614512568-c4024d13c247",
    photographer: "Brooke Cagle",
    url: "https://unsplash.com/photos/uxXHfTrAU0o",
    brief: "Café interior, morning amber light",
  },
  {
    slug: "pour-shot",
    id: "photo-1510812431401-41d2bd2722f3",
    photographer: "Mae Mu",
    url: "https://unsplash.com/photos/yA-OOaENvxg",
    brief: "Drink pour, low-key dramatic light",
  },
  {
    slug: "empty-tables-evening",
    id: "photo-1552566626-52f8b828add9",
    photographer: "Stefan Johnson",
    url: "https://unsplash.com/photos/-pwT7nz1Lec",
    brief: "Empty restaurant tables, dim warm light",
  },
  {
    slug: "pizza-pass",
    id: "photo-1565299624946-b28f40a0ae38",
    photographer: "Aurélien Lemasson-Théobald",
    url: "https://unsplash.com/photos/m5GiI16fxlw",
    brief: "Pizza emerging on a pass",
  },
  {
    slug: "sydney-skyline-night",
    id: "photo-1523428096881-5bd79d043006",
    photographer: "Dan Freeman",
    url: "https://unsplash.com/photos/SzWBPqg6Vss",
    brief: "Sydney skyline at night with harbour reflection",
  },
  {
    slug: "busy-service-night",
    id: "photo-1559339352-11d035aa65de",
    photographer: "Louis Hansel",
    url: "https://unsplash.com/photos/qREZGOkkOdY",
    brief: "Full restaurant during service, candle-lit, busy tables",
  },
  {
    slug: "sydney-cafe-street",
    id: "photo-1521017432531-fbd92d768814",
    photographer: "Toa Heftiba",
    url: "https://unsplash.com/photos/4xe-yVFJCvw",
    brief: "Café street view, awning + signage, golden hour",
  },
  {
    slug: "bar-cocktail-action",
    id: "photo-1514362545857-3bc16c4c7d1b",
    photographer: "Edward Howell",
    url: "https://unsplash.com/photos/u3WmDyKGsrY",
    brief: "Cocktail pour in a low-lit bar, hand visible",
  },
  {
    slug: "table-set-candles",
    id: "photo-1424847651672-bf20a4b0982b",
    photographer: "Rod Long",
    url: "https://unsplash.com/photos/oZsP-od1jOM",
    brief: "Close-up of a set restaurant table with candles + cutlery",
  },
  {
    slug: "staff-hands-tray",
    id: "photo-1559925393-8be0ec4767c8",
    photographer: "Louis Hansel",
    url: "https://unsplash.com/photos/7QChbqDes6w",
    brief: "Hands of service staff carrying a tray",
  },
];

const FETCH_W = 2000;
const FETCH_Q = 85;

async function fetchOne(entry) {
  const out = join(RAW, `${entry.slug}.jpg`);
  if (existsSync(out)) {
    console.log(`· ${entry.slug} (cached)`);
    return { ...entry, status: "cached" };
  }
  const url = `https://images.unsplash.com/${entry.id}?w=${FETCH_W}&q=${FETCH_Q}&fm=jpg&fit=max&auto=format`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "biteperk-website/fetch-images (https://biteperk.com.au)",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(out, buf);
    const kb = Math.round(buf.length / 1024);
    console.log(`✓ ${entry.slug} (${kb} KB)`);
    return { ...entry, status: "fetched" };
  } catch (err) {
    console.error(`✗ ${entry.slug}: ${err.message}`);
    return { ...entry, status: "failed", error: err.message };
  }
}

console.log(`→ fetching ${catalogue.length} photos from Unsplash CDN…\n`);

const results = [];
for (const entry of catalogue) {
  results.push(await fetchOne(entry));
}

const ok = results.filter((r) => r.status !== "failed");
const failed = results.filter((r) => r.status === "failed");

// ── Credits file ───────────────────────────────────────────────────
const creditLines = [
  "Biteperk photo credits",
  "=====================",
  "",
  "All photos sourced under the Unsplash License (https://unsplash.com/license).",
  "Photos have been colour-graded for site consistency. Originals are at the",
  "URLs below.",
  "",
];
for (const r of ok) {
  creditLines.push(`${r.slug}`);
  creditLines.push(`  Photographer: ${r.photographer}`);
  creditLines.push(`  Original:     ${r.url}`);
  creditLines.push(`  Brief:        ${r.brief}`);
  creditLines.push("");
}
writeFileSync(CREDITS, creditLines.join("\n"));

console.log("");
console.log(`fetched: ${results.filter((r) => r.status === "fetched").length}`);
console.log(`cached:  ${results.filter((r) => r.status === "cached").length}`);
console.log(`failed:  ${failed.length}`);
if (failed.length > 0) {
  console.error("\nFailed fetches:");
  failed.forEach((f) => console.error(`  ${f.slug} → ${f.error}`));
  process.exitCode = 1;
}
