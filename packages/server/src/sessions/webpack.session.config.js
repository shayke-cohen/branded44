const path = require('path');
const webpack = require('webpack');

/**
 * Webpack configuration for building session workspace files
 * Similar to packages/web but for dynamic session directories
 */
function createSessionWebpackConfig(sessionPath, outputPath) {
  const workspacePath = path.join(sessionPath, 'workspace');
  const mobileDirectory = path.resolve(__dirname, '../../../mobile');
  
  return {
    entry: path.join(workspacePath, 'App.tsx'),
    mode: 'development',
    output: {
      path: outputPath,
      filename: 'session-app.js',
      library: 'SessionApp',
      libraryTarget: 'umd',
      globalObject: 'this',
    },
    resolve: {
      extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js', '.jsx', '.mjs'],
      alias: {
        // React Native Web compatibility
        'react-native$': 'react-native-web',
        '@react-native-async-storage/async-storage': path.resolve(__dirname, '../../../visual-editor/src/polyfills/AsyncStorage.js'),
        'react-native-reanimated': 'react-native-web',
        '@react-native-cookies/cookies': path.resolve(__dirname, '../../../visual-editor/src/polyfills/ReactNativeCookies.js'),
        'react-native-safe-area-context': path.resolve(__dirname, '../../../visual-editor/src/polyfills/ReactNativeSafeAreaContext.jsx'),
        'react-native-svg': path.resolve(__dirname, '../../../visual-editor/src/polyfills/ReactNativeSVG.js'),
        '@react-navigation/native': path.resolve(__dirname, '../../../visual-editor/src/polyfills/ReactNavigation.js'),
        // @rn-primitives polyfills
        '@rn-primitives/avatar': path.resolve(__dirname, '../../../visual-editor/src/polyfills/RNPrimitives.js'),
        '@rn-primitives/checkbox': path.resolve(__dirname, '../../../visual-editor/src/polyfills/RNPrimitives.js'),
        '@rn-primitives/label': path.resolve(__dirname, '../../../visual-editor/src/polyfills/RNPrimitives.js'),
        '@rn-primitives/progress': path.resolve(__dirname, '../../../visual-editor/src/polyfills/RNPrimitives.js'),
        '@rn-primitives/select': path.resolve(__dirname, '../../../visual-editor/src/polyfills/RNPrimitives.js'),
        '@rn-primitives/separator': path.resolve(__dirname, '../../../visual-editor/src/polyfills/RNPrimitives.js'),
        '@rn-primitives/switch': path.resolve(__dirname, '../../../visual-editor/src/polyfills/RNPrimitives.js'),
        // Mobile package aliases (same as packages/web)
        '@mobile': path.resolve(mobileDirectory, 'src'),
        // Add the ~ alias to point to the ~ directory in workspace
        '~': path.join(workspacePath, '~'),
        // Handle relative paths that go up to the ~ directory (common in mobile files)
        '../../../../~': path.join(workspacePath, '~'),
        '../../../~': path.join(workspacePath, '~'),
        '../../~': path.join(workspacePath, '~'),
        '../~': path.join(workspacePath, '~'),
        // Context overrides for web compatibility
        '@mobile/context$': path.resolve(__dirname, '../../../web/src/context/WebMobileContextIndex.ts'),
        '@mobile/context/index$': path.resolve(__dirname, '../../../web/src/context/WebMobileContextIndex.ts'),
        '@mobile/context/WixCartContext': path.resolve(__dirname, '../../../web/src/context/WebWixCartContext.tsx'),
        '@mobile/context/MemberContext': path.resolve(__dirname, '../../../web/src/context/WebMemberContext.tsx'),
        '@mobile/context/PlatformContextResolver': path.resolve(__dirname, '../../../web/src/context/WebPlatformContextResolver.ts'),
        // Override WixProductService with web-specific version
        '@mobile/screens/wix/ecommerce/shared/WixProductService': path.resolve(__dirname, '../../../web/src/utils/WebWixProductService.ts'),
      },
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx|js|jsx|mjs)$/,
          exclude: /node_modules\/(?!(@rn-primitives|react-native-web|@react-native-async-storage\/async-storage|react-native-reanimated|@react-native-cookies\/cookies|react-native-safe-area-context|react-native-svg|@react-navigation\/native)).*/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: { browsers: ['last 2 versions'] } }],
                ['@babel/preset-react', { runtime: 'automatic' }],
                ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
              ],
              plugins: [
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-transform-class-properties',
                '@babel/plugin-transform-private-methods',
                '@babel/plugin-transform-private-property-in-object',
                '@babel/plugin-syntax-jsx',
                '@babel/plugin-transform-react-jsx',
              ],
            },
          },
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/,
          use: {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets/',
            },
          },
        },
      ],
    },
    // Note: We bundle React with the app instead of externalizing it
    // This ensures React context works properly in the dynamically loaded bundle
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify('development'),
        __DEV__: true,
      }),
    ],
    devtool: 'source-map',
    stats: {
      warnings: false, // Suppress warnings for cleaner output
    },
  };
}

module.exports = { createSessionWebpackConfig };
