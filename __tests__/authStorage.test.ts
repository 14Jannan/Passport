import * as Keychain from 'react-native-keychain';
import {
  clearSession,
  getSession,
  InvalidSavedSession,
  saveSession,
  SessionWriteError,
} from '../src/features/auth/services/authStorage';

const options = { service: 'com.passport.session' };
const savedSession = {
  accessToken: 'fixture-access',
  refreshToken: 'fixture-refresh',
  expiresAt: 2000000000000,
};
const credentials = {
  ...options,
  storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
  username: 'passport',
};

beforeEach(() => jest.clearAllMocks());

it('saves both tokens in the device-only Keychain service and restores the typed session', async () => {
  await saveSession(savedSession);
  expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
    'passport',
    JSON.stringify(savedSession),
    {
      ...options,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      storage: Keychain.STORAGE_TYPE.AES_GCM_NO_AUTH,
    },
  );
  jest.mocked(Keychain.getGenericPassword).mockResolvedValueOnce({
    ...credentials,
    password: JSON.stringify(savedSession),
  });
  expect(await getSession()).toEqual(savedSession);
});

it('distinguishes absent and invalid credentials', async () => {
  expect(await getSession()).toBeNull();
  jest.mocked(Keychain.getGenericPassword).mockResolvedValueOnce({
    ...credentials,
    password: 'invalid legacy payload',
  });
  await expect(getSession()).rejects.toBeInstanceOf(InvalidSavedSession);
});

it('reports restricted or failed writes without exposing native error detail', async () => {
  jest.mocked(Keychain.setGenericPassword).mockResolvedValueOnce(false);
  await expect(saveSession(savedSession)).rejects.toBeInstanceOf(
    SessionWriteError,
  );
  jest
    .mocked(Keychain.setGenericPassword)
    .mockRejectedValueOnce(new Error('private native diagnostic'));
  await expect(saveSession(savedSession)).rejects.toThrow(
    'Could not save your session securely.',
  );
});

it('treats clearing an absent entry as success and detects when credentials remain', async () => {
  jest.mocked(Keychain.resetGenericPassword).mockResolvedValueOnce(false);
  await expect(clearSession()).resolves.toBeUndefined();
  expect(Keychain.resetGenericPassword).toHaveBeenCalledWith(options);
  jest.mocked(Keychain.resetGenericPassword).mockResolvedValueOnce(false);
  jest.mocked(Keychain.hasGenericPassword).mockResolvedValueOnce(true);
  await expect(clearSession()).rejects.toThrow(
    'Could not remove the saved session.',
  );
});
