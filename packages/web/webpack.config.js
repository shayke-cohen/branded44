const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const appDirectory = path.resolve(__dirname);
const mobileDirectory = path.resolve(appDirectory, '../mobile');

module.exports = {
  entry: path.resolve(appDirectory, 'src/index.tsx'),
  mode: 'development',
  output: {
    path: path.resolve(appDirectory, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      '@mobile': path.resolve(__dirname, '../mobile/src'),
      // Override entire mobile context index with web version
      '@mobile/context$': path.resolve(__dirname, 'src/context/WebMobileContextIndex.ts'),
      '@mobile/context/index$': path.resolve(__dirname, 'src/context/WebMobileContextIndex.ts'),
      // Override specific context files directly
      '@mobile/context/WixCartContext': path.resolve(__dirname, 'src/context/WebWixCartContext.tsx'),
      '@mobile/context/MemberContext': path.resolve(__dirname, 'src/context/WebMemberContext.tsx'),
      '../mobile/src/context/WixCartContext': path.resolve(__dirname, 'src/context/WebWixCartContext.tsx'),
      '../mobile/src/context/MemberContext': path.resolve(__dirname, 'src/context/WebMemberContext.tsx'),
      // Override mobile context with web-compatible versions - try multiple patterns
      '@mobile/context/PlatformContextResolver': path.resolve(__dirname, 'src/context/WebPlatformContextResolver.ts'),
      '../mobile/src/context/PlatformContextResolver': path.resolve(__dirname, 'src/context/WebPlatformContextResolver.ts'),
      './PlatformContextResolver': path.resolve(__dirname, 'src/context/WebPlatformContextResolver.ts'),
      // Override WixProductService with web-specific version
      '@mobile/screens/wix/ecommerce/shared/WixProductService': path.resolve(__dirname, 'src/utils/WebWixProductService.ts'),
      '../mobile/src/screens/wix/ecommerce/shared/WixProductService': path.resolve(__dirname, 'src/utils/WebWixProductService.ts'),
      // Handle relative imports from different locations
      '../shared/WixProductService': path.resolve(__dirname, 'src/utils/WebWixProductService.ts'),
      '../../screens/wix/ecommerce/shared/WixProductService': path.resolve(__dirname, 'src/utils/WebWixProductService.ts'),
      '../../../screens/wix/ecommerce/shared/WixProductService': path.resolve(__dirname, 'src/utils/WebWixProductService.ts'),
      '../../../../screens/wix/ecommerce/shared/WixProductService': path.resolve(__dirname, 'src/utils/WebWixProductService.ts'),
      '@react-native-async-storage/async-storage': path.resolve(
        appDirectory,
        'src/polyfills/AsyncStorage.js',
      ),
      // React Native Reanimated polyfill
      'react-native-reanimated': path.resolve(
        appDirectory,
        'src/polyfills/ReactNativeReanimated.js',
      ),
      // React Native Cookies polyfill
      '@react-native-cookies/cookies': path.resolve(
        appDirectory,
        'src/polyfills/ReactNativeCookies.js',
      ),
      // React Native Safe Area Context polyfill
      'react-native-safe-area-context': path.resolve(
        appDirectory,
        'src/polyfills/ReactNativeSafeAreaContext.js',
      ),
      // RN Primitives polyfills - exact matches to override node_modules
      '@rn-primitives/avatar$': path.resolve(
        appDirectory,
        'src/polyfills/avatar.js',
      ),
      '@rn-primitives/checkbox$': path.resolve(
        appDirectory,
        'src/polyfills/checkbox.js',
      ),
      '@rn-primitives/label$': path.resolve(
        appDirectory,
        'src/polyfills/label.js',
      ),
      '@rn-primitives/progress$': path.resolve(
        appDirectory,
        'src/polyfills/progress.js',
      ),
      '@rn-primitives/select$': path.resolve(
        appDirectory,
        'src/polyfills/select.js',
      ),
      '@rn-primitives/separator$': path.resolve(
        appDirectory,
        'src/polyfills/separator.js',
      ),
      '@rn-primitives/slot$': path.resolve(
        appDirectory,
        'src/polyfills/slot.js',
      ),
      '@rn-primitives/switch$': path.resolve(
        appDirectory,
        'src/polyfills/switch.js',
      ),
      '../../context/ProductCacheContext': path.resolve(
        __dirname,
        '../mobile/src/context/ProductCacheContext.tsx',
      ),
      '../../context/ThemeContext': path.resolve(
        __dirname,
        '../mobile/src/context/ThemeContext.tsx',
      ),
      '../../context/WixCartContext': path.resolve(
        appDirectory,
        'src/context/WebWixCartContext.tsx',
      ),
      '../../context/WixCartContext$': path.resolve(
        appDirectory,
        'src/context/WebWixCartContext.tsx',
      ),
      '../../context/MemberContext': path.resolve(
        appDirectory,
        'src/context/WebMemberContext.tsx',
      ),
      '../mobile/src/context/MemberContext$': path.resolve(
        appDirectory,
        'src/context/WebMemberContext.tsx',
      ),
      '../../context': path.resolve(
        appDirectory,
        'src/context',
      ),
      '../context$': path.resolve(
        appDirectory,
        'src/context',
      ),
      '@mobile/context': path.resolve(
        appDirectory,
        'src/context',
      ),
      react: path.resolve(__dirname, '../../node_modules/react'),
    },
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.tsx',
      '.ts',
      '.web.js',
      '.js',
    ],
    modules: [
      path.resolve(appDirectory, 'node_modules'),     // Web package node_modules first
      path.resolve(__dirname, '../../node_modules'), // Root node_modules second
      'node_modules'
    ],
    // Ensure aliases take precedence over node_modules
    preferRelative: false,
    fallback: {
      "crypto": false,
      "stream": false,
      "buffer": false,
      "util": false,
      "path": false,
      "fs": false,
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules\/(?!(react-native-web)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [
              ['@babel/preset-env', {
                loose: true,
                targets: {
                  browsers: ['last 2 versions', 'ie >= 11']
                }
              }],
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: [
              ['@babel/plugin-transform-class-properties', { loose: true }],
              ['@babel/plugin-transform-private-methods', { loose: true }],
              ['@babel/plugin-transform-private-property-in-object', { loose: true }],
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 8192,
            name: 'images/[name].[ext]',
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(appDirectory, 'public/index.html'),
      inject: 'body',
    }),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    }),
  ],
  devServer: {
    static: {
      directory: path.resolve(appDirectory, 'public'),
    },
    port: 3000,
    hot: true,
    historyApiFallback: true,
    open: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
      // More graceful handling of HMR failures
      logging: 'info',
    },
    // Watch files but be more tolerant of HMR failures
    liveReload: true,
  },
  watchOptions: {
    // Only ignore node_modules, but watch mobile files for updates
    ignored: /node_modules/,
    // Reduce polling to avoid excessive file watching
    poll: 1000,
  },
}; 