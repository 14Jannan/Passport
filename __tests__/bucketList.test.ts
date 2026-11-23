import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAppStore } from '../src/app/store';
import { signIn } from '../src/features/auth/session';
import {
  BucketStatusError,
  changeBucketStatus,
} from '../src/features/favourites/services/favouritesActions';
import {
  loadFavourites,
  parseStoredFavourites,
  saveFavourites,
} from '../src/features/favourites/services/favouritesStorage';
import {
  selectBucketStatusCounts,
  selectCountryBucketStatus,
  selectFavouritesByStatus,
} from '../src/features/favourites/store/favouritesSelectors';
import {
  addFavourite,
  favouritesReducer,
  hydrateFavourites,
  removeFavourite,
  toggleFavourite,
  updateBucketStatus,
} from '../src/features/favourites/store/favouritesSlice';
import {
  DEFAULT_BUCKET_STATUS,
  bucketStatusMeta,
  isBucketStatus,
} from '../src/features/favourites/types/favourite.types';
import { removeFavouriteAndJournal } from '../src/features/journal/services/journalActions';
import { hydrateJournal } from '../src/features/journal/store/journalSlice';

const T = '2026-11-23T08:00:00.000Z';

function storeWith(userId: number, codes: string[]) {
  const store = createAppStore();
  store.dispatch(
    signIn({
      user: {
        id: userId,
        username: 'emilys',
        firstName: 'Emily',
        lastName: 'J',
      },
      expiresAt: Date.now() + 60_000,
    }),
  );
  store.dispatch(hydrateFavourites([]));
  store.dispatch(hydrateJournal({ userId, entries: [] }));
  for (const countryCode of codes) {
    store.dispatch(addFavourite({ countryCode, savedAt: T }));
  }
  return store;
}

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('bucket status state', () => {
  it('gives newly saved countries the Want to Visit status', () => {
    const added = favouritesReducer(
      undefined,
      addFavourite({ countryCode: 'JPN', savedAt: T }),
    );
    const toggled = favouritesReducer(
      undefined,
      toggleFavourite({ countryCode: 'ITA', savedAt: T }),
    );
    expect(added.items[0].bucketStatus).toBe('want_to_visit');
    expect(toggled.items[0].bucketStatus).toBe(DEFAULT_BUCKET_STATUS);
  });

  it('changes the status of a saved country and ignores unsaved ones', () => {
    let state = favouritesReducer(
      undefined,
      addFavourite({ countryCode: 'JPN', savedAt: T }),
    );
    state = favouritesReducer(
      state,
      updateBucketStatus({ countryCode: 'JPN', bucketStatus: 'planning' }),
    );
    state = favouritesReducer(
      state,
      updateBucketStatus({ countryCode: 'FRA', bucketStatus: 'visited' }),
    );
    expect(state.items).toEqual([
      { countryCode: 'JPN', savedAt: T, bucketStatus: 'planning' },
    ]);
  });

  it('counts and filters saved countries by status', () => {
    const store = storeWith(1, ['JPN', 'FRA', 'ITA', 'LKA']);
    store.dispatch(
      updateBucketStatus({ countryCode: 'FRA', bucketStatus: 'planning' }),
    );
    store.dispatch(
      updateBucketStatus({ countryCode: 'ITA', bucketStatus: 'visited' }),
    );
    store.dispatch(
      updateBucketStatus({ countryCode: 'LKA', bucketStatus: 'visited' }),
    );
    const state = store.getState();

    expect(selectBucketStatusCounts(state)).toEqual({
      want_to_visit: 1,
      planning: 1,
      visited: 2,
    });
    expect(
      selectFavouritesByStatus(state, 'visited').map(f => f.countryCode),
    ).toEqual(['ITA', 'LKA']);
    expect(selectFavouritesByStatus(state, 'planning')).toHaveLength(1);
    expect(selectCountryBucketStatus(state, 'ITA')).toBe('visited');
    expect(selectCountryBucketStatus(state, 'USA')).toBeNull();
    // Memoized: same input state returns the same array.
    expect(selectFavouritesByStatus(state, 'visited')).toBe(
      selectFavouritesByStatus(state, 'visited'),
    );
  });

  it('removes the status together with the favourite', () => {
    const store = storeWith(1, ['JPN']);
    store.dispatch(
      updateBucketStatus({ countryCode: 'JPN', bucketStatus: 'visited' }),
    );
    store.dispatch(removeFavourite('JPN'));
    const state = store.getState();
    expect(selectCountryBucketStatus(state, 'JPN')).toBeNull();
    expect(selectBucketStatusCounts(state)).toEqual({
      want_to_visit: 0,
      planning: 0,
      visited: 0,
    });

    // Saving it again starts fresh at the default status.
    store.dispatch(addFavourite({ countryCode: 'JPN', savedAt: T }));
    expect(selectCountryBucketStatus(store.getState(), 'JPN')).toBe(
      'want_to_visit',
    );
  });

  it('exposes labels and guards for every status', () => {
    expect(bucketStatusMeta.planning.label).toBe('Planning');
    expect(isBucketStatus('visited')).toBe(true);
    expect(isBucketStatus('been_there')).toBe(false);
  });
});

