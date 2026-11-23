import type { JournalEntry } from '../../journal/types';
import type { FavouriteCountry } from '../types/favourite.types';

/** Whether a country has a journal note or photo attached. */
export function hasJournalData(
  entries: Record<string, JournalEntry>,
  countryCode: string,
): boolean {
  const entry = entries[countryCode];
  return !!entry && (!!entry.note || !!entry.photoUri);
}

/**
 * Removal policy:
 * - Countries without journal content are removed immediately.
 * - Countries with a journal note/photo require confirmation, and removing
 *   them also deletes the entry and its stored photo.
 */
export function canRemoveImmediately(
  entries: Record<string, JournalEntry>,
  countryCode: string,
): boolean {
  return !hasJournalData(entries, countryCode);
}

/**
 * Find a favourite by country code.
 */
export function findFavourite(
  favourites: FavouriteCountry[],
  countryCode: string,
): FavouriteCountry | undefined {
  return favourites.find(f => f.countryCode === countryCode);
}
