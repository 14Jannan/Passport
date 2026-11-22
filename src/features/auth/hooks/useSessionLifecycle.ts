import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../app/store';
import { restoreSession } from '../services/sessionActions';

export function useSessionLifecycle() {
  const dispatch = useAppDispatch();
  const session = useAppSelector(state => state.session);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  useEffect(() => {
    if (session.status !== 'signedIn') {
      return;
    }
    const timer = setTimeout(() => {
      // A backgrounded app can defer refresh until it returns to the foreground.
      if (AppState.currentState === 'active' || AppState.currentState == null) {
        dispatch(restoreSession());
      }
    }, Math.max(0, session.expiresAt - Date.now()));
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        dispatch(restoreSession());
      }
    });
    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [dispatch, session]);
}