describe('bucket status persistence', () => {
  it('persists a status change and restores it after a restart', async () => {
    const store = storeWith(5, ['JPN', 'FRA']);
    await store.dispatch(changeBucketStatus('FRA', 'visited'));

    const stored = JSON.parse(
      (await AsyncStorage.getItem('passport:favourites:5'))!,
    );
    expect(stored).toEqual([
      { countryCode: 'JPN', savedAt: T, bucketStatus: 'want_to_visit' },
      { countryCode: 'FRA', savedAt: T, bucketStatus: 'visited' },
    ]);

    const restarted = createAppStore();
    restarted.dispatch(hydrateFavourites(await loadFavourites(5)));
    expect(selectCountryBucketStatus(restarted.getState(), 'FRA')).toBe(
      'visited',
    );
    expect(selectBucketStatusCounts(restarted.getState())).toEqual({
      want_to_visit: 1,
      planning: 0,
      visited: 1,
    });
  });

  it('migrates old favourites without a status instead of dropping them', async () => {
    await AsyncStorage.setItem(
      'passport:favourites:3',
      JSON.stringify([
        { countryCode: 'JPN', savedAt: T },
        { countryCode: 'FRA', savedAt: T, bucketStatus: 'unknown' },
        { countryCode: 'ITA', savedAt: T, bucketStatus: 'planning' },
        { countryCode: 'ITA', savedAt: T, bucketStatus: 'visited' },
        { savedAt: T },
      ]),
    );
    expect(await loadFavourites(3)).toEqual([
      { countryCode: 'JPN', savedAt: T, bucketStatus: 'want_to_visit' },
      { countryCode: 'FRA', savedAt: T, bucketStatus: 'want_to_visit' },
      { countryCode: 'ITA', savedAt: T, bucketStatus: 'planning' },
    ]);
    expect(parseStoredFavourites({ not: 'a list' })).toEqual([]);
  });

  it('keeps statuses isolated per user', async () => {
    await saveFavourites(1, [
      { countryCode: 'JPN', savedAt: T, bucketStatus: 'visited' },
    ]);
    await saveFavourites(2, [
      { countryCode: 'JPN', savedAt: T, bucketStatus: 'planning' },
    ]);
    const second = storeWith(2, []);
    second.dispatch(hydrateFavourites(await loadFavourites(2)));
    await second.dispatch(changeBucketStatus('JPN', 'want_to_visit'));

    expect((await loadFavourites(1))[0].bucketStatus).toBe('visited');
    expect((await loadFavourites(2))[0].bucketStatus).toBe('want_to_visit');
  });

  it('rolls back and reports an error when saving fails', async () => {
    const store = storeWith(1, ['JPN']);
    jest
      .mocked(AsyncStorage.setItem)
      .mockRejectedValueOnce(new Error('disk full'));
    await expect(
      store.dispatch(changeBucketStatus('JPN', 'planning')),
    ).rejects.toBeInstanceOf(BucketStatusError);
    expect(selectCountryBucketStatus(store.getState(), 'JPN')).toBe(
      'want_to_visit',
    );
    expect(store.getState().favourites.error).toMatch(/Could not save/);
  });

  it('refuses a status for a country that is not saved', async () => {
    const store = storeWith(1, []);
    await expect(
      store.dispatch(changeBucketStatus('JPN', 'visited')),
    ).rejects.toThrow('Save this country to your favourites');
    expect(store.getState().favourites.items).toEqual([]);
  });
});

describe('journal compatibility', () => {
  it('leaves journal entries untouched when the status changes', async () => {
    const store = storeWith(1, ['LKA']);
    const entry = {
      countryCode: 'LKA',
      note: 'Sunrise at Sigiriya',
      photoUri: 'file:///data/docs/journal/1/LKA-1.jpg',
      createdAt: T,
      updatedAt: T,
    };
    store.dispatch(hydrateJournal({ userId: 1, entries: [entry] }));

    await store.dispatch(changeBucketStatus('LKA', 'visited'));
    await store.dispatch(changeBucketStatus('LKA', 'planning'));

    expect(store.getState().journal.entries).toEqual({ LKA: entry });
    expect(selectCountryBucketStatus(store.getState(), 'LKA')).toBe('planning');
  });

  it('removes status and journal together when the favourite is removed', async () => {
    const store = storeWith(1, ['LKA']);
    store.dispatch(
      hydrateJournal({
        userId: 1,
        entries: [
          {
            countryCode: 'LKA',
            note: 'Tea country',
            photoUri: null,
            createdAt: T,
            updatedAt: T,
          },
        ],
      }),
    );
    await store.dispatch(changeBucketStatus('LKA', 'visited'));
    await store.dispatch(removeFavouriteAndJournal('LKA'));

    expect(selectCountryBucketStatus(store.getState(), 'LKA')).toBeNull();
    expect(store.getState().journal.entries).toEqual({});
  });
});
