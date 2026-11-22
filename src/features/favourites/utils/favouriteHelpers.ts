import type { FavouriteCountry } from '../types/favourite.types';

/**
 * Check whether a country has associated journal data.
 * Returns false until journal functionality is implemented (Prompt 6).
 *
 * When journal notes/photos are introduced, this function should check the
 * journal store for entries associated with the given country code.
 */
export function hasJournalData(_countryCode: string): boolean {
  return false;
}

/**
 * Determine whether a favourite can be removed immediately.
 *
 * Current policy:
 * - Countries with no journal data are removed immediately.
 * - Countries with journal data should prompt for confirmation (future).
 *
 * Since journal is not yet implemented, all countries can be removed immediately.
 */
export function canRemoveImmediately(countryCode: string): boolean {
  return !hasJournalData(countryCode);
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
