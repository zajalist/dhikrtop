// Populate this array from the external repository:
// https://github.com/Seen-Arabic/Morning-And-Evening-Adhkar-DB
//
// Keep this file data-only so it can be updated without touching app logic.

export interface ExternalGeneralAdhkarRecord {
  id?: string;
  arabic?: string;
  text?: string;
  transliteration?: string;
  translation?: string;
  source?: string;
  reference?: string;
  count?: number;
  repeat?: number;
  category?: string;
  section?: string;
}

export const EXTERNAL_GENERAL_ADHKAR_DB: ExternalGeneralAdhkarRecord[] = [];
