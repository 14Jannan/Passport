/**
 * Journal data model.
 *
 * One entry per favourite country, keyed by the ISO 3166-1 alpha-3 code
 * (cca3). Only personal content is stored — country metadata is always read
 * from the REST Countries cache at render time.
 *
 * `photoUri` is a `file://` URI inside the app-private journal directory,
 * never a temporary picker URI and never image binary data.
 */
export interface JournalEntry {
  countryCode: string;
  note: string;
  photoUri: string | null;
  /** ISO 8601 timestamp of when the entry was first saved. */
  createdAt: string;
  /** ISO 8601 timestamp of the latest change. */
  updatedAt: string;
}

/** Maximum length of a personal note. */
export const JOURNAL_NOTE_MAX = 500;

/** Version of the persisted journal document. */
export const JOURNAL_STORAGE_VERSION = 1;

/** Shape persisted to AsyncStorage under `passport:journal:<userId>`. */
export interface StoredJournal {
  version: typeof JOURNAL_STORAGE_VERSION;
  entries: JournalEntry[];
}

/** How a save should treat the entry photo. */
export type JournalPhotoChange =
  | { kind: 'keep' }
  | { kind: 'set'; uri: string }
  | { kind: 'remove' };

/** User-presentable journal failure. */
export class JournalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JournalError';
  }
}
