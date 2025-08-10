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

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: {
    View: require('react-native').View,
    Text: require('react-native').Text,
    ScrollView: require('react-native').ScrollView,
    FlatList: require('react-native').FlatList,
    Image: require('react-native').Image,
    createAnimatedComponent: (component) => component,
    interpolate: jest.fn(),
    Extrapolation: {
      EXTEND: 'extend',
      CLAMP: 'clamp',
      IDENTITY: 'identity',
    },
  },
  useSharedValue: jest.fn(() => ({ value: 0 })),
  useAnimatedStyle: jest.fn(() => ({})),
  useAnimatedScrollHandler: jest.fn(() => jest.fn()),
  useDerivedValue: jest.fn(),
  useAnimatedGestureHandler: jest.fn(() => jest.fn()),
  useAnimatedReaction: jest.fn(),
  withTiming: jest.fn((value) => value),
  withSpring: jest.fn((value) => value),
  withDelay: jest.fn((_, value) => value),
  withSequence: jest.fn((...values) => values[values.length - 1]),
  withRepeat: jest.fn((value) => value),
  cancelAnimation: jest.fn(),
  measure: jest.fn(),
  Easing: {
    linear: jest.fn(),
    ease: jest.fn(),
    quad: jest.fn(),
    cubic: jest.fn(),
    bezier: jest.fn(),
  },
  runOnJS: jest.fn((fn) => fn),
  runOnUI: jest.fn((fn) => fn),
})); 