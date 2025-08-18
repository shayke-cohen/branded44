const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration for building React Native bundles from session workspaces
 * Based on packages/mobile/metro.config.js but for dynamic session directories
 */
function createSessionMetroConfig(workspacePath, options = {}) {
  const { platform = 'android', dev = true, projectRoot } = options;
  
  // Create session-specific config similar to mobile/metro.config.js
  const sessionConfig = {
    projectRoot: workspacePath,
    
    watchFolders: [
      // Watch the session workspace
      workspacePath,
      // Include the original mobile package for shared dependencies
      path.resolve(__dirname, '../../../mobile'),
      // Include the ~ directory from mobile package
      path.resolve(__dirname, '../../../mobile/~'),
      // Include root node_modules for workspace dependencies
      path.resolve(__dirname, '../../../..'),
    ],
    
    resolver: {
      // Look for modules in both local and root node_modules (like original)
      nodeModulesPaths: [
        path.join(workspacePath, 'node_modules'),
        path.resolve(__dirname, '../../../mobile/node_modules'),
        path.resolve(__dirname, '../../../../node_modules'),
      ],
      
      // Direct mapping for tilde path only - no Node.js polyfills
      alias: {
        '~': path.join(workspacePath, '~'),
      },
      
      // More comprehensive resolver config (like original)
      unstable_enablePackageExports: true,
      platforms: ['ios', 'android', 'native', 'web'],
      
      // Block problematic packages and Node.js core modules
      blockList: [
        // Wix-specific blocking
        /.*\/node_modules\/jose\/.*/,
        /.*\/node_modules\/@wix\/sdk\/.*/,
        /.*\/utils\/wixApiClient\.ts$/,
        /.*\/utils\/wixServiceAdapter\.ts$/,
        /.*\/utils\/wixBookingApiClient\.ts$/,
        /.*\/utils\/wixRestaurantApiClient\.ts$/,
        /.*\/utils\/wix.*\.ts$/,
        /.*\/context\/WixCartContext\.tsx$/,
        /.*\/context\/WixBookingContext\.tsx$/,
        /.*\/context\/.*Wix.*\.tsx$/,
        // Block Node.js core modules that should not be in React Native bundles
        // Note: base64-js and ieee754 are needed by React Native internals
        /.*\/node_modules\/buffer\/.*/,
        /.*\/node_modules\/stream\/.*/,
        /.*\/node_modules\/stream-browserify\/.*/,
        /.*\/node_modules\/util\/.*/,
        /.*\/node_modules\/crypto\/.*/,
        /.*\/node_modules\/crypto-browserify\/.*/,
        /.*\/node_modules\/text-encoding\/.*/,
        /.*\/node_modules\/text-encoding-polyfill\/.*/,
        /.*\/node_modules\/url\/.*/,
        /.*\/node_modules\/process\/.*/,
      ],
    },
    
    transformer: {
      // Enable experimental require.context for auto-discovery (like original)
      unstable_allowRequireContext: true,
      // Enable polyfill support (like original)
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true, // Like original for better performance
        },
      }),
    },
    
    // Use minimal serializer - no Node.js polyfills for pure React Native bundles
    serializer: {
      // Let Metro use its default polyfills for React Native only
    },
  };
  
  // Merge with default config like the original mobile metro.config.js
  return mergeConfig(getDefaultConfig(workspacePath), sessionConfig);
}

module.exports = { createSessionMetroConfig };
