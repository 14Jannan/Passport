import NetInfo from '@react-native-community/netinfo';
import { setupListeners } from '@reduxjs/toolkit/query';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { store } from './store';

export function useQueryListeners() {
  useEffect(
    () =>
      setupListeners(store.dispatch, (dispatch, actions) => {
        const appState = AppState.addEventListener('change', state => {
          dispatch(
            state === 'active' ? actions.onFocus() : actions.onFocusLost(),
          );
        });
        const unsubscribe = NetInfo.addEventListener(state => {
          const online = state.isInternetReachable ?? state.isConnected;
          if (online !== null) {
            dispatch(online ? actions.onOnline() : actions.onOffline());
          }
        });
        return () => {
          appState.remove();
          unsubscribe();
        };
      }),
    [],
  );
}
