const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = path.resolve(__dirname);
const mobileDirectory = path.resolve(appDirectory, '../mobile');

module.exports = {
  entry: path.resolve(appDirectory, 'src/index.tsx'),
  output: {
    path: path.resolve(appDirectory, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      // Use our custom AsyncStorage polyfill for web
      '@react-native-async-storage/async-storage$': path.resolve(appDirectory, 'src/polyfills/AsyncStorage.js'),
      // Add alias to mobile package for shared components
      '@mobile': path.resolve(appDirectory, '../mobile/src'),
      // Ensure single React instance to prevent hook issues - use root node_modules
      'react': path.resolve(__dirname, '../../node_modules/react'),
      'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
    },
    extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js'],
    modules: [
      path.resolve(__dirname, '../../node_modules'), // Root node_modules first
      path.resolve(appDirectory, 'node_modules'),     // Web package node_modules
      'node_modules'
    ],
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