#!/usr/bin/env node
/**
 * Fetches the Seen-Arabic Morning-And-Evening-Adhkar-DB from GitHub
 * and writes it as a TypeScript data file into src/data/seenArabicDb.ts
 *
 * Usage:  node scripts/fetch-seen-db.mjs
 *         npm run fetch:seen-db
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "src", "data", "seenArabicDb.ts");

const RAW =
    "https://raw.githubusercontent.com/Seen-Arabic/Morning-And-Evening-Adhkar-DB/main";

// All possible file layout patterns across repo versions
const CANDIDATE_PATHS = [
    {
        morning: `${RAW}/Data/ar_en/morning.json`,
        evening: `${RAW}/Data/ar_en/evening.json`,
    },
    {
        morning: `${RAW}/data/ar_en/morning.json`,
        evening: `${RAW}/data/ar_en/evening.json`,
    },
    { morning: `${RAW}/morning.json`, evening: `${RAW}/evening.json` },
    { morning: `${RAW}/db/morning.json`, evening: `${RAW}/db/evening.json` },
    {
        morning: `${RAW}/adhkar/morning.json`,
        evening: `${RAW}/adhkar/evening.json`,
    },
    { morning: `${RAW}/src/morning.json`, evening: `${RAW}/src/evening.json` },
    {
        morning: `${RAW}/assets/morning.json`,
        evening: `${RAW}/assets/evening.json`,
    },
    {
        morning: `${RAW}/Data/morning.json`,
        evening: `${RAW}/Data/evening.json`,
    },
];

async function tryFetch(url) {
    try {
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) return null;
        const text = await res.text();
        const parsed = JSON.parse(text);
        return Array.isArray(parsed)
            ? parsed
            : Array.isArray(parsed?.data)
              ? parsed.data
              : Array.isArray(parsed?.content)
                ? parsed.content
                : null;
    } catch {
        return null;
    }
}

function normalise(record, index, category) {
    // Support multiple field naming conventions used across different repo versions
    const arabic = (
        record.zekr ||
        record.text ||
        record.arabic ||
        record.content ||
        ""
    ).trim();

    const transliteration = (
        record.transliteration ||
        record.translit ||
        ""
    ).trim();

    const translation = (
        record.description ||
        record.translation ||
        record.meaning ||
        record.english ||
        record.en ||
        ""
    ).trim();

    const rawCount = record.count ?? record.repeat ?? record.times ?? 1;
    const count = parseInt(String(rawCount), 10);

    const source = (
        record.reference ||
        record.source ||
        record.hadith ||
        "Morning-And-Evening-Adhkar-DB"
    ).trim();

    const benefit = (record.note || record.benefit || record.fadl || "").trim();

    return {
        id: `seen_${category}_${index + 1}`,
        arabic,
        transliteration,
        translation,
        targetCount: isNaN(count) || count < 1 ? 1 : count,
        source,
        category,
        ...(benefit ? { benefit } : {}),
    };
}

async function main() {
    console.log("Fetching Seen-Arabic/Morning-And-Evening-Adhkar-DB …\n");

    let morning = null;
    let evening = null;

    for (const { morning: mUrl, evening: eUrl } of CANDIDATE_PATHS) {
        if (!morning) {
            const data = await tryFetch(mUrl);
            if (data?.length) {
                console.log(`  ✓ morning — ${mUrl} (${data.length} records)`);
                morning = data;
            }
        }
        if (!evening) {
            const data = await tryFetch(eUrl);
            if (data?.length) {
                console.log(`  ✓ evening — ${eUrl} (${data.length} records)`);
                evening = data;
            }
        }
        if (morning && evening) break;
    }

    if (!morning && !evening) {
        console.error(
            "\n✗ Could not reach any known endpoint.\n" +
                "  → Clone https://github.com/Seen-Arabic/Morning-And-Evening-Adhkar-DB\n" +
                "    and run:  node scripts/fetch-seen-db.mjs --local /path/to/clone\n",
        );
        // Try --local flag fallback
        const localFlag = process.argv.indexOf("--local");
        if (localFlag !== -1 && process.argv[localFlag + 1]) {
            const localDir = path.resolve(process.argv[localFlag + 1]);
            console.log(`Trying local clone at ${localDir} …`);
            const tryLocal = (name) => {
                const candidates = [
                    path.join(localDir, "Data", "ar_en", `${name}.json`),
                    path.join(localDir, "data", "ar_en", `${name}.json`),
                    path.join(localDir, `${name}.json`),
                    path.join(localDir, "db", `${name}.json`),
                    path.join(localDir, "adhkar", `${name}.json`),
                ];
                for (const p of candidates) {
                    if (fs.existsSync(p)) {
                        const arr = JSON.parse(fs.readFileSync(p, "utf8"));
                        return Array.isArray(arr)
                            ? arr
                            : (arr?.data ?? arr?.content ?? null);
                    }
                }
                return null;
            };
            morning = tryLocal("morning");
            evening = tryLocal("evening");
        }
    }

    if (!morning && !evening) {
        console.error(
            "No data found. Leaving existing src/data/seenArabicDb.ts unchanged.",
        );
        process.exit(1);
    }

    const normMorning = (morning ?? []).map((r, i) =>
        normalise(r, i, "morning"),
    );
    const normEvening = (evening ?? []).map((r, i) =>
        normalise(r, i, "evening"),
    );

    // Deduplicate by arabic text
    const seen = new Set();
    const dedup = (arr) =>
        arr.filter((item) => {
            if (!item.arabic || seen.has(item.arabic)) return false;
            seen.add(item.arabic);
            return true;
        });

    const finalMorning = dedup(normMorning);
    const finalEvening = dedup(normEvening);

    console.log(
        `\nWriting ${finalMorning.length} morning + ${finalEvening.length} evening adhkar → ${OUT}`,
    );

    const ts = `// AUTO-GENERATED — do not edit manually.
// Source: https://github.com/Seen-Arabic/Morning-And-Evening-Adhkar-DB
// Fetched: ${new Date().toISOString()}
// Re-run:  npm run fetch:seen-db
import type { Dhikr } from "./dhikr";

export const SEEN_MORNING_ADHKAR: Dhikr[] = ${JSON.stringify(finalMorning, null, 2)};

export const SEEN_EVENING_ADHKAR: Dhikr[] = ${JSON.stringify(finalEvening, null, 2)};
`;

    fs.writeFileSync(OUT, ts, "utf8");
    console.log("Done ✓");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
