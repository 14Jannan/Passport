import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  DEFAULT_BUCKET_STATUS,
  type BucketStatus,
  type FavouriteCountry,
} from '../types/favourite.types';

export interface FavouritesState {
  /** Ordered list of saved countries. */
  items: FavouriteCountry[];
  /** Whether storage hydration has completed. */
  hydrated: boolean;
  /** Last persistence error message, if any. */
  error: string | null;
}

const initialState: FavouritesState = {
  items: [],
  hydrated: false,
  error: null,
};

const favouritesSlice = createSlice({
  name: 'favourites',
  initialState,
  reducers: {
    /**
     * Replace the entire favourites list from AsyncStorage.
     * Only used during initial hydration to avoid overwriting an active list.
     */
    hydrateFavourites(state, action: PayloadAction<FavouriteCountry[]>) {
      state.items = action.payload;
      state.hydrated = true;
      state.error = null;
    },

    /** Add a country to favourites. Silently ignores duplicates. */
    addFavourite(
      state,
      action: PayloadAction<{ countryCode: string; savedAt: string }>,
    ) {
      const { countryCode, savedAt } = action.payload;
      if (state.items.some(f => f.countryCode === countryCode)) {
        return;
      }
      state.items.push({
        countryCode,
        savedAt,
        bucketStatus: DEFAULT_BUCKET_STATUS,
      });
      state.error = null;
    },

    /** Remove a country from favourites. */
    removeFavourite(state, action: PayloadAction<string>) {
      state.items = state.items.filter(f => f.countryCode !== action.payload);
      state.error = null;
    },

    /**
     * Toggle a country's favourite status.
     * Adds with 'want_to_visit' if not saved, removes if already saved.
     */
    toggleFavourite(
      state,
      action: PayloadAction<{ countryCode: string; savedAt: string }>,
    ) {
      const { countryCode, savedAt } = action.payload;
      const index = state.items.findIndex(f => f.countryCode === countryCode);
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push({
          countryCode,
          savedAt,
          bucketStatus: DEFAULT_BUCKET_STATUS,
        });
      }
      state.error = null;
    },

    /**
     * Set the bucket-list status of a saved country. Unsaved countries are
     * ignored so a status can never exist without its favourite.
     */
    updateBucketStatus(
      state,
      action: PayloadAction<{
        countryCode: string;
        bucketStatus: BucketStatus;
      }>,
    ) {
      const { countryCode, bucketStatus } = action.payload;
      const item = state.items.find(f => f.countryCode === countryCode);
      if (item) {
        item.bucketStatus = bucketStatus;
      }
    },

    /** Record a persistence error. */
    setFavouritesError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },

    /** Clear any persistence error. */
    clearFavouritesError(state) {
      state.error = null;
    },
  },
});

export const {
  hydrateFavourites,
  addFavourite,
  removeFavourite,
  toggleFavourite,
  updateBucketStatus,
  setFavouritesError,
  clearFavouritesError,
} = favouritesSlice.actions;
export const favouritesReducer = favouritesSlice.reducer;
