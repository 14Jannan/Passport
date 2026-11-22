import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { sessionReducer } from '../features/auth/session';
import { api } from '../services/api';

export function createAppStore() {
  return configureStore({
    reducer: { session: sessionReducer, [api.reducerPath]: api.reducer },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().concat(api.middleware),
  });
}

export const store = createAppStore();
type RootState = ReturnType<typeof store.getState>;
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<typeof store.dispatch>();
