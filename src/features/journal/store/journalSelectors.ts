import { createSelector } from '@reduxjs/toolkit';
import type { JournalEntry } from '../types';
import type { JournalState } from './journalSlice';

type WithJournal = { journal: JournalState };

const selectEntryMap = (state: WithJournal) => state.journal.entries;

/** All entries, most recently updated first. */
export const selectJournalEntries = createSelector(
  selectEntryMap,
  (entries): JournalEntry[] =>
    Object.values(entries).sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    ),
);

export function selectJournalEntryByCountry(
  state: WithJournal,
  countryCode: string,
): JournalEntry | undefined {
  return state.journal.entries[countryCode];
}

export function selectJournalCount(state: WithJournal): number {
  return Object.keys(state.journal.entries).length;
}

export const selectJournalPhotoCount = createSelector(
  selectEntryMap,
  entries => Object.values(entries).filter(entry => entry.photoUri).length,
);

export function selectJournalHydrated(state: WithJournal): boolean {
  return state.journal.hydrated;
}

export function selectJournalError(state: WithJournal): string | null {
  return state.journal.error;
}
