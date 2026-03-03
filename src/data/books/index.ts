// ── Book Library Master Export ────────────────────────────────────────────────
// All tradition books are indexed here. Add new books to BOOK_REGISTRY.

export type { AdhkarBook, BookSection, BookAdhkarItem } from "./types";

export { HISN_AL_MUSLIM } from "./hisn-al-muslim";
export { WIRD_AL_LATIF } from "./wird-al-latif";
export { RATIB_AL_HADDAD } from "./ratib-al-haddad";
export { DALAIL_AL_KHAYRAT } from "./dalail-khayrat";
export { NAWAWI_ADHKAR } from "./nawawi-adhkar";

import type { AdhkarBook } from "./types";
import { HISN_AL_MUSLIM } from "./hisn-al-muslim";
import { WIRD_AL_LATIF } from "./wird-al-latif";
import { RATIB_AL_HADDAD } from "./ratib-al-haddad";
import { DALAIL_AL_KHAYRAT } from "./dalail-khayrat";
import { NAWAWI_ADHKAR } from "./nawawi-adhkar";

export const BOOK_REGISTRY: AdhkarBook[] = [
  HISN_AL_MUSLIM,
  WIRD_AL_LATIF,
  RATIB_AL_HADDAD,
  DALAIL_AL_KHAYRAT,
  NAWAWI_ADHKAR,
];

export function getBookById(bookId: string): AdhkarBook | undefined {
  return BOOK_REGISTRY.find((book) => book.id === bookId);
}

export function getBooksForTradition(traditionId: string): AdhkarBook[] {
  return BOOK_REGISTRY.filter((book) => book.tradition === traditionId);
}

/** Flat list of all items across all sections of all books. */
export function getAllBookItems() {
  return BOOK_REGISTRY.flatMap((book) =>
    book.sections.flatMap((section) =>
      section.adhkar.map((item) => ({
        ...item,
        bookId: book.id,
        bookTitle: book.title,
        sectionId: section.id,
        sectionTitle: section.title,
        category: section.category,
        tradition: book.tradition,
      })),
    ),
  );
}
