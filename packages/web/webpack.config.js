const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = path.resolve(__dirname);

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
      'react-native/Libraries/Utilities/Platform': 'react-native-web/dist/exports/Platform',
      'react-native/Libraries/Components/Touchable/TouchableOpacity': 'react-native-web/dist/exports/TouchableOpacity',
      'react-native/Libraries/Components/Keyboard/KeyboardAvoidingView': 'react-native-web/dist/exports/KeyboardAvoidingView',
      'react-native/Libraries/Components/TextInput/TextInput': 'react-native-web/dist/exports/TextInput',
      'react-native/Libraries/Components/ScrollView/ScrollView': 'react-native-web/dist/exports/ScrollView',
      'react-native/Libraries/Image/Image': 'react-native-web/dist/exports/Image',
      'react-native/Libraries/Components/ActivityIndicator/ActivityIndicator': 'react-native-web/dist/exports/ActivityIndicator',
      'react-native/Libraries/Components/SafeAreaView/SafeAreaView': 'react-native-web/dist/exports/SafeAreaView',
      'react-native/Libraries/Components/Button/Button': 'react-native-web/dist/exports/Button',
      'react-native/Libraries/Components/Pressable/Pressable': 'react-native-web/dist/exports/Pressable',
      'react-native/Libraries/Components/Modal/Modal': 'react-native-web/dist/exports/Modal',
      'react-native/Libraries/Components/RefreshControl/RefreshControl': 'react-native-web/dist/exports/RefreshControl',
      'react-native/Libraries/Components/StatusBar/StatusBar': 'react-native-web/dist/exports/StatusBar',
      'react-native/Libraries/Components/Switch/Switch': 'react-native-web/dist/exports/Switch',
      'react-native/Libraries/LayoutAnimation/LayoutAnimation': 'react-native-web/dist/exports/LayoutAnimation',
      'react-native/Libraries/Alert/Alert': 'react-native-web/dist/exports/Alert',
      'react-native/Libraries/Animated/Animated': 'react-native-web/dist/exports/Animated',
      'react-native/Libraries/Utilities/Dimensions': 'react-native-web/dist/exports/Dimensions',
      'react-native/Libraries/EventEmitter/DeviceEventEmitter': 'react-native-web/dist/exports/DeviceEventEmitter',
      'react-native/Libraries/vendor/emitter/EventEmitter': 'react-native-web/dist/exports/NativeEventEmitter',
      'react-native/Libraries/AppState/AppState': 'react-native-web/dist/exports/AppState',
      // Add alias to mobile package for shared components
      '@mobile': path.resolve(appDirectory, '../mobile/src'),
    },
    extensions: ['.web.tsx', '.web.ts', '.tsx', '.ts', '.web.js', '.js'],
    fallback: {
      "crypto": false,
      "stream": false,
      "buffer": false,
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules(?!.*react-native-web)/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [
              ['@babel/preset-env', {
                targets: {
                  browsers: ['last 2 versions', 'ie >= 11']
                }
              }],
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: [
              'babel-plugin-react-native-web',
              ['@babel/plugin-proposal-class-properties', { loose: true }],
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
    },
  },
}; 