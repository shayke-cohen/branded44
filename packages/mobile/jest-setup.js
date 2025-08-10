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

// Mock performance.now for timing tests with more realistic timing
let performanceCallCount = 0;
global.performance = global.performance || {};
global.performance.now = jest.fn(() => {
  performanceCallCount++;
  // Return increasing values to simulate time passing
  return performanceCallCount * 10; // Each call adds 10ms
});

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

// Mock useColorScheme
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}), {
  virtual: true,
});

// Mock our custom useColorScheme hook directly
jest.mock('./~/lib/useColorScheme', () => ({
  useColorScheme: jest.fn(() => ({ colorScheme: 'light' })),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useTheme: jest.fn(() => ({
    colors: {
      primary: '#007AFF',
      background: '#FFFFFF',
      card: '#F2F2F7',
      text: '#000000',
      border: '#C7C7CC',
      notification: '#FF3B30',
    },
    dark: false,
  })),
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  })),
  useFocusEffect: jest.fn(),
}), {
  virtual: true,
});

// Mock Wix API Client
jest.mock('./src/utils/wixApiClient', () => {
  const mockWixApiClient = {
    isMemberLoggedIn: jest.fn().mockResolvedValue(false),
    getMemberData: jest.fn().mockResolvedValue({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      isVerified: true
    }),
    initializeWixClient: jest.fn().mockResolvedValue(undefined),
    getProducts: jest.fn().mockResolvedValue([]),
    getCartData: jest.fn().mockResolvedValue({ items: [], total: 0 }),
  };
  
  return {
    wixApiClient: mockWixApiClient,
    default: mockWixApiClient,
    ...mockWixApiClient, // Export all functions directly as well
  };
}, { virtual: true });

// Mock react-native-reanimated for testing
jest.mock('react-native-reanimated', () => {
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: {
      View,
      Text,
      createAnimatedComponent: (component) => component,
    },
    useAnimatedStyle: () => ({}),
    useDerivedValue: (fn) => ({ value: fn() }),
    useSharedValue: (initial) => ({ value: initial }),
    withSpring: (value) => value,
    withTiming: (value) => value,
    interpolate: (value, input, output) => output[0],
    Extrapolation: { CLAMP: 'clamp' },
    FadeIn: {},
    FadeOut: {},
    runOnJS: (fn) => fn,
    runOnUI: (fn) => fn,
  };
}); 