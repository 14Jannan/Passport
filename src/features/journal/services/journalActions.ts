import type { AppThunk, RootState } from '../../../app/store';
import { removeFavourite } from '../../favourites/store/favouritesSlice';
import {
  createJournalEntry,
  deleteJournalEntry,
  hydrateJournal,
  removeJournalPhoto,
  restoreJournalEntries,
  setJournalError,
  setJournalPhoto,
  updateJournalEntry,
} from '../store/journalSlice';
import {
  JournalError,
  type JournalEntry,
  type JournalPhotoChange,
} from '../types';
import {
  cleanupOrphanJournalPhotos,
  deleteJournalPhoto,
} from './journalPhotos';
import { loadJournal, saveJournal } from './journalStorage';

function signedInUserId(state: RootState): number {
  if (state.session.status !== 'signedIn') {
    throw new JournalError('Sign in again to update your journal.');
  }
  return state.session.user.id;
}

/**
 * Write the current journal to storage. On failure the in-memory journal is
 * rolled back to `previous` so Redux never claims data that was not saved.
 */
function persistOrRollback(
  previous: Record<string, JournalEntry>,
  message: string,
): AppThunk<Promise<void>> {
  return async (dispatch, getState) => {
    const state = getState();
    const userId = signedInUserId(state);
    try {
      await saveJournal(userId, Object.values(state.journal.entries));
    } catch {
      dispatch(restoreJournalEntries(previous));
      throw new JournalError(message);
    }
  };
}

/** Load the journal for a user and sweep photos that nothing references. */
export function hydrateJournalForUser(userId: number): AppThunk<Promise<void>> {
  return async dispatch => {
    try {
      const entries = await loadJournal(userId);
      dispatch(hydrateJournal({ userId, entries }));
      await cleanupOrphanJournalPhotos(
        userId,
        entries.map(entry => entry.photoUri),
      );
    } catch {
      dispatch(hydrateJournal({ userId, entries: [] }));
      dispatch(
        setJournalError(
          'Could not load your travel journal. Your entries may appear after a restart.',
        ),
      );
    }
  };
}

/**
 * Create or update the journal entry for a favourite country.
 *
 * Photo replacement order: the new photo is already copied to persistent
 * storage by the editor; the entry is saved; only after the save succeeds is
 * the previous photo deleted. A failed save keeps the old photo intact.
 */
export function saveJournalEntry(input: {
  countryCode: string;
  note: string;
  photo: JournalPhotoChange;
}): AppThunk<Promise<JournalEntry | null>> {
  return async (dispatch, getState) => {
    const state = getState();
    signedInUserId(state);
    const { countryCode, photo } = input;
    const note = input.note.trim();

    if (!state.favourites.items.some(f => f.countryCode === countryCode)) {
      throw new JournalError(
        'Save this country to your favourites before adding a journal entry.',
      );
    }

    const previous = state.journal.entries;
    const existing = previous[countryCode];
    const resultingPhoto =
      photo.kind === 'set'
        ? photo.uri
        : photo.kind === 'remove'
        ? null
        : existing?.photoUri ?? null;
    if (!note && !resultingPhoto) {
      throw new JournalError('Add a note or a photo before saving.');
    }

    const timestamp = new Date().toISOString();
    if (!existing) {
      dispatch(
        createJournalEntry({
          countryCode,
          note,
          photoUri: resultingPhoto,
          timestamp,
        }),
      );
    } else {
      if (photo.kind === 'set') {
        dispatch(
          setJournalPhoto({ countryCode, photoUri: photo.uri, timestamp }),
        );
      }
      dispatch(updateJournalEntry({ countryCode, note, timestamp }));
      if (photo.kind === 'remove') {
        dispatch(removeJournalPhoto({ countryCode, timestamp }));
      }
    }

    await dispatch(
      persistOrRollback(
        previous,
        'Could not save your journal entry. Check your device storage and try again.',
      ),
    );

    const replaced = existing?.photoUri;
    if (replaced && replaced !== resultingPhoto) {
      await deleteJournalPhoto(replaced);
    }
    return getState().journal.entries[countryCode] ?? null;
  };
}

/** Delete an entry and, once storage confirms, its stored photo. */
export function deleteJournalEntryWithPhoto(
  countryCode: string,
): AppThunk<Promise<void>> {
  return async (dispatch, getState) => {
    const previous = getState().journal.entries;
    const existing = previous[countryCode];
    if (!existing) {
      return;
    }
    dispatch(deleteJournalEntry(countryCode));
    await dispatch(
      persistOrRollback(
        previous,
        'Could not delete your journal entry. Try again.',
      ),
    );
    await deleteJournalPhoto(existing.photoUri);
  };
}

/**
 * Favourite removal policy: removing a favourite also removes its journal
 * note and photo. Callers must confirm with the user first when
 * `hasJournalEntry` is true — journal content is never deleted silently.
 */
export function removeFavouriteAndJournal(
  countryCode: string,
): AppThunk<Promise<void>> {
  return async (dispatch, getState) => {
    const hasEntry = !!getState().journal.entries[countryCode];
    if (hasEntry) {
      try {
        await dispatch(deleteJournalEntryWithPhoto(countryCode));
      } catch (error) {
        dispatch(
          setJournalError(
            error instanceof JournalError
              ? error.message
              : 'Could not remove the journal entry.',
          ),
        );
        return;
      }
    }
    dispatch(removeFavourite(countryCode));
  };
}
