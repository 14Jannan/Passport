import type { AppThunk } from '../../../app/store';
import {
  setFavouritesError,
  updateBucketStatus,
} from '../store/favouritesSlice';
import type { BucketStatus } from '../types/favourite.types';
import { saveFavourites } from './favouritesStorage';

/** User-presentable bucket-list failure. */
export class BucketStatusError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BucketStatusError';
  }
}

/**
 * Change the bucket-list status of a saved country and persist it.
 *
 * The status lives on the favourite, so unsaved countries are rejected
 * instead of creating an orphaned status. If the write fails the previous
 * status is restored and a BucketStatusError is thrown for the UI.
 */
export function changeBucketStatus(
  countryCode: string,
  bucketStatus: BucketStatus,
): AppThunk<Promise<void>> {
  return async (dispatch, getState) => {
    const state = getState();
    if (state.session.status !== 'signedIn') {
      throw new BucketStatusError('Sign in again to update your bucket list.');
    }
    const favourite = state.favourites.items.find(
      f => f.countryCode === countryCode,
    );
    if (!favourite) {
      throw new BucketStatusError(
        'Save this country to your favourites before choosing a status.',
      );
    }
    const previous = favourite.bucketStatus;
    if (previous === bucketStatus) {
      return;
    }

    dispatch(updateBucketStatus({ countryCode, bucketStatus }));
    try {
      await saveFavourites(state.session.user.id, getState().favourites.items);
    } catch {
      dispatch(updateBucketStatus({ countryCode, bucketStatus: previous }));
      const message =
        'Could not save the new status. Check your device storage and try again.';
      dispatch(setFavouritesError(message));
      throw new BucketStatusError(message);
    }
  };
}
