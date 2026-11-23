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
  selectCountryBucketStatus,
  selectFavouritesHydrated,
  selectIsFavourite,
  selectFavouriteCount,
  selectFavouritesError,
} from '../store/favouritesSelectors';
import type { BucketStatus } from '../types/favourite.types';

/**
 * Hydrates favourites for the signed-in user and persists every change.
 *
 * Mount exactly once inside the authenticated navigator so there is a single
 * writer for the user's favourites key.
 */
export function useFavouritesSync() {
  const dispatch = useAppDispatch();
  const favourites = useAppSelector(selectAllFavourites);
  const hydrated = useAppSelector(selectFavouritesHydrated);
  const userId = useAppSelector(state =>
    state.session.status === 'signedIn' ? state.session.user.id : null,
  );

  // Serialize writes so rapid toggles are persisted in order.
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

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

  const prevFavourites = useRef(favourites);
  useEffect(() => {
    if (!hydrated || userId === null) {
      return;
    }
    // Skip the render right after hydration (the data came from storage).
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
}

/** Read favourites state and basic actions. Has no side effects. */
export function useFavourites() {
  const dispatch = useAppDispatch();
  const favourites = useAppSelector(selectAllFavourites);
  const hydrated = useAppSelector(selectFavouritesHydrated);
  const count = useAppSelector(selectFavouriteCount);
  const error = useAppSelector(selectFavouritesError);

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

/** The bucket status of a country, or null when it is not saved. */
export function useBucketStatus(countryCode: string): BucketStatus | null {
  return useAppSelector(state => selectCountryBucketStatus(state, countryCode));
}
