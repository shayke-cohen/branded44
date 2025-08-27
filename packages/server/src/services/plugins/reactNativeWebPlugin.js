/**
 * Create plugin to handle React Native Web transformations
 * @returns {Object} - esbuild plugin
 */
function createReactNativeWebPlugin() {
  return {
    name: 'react-native-web',
    setup(build) {
      // Map React Native imports to React Native Web
      build.onResolve({ filter: /^react-native$/ }, args => {
        return { path: 'react-native-web', external: true };
      });
      
      // Handle React Native specific imports
      build.onResolve({ filter: /^react-native\/.*/ }, args => {
        const subpath = args.path.replace('react-native/', '');
        return { path: `react-native-web/${subpath}`, external: true };
      });
    }
  };
}

module.exports = { createReactNativeWebPlugin };

