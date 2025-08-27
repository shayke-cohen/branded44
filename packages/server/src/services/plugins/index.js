const { createSessionImportPlugin } = require('./sessionImportPlugin');
const { createReactNativeWebPlugin } = require('./reactNativeWebPlugin');
const { createIframeBundlePlugin } = require('./iframeBundlePlugin');
const { createGlobalExternalsPlugin } = require('./globalExternalsPlugin');

/**
 * Create debug plugin for external dependencies
 * @returns {Object} - esbuild plugin
 */
function createDebugExternalsPlugin() {
  return {
    name: 'debug-externals',
    setup(build) {
      build.onResolve({ filter: /@react-native-cookies\/cookies/ }, (args) => {
        console.log(`🔍 [ESBUILD DEBUG] Resolving cookies package: ${args.path}`);
        console.log(`🔍 [ESBUILD DEBUG] External deps: ${JSON.stringify(build.initialOptions.external)}`);
        return { path: args.path, external: true };
      });
    }
  };
}

module.exports = {
  createSessionImportPlugin,
  createReactNativeWebPlugin,
  createIframeBundlePlugin,
  createGlobalExternalsPlugin,
  createDebugExternalsPlugin
};
