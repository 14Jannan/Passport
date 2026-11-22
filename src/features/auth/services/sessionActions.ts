import type { AppThunk } from '../../../app/store';
import { api } from '../../../services/api';
import {
  authApi,
  authErrorMessage,
  isRejectedCredential,
  sessionDurationMinutes,
} from '../api/authApi';
import { beginCheck, leaveSession, signIn } from '../session';
import {
  clearSession,
  getSession,
  InvalidSavedSession,
  saveSession,
  SessionWriteError,
} from './authStorage';

export function nextExpiry() {
  return Date.now() + sessionDurationMinutes * 60_000 - 1000;
}

const clearFailed = {
  kind: 'clear' as const,
  message:
    'Could not remove your saved session. Retry before signing in again.',
};

export function restoreSession(): AppThunk<Promise<void>> {
  return async (dispatch, getState) => {
    const state = getState().session;
    if (
      state.status === 'checking' ||
      (state.status === 'signedOut' && state.issue?.kind !== 'retry') ||
      (state.status === 'signedIn' && state.expiresAt > Date.now())
    ) {
      return;
    }

    dispatch(beginCheck());
    try {
      const saved = await getSession();
      if (!saved) {
        dispatch(leaveSession());
        return;
      }

      const profile = (token: string) =>
        dispatch(
          authApi.endpoints.currentUser.initiate(token, { track: false }),
        ).unwrap();

      if (saved.expiresAt > Date.now()) {
        try {
          const user = await profile(saved.accessToken);
          if (saved.expiresAt > Date.now()) {
            dispatch(signIn({ user, expiresAt: saved.expiresAt }));
            return;
          }
        } catch (error) {
          if (!isRejectedCredential(error)) {
            throw error;
          }
        }
      }

      const expiresAt = nextExpiry();
      const tokens = await dispatch(
        authApi.endpoints.refresh.initiate(saved.refreshToken, {
          track: false,
        }),
      ).unwrap();
      await saveSession({ ...tokens, expiresAt });
      const user = await profile(tokens.accessToken);
      dispatch(signIn({ user, expiresAt }));
    } catch (error) {
      dispatch(api.util.resetApiState());
      if (error instanceof InvalidSavedSession || isRejectedCredential(error)) {
        try {
          await clearSession();
          dispatch(
            leaveSession({
              kind: 'message',
              message: 'Your saved session is no longer valid. Sign in again.',
            }),
          );
        } catch {
          dispatch(leaveSession(clearFailed));
        }
        return;
      }

      dispatch(
        leaveSession({
          kind: 'retry',
          message:
            error instanceof SessionWriteError
              ? error.message
              : authErrorMessage(error, 'restore'),
        }),
      );
    }
  };
}

export function logoutSession(): AppThunk<Promise<void>> {
  return async (dispatch, getState) => {
    const session = getState().session;
    if (
      session.status !== 'signedIn' &&
      !(session.status === 'signedOut' && session.issue?.kind === 'clear')
    ) {
      return;
    }

    dispatch(beginCheck());
    dispatch(api.util.resetApiState());
    try {
      await clearSession();
      dispatch(leaveSession());
    } catch {
      dispatch(leaveSession(clearFailed));
    }
  };
}
