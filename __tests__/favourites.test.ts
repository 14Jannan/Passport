import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  favouritesReducer,
  hydrateFavourites,
  addFavourite,
  removeFavourite,
  toggleFavourite,
  updateBucketStatus,
  setFavouritesError,
  clearFavouritesError,
  type FavouritesState,
} from '../src/features/favourites/store/favouritesSlice';
import {
  selectAllFavourites,
  selectIsFavourite,
  selectFavouriteCount,
  selectFavouritesHydrated,
  selectFavouritesError,
} from '../src/features/favourites/store/favouritesSelectors';
import {
  loadFavourites,
  saveFavourites,
  clearFavourites,
} from '../src/features/favourites/services/favouritesStorage';
import type { FavouriteCountry } from '../src/features/favourites/types/favourite.types';

// ── helpers ──────────────────────────────────────────────────────────────────

function makeState(items: FavouriteCountry[] = []): FavouritesState {
  return { items, hydrated: false, error: null };
}

function rootState(items: FavouriteCountry[] = [], hydrated = true) {
  return { favourites: { items, hydrated, error: null } };
}

const japan: FavouriteCountry = {
  countryCode: 'JPN',
  savedAt: '2026-11-22T10:00:00.000Z',
  bucketStatus: 'want_to_visit',
};

const canada: FavouriteCountry = {
  countryCode: 'CAN',
  savedAt: '2026-11-22T11:00:00.000Z',
  bucketStatus: 'want_to_visit',
};

const lka: FavouriteCountry = {
  countryCode: 'LKA',
  savedAt: '2026-11-22T12:00:00.000Z',
  bucketStatus: 'planning',
};

// ── slice reducers ───────────────────────────────────────────────────────────

describe('favouritesSlice', () => {
  it('has the correct initial state', () => {
    const state = favouritesReducer(undefined, { type: '@@INIT' });
    expect(state).toEqual({ items: [], hydrated: false, error: null });
  });

  describe('addFavourite', () => {
    it('adds a country', () => {
      const state = favouritesReducer(
        makeState(),
        addFavourite({ countryCode: 'JPN', savedAt: japan.savedAt }),
      );
      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual(japan);
    });

    it('prevents duplicate country codes', () => {
      const state = favouritesReducer(
        makeState([japan]),
        addFavourite({ countryCode: 'JPN', savedAt: '2026-12-01T00:00:00Z' }),
      );
      expect(state.items).toHaveLength(1);
      // Timestamp is NOT updated for duplicates — original is preserved.
      expect(state.items[0]!.savedAt).toBe(japan.savedAt);
    });

    it('defaults bucketStatus to want_to_visit', () => {
      const state = favouritesReducer(
        makeState(),
        addFavourite({ countryCode: 'CAN', savedAt: canada.savedAt }),
      );
      expect(state.items[0]!.bucketStatus).toBe('want_to_visit');
    });
  });

  describe('removeFavourite', () => {
    it('removes a country by code', () => {
      const state = favouritesReducer(
        makeState([japan, canada]),
        removeFavourite('JPN'),
      );
      expect(state.items).toEqual([canada]);
    });

    it('does nothing for a code that is not saved', () => {
      const state = favouritesReducer(
        makeState([japan]),
        removeFavourite('CAN'),
      );
      expect(state.items).toEqual([japan]);
    });
  });

  describe('toggleFavourite', () => {
    it('adds a country when not saved', () => {
      const state = favouritesReducer(
        makeState(),
        toggleFavourite({ countryCode: 'JPN', savedAt: japan.savedAt }),
      );
      expect(state.items).toHaveLength(1);
      expect(state.items[0]!.countryCode).toBe('JPN');
    });

    it('removes a country when already saved', () => {
      const state = favouritesReducer(
        makeState([japan]),
        toggleFavourite({ countryCode: 'JPN', savedAt: japan.savedAt }),
      );
      expect(state.items).toHaveLength(0);
    });
  });

  describe('updateBucketStatus', () => {
    it('updates bucketStatus of a saved country', () => {
      const state = favouritesReducer(
        makeState([japan]),
        updateBucketStatus({ countryCode: 'JPN', bucketStatus: 'visited' }),
      );
      expect(state.items[0]!.bucketStatus).toBe('visited');
    });

    it('does nothing for a country that is not saved', () => {
      const state = favouritesReducer(
        makeState([japan]),
        updateBucketStatus({ countryCode: 'CAN', bucketStatus: 'planning' }),
      );
      expect(state.items).toEqual([japan]);
    });
  });

  describe('hydrateFavourites', () => {
    it('replaces items and marks hydrated', () => {
      const state = favouritesReducer(
        makeState(),
        hydrateFavourites([japan, canada]),
      );
      expect(state.items).toEqual([japan, canada]);
      expect(state.hydrated).toBe(true);
    });

    it('clears error on hydration', () => {
      const withError: FavouritesState = {
        items: [],
        hydrated: false,
        error: 'some error',
      };
      const state = favouritesReducer(withError, hydrateFavourites([]));
      expect(state.error).toBeNull();
    });
  });

  describe('error actions', () => {
    it('sets an error message', () => {
      const state = favouritesReducer(
        makeState(),
        setFavouritesError('Write failed'),
      );
      expect(state.error).toBe('Write failed');
    });

    it('clears the error', () => {
      const withError: FavouritesState = {
        items: [],
        hydrated: false,
        error: 'Write failed',
      };
      const state = favouritesReducer(withError, clearFavouritesError());
      expect(state.error).toBeNull();
    });
  });

  describe('rapid consecutive updates', () => {
    it('handles multiple toggles in sequence', () => {
      let state = makeState();
      // Add JPN
      state = favouritesReducer(
        state,
        toggleFavourite({ countryCode: 'JPN', savedAt: japan.savedAt }),
      );
      expect(state.items).toHaveLength(1);
      // Add CAN
      state = favouritesReducer(
        state,
        toggleFavourite({ countryCode: 'CAN', savedAt: canada.savedAt }),
      );
      expect(state.items).toHaveLength(2);
      // Remove JPN
      state = favouritesReducer(
        state,
        toggleFavourite({ countryCode: 'JPN', savedAt: japan.savedAt }),
      );
      expect(state.items).toHaveLength(1);
      expect(state.items[0]!.countryCode).toBe('CAN');
      // Remove CAN
      state = favouritesReducer(
        state,
        toggleFavourite({ countryCode: 'CAN', savedAt: canada.savedAt }),
      );
      expect(state.items).toHaveLength(0);
    });
  });
});

