import {
  configureStore,
  type ThunkAction,
  type UnknownAction,
} from '@reduxjs/toolkit';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { sessionReducer } from '../features/auth/session';
import { favouritesReducer } from '../features/favourites/store/favouritesSlice';
import { journalReducer } from '../features/journal/store/journalSlice';
import { api } from '../services/api';

export function createAppStore() {
  return configureStore({
    // RTK Query mutation actions carry transient request arguments.
    devTools: false,
    reducer: {
      session: sessionReducer,
      favourites: favouritesReducer,
      journal: journalReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().concat(api.middleware),
  });
}

export const store = createAppStore();
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<Result> = ThunkAction<
  Result,
  RootState,
  unknown,
  UnknownAction
>;
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<typeof store.dispatch>();
export const useAppStore = useStore.withTypes<typeof store>();
