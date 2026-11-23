import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { JOURNAL_NOTE_MAX, type JournalEntry } from '../types';

export interface JournalState {
  /** Entries keyed by country code (cca3). */
  entries: Record<string, JournalEntry>;
  /** Whether entries for the current user have been loaded from storage. */
  hydrated: boolean;
  /** The user whose entries are currently loaded. */
  userId: number | null;
  /** Last load/persistence error, if any. */
  error: string | null;
}

const initialState: JournalState = {
  entries: {},
  hydrated: false,
  userId: null,
  error: null,
};

function cleanNote(note: string) {
  return note.trim().slice(0, JOURNAL_NOTE_MAX);
}

/** Entries with neither a note nor a photo are removed automatically. */
function pruneIfEmpty(state: JournalState, countryCode: string) {
  const entry = state.entries[countryCode];
  if (entry && !entry.note && !entry.photoUri) {
    delete state.entries[countryCode];
  }
}

type Stamped = { countryCode: string; timestamp: string };

const journalSlice = createSlice({
  name: 'journal',
  initialState,
  reducers: {
    hydrateJournal(
      state,
      action: PayloadAction<{ userId: number; entries: JournalEntry[] }>,
    ) {
      state.entries = {};
      for (const entry of action.payload.entries) {
        state.entries[entry.countryCode] = entry;
      }
      state.userId = action.payload.userId;
      state.hydrated = true;
      state.error = null;
    },

    createJournalEntry(
      state,
      action: PayloadAction<
        Stamped & { note: string; photoUri: string | null }
      >,
    ) {
      const { countryCode, timestamp, note, photoUri } = action.payload;
      const existing = state.entries[countryCode];
      state.entries[countryCode] = {
        countryCode,
        note: cleanNote(note),
        photoUri,
        createdAt: existing?.createdAt ?? timestamp,
        updatedAt: timestamp,
      };
      pruneIfEmpty(state, countryCode);
      state.error = null;
    },

    updateJournalEntry(
      state,
      action: PayloadAction<Stamped & { note: string }>,
    ) {
      const { countryCode, timestamp, note } = action.payload;
      const entry = state.entries[countryCode];
      if (!entry) {
        return;
      }
      entry.note = cleanNote(note);
      entry.updatedAt = timestamp;
      pruneIfEmpty(state, countryCode);
    },

    setJournalPhoto(
      state,
      action: PayloadAction<Stamped & { photoUri: string }>,
    ) {
      const { countryCode, timestamp, photoUri } = action.payload;
      const entry = state.entries[countryCode];
      if (entry) {
        entry.photoUri = photoUri;
        entry.updatedAt = timestamp;
      } else {
        state.entries[countryCode] = {
          countryCode,
          note: '',
          photoUri,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
      }
    },

    removeJournalPhoto(state, action: PayloadAction<Stamped>) {
      const { countryCode, timestamp } = action.payload;
      const entry = state.entries[countryCode];
      if (!entry) {
        return;
      }
      entry.photoUri = null;
      entry.updatedAt = timestamp;
      pruneIfEmpty(state, countryCode);
    },

    deleteJournalEntry(state, action: PayloadAction<string>) {
      delete state.entries[action.payload];
    },

    /** Roll back to a previous snapshot after a failed write. */
    restoreJournalEntries(
      state,
      action: PayloadAction<Record<string, JournalEntry>>,
    ) {
      state.entries = action.payload;
    },

    setJournalError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },

    resetJournal() {
      return initialState;
    },
  },
});

export const {
  hydrateJournal,
  createJournalEntry,
  updateJournalEntry,
  setJournalPhoto,
  removeJournalPhoto,
  deleteJournalEntry,
  restoreJournalEntries,
  setJournalError,
  resetJournal,
} = journalSlice.actions;
export const journalReducer = journalSlice.reducer;
