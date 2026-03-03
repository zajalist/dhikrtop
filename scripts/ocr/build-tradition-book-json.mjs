import fs from "node:fs";
import path from "node:path";

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function assertRecord(record, index) {
  const required = [
    "traditionId",
    "bookTitle",
    "sectionTitle",
    "category",
    "items",
  ];
  for (const key of required) {
    if (record[key] === undefined || record[key] === null) {
      throw new Error(`Record ${index} missing required field: ${key}`);
    }
  }
  if (!Array.isArray(record.items) || record.items.length === 0) {
    throw new Error(`Record ${index} has no items`);
  }
}

function normalize(inputRows) {
  const grouped = new Map();

  for (let i = 0; i < inputRows.length; i += 1) {
    const row = inputRows[i];
    assertRecord(row, i);

    const bookId = slug(row.bookTitle);
    const sectionId = `${bookId}:${slug(row.sectionTitle)}`;

    const key = `${row.traditionId}::${bookId}::${sectionId}`;
    if (!grouped.has(key)) {
      grouped.set(key, {
        traditionId: row.traditionId,
        bookId,
        bookTitle: row.bookTitle,
        sectionId,
        sectionTitle: row.sectionTitle,
        category: row.category,
        items: [],
      });
    }

    const bucket = grouped.get(key);
    const normalizedItems = row.items.map((item, itemIndex) => ({
      id: `${row.traditionId}:${sectionId}:${itemIndex + 1}`,
      arabic: item.arabic || "",
      transliteration: item.transliteration || "",
      translation: item.translation || "",
      targetCount: Number(item.targetCount || 1),
      source: item.source || row.bookTitle,
      category: row.category,
    }));

    bucket.items.push(...normalizedItems);
  }

  return Array.from(grouped.values());
}

function main() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];

  if (!inputPath || !outputPath) {
    console.error("Usage: node scripts/ocr/build-tradition-book-json.mjs <input.json> <output.json>");
    process.exit(1);
  }

  const absoluteInput = path.resolve(process.cwd(), inputPath);
  const absoluteOutput = path.resolve(process.cwd(), outputPath);

  const raw = fs.readFileSync(absoluteInput, "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("Input JSON must be an array");
  }

  const normalized = normalize(parsed);
  fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true });
  fs.writeFileSync(absoluteOutput, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");

  console.log(`Wrote ${normalized.length} normalized section blocks to ${outputPath}`);
}

main();
