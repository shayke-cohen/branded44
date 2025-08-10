module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/android/',
    '<rootDir>/ios/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-vector-icons|@react-native-community|@react-navigation|react-native-webview|@react-native-cookies|@rn-primitives|react-native-reanimated|react-native-worklets)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
  ],
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/jest-setup.js'],
  testTimeout: 10000,
  maxWorkers: 1, // Reduce concurrency to prevent worker issues
  
  // Prevent memory leaks and force exit
  forceExit: true,
  detectOpenHandles: false,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Mock specific modules that cause issues
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^react-native-webview$': '<rootDir>/src/test/__mocks__/react-native-webview.js',
  },
  
  // Silence specific warnings
  silent: false,
  verbose: true,
};
