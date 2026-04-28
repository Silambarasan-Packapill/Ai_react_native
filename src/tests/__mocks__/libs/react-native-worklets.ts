/* eslint-disable @typescript-eslint/no-unsafe-return */
jest.mock('react-native-worklets', () => {
  return jest.requireActual('react-native-worklets/src/mock');
});
