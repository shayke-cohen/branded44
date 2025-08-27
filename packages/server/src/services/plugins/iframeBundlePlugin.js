/**
 * Create plugin for self-contained iframe bundles with all dependencies included
 * @returns {Object} - esbuild plugin
 */
function createIframeBundlePlugin() {
  return {
    name: 'iframe-bundle',
    setup(build) {
      console.log(`📦 [IFRAME-BUNDLE] Setting up self-contained bundle plugin`);
      
      // For iframe bundles, let React/ReactDOM/RN-Web be bundled normally from node_modules
      // Only mock packages that don't work in browser or need special handling
      
      // Handle externalized React Native packages as globals
      build.onResolve({ filter: /^react-native-web$/ }, args => {
        console.log(`🔧 [IFRAME-BUNDLE] Resolving react-native-web as global`);
        return { path: args.path, namespace: 'iframe-global' };
      });
      
      build.onResolve({ filter: /^react-native$/ }, args => {
        console.log(`🔧 [IFRAME-BUNDLE] Resolving react-native as global`);
        return { path: args.path, namespace: 'iframe-global' };
      });
      
      // Mock @react-native packages (scoped packages that usually need native functionality)
      build.onResolve({ filter: /^@react-native-async-storage|@react-native-cookies/ }, args => {
        console.log(`🔧 [IFRAME-BUNDLE] Mocking @react-native package: ${args.path}`);
        return { path: args.path, namespace: 'iframe-mock' };
      });
      
      // Mock specific react-native-* packages that need native functionality
      build.onResolve({ filter: /^react-native-(reanimated|svg|vector-icons|webview|safe-area-context|device-info|permissions|share|image-picker|gesture-handler|screens|keyboard-aware-scroll-view|status-bar-height)/ }, args => {
        console.log(`🔧 [IFRAME-BUNDLE] Mocking react-native package: ${args.path}`);
        return { path: args.path, namespace: 'iframe-mock' };
      });
      
      // Mock Wix SDKs - they have Node.js file system dependencies (.context files) that can't be bundled for browsers
      build.onResolve({ filter: /^@wix\// }, args => {
        console.log(`🔧 [IFRAME-BUNDLE] Mocking Wix SDK (file system dependencies): ${args.path}`);
        return { path: args.path, namespace: 'iframe-mock' };
      });
      
      // Handle externalized globals for iframe bundles
      build.onLoad({ filter: /.*/, namespace: 'iframe-global' }, args => {
        console.log(`📦 [IFRAME-BUNDLE] Loading global for: ${args.path}`);
        
        if (args.path === 'react-native-web') {
          return {
            contents: `
              // React Native Web from CDN or bundled version
              const ReactNativeWeb = window.ReactNativeWeb || (() => {
                throw new Error('ReactNativeWeb not available on window - make sure it is loaded via CDN');
              })();
              
              module.exports = ReactNativeWeb;
            `,
            loader: 'js'
          };
        }
        
        if (args.path === 'react-native') {
          return {
            contents: `
              // React Native -> alias to React Native Web
              const ReactNativeWeb = window.ReactNativeWeb || (() => {
                throw new Error('ReactNativeWeb not available on window - make sure it is loaded via CDN');
              })();
              
              module.exports = ReactNativeWeb;
            `,
            loader: 'js'
          };
        }
        
        return {
          contents: `module.exports = {};`,
          loader: 'js'
        };
      });
      
      // Handle all mocked packages
      build.onLoad({ filter: /.*/, namespace: 'iframe-mock' }, args => {
        console.log(`📦 [IFRAME-BUNDLE] Loading self-contained mock for: ${args.path}`);
        
        // Provide comprehensive mocks based on package type
        if (args.path.includes('async-storage')) {
          return {
            contents: `
              const AsyncStorage = {
                getItem: async (key) => localStorage.getItem(key),
                setItem: async (key, value) => localStorage.setItem(key, value),
                removeItem: async (key) => localStorage.removeItem(key),
                clear: async () => localStorage.clear(),
                getAllKeys: async () => Object.keys(localStorage)
              };
              module.exports = AsyncStorage;
              module.exports.default = AsyncStorage;
            `,
            loader: 'js'
          };
        }
        
        if (args.path.includes('safe-area-context')) {
          return {
            contents: `
              const SafeAreaProvider = ({ children }) => children;
              const useSafeAreaInsets = () => ({ top: 0, bottom: 0, left: 0, right: 0 });
              const useSafeAreaFrame = () => ({ x: 0, y: 0, width: 375, height: 812 });
              module.exports = { SafeAreaProvider, useSafeAreaInsets, useSafeAreaFrame };
            `,
            loader: 'js'
          };
        }
        
        if (args.path.includes('webview')) {
          return {
            contents: `
              const WebView = ({ source, style, ...props }) => {
                return { type: 'iframe', props: { src: source?.uri, style, ...props } };
              };
              module.exports = WebView;
              module.exports.default = WebView;
            `,
            loader: 'js'
          };
        }
        
        if (args.path.includes('reanimated')) {
          return {
            contents: `
              const Animated = {
                View: ({ children, style, ...props }) => ({ type: 'div', props: { style, ...props }, children }),
                Text: ({ children, style, ...props }) => ({ type: 'span', props: { style, ...props }, children }),
                ScrollView: ({ children, style, ...props }) => ({ type: 'div', props: { style, ...props }, children }),
                Image: ({ source, style, ...props }) => ({ type: 'img', props: { src: source?.uri, style, ...props } })
              };
              const useSharedValue = (initial) => ({ value: initial });
              const useAnimatedStyle = (fn) => ({});
              const withSpring = (value) => value;
              const withTiming = (value) => value;
              const runOnJS = (fn) => fn;
              module.exports = { 
                default: Animated,
                useSharedValue,
                useAnimatedStyle, 
                withSpring,
                withTiming,
                runOnJS
              };
            `,
            loader: 'js'
          };
        }
        
        if (args.path.includes('wix-data-items-sdk')) {
          return {
            contents: `
              const items = {
                query: (collection) => ({
                  find: async () => ({ items: [], totalCount: 0 }),
                  limit: (n) => this,
                  skip: (n) => this,
                  ascending: (field) => this,
                  descending: (field) => this,
                  eq: (field, value) => this,
                  ne: (field, value) => this,
                  contains: (field, value) => this
                }),
                get: async (id) => ({ _id: id, title: 'Mock Item' }),
                insert: async (item) => ({ ...item, _id: 'mock-id' }),
                update: async (id, item) => ({ ...item, _id: id }),
                save: async (item) => ({ ...item, _id: item._id || 'mock-id' }),
                remove: async (id) => ({ _id: id }),
                bulkInsert: async (items) => items.map(item => ({ ...item, _id: 'mock-id' }))
              };
              module.exports = { items };
            `,
            loader: 'js'
          };
        }
        
        if (args.path.includes('wix-stores-sdk')) {
          return {
            contents: `
              const cart = {
                getCurrentCart: async () => ({ lineItems: [], totals: { subtotal: 0, total: 0 } }),
                addToCart: async (items) => ({ lineItems: items }),
                removeLineItemsFromCart: async (ids) => ({ lineItems: [] }),
                updateLineItemsInCart: async (items) => ({ lineItems: items })
              };
              const products = {
                getProduct: async (id) => ({ _id: id, name: 'Mock Product', price: { price: 10 } }),
                queryProducts: () => ({
                  find: async () => ({ items: [], totalCount: 0 }),
                  limit: (n) => this,
                  skip: (n) => this
                })
              };
              module.exports = { cart, products };
            `,
            loader: 'js'
          };
        }
        
        if (args.path.includes('wix-bookings-sdk')) {
          return {
            contents: `
              const services = {
                getService: async (id) => ({ _id: id, name: 'Mock Service' }),
                queryServices: () => ({
                  find: async () => ({ items: [], totalCount: 0 }),
                  limit: (n) => this,
                  skip: (n) => this
                })
              };
              const bookings = {
                createBooking: async (booking) => ({ ...booking, _id: 'mock-booking-id' }),
                getBooking: async (id) => ({ _id: id, status: 'CONFIRMED' }),
                queryBookings: () => ({
                  find: async () => ({ items: [], totalCount: 0 })
                })
              };
              module.exports = { services, bookings };
            `,
            loader: 'js'
          };
        }
        
        if (args.path.includes('wix-members-sdk')) {
          return {
            contents: `
              const authentication = {
                login: async (credentials) => ({ sessionToken: 'mock-token' }),
                logout: async () => ({ success: true }),
                register: async (member) => ({ _id: 'mock-member-id', ...member })
              };
              const currentMember = {
                getMember: async () => ({ _id: 'mock-member-id', email: 'mock@example.com' })
              };
              module.exports = { authentication, currentMember };
            `,
            loader: 'js'
          };
        }
        
        // Generic mock for @react-native packages that aren't specifically handled
        if (args.path.startsWith('@react-native')) {
          return {
            contents: `
              // Generic @react-native package mock
              console.log('📦 [IFRAME-MOCK] Using generic mock for ${args.path}');
              module.exports = {};
              module.exports.default = {};
            `,
            loader: 'js'
          };
        }
        
        // Default empty mock for any other packages
        return {
          contents: `
            console.log('📦 [IFRAME-MOCK] Using default empty mock for ${args.path}');
            module.exports = {};
          `,
          loader: 'js'
        };
      });
    }
  };
}

module.exports = { createIframeBundlePlugin };
