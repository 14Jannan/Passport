import AsyncStorage from '@react-native-async-storage/async-storage';
import { FileSystem } from 'react-native-file-access';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { createAppStore } from '../src/app/store';
import { signIn } from '../src/features/auth/session';
import {
  fallbackPlacesSearch,
  famousPlacesSearch,
  normalizeFamousPlaces,
} from '../src/features/countries/api/famousPlacesApi';
import { addFavourite } from '../src/features/favourites/store/favouritesSlice';
import {
  canRemoveImmediately,
  hasJournalData,
} from '../src/features/favourites/utils/favouriteHelpers';
import {
  deleteJournalEntryWithPhoto,
  hydrateJournalForUser,
  removeFavouriteAndJournal,
  saveJournalEntry,
} from '../src/features/journal/services/journalActions';
import {
  interpretPickerResponse,
  isManagedJournalPhoto,
  persistJournalPhoto,
  pickJournalPhoto,
  safePhotoName,
} from '../src/features/journal/services/journalPhotos';
import {
  journalStorageKey,
  loadJournal,
  parseStoredJournal,
} from '../src/features/journal/services/journalStorage';
import {
  selectJournalCount,
  selectJournalEntries,
  selectJournalEntryByCountry,
} from '../src/features/journal/store/journalSelectors';
import {
  createJournalEntry,
  deleteJournalEntry,
  hydrateJournal,
  journalReducer,
  removeJournalPhoto,
  setJournalPhoto,
  updateJournalEntry,
  type JournalState,
} from '../src/features/journal/store/journalSlice';
import { JOURNAL_NOTE_MAX, JournalError } from '../src/features/journal/types';

const fileStore = (FileSystem as unknown as { __files: Set<string> }).__files;
const T1 = '2026-11-20T10:00:00.000Z';
const T2 = '2026-11-21T10:00:00.000Z';

function photoUri(name: string, userId = 1) {
  return `file:///data/docs/journal/${userId}/${name}`;
}

function signedInStore(userId = 1, favourites: string[] = ['JPN']) {
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
  store.dispatch(hydrateJournal({ userId, entries: [] }));
  for (const countryCode of favourites) {
    store.dispatch(addFavourite({ countryCode, savedAt: T1 }));
  }
  return store;
}

function reduce(...actions: Parameters<typeof journalReducer>[1][]) {
  return actions.reduce<JournalState>(
    (state, action) => journalReducer(state, action),
    journalReducer(undefined, { type: 'init' }),
  );
}

beforeEach(async () => {
  await AsyncStorage.clear();
  fileStore.clear();
  jest.clearAllMocks();
});

describe('journal reducer', () => {
  it('creates an entry with a trimmed note and timestamps', () => {
    const state = reduce(
      createJournalEntry({
        countryCode: 'JPN',
        note: '  Cherry blossoms in Kyoto  ',
        photoUri: null,
        timestamp: T1,
      }),
    );
    expect(state.entries.JPN).toEqual({
      countryCode: 'JPN',
      note: 'Cherry blossoms in Kyoto',
      photoUri: null,
      createdAt: T1,
      updatedAt: T1,
    });
  });

  it('edits a note, keeps createdAt and clips to the maximum length', () => {
    const state = reduce(
      createJournalEntry({
        countryCode: 'JPN',
        note: 'Plan',
        photoUri: null,
        timestamp: T1,
      }),
      updateJournalEntry({
        countryCode: 'JPN',
        note: 'x'.repeat(JOURNAL_NOTE_MAX + 40),
        timestamp: T2,
      }),
    );
    expect(state.entries.JPN.note).toHaveLength(JOURNAL_NOTE_MAX);
    expect(state.entries.JPN.createdAt).toBe(T1);
    expect(state.entries.JPN.updatedAt).toBe(T2);
  });

  it('removes a note independently while keeping the photo', () => {
    const state = reduce(
      createJournalEntry({
        countryCode: 'JPN',
        note: 'Fuji',
        photoUri: photoUri('a.jpg'),
        timestamp: T1,
      }),
      updateJournalEntry({ countryCode: 'JPN', note: '', timestamp: T2 }),
    );
    expect(state.entries.JPN).toMatchObject({
      note: '',
      photoUri: photoUri('a.jpg'),
    });
  });

  it('adds, replaces and removes a photo reference', () => {
    let state = reduce(
      createJournalEntry({
        countryCode: 'JPN',
        note: 'Fuji',
        photoUri: null,
        timestamp: T1,
      }),
      setJournalPhoto({
        countryCode: 'JPN',
        photoUri: photoUri('a.jpg'),
        timestamp: T1,
      }),
    );
    expect(state.entries.JPN.photoUri).toBe(photoUri('a.jpg'));
    state = journalReducer(
      state,
      setJournalPhoto({
        countryCode: 'JPN',
        photoUri: photoUri('b.jpg'),
        timestamp: T2,
      }),
    );
    expect(state.entries.JPN.photoUri).toBe(photoUri('b.jpg'));
    state = journalReducer(
      state,
      removeJournalPhoto({ countryCode: 'JPN', timestamp: T2 }),
    );
    expect(state.entries.JPN).toMatchObject({ note: 'Fuji', photoUri: null });
  });

  it('prunes an entry once both note and photo are gone, and deletes entries', () => {
    const pruned = reduce(
      createJournalEntry({
        countryCode: 'JPN',
        note: '',
        photoUri: photoUri('a.jpg'),
        timestamp: T1,
      }),
      removeJournalPhoto({ countryCode: 'JPN', timestamp: T2 }),
    );
    expect(pruned.entries.JPN).toBeUndefined();

    const deleted = reduce(
      createJournalEntry({
        countryCode: 'FRA',
        note: 'Paris',
        photoUri: null,
        timestamp: T1,
      }),
      deleteJournalEntry('FRA'),
    );
    expect(deleted.entries).toEqual({});
  });

  it('selects entries newest first and by country', () => {
    const journal = reduce(
      createJournalEntry({
        countryCode: 'JPN',
        note: 'old',
        photoUri: null,
        timestamp: T1,
      }),
      createJournalEntry({
        countryCode: 'FRA',
        note: 'new',
        photoUri: null,
        timestamp: T2,
      }),
    );
    const state = { journal };
    expect(selectJournalEntries(state).map(e => e.countryCode)).toEqual([
      'FRA',
      'JPN',
    ]);
    expect(selectJournalEntryByCountry(state, 'JPN')?.note).toBe('old');
    expect(selectJournalCount(state)).toBe(2);
  });
});

