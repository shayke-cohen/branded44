const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [
    // Include the root of the yarn workspace
    path.resolve(__dirname, '../..'),
  ],
  resolver: {
    // Look for modules in both local and root node_modules
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../node_modules'),
    ],
    // Add crypto polyfill aliases for better compatibility
    alias: {
      crypto: 'react-native-get-random-values',
    },
  },
  transformer: {
    // Enable experimental require.context for auto-discovery
    unstable_allowRequireContext: true,
    // Enable polyfill support
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
