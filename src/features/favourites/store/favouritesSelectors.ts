import { createSelector } from '@reduxjs/toolkit';
import {
  BUCKET_STATUSES,
  type BucketStatus,
  type BucketStatusCounts,
  type FavouriteCountry,
} from '../types/favourite.types';

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

/** Number of saved countries in each bucket-list status. */
export const selectBucketStatusCounts = createSelector(
  selectAllFavourites,
  (favourites): BucketStatusCounts => {
    const counts: BucketStatusCounts = {
      want_to_visit: 0,
      planning: 0,
      visited: 0,
    };
    for (const favourite of favourites) {
      counts[favourite.bucketStatus] += 1;
    }
    return counts;
  },
);

const favouritesByStatus = createSelector(selectAllFavourites, favourites => {
  const groups = Object.fromEntries(
    BUCKET_STATUSES.map(status => [status, [] as FavouriteCountry[]]),
  ) as Record<BucketStatus, FavouriteCountry[]>;
  for (const favourite of favourites) {
    groups[favourite.bucketStatus].push(favourite);
  }
  return groups;
});

/** Saved countries with the given status, in saved order (memoized). */
export function selectFavouritesByStatus(
  state: { favourites: { items: FavouriteCountry[] } },
  status: BucketStatus,
): FavouriteCountry[] {
  return favouritesByStatus(state)[status];
}

/** The bucket status of a country, or null when it is not saved. */
export function selectCountryBucketStatus(
  state: { favourites: { items: FavouriteCountry[] } },
  countryCode: string,
): BucketStatus | null {
  return (
    state.favourites.items.find(f => f.countryCode === countryCode)
      ?.bucketStatus ?? null
  );
}
