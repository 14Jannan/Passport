import { useCallback, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { loadFavourites, saveFavourites } from '../services/favouritesStorage';
import {
  hydrateFavourites,
  toggleFavourite,
  removeFavourite as removeFavouriteAction,
  setFavouritesError,
} from '../store/favouritesSlice';
import {
  selectAllFavourites,
  selectFavouritesHydrated,
  selectIsFavourite,
  selectFavouriteCount,
  selectFavouritesError,
} from '../store/favouritesSelectors';

/**
 * Core favourites hook that handles hydration and persistence.
 *
 * Call once at the app level (e.g. in the navigator or a provider) to hydrate
 * favourites for the authenticated user. Subsequent calls reuse the same
 * Redux state without re-triggering hydration.
 */
export function useFavourites() {
  const dispatch = useAppDispatch();
  const session = useAppSelector(state => state.session);
  const favourites = useAppSelector(selectAllFavourites);
  const hydrated = useAppSelector(selectFavouritesHydrated);
  const count = useAppSelector(selectFavouriteCount);
  const error = useAppSelector(selectFavouritesError);
  const userId = session.status === 'signedIn' ? session.user.id : null;

  // Track a serialization queue to ensure rapid toggles persist correctly.
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  // Hydrate favourites when the authenticated user changes.
  useEffect(() => {
    if (userId === null) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const stored = await loadFavourites(userId);
        if (!cancelled) {
          dispatch(hydrateFavourites(stored));
        }
      } catch {
        if (!cancelled) {
          dispatch(hydrateFavourites([]));
          dispatch(
            setFavouritesError(
              'Could not load your saved countries. They may appear after a restart.',
            ),
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch, userId]);

  // Persist favourites whenever the list changes after hydration.
  const prevFavourites = useRef(favourites);
  useEffect(() => {
    if (!hydrated || userId === null) {
      return;
    }
    // Skip the first render after hydration (the data just came from storage).
    if (prevFavourites.current === favourites) {
      return;
    }
    prevFavourites.current = favourites;

    const snapshot = favourites;
    saveQueue.current = saveQueue.current
      .then(() => saveFavourites(userId, snapshot))
      .catch(() => {
        dispatch(
          setFavouritesError(
            'Could not save your favourites. Changes may be lost on restart.',
          ),
        );
      });
  }, [dispatch, favourites, hydrated, userId]);

  const toggle = useCallback(
    (countryCode: string) => {
      dispatch(
        toggleFavourite({
          countryCode,
          savedAt: new Date().toISOString(),
        }),
      );
    },
    [dispatch],
  );

  const remove = useCallback(
    (countryCode: string) => {
      dispatch(removeFavouriteAction(countryCode));
    },
    [dispatch],
  );

  return {
    favourites,
    hydrated,
    count,
    error,
    toggle,
    remove,
  };
}

/** Convenience hook to check whether a single country is saved. */
export function useIsFavourite(countryCode: string): boolean {
  return useAppSelector(state => selectIsFavourite(state, countryCode));
}
