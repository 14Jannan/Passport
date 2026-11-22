import { createSelector } from '@reduxjs/toolkit';
import type { FavouriteCountry } from '../types/favourite.types';

/**
 * Selectors operate on the favourites sub-state directly.
 * The store types are inferred from the store file; these selectors
 * accept the slice state via the typed `useAppSelector` accessor.
 */

/** Select all favourite countries. */
export function selectAllFavourites(state: {
  favourites: { items: FavouriteCountry[] };
}): FavouriteCountry[] {
  return state.favourites.items;
}

/** Check whether a specific country is saved. */
export function selectIsFavourite(
  state: { favourites: { items: FavouriteCountry[] } },
  countryCode: string,
): boolean {
  return state.favourites.items.some(f => f.countryCode === countryCode);
}

/** Select the total count of saved countries. */
export function selectFavouriteCount(state: {
  favourites: { items: FavouriteCountry[] };
}): number {
  return state.favourites.items.length;
}

/** Select whether hydration has completed. */
export function selectFavouritesHydrated(state: {
  favourites: { hydrated: boolean };
}): boolean {
  return state.favourites.hydrated;
}

/** Select the current persistence error, if any. */
export function selectFavouritesError(state: {
  favourites: { error: string | null };
}): string | null {
  return state.favourites.error;
}

/** Memoized selector for favourite country codes (for FlatList keyExtractor etc). */
export const selectFavouriteCountryCodes = createSelector(
  selectAllFavourites,
  favourites => new Set(favourites.map(f => f.countryCode)),
);
