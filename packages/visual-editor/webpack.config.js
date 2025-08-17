const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';

  return {
    entry: './src/index.tsx',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isDevelopment ? '[name].js' : '[name].[contenthash].js',
      clean: true,
      publicPath: '/',
    },
      resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      'react-native$': 'react-native-web',
      'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter':
        'react-native-web/dist/vendor/react-native/NativeEventEmitter/RCTDeviceEventEmitter',
      'react-native/Libraries/vendor/emitter/EventEmitter':
        'react-native-web/dist/vendor/react-native/emitter/EventEmitter',
      'react-native/Libraries/EventEmitter/NativeEventEmitter':
        'react-native-web/dist/vendor/react-native/NativeEventEmitter',
      
      // Mobile app access (same as web package)
      '@mobile': path.resolve(__dirname, '../mobile/src'),
      '@mobile-components': path.resolve(__dirname, '../mobile/src/components'),
      '@mobile-templates': path.resolve(__dirname, '../mobile/src/components/templates'),
      '@mobile-blocks': path.resolve(__dirname, '../mobile/src/components/blocks'),
      
      // Context overrides - use web-compatible versions where needed
      // For now, use the mobile context directly, but this may need web overrides later
      '@mobile/context': path.resolve(__dirname, '../mobile/src/context'),
      
      // React Native polyfills (same as web package)
      '@react-native-async-storage/async-storage': path.resolve(__dirname, 'src/polyfills/AsyncStorage.js'),
      'react-native-safe-area-context': path.resolve(__dirname, 'src/polyfills/ReactNativeSafeAreaContext.jsx'),
      'react-native-reanimated': path.resolve(__dirname, 'src/polyfills/ReactNativeReanimated.js'),
      '@react-native-cookies/cookies': path.resolve(__dirname, 'src/polyfills/ReactNativeCookies.js'),
      
      // React Navigation polyfill
      '@react-navigation/native': path.resolve(__dirname, 'src/polyfills/ReactNavigation.js'),
      
      // React Native SVG polyfill
      'react-native-svg': path.resolve(__dirname, 'src/polyfills/ReactNativeSVG.js'),
      
      // RN Primitives polyfills (essential ones)
      '@rn-primitives/select$': path.resolve(__dirname, 'src/polyfills/RNPrimitives.js'),
      '@rn-primitives/avatar$': path.resolve(__dirname, 'src/polyfills/RNPrimitives.js'),
      '@rn-primitives/checkbox$': path.resolve(__dirname, 'src/polyfills/RNPrimitives.js'),
      '@rn-primitives/label$': path.resolve(__dirname, 'src/polyfills/RNPrimitives.js'),
      '@rn-primitives/progress$': path.resolve(__dirname, 'src/polyfills/RNPrimitives.js'),
      '@rn-primitives/separator$': path.resolve(__dirname, 'src/polyfills/RNPrimitives.js'),
      '@rn-primitives/switch$': path.resolve(__dirname, 'src/polyfills/RNPrimitives.js'),
      '@rn-primitives/slot$': path.resolve(__dirname, 'src/polyfills/RNPrimitives.js'),
    },
    fallback: {
      "fs": false,
      "path": require.resolve("path-browserify"),
      "stream": require.resolve("stream-browserify"),
      "assert": require.resolve("assert/"),
      "constants": require.resolve("constants-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "util": require.resolve("util/")
    },
  },
    module: {
      rules: [
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules\/(?!(react-native-web)\/).*/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [
                  '@babel/preset-env',
                  '@babel/preset-react',
                  '@babel/preset-typescript',
                ],
                plugins: [
                  ['@babel/plugin-proposal-class-properties'],
                  ['@babel/plugin-transform-runtime'],
                ],
              },
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          type: 'asset/resource',
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        title: 'Branded44 Visual Editor',
      }),
      new (require('webpack')).DefinePlugin({
        __DEV__: JSON.stringify(isDevelopment),
        'process.env.NODE_ENV': JSON.stringify(isDevelopment ? 'development' : 'production'),
      }),
    ],
    devServer: {
      port: 3002,
      hot: true,
      historyApiFallback: true,
      static: {
        directory: path.join(__dirname, 'public'),
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
        // Proxy session files to the server
        '/session/**': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          pathRewrite: {
            '^/session': '/api/editor/session'
          },
          logLevel: 'debug',
          onProxyReq: (proxyReq, req, res) => {
            console.log('📁 [Webpack Proxy] Proxying session file request:', req.url);
            console.log('📁 [Webpack Proxy] Target URL:', proxyReq.path);
          }
        },
        // Proxy Wix API calls to server to avoid CORS issues
        '/api/wix-proxy/**': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          logLevel: 'debug',
          onProxyReq: (proxyReq, req, res) => {
            console.log('🌐 [Webpack Proxy] Proxying Wix API request:', req.url);
            console.log('🌐 [Webpack Proxy] Target URL:', proxyReq.path);
          }
        },
      },
      client: {
        logging: 'warn', // Reduce console noise
        overlay: {
          warnings: false, // Don't show warnings in overlay
          errors: true,    // Still show errors
        },
      },
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          mobile: {
            test: /[\\/]packages[\\/]mobile[\\/]/,
            name: 'mobile-components',
            chunks: 'all',
          },
        },
      },
    },
    devtool: isDevelopment ? 'eval-source-map' : 'source-map',
    
    // Configure stats to filter warnings
    stats: {
      warningsFilter: [
        /react-native-web/,
        /export .* was not found in 'react-dom'/,
        /findDOMNode/,
        /hydrate/,
        /render/,
        /unmountComponentAtNode/,
      ],
    },
    
    // Suppress bundle size warnings in development
    performance: {
      hints: isDevelopment ? false : 'warning',
      maxAssetSize: 500000,
      maxEntrypointSize: 500000,
    },
    
    // Suppress React Native Web compatibility warnings
    ignoreWarnings: [
      {
        module: /react-native-web/,
        message: /export .* was not found in 'react-dom'/,
      },
      {
        module: /react-native-web/,
        message: /findDOMNode/,
      },
      {
        module: /react-native-web/,
        message: /hydrate/,
      },
      {
        module: /react-native-web/,
        message: /render/,
      },
      {
        module: /react-native-web/,
        message: /unmountComponentAtNode/,
      },
    ],
  };
};