describe('journal persistence', () => {
  it('restores saved journal data after a restart', async () => {
    const store = signedInStore();
    await store.dispatch(
      saveJournalEntry({
        countryCode: 'JPN',
        note: 'Ramen in Osaka',
        photo: { kind: 'keep' },
      }),
    );
    expect(
      JSON.parse((await AsyncStorage.getItem('passport:journal:1'))!),
    ).toMatchObject({
      version: 1,
      entries: [{ countryCode: 'JPN', note: 'Ramen in Osaka', photoUri: null }],
    });

    const restarted = createAppStore();
    await restarted.dispatch(hydrateJournalForUser(1));
    expect(restarted.getState().journal.entries.JPN.note).toBe(
      'Ramen in Osaka',
    );
    expect(restarted.getState().journal.hydrated).toBe(true);
  });

  it('isolates journal data per user', async () => {
    const emily = signedInStore(1);
    await emily.dispatch(
      saveJournalEntry({
        countryCode: 'JPN',
        note: 'Emily only',
        photo: { kind: 'keep' },
      }),
    );
    expect(journalStorageKey(2)).toBe('passport:journal:2');
    expect(await loadJournal(2)).toEqual([]);
    expect(await loadJournal(1)).toHaveLength(1);

    const other = createAppStore();
    await other.dispatch(hydrateJournalForUser(2));
    expect(other.getState().journal.entries).toEqual({});
  });

  it('handles corrupted storage and drops invalid entries', async () => {
    expect(parseStoredJournal('{broken')).toEqual([]);
    expect(parseStoredJournal('"text"')).toEqual([]);
    const legacyArray = JSON.stringify([
      {
        countryCode: 'JPN',
        note: 'ok',
        photoUri: null,
        createdAt: T1,
        updatedAt: T1,
      },
      {
        countryCode: 'bad',
        note: 'x',
        photoUri: null,
        createdAt: T1,
        updatedAt: T1,
      },
      { countryCode: 'FRA', note: 5 },
      {
        countryCode: 'ITA',
        note: '',
        photoUri: null,
        createdAt: T1,
        updatedAt: T1,
      },
    ]);
    expect(parseStoredJournal(legacyArray).map(e => e.countryCode)).toEqual([
      'JPN',
    ]);

    await AsyncStorage.setItem('passport:journal:1', '{not json');
    const store = createAppStore();
    await store.dispatch(hydrateJournalForUser(1));
    expect(store.getState().journal).toMatchObject({
      entries: {},
      hydrated: true,
      error: null,
    });
  });

  it('rolls back state and reports an error when storage writes fail', async () => {
    const store = signedInStore();
    jest
      .mocked(AsyncStorage.setItem)
      .mockRejectedValueOnce(new Error('disk full'));
    await expect(
      store.dispatch(
        saveJournalEntry({
          countryCode: 'JPN',
          note: 'Will fail',
          photo: { kind: 'keep' },
        }),
      ),
    ).rejects.toBeInstanceOf(JournalError);
    expect(store.getState().journal.entries).toEqual({});
  });
});

