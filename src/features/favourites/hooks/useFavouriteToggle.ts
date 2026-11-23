import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useAppDispatch, useAppStore } from '../../../app/store';
import { removeFavouriteAndJournal } from '../../journal/services/journalActions';
import { toggleFavourite } from '../store/favouritesSlice';
import { hasJournalData } from '../utils/favouriteHelpers';

/**
 * Toggle a favourite while enforcing the journal removal policy: removing a
 * country that has a journal note/photo asks for confirmation and then
 * deletes the entry and its stored photo together with the favourite.
 */
export function useFavouriteToggle() {
  const dispatch = useAppDispatch();
  const store = useAppStore();

  return useCallback(
    (countryCode: string, countryName?: string) => {
      const state = store.getState();
      const saved = state.favourites.items.some(
        f => f.countryCode === countryCode,
      );
      if (saved && hasJournalData(state.journal.entries, countryCode)) {
        const name = countryName ?? 'this country';
        Alert.alert(
          `Remove ${name}?`,
          `Your journal note and photo for ${name} will also be permanently deleted.`,
          [
            { text: 'Keep', style: 'cancel' },
            {
              text: 'Remove',
              style: 'destructive',
              onPress: () => {
                dispatch(removeFavouriteAndJournal(countryCode));
              },
            },
          ],
        );
        return;
      }
      dispatch(
        toggleFavourite({ countryCode, savedAt: new Date().toISOString() }),
      );
    },
    [dispatch, store],
  );
}
