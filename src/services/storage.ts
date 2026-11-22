import AsyncStorage from '@react-native-async-storage/async-storage';

export const preferences = {
  get: (key: string) => AsyncStorage.getItem(`@passport/preferences/${key}`),
  set: (key: string, value: string) =>
    AsyncStorage.setItem(`@passport/preferences/${key}`, value),
};
