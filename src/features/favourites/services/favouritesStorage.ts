import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FavouriteCountry } from '../types/favourite.types';

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
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    // Validate each entry loosely — drop corrupted entries instead of
    // discarding the entire list.
    return parsed.filter(
      (item): item is FavouriteCountry =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.countryCode === 'string' &&
        typeof item.savedAt === 'string' &&
        typeof item.bucketStatus === 'string',
    );
  } catch {
    // Corrupted JSON — treat as empty.
    return [];
  }
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
