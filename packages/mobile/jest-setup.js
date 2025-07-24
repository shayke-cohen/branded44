// Basic React Native setup for Jest

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
}));

// Mock Alert
global.Alert = {
  alert: jest.fn(),
};

// Mock console to reduce noise
global.__DEV__ = true;

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper', () => ({}), {
  virtual: true,
});

// Mock Platform
const mockPlatform = {
  OS: 'ios',
  select: jest.fn((config) => config.ios || config.default),
};

jest.mock('react-native/Libraries/Utilities/Platform', () => mockPlatform, {
  virtual: true,
});

// Mock Dimensions
const mockDimensions = {
  get: jest.fn(() => ({ width: 375, height: 667 })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

jest.mock('react-native/Libraries/Utilities/Dimensions', () => mockDimensions, {
  virtual: true,
});

// Mock @react-native-cookies/cookies
jest.mock('@react-native-cookies/cookies', () => ({
  __esModule: true,
  default: {
    clearAll: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    get: jest.fn(() => Promise.resolve({})),
    set: jest.fn(() => Promise.resolve()),
    getAll: jest.fn(() => Promise.resolve({})),
  },
})); 