describe('favourites and journal relationship', () => {
  it('refuses journal entries for countries that are not favourites', async () => {
    const store = signedInStore(1, []);
    await expect(
      store.dispatch(
        saveJournalEntry({
          countryCode: 'JPN',
          note: 'Nope',
          photo: { kind: 'keep' },
        }),
      ),
    ).rejects.toThrow('Save this country to your favourites');
  });

  it('requires a note or photo before saving', async () => {
    const store = signedInStore();
    await expect(
      store.dispatch(
        saveJournalEntry({
          countryCode: 'JPN',
          note: '   ',
          photo: { kind: 'keep' },
        }),
      ),
    ).rejects.toThrow('Add a note or a photo');
  });

  it('flags favourites with journal content and removes both together', async () => {
    const store = signedInStore();
    const uri = photoUri('JPN-1.jpg');
    fileStore.add(uri.slice(7));
    await store.dispatch(
      saveJournalEntry({
        countryCode: 'JPN',
        note: 'Fuji',
        photo: { kind: 'set', uri },
      }),
    );
    const entries = store.getState().journal.entries;
    expect(hasJournalData(entries, 'JPN')).toBe(true);
    expect(canRemoveImmediately(entries, 'JPN')).toBe(false);
    expect(canRemoveImmediately(entries, 'FRA')).toBe(true);

    await store.dispatch(removeFavouriteAndJournal('JPN'));
    expect(store.getState().favourites.items).toEqual([]);
    expect(store.getState().journal.entries).toEqual({});
    expect(fileStore.has(uri.slice(7))).toBe(false);
  });
});

describe('photo storage and cleanup', () => {
  it('deletes the old photo only after a replacement is saved', async () => {
    const store = signedInStore();
    const first = photoUri('JPN-1.jpg');
    const second = photoUri('JPN-2.jpg');
    fileStore.add(first.slice(7));
    fileStore.add(second.slice(7));
    await store.dispatch(
      saveJournalEntry({
        countryCode: 'JPN',
        note: '',
        photo: { kind: 'set', uri: first },
      }),
    );

    jest
      .mocked(AsyncStorage.setItem)
      .mockRejectedValueOnce(new Error('disk full'));
    await expect(
      store.dispatch(
        saveJournalEntry({
          countryCode: 'JPN',
          note: '',
          photo: { kind: 'set', uri: second },
        }),
      ),
    ).rejects.toBeInstanceOf(JournalError);
    expect(fileStore.has(first.slice(7))).toBe(true);
    expect(store.getState().journal.entries.JPN.photoUri).toBe(first);

    await store.dispatch(
      saveJournalEntry({
        countryCode: 'JPN',
        note: '',
        photo: { kind: 'set', uri: second },
      }),
    );
    expect(store.getState().journal.entries.JPN.photoUri).toBe(second);
    expect(fileStore.has(first.slice(7))).toBe(false);
  });

  it('removes the photo file when the photo or entry is deleted', async () => {
    const store = signedInStore();
    const uri = photoUri('JPN-3.jpg');
    fileStore.add(uri.slice(7));
    await store.dispatch(
      saveJournalEntry({
        countryCode: 'JPN',
        note: 'Keep note',
        photo: { kind: 'set', uri },
      }),
    );
    await store.dispatch(
      saveJournalEntry({
        countryCode: 'JPN',
        note: 'Keep note',
        photo: { kind: 'remove' },
      }),
    );
    expect(fileStore.has(uri.slice(7))).toBe(false);
    expect(store.getState().journal.entries.JPN).toMatchObject({
      note: 'Keep note',
      photoUri: null,
    });

    const again = photoUri('JPN-4.jpg');
    fileStore.add(again.slice(7));
    await store.dispatch(
      saveJournalEntry({
        countryCode: 'JPN',
        note: 'Keep note',
        photo: { kind: 'set', uri: again },
      }),
    );
    await store.dispatch(deleteJournalEntryWithPhoto('JPN'));
    expect(store.getState().journal.entries).toEqual({});
    expect(fileStore.has(again.slice(7))).toBe(false);
  });

  it('copies picked photos into the private journal directory', async () => {
    const uri = await persistJournalPhoto(7, 'jpn', {
      uri: 'file:///cache/rn_image_picker_lib_temp_1.jpg',
      fileName: 'rn_image_picker_lib_temp_1.jpg',
      type: 'image/jpeg',
      fileSize: 1000,
    });
    expect(uri).toMatch(
      /^file:\/\/\/data\/docs\/journal\/7\/JPN-\d+-[a-z\d]+\.jpg$/,
    );
    expect(FileSystem.cp).toHaveBeenCalledWith(
      '/cache/rn_image_picker_lib_temp_1.jpg',
      uri.slice(7),
    );
    expect(isManagedJournalPhoto(uri)).toBe(true);
    expect(isManagedJournalPhoto('file:///somewhere/else.jpg')).toBe(false);
    expect(
      safePhotoName('../x', {
        uri: 'x',
        fileName: 'evil.exe',
        type: null,
        fileSize: null,
      }),
    ).toMatch(/^X-\d+-[a-z\d]+\.jpg$/);
  });
});

