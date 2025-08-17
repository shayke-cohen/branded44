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
      
      // Add crypto polyfill aliases for better compatibility (like original)
      alias: {
        crypto: 'react-native-get-random-values',
        // Direct mapping for tilde path (like original)
        '~': path.join(workspacePath, '~'),
      },
      
      // More comprehensive resolver config (like original)
      unstable_enablePackageExports: true,
      platforms: ['ios', 'android', 'native', 'web'],
      
      // Block problematic packages that cause issues in session builds
      blockList: [
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
    
    // Add polyfills for session bundles (try to include what mobile package has)
    serializer: {
      getPolyfills: () => {
        // Try to include essential polyfills, but gracefully handle missing ones
        const polyfills = [];
        try {
          // Only add polyfills that actually exist in node_modules
          const mobileNodeModules = path.resolve(__dirname, '../../../mobile/node_modules');
          
          // Check for react-native-get-random-values (crypto)
          if (require.resolve('react-native-get-random-values', { paths: [mobileNodeModules] })) {
            polyfills.push(require.resolve('react-native-get-random-values', { paths: [mobileNodeModules] }));
          }
          
        } catch (error) {
          console.log('📦 [Metro] Some polyfills not available, using defaults');
        }
        return polyfills;
      },
    },
  };
  
  // Merge with default config like the original mobile metro.config.js
  return mergeConfig(getDefaultConfig(workspacePath), sessionConfig);
}

module.exports = { createSessionMetroConfig };
