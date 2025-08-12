// Import React Native Testing Library matchers
import '@testing-library/jest-native/extend-expect';

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

// Mock fetch to prevent real network calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
) as jest.Mock;

// Mock the wix config
jest.mock('../config/wixConfig', () => ({
  getClientId: jest.fn(() => 'mock-client-id'),
  getSiteId: jest.fn(() => 'mock-site-id'),
  getApiBaseUrl: jest.fn(() => 'https://mock-api.wix.com'),
  getStoresAppId: jest.fn(() => 'mock-stores-app-id'),
}));



// Mock the WixApiClient to prevent async operations
jest.mock('../utils/wixApiClient', () => {
  const mockWixApiClient = {
    // Mock all async methods that could cause logging after tests
    generateVisitorTokens: jest.fn(() => Promise.resolve()),
    updateWixClientAuth: jest.fn(() => Promise.resolve()),
    diagnoseAuthenticationIssues: jest.fn(() => Promise.resolve()),
    getCurrentCart: jest.fn(() => Promise.resolve(null)),
    refreshCart: jest.fn(() => Promise.resolve(null)),
    addToCart: jest.fn(() => Promise.resolve()),
    removeFromCart: jest.fn(() => Promise.resolve()),
    clearCart: jest.fn(() => Promise.resolve()),
    
    // Mock other methods that might be called
    getProducts: jest.fn(() => Promise.resolve([])),
    getProductById: jest.fn(() => Promise.resolve(null)),
    searchProducts: jest.fn(() => Promise.resolve([])),
    
    // Mock authentication properties
    isAuthenticated: false,
    visitorTokens: null,
    
    // Mock member authentication methods
    isMemberLoggedIn: jest.fn(() => false),
    getCurrentMember: jest.fn(() => null),
    hasMemberTokens: jest.fn(() => false),
    
    // Mock API request methods
    makeRequest: jest.fn(() => Promise.resolve({ success: true, data: {} })),
    queryDataCollection: jest.fn(() => Promise.resolve({ success: true, data: [] })),
    
    // Mock initialization
    initialize: jest.fn(() => Promise.resolve()),
    
    // Mock any timers or intervals
    stopAllBackgroundOperations: jest.fn(),
  };

  return {
    __esModule: true,
    default: mockWixApiClient,
    wixApiClient: mockWixApiClient,
    WixApiClient: jest.fn(() => mockWixApiClient),
  };
});

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

console.error = (...args: any[]) => {
  // Only show errors that aren't from expected test scenarios
  if (
    !args.some(arg => 
      typeof arg === 'string' && (
        arg.includes('[WIX SDK]') ||
        arg.includes('[AUTH ERROR]') ||
        arg.includes('[CART]') ||
        arg.includes('[DEBUG]') ||
        arg.includes('[DIAGNOSTICS]') ||
        arg.includes('not wrapped in act') ||
        arg.includes('WixCartProvider') ||
        arg.includes('MemberProvider') ||
        arg.includes('ProductCacheProvider')
      )
    )
  ) {
    originalConsoleError(...args);
  }
};

console.warn = (...args: any[]) => {
  // Only show warnings that aren't from expected test scenarios
  if (
    !args.some(arg => 
      typeof arg === 'string' && (
        arg.includes('[WIX SDK]') ||
        arg.includes('⚠️') ||
        arg.includes('[DEBUG]')
      )
    )
  ) {
    originalConsoleWarn(...args);
  }
};

console.log = (...args: any[]) => {
  // Suppress verbose logging during tests
  if (
    !args.some(arg => 
      typeof arg === 'string' && (
        arg.includes('✅') ||
        arg.includes('🔧') ||
        arg.includes('📱') ||
        arg.includes('🛒') ||
        arg.includes('[DEBUG]') ||
        arg.includes('[AUTH]') ||
        arg.includes('[CART]') ||
        arg.includes('[DIAGNOSTICS]')
      )
    )
  ) {
    originalConsoleLog(...args);
  }
};

// Clean up any remaining timers after each test
afterEach(() => {
  jest.clearAllTimers();
  jest.clearAllMocks();
  
  // Clear any pending async operations
  return new Promise(resolve => {
    setImmediate(resolve);
  });
});

// Set test timeout
jest.setTimeout(10000);