describe('camera and gallery results', () => {
  it('maps cancellations, permission denial and missing cameras', async () => {
    expect(interpretPickerResponse({ didCancel: true })).toEqual({
      status: 'cancelled',
    });
    expect(interpretPickerResponse({ errorCode: 'permission' })).toMatchObject({
      status: 'error',
      reason: 'permission',
    });
    jest
      .mocked(launchCamera)
      .mockResolvedValueOnce({ errorCode: 'camera_unavailable' });
    expect(await pickJournalPhoto('camera')).toMatchObject({
      status: 'error',
      reason: 'camera_unavailable',
    });
    jest.mocked(launchImageLibrary).mockRejectedValueOnce(new Error('boom'));
    expect(await pickJournalPhoto('library')).toMatchObject({
      status: 'error',
    });
  });

  it('validates the returned asset', () => {
    expect(interpretPickerResponse({ assets: [{}] })).toMatchObject({
      reason: 'invalid',
    });
    expect(
      interpretPickerResponse({
        assets: [{ uri: 'file:///a.mp4', type: 'video/mp4' }],
      }),
    ).toMatchObject({ reason: 'invalid' });
    expect(
      interpretPickerResponse({
        assets: [
          {
            uri: 'file:///a.jpg',
            type: 'image/jpeg',
            fileSize: 99 * 1024 * 1024,
          },
        ],
      }),
    ).toMatchObject({ reason: 'too_large' });
    expect(
      interpretPickerResponse({
        assets: [
          {
            uri: 'content://media/1',
            type: 'image/png',
            fileName: 'p.png',
            fileSize: 10,
          },
        ],
      }),
    ).toEqual({
      status: 'picked',
      photo: {
        uri: 'content://media/1',
        type: 'image/png',
        fileName: 'p.png',
        fileSize: 10,
      },
    });
  });
});

describe('famous places', () => {
  it('builds category and fallback searches from the country name', () => {
    expect(famousPlacesSearch('Sri Lanka')).toBe(
      'incategory:World_Heritage_Sites_in_Sri_Lanka|World_Heritage_Sites_in_the_Sri_Lanka|Tourist_attractions_in_Sri_Lanka|Tourist_attractions_in_the_Sri_Lanka',
    );
    expect(fallbackPlacesSearch('Tuvalu')).toContain('Tuvalu landmark');
  });

  it('normalizes ranked places with photos and skips lists and the country itself', () => {
    const places = normalizeFamousPlaces(
      {
        query: {
          pages: [
            {
              pageid: 2,
              index: 2,
              title: 'Galle Fort',
              thumbnail: { source: 'https://img/galle.jpg' },
            },
            {
              pageid: 1,
              index: 1,
              title: 'Sigiriya',
              description: 'Ancient rock fortress',
              extract: 'Sigiriya is an ancient rock fortress.',
              thumbnail: { source: 'https://img/sigiriya.jpg' },
            },
            {
              pageid: 3,
              index: 3,
              title: 'List of World Heritage Sites in Sri Lanka',
              thumbnail: { source: 'https://img/x.jpg' },
            },
            {
              pageid: 4,
              index: 4,
              title: 'Sri Lanka',
              thumbnail: { source: 'https://img/y.jpg' },
            },
            { pageid: 5, index: 5, title: 'No photo' },
            {
              pageid: 6,
              index: 6,
              title: 'Insecure',
              thumbnail: { source: 'http://img/z.jpg' },
            },
          ],
        },
      },
      'Sri Lanka',
    );
    expect(places?.map(place => place.title)).toEqual([
      'Sigiriya',
      'Galle Fort',
    ]);
    expect(places?.[0]).toMatchObject({
      description: 'Ancient rock fortress',
      summary: 'Sigiriya is an ancient rock fortress.',
      articleUrl: 'https://en.wikipedia.org/wiki/Sigiriya',
    });
    expect(normalizeFamousPlaces({ batchcomplete: true }, 'X')).toEqual([]);
    expect(normalizeFamousPlaces('nope', 'X')).toBeNull();
  });
});
