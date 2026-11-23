import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { hydrateJournalForUser } from '../services/journalActions';
import { selectJournalEntryByCountry } from '../store/journalSelectors';

/**
 * Load the signed-in user's journal. Mount once inside the authenticated
 * navigator; switching users reloads the matching per-user journal.
 */
export function useJournalHydration() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector(state =>
    state.session.status === 'signedIn' ? state.session.user.id : null,
  );
  const loadedFor = useAppSelector(state => state.journal.userId);
  const hydrated = useAppSelector(state => state.journal.hydrated);

  useEffect(() => {
    if (userId !== null && (!hydrated || loadedFor !== userId)) {
      dispatch(hydrateJournalForUser(userId));
    }
  }, [dispatch, hydrated, loadedFor, userId]);
}

export function useJournalEntry(countryCode: string) {
  return useAppSelector(state =>
    selectJournalEntryByCountry(state, countryCode),
  );
}
