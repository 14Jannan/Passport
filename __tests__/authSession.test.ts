import * as Keychain from 'react-native-keychain';
import { createAppStore } from '../src/app/store';
import { authApi } from '../src/features/auth/api/authApi';
import {
  logoutSession,
  restoreSession,
} from '../src/features/auth/services/sessionActions';
import {
  beginCheck,
  leaveSession,
  sessionReducer,
  signIn,
} from '../src/features/auth/session';
import { api } from '../src/services/api';

const user = {
  id: 1,
  username: 'emilys',
  firstName: 'Emily',
  lastName: 'Johnson',
};
const session = {
  accessToken: 'saved-access',
  refreshToken: 'saved-refresh',
  expiresAt: 2000000000000,
};

function setSavedSession(expiresAt = session.expiresAt) {
  jest.mocked(Keychain.getGenericPassword).mockResolvedValueOnce({
    service: 'com.passport.session',
    storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
    username: 'passport',
    password: JSON.stringify({ ...session, expiresAt }),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

it('moves from startup through checking to sign-in and sign-out without storing tokens', () => {
  const starting = sessionReducer(undefined, { type: 'init' });
  expect(starting).toEqual({ status: 'starting' });
  const checking = sessionReducer(starting, beginCheck());
  expect(checking).toEqual({ status: 'checking' });
  const signedIn = sessionReducer(
    checking,
    signIn({ user, expiresAt: session.expiresAt }),
  );
  expect(signedIn).toEqual({
    status: 'signedIn',
    user,
    expiresAt: session.expiresAt,
  });
  expect(sessionReducer(signedIn, leaveSession())).toMatchObject({
    status: 'signedOut',
  });
});

it('verifies an unexpired saved session on startup and keeps credentials out of Redux state', async () => {
  setSavedSession();
  const fetch = jest
    .spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({ ...user, password: 'ignored', unrelated: 'ignored' }),
      ),
    );
  const store = createAppStore();
  await store.dispatch(restoreSession());
  expect(store.getState().session).toEqual({
    status: 'signedIn',
    user,
    expiresAt: session.expiresAt,
  });
  const [request] = fetch.mock.calls[0];
  expect(request).toBeInstanceOf(Request);
  expect((request as Request).headers.get('Authorization')).toBe(
    'Bearer saved-access',
  );
  expect(store.getState()[api.reducerPath].mutations).toEqual({});
  expect(JSON.stringify(store.getState())).not.toContain('saved-access');
});

it.each([true, false])(
  'rotates credentials when local expiry is %s or the API rejects the access token',
  async expired => {
    setSavedSession(expired ? Date.now() - 1 : session.expiresAt);
    const fetch = jest.spyOn(globalThis, 'fetch');
    if (!expired) {
      fetch.mockResolvedValueOnce(new Response('{}', { status: 401 }));
    }
    fetch
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            accessToken: 'rotated-access',
            refreshToken: 'rotated-refresh',
          }),
        ),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify(user)));
    const store = createAppStore();
    await store.dispatch(restoreSession());
    expect(store.getState().session).toMatchObject({
      status: 'signedIn',
      user,
    });
    const [refreshRequest] = fetch.mock.calls[expired ? 0 : 1];
    expect((refreshRequest as Request).url).toBe(
      'https://dummyjson.com/auth/refresh',
    );
    const [, payload] = jest.mocked(Keychain.setGenericPassword).mock.calls[0];
    expect(JSON.parse(payload)).toMatchObject({
      accessToken: 'rotated-access',
      refreshToken: 'rotated-refresh',
    });
  },
);

it('clears rejected refresh credentials and requires login', async () => {
  setSavedSession(Date.now() - 1);
  jest
    .spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(new Response('{}', { status: 403 }));
  const store = createAppStore();
  await store.dispatch(restoreSession());
  expect(store.getState().session).toMatchObject({
    status: 'signedOut',
    issue: { kind: 'message' },
  });
  expect(Keychain.resetGenericPassword).toHaveBeenCalledTimes(1);
});

it('withholds protected routes on a network failure and supports retrying restoration', async () => {
  setSavedSession();
  const fetch = jest
    .spyOn(globalThis, 'fetch')
    .mockRejectedValueOnce(new Error('network failed'));
  const store = createAppStore();
  await store.dispatch(restoreSession());
  expect(store.getState().session).toMatchObject({
    status: 'signedOut',
    issue: { kind: 'retry' },
  });
  expect(Keychain.resetGenericPassword).not.toHaveBeenCalled();
  setSavedSession();
  fetch.mockResolvedValueOnce(new Response(JSON.stringify(user)));
  await store.dispatch(restoreSession());
  expect(store.getState().session).toMatchObject({ status: 'signedIn', user });
});

it('blocks navigation on logout even when secure deletion fails and retries deletion', async () => {
  const store = createAppStore();
  store.dispatch(signIn({ user, expiresAt: session.expiresAt }));
  jest
    .mocked(Keychain.resetGenericPassword)
    .mockRejectedValueOnce(new Error('native error'));
  jest
    .spyOn(globalThis, 'fetch')
    .mockResolvedValueOnce(new Response(JSON.stringify(user)));
  await store
    .dispatch(authApi.endpoints.currentUser.initiate('test-cache-token'))
    .unwrap();
  expect(Object.keys(store.getState()[api.reducerPath].mutations)).toHaveLength(
    1,
  );
  await store.dispatch(logoutSession());
  expect(store.getState().session).toMatchObject({
    status: 'signedOut',
    issue: { kind: 'clear' },
  });
  expect(store.getState()[api.reducerPath].mutations).toEqual({});
  await store.dispatch(logoutSession());
  expect(store.getState().session).toEqual({
    status: 'signedOut',
    issue: undefined,
  });
  expect(Keychain.resetGenericPassword).toHaveBeenCalledTimes(2);
});
