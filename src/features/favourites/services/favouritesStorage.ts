import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_BUCKET_STATUS,
  isBucketStatus,
  type FavouriteCountry,
} from '../types/favourite.types';

function storageKey(userId: number): string {
  return `passport:favourites:${userId}`;
}

/**
 * Load saved favourites for a specific user.
 *
 * Returns an empty array when:
 * - No data exists for the user.
 * - Stored JSON is corrupted or unparseable.
 *
 * Throws on AsyncStorage read failures so the caller can show error feedback.
 */
export async function loadFavourites(
  userId: number,
): Promise<FavouriteCountry[]> {
  const raw = await AsyncStorage.getItem(storageKey(userId));
  if (raw === null) {
    return [];
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Corrupted JSON — treat as empty.
    return [];
  }
  return parseStoredFavourites(parsed);
}

/**
 * Validate stored favourites without discarding the whole list.
 *
 * - Entries without a usable country code or savedAt are dropped.
 * - Entries saved before bucket statuses existed (or with an unknown status)
 *   are migrated to the default 'want_to_visit' instead of being lost.
 * - Duplicate country codes keep the first entry so each country has
 *   exactly one status.
 */
export function parseStoredFavourites(parsed: unknown): FavouriteCountry[] {
  if (!Array.isArray(parsed)) {
    return [];
  }
  const seen = new Set<string>();
  const result: FavouriteCountry[] = [];
  for (const item of parsed) {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof item.countryCode !== 'string' ||
      typeof item.savedAt !== 'string' ||
      seen.has(item.countryCode)
    ) {
      continue;
    }
    seen.add(item.countryCode);
    result.push({
      countryCode: item.countryCode,
      savedAt: item.savedAt,
      bucketStatus: isBucketStatus(item.bucketStatus)
        ? item.bucketStatus
        : DEFAULT_BUCKET_STATUS,
    });
  }
  return result;
}

/**
 * Persist the full favourites list for a specific user.
 *
 * Overwrites the entire key to ensure the stored state matches the in-memory
 * Redux state exactly. Rapid toggles are safe because Redux Toolkit serializes
 * reducer updates and each save writes the latest snapshot.
 */
export async function saveFavourites(
  userId: number,
  favourites: FavouriteCountry[],
): Promise<void> {
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(favourites));
}

/**
 * Remove all favourites data for a specific user.
 * Used when the user explicitly chooses to clear local saved data.
 */
export async function clearFavourites(userId: number): Promise<void> {
  await AsyncStorage.removeItem(storageKey(userId));
}
