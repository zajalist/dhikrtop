import { Dhikr } from "./dhikr";
import {
    EXTERNAL_GENERAL_ADHKAR_DB,
    ExternalGeneralAdhkarRecord,
} from "./externalGeneralAdhkarDb";

function isGeneralLike(record: ExternalGeneralAdhkarRecord): boolean {
    const category = (record.category || record.section || "").toLowerCase();
    if (!category) return true;
    return (
        category.includes("general") ||
        category.includes("anytime") ||
        category.includes("misc")
    );
}

function normalizeToDhikr(
    record: ExternalGeneralAdhkarRecord,
    index: number,
): Dhikr | null {
    const arabic = (record.arabic || record.text || "").trim();
    if (!arabic) return null;

    return {
        id: record.id || `external_general_${index + 1}`,
        arabic,
        transliteration: (record.transliteration || "").trim(),
        translation: (record.translation || "").trim(),
        targetCount: Number(record.count || record.repeat || 1),
        source: (
            record.source ||
            record.reference ||
            "Morning-And-Evening-Adhkar-DB"
        ).trim(),
        category: "general",
    };
}

export const externalGeneralAdhkar: Dhikr[] = EXTERNAL_GENERAL_ADHKAR_DB.filter(
    isGeneralLike,
)
    .map(normalizeToDhikr)
    .filter((item): item is Dhikr => item !== null);
