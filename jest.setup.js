/* eslint-env jest */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock.js'),
);
jest.mock('@react-native-vector-icons/feather/static', () => ({
  Feather: () => null,
}));
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('react-native-keychain', () => ({
  ACCESSIBLE: { WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WhenUnlockedThisDeviceOnly' },
  STORAGE_TYPE: { AES_GCM_NO_AUTH: 'KeystoreAESGCM_NoAuth' },
  setGenericPassword: jest.fn().mockResolvedValue({
    service: 'com.passport.session',
    storage: 'KeystoreAESGCM_NoAuth',
  }),
  getGenericPassword: jest.fn().mockResolvedValue(false),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
  hasGenericPassword: jest.fn().mockResolvedValue(false),
}));
jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn().mockResolvedValue({ didCancel: true }),
  launchImageLibrary: jest.fn().mockResolvedValue({ didCancel: true }),
}));
jest.mock('react-native-file-access', () => {
  const files = new Set();
  const FileSystem = {
    __files: files,
    exists: jest.fn(async path => files.has(path)),
    mkdir: jest.fn(async () => undefined),
    cp: jest.fn(async (_source, target) => {
      files.add(target);
    }),
    unlink: jest.fn(async path => {
      files.delete(path);
    }),
    ls: jest.fn(async () => []),
  };
  return { Dirs: { DocumentDir: '/data/docs' }, FileSystem };
});
