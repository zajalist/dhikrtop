import fs from "node:fs";
import path from "node:path";

function readJson(filePath) {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
        throw new Error("Input must be a JSON array");
    }
    return parsed;
}

function toTsModule(records) {
    return (
        `// Auto-generated from external adhkar DB source\n` +
        `// Source repo: https://github.com/Seen-Arabic/Morning-And-Evening-Adhkar-DB\n` +
        `export interface ExternalGeneralAdhkarRecord {\n` +
        `  id?: string;\n` +
        `  arabic?: string;\n` +
        `  text?: string;\n` +
        `  transliteration?: string;\n` +
        `  translation?: string;\n` +
        `  source?: string;\n` +
        `  reference?: string;\n` +
        `  count?: number;\n` +
        `  repeat?: number;\n` +
        `  category?: string;\n` +
        `  section?: string;\n` +
        `}\n\n` +
        `export const EXTERNAL_GENERAL_ADHKAR_DB: ExternalGeneralAdhkarRecord[] = ${JSON.stringify(records, null, 2)};\n`
    );
}

function main() {
    const input = process.argv[2];
    const output =
        process.argv[3] || "src/data/externalGeneralAdhkarDb.generated.ts";

    if (!input) {
        console.error(
            "Usage: node scripts/ocr/import-seen-db-to-ts.mjs <input.json> [output.ts]",
        );
        process.exit(1);
    }

    const inputPath = path.resolve(process.cwd(), input);
    const outputPath = path.resolve(process.cwd(), output);

    const records = readJson(inputPath);
    const content = toTsModule(records);

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, content, "utf8");
    console.log(`Generated ${outputPath} with ${records.length} records.`);
}

main();