// ── selectors ────────────────────────────────────────────────────────────────

describe('favourites selectors', () => {
  it('selectAllFavourites returns all items', () => {
    expect(selectAllFavourites(rootState([japan, canada]))).toEqual([
      japan,
      canada,
    ]);
  });

  it('selectIsFavourite returns true for saved country', () => {
    expect(selectIsFavourite(rootState([japan]), 'JPN')).toBe(true);
  });

  it('selectIsFavourite returns false for unsaved country', () => {
    expect(selectIsFavourite(rootState([japan]), 'CAN')).toBe(false);
  });

  it('selectFavouriteCount returns the count', () => {
    expect(selectFavouriteCount(rootState([japan, canada]))).toBe(2);
  });

  it('selectFavouriteCount returns 0 for empty state', () => {
    expect(selectFavouriteCount(rootState([]))).toBe(0);
  });

  it('selectFavouritesHydrated returns hydrated flag', () => {
    expect(selectFavouritesHydrated(rootState([], true))).toBe(true);
    expect(selectFavouritesHydrated(rootState([], false))).toBe(false);
  });

  it('selectFavouritesError returns the error', () => {
    const state = { favourites: { items: [], hydrated: true, error: 'oops' } };
    expect(selectFavouritesError(state)).toBe('oops');
  });
});

// ── storage service ──────────────────────────────────────────────────────────

describe('favouritesStorage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns empty array when no data exists', async () => {
    const result = await loadFavourites(1);
    expect(result).toEqual([]);
  });

  it('saves and loads favourites', async () => {
    await saveFavourites(42, [japan, canada]);
    const loaded = await loadFavourites(42);
    expect(loaded).toEqual([japan, canada]);
  });

  it('isolates data per user', async () => {
    await saveFavourites(1, [japan]);
    await saveFavourites(2, [canada]);
    expect(await loadFavourites(1)).toEqual([japan]);
    expect(await loadFavourites(2)).toEqual([canada]);
  });

  it('handles corrupted JSON gracefully', async () => {
    await AsyncStorage.setItem('passport:favourites:99', '{invalid json');
    const result = await loadFavourites(99);
    expect(result).toEqual([]);
  });

  it('handles non-array stored value', async () => {
    await AsyncStorage.setItem(
      'passport:favourites:99',
      JSON.stringify({ not: 'an array' }),
    );
    const result = await loadFavourites(99);
    expect(result).toEqual([]);
  });

  it('filters out corrupted entries', async () => {
    const mixed = [japan, { broken: true }, canada];
    await AsyncStorage.setItem('passport:favourites:99', JSON.stringify(mixed));
    const result = await loadFavourites(99);
    expect(result).toEqual([japan, canada]);
  });

  it('clearFavourites removes the key', async () => {
    await saveFavourites(42, [japan]);
    await clearFavourites(42);
    const loaded = await loadFavourites(42);
    expect(loaded).toEqual([]);
  });

  it('uses scoped storage key per user', async () => {
    await saveFavourites(42, [japan]);
    const raw = await AsyncStorage.getItem('passport:favourites:42');
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toEqual([japan]);
  });

  describe('persistence serialization', () => {
    it('serializes to valid JSON', async () => {
      await saveFavourites(1, [japan, lka]);
      const raw = await AsyncStorage.getItem('passport:favourites:1');
      expect(() => JSON.parse(raw!)).not.toThrow();
      const parsed = JSON.parse(raw!);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].countryCode).toBe('JPN');
      expect(parsed[1].countryCode).toBe('LKA');
      expect(parsed[1].bucketStatus).toBe('planning');
    });
  });
});

// ── search filtering ─────────────────────────────────────────────────────────

describe('search saved countries', () => {
  const countries = [
    { cca3: 'JPN', commonName: 'Japan', officialName: 'Japan' },
    { cca3: 'CAN', commonName: 'Canada', officialName: 'Canada' },
    {
      cca3: 'LKA',
      commonName: 'Sri Lanka',
      officialName: 'Democratic Socialist Republic of Sri Lanka',
    },
  ];

  function searchFavourites(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) {
      return countries;
    }
    return countries.filter(
      c =>
        c.commonName.toLowerCase().includes(q) ||
        c.officialName?.toLowerCase().includes(q),
    );
  }

  it('returns all when query is empty', () => {
    expect(searchFavourites('')).toHaveLength(3);
  });

  it('filters by common name', () => {
    expect(searchFavourites('japan')).toEqual([countries[0]]);
  });

  it('filters by official name', () => {
    expect(searchFavourites('democratic')).toEqual([countries[2]]);
  });

  it('case-insensitive', () => {
    expect(searchFavourites('CANADA')).toEqual([countries[1]]);
  });

  it('returns empty for no match', () => {
    expect(searchFavourites('xyz')).toEqual([]);
  });
});
