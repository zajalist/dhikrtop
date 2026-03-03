# OCR Import Pipeline

This folder prepares OCR text into structured tradition-book JSON while preserving original section boundaries.

## What this solves

- Keep each book divided into its original sections/chapters.
- Produce stable section IDs for app settings and daily carousel filtering.
- Validate minimum required fields before import.

## Input format

See `template.input.json`.

Each input record should contain:

- `traditionId`
- `bookTitle`
- `sectionTitle`
- `category` (`morning`, `evening`, `after-prayer`, `general`)
- `items[]` with `arabic`, `transliteration`, `translation`, `targetCount`, `source`

## Build command

```bash
node scripts/ocr/build-tradition-book-json.mjs scripts/ocr/template.input.json src/data/imported-traditions.sample.json
```

## Import Seen-Arabic DB for General Adhkar

If you export JSON from https://github.com/Seen-Arabic/Morning-And-Evening-Adhkar-DB, generate a typed TS module with:

```bash
node scripts/ocr/import-seen-db-to-ts.mjs /path/to/seen-db-export.json src/data/externalGeneralAdhkarDb.generated.ts
```

Then copy/paste the generated array into `src/data/externalGeneralAdhkarDb.ts` (or replace your app import strategy as needed).

## Notes

- This script does not scrape websites.
- You can place OCR text manually (or from your own extraction workflow) into input JSON and run normalization.
