import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

const sessionOptions = { service: 'com.passport.session' };

export const secureSession = {
  save: (token: string) =>
    Keychain.setGenericPassword('passport', token, sessionOptions),
  async read() {
    const credentials = await Keychain.getGenericPassword(sessionOptions);
    return credentials ? credentials.password : null;
  },
  clear: () => Keychain.resetGenericPassword(sessionOptions),
};

export const preferences = {
  get: (key: string) => AsyncStorage.getItem(`@passport/preferences/${key}`),
  set: (key: string, value: string) =>
    AsyncStorage.setItem(`@passport/preferences/${key}`, value),
};
