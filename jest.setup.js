/* eslint-env jest */

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
