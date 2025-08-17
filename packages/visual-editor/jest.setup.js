// Jest setup file for visual editor tests

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Only show important console messages during tests
console.log = (...args) => {
  const message = args.join(' ');
  if (
    message.includes('✅') ||
    message.includes('❌') ||
    message.includes('🔧') ||
    message.includes('📁') ||
    message.includes('💾') ||
    message.includes('🔨') ||
    message.includes('📡') ||
    message.includes('🔄')
  ) {
    originalConsoleLog(...args);
  }
};

console.warn = (...args) => {
  const message = args.join(' ');
  if (message.includes('Integration Test') || message.includes('WARN')) {
    originalConsoleWarn(...args);
  }
};

console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('Integration Test') || message.includes('ERROR')) {
    originalConsoleError(...args);
  }
};

// Global test timeout
jest.setTimeout(30000);

// Mock fetch for tests that don't use axios
global.fetch = jest.fn();

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});
