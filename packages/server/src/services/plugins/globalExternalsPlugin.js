/**
 * Create plugin to map external dependencies to global variables
 * @returns {Object} - esbuild plugin
 */
function createGlobalExternalsPlugin() {
  return {
    name: 'global-externals',
    setup(build) {
      console.log('🔧 [GLOBAL-EXTERNALS] Plugin initialized');
      
      // Set up resolvers for various packages
      setupReactResolvers(build);
      setupReactNativeResolvers(build);
      setupThirdPartyResolvers(build);
      // Mock Wix SDKs - they have Node.js file system dependencies (.context files) that can't be bundled for browsers
      setupWixSDKResolvers(build);
      
      // Set up loaders for global externals
      setupGlobalLoaders(build);
    }
  };
}

/**
 * Set up React-related package resolvers
 */
function setupReactResolvers(build) {
  // Map React to global variable
  build.onResolve({ filter: /^react$/ }, args => {
    console.log(`🔧 [GLOBAL-EXTERNALS] Resolving react: ${args.path}`);
    return { 
      path: 'react', 
      namespace: 'global-external'
    };
  });
  
  // Map React JSX runtime to global variable  
  build.onResolve({ filter: /^react\/jsx-runtime$/ }, args => {
    return { 
      path: 'react/jsx-runtime', 
      namespace: 'global-external'
    };
  });
  
  // Map ReactDOM to global variable
  build.onResolve({ filter: /^react-dom.*$/ }, args => {
    return { 
      path: args.path, 
      namespace: 'global-external'
    };
  });
}

/**
 * Set up React Native related package resolvers
 */
function setupReactNativeResolvers(build) {
  // Map React Native Web to global variable
  build.onResolve({ filter: /^react-native-web$/ }, args => {
    console.log(`🔧 [GLOBAL-EXTERNALS] Resolving react-native-web: ${args.path}`);
    return { 
      path: 'react-native-web', 
      namespace: 'global-external'
    };
  });
  
  // Map React Native to global variable (fallback to react-native-web)
  build.onResolve({ filter: /^react-native$/ }, args => {
    console.log(`🔧 [GLOBAL-EXTERNALS] Resolving react-native: ${args.path}`);
    return { 
      path: 'react-native', 
      namespace: 'global-external'
    };
  });
}

/**
 * Set up third-party React Native package resolvers
 */
function setupThirdPartyResolvers(build) {
  // Map React Native Safe Area Context to mock
  build.onResolve({ filter: /^react-native-safe-area-context$/ }, args => {
    console.log(`🔧 [GLOBAL-EXTERNALS] Resolving react-native-safe-area-context: ${args.path}`);
    return { 
      path: 'react-native-safe-area-context', 
      namespace: 'global-external'
    };
  });
  
  // Map other common React Native packages to mocks
  build.onResolve({ filter: /^react-native-webview$/ }, args => {
    console.log(`🔧 [GLOBAL-EXTERNALS] Resolving react-native-webview: ${args.path}`);
    return { 
      path: 'react-native-webview', 
      namespace: 'global-external'
    };
  });
  
  build.onResolve({ filter: /^react-native-reanimated$/ }, args => {
    console.log(`🔧 [GLOBAL-EXTERNALS] Resolving react-native-reanimated: ${args.path}`);
    return { 
      path: 'react-native-reanimated', 
      namespace: 'global-external'
    };
  });
  
  // Map AsyncStorage to mock
  build.onResolve({ filter: /^@react-native-async-storage\/async-storage$/ }, args => {
    console.log(`🔧 [GLOBAL-EXTERNALS] Resolving @react-native-async-storage/async-storage: ${args.path}`);
    return { 
      path: '@react-native-async-storage/async-storage', 
      namespace: 'global-external'
    };
  });
  
  // Map React Native Cookies to mock
  build.onResolve({ filter: /^@react-native-cookies\/cookies$/ }, args => {
    console.log(`🔧 [GLOBAL-EXTERNALS] Resolving @react-native-cookies/cookies: ${args.path}`);
    return { 
      path: '@react-native-cookies/cookies', 
      namespace: 'global-external'
    };
  });
}

/**
 * Set up Wix SDK package resolvers
 */
function setupWixSDKResolvers(build) {
  const wixSDKPackages = [
    '@wix/wix-data-items-sdk',
    '@wix/wix-stores-sdk', 
    '@wix/wix-bookings-sdk',
    '@wix/wix-members-sdk'
  ];
  
  wixSDKPackages.forEach(packageName => {
    const filter = new RegExp(`^${packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
    build.onResolve({ filter }, args => {
      console.log(`🔧 [GLOBAL-EXTERNALS] Resolving ${packageName}: ${args.path}`);
      return { 
        path: packageName, 
        namespace: 'global-external'
      };
    });
  });
}

/**
 * Set up global loaders for externalized packages
 */
function setupGlobalLoaders(build) {
  // Provide the actual global variable references
  build.onLoad({ filter: /.*/, namespace: 'global-external' }, args => {
    // React core
    if (args.path === 'react') {
      return {
        contents: 'module.exports = window.React;',
        loader: 'js'
      };
    }
    
    if (args.path === 'react/jsx-runtime') {
      return {
        contents: `
          module.exports = {
            jsx: window.React.jsx || window.React.createElement,
            jsxs: window.React.jsxs || window.React.createElement,
            Fragment: window.React.Fragment
          };
        `,
        loader: 'js'
      };
    }
    
    if (args.path.startsWith('react-dom')) {
      return {
        contents: 'module.exports = window.ReactDOM;',
        loader: 'js'
      };
    }
    
    // React Native packages
    if (args.path === 'react-native-web') {
      return getReactNativeWebLoader();
    }
    
    if (args.path === 'react-native') {
      return getReactNativeLoader();
    }
    
    // Third-party RN packages
    if (args.path === 'react-native-safe-area-context') {
      return getSafeAreaContextLoader();
    }
    
    if (args.path === 'react-native-webview') {
      return getWebViewLoader();
    }
    
    if (args.path === 'react-native-reanimated') {
      return getReanimatedLoader();
    }
    
    if (args.path === '@react-native-async-storage/async-storage') {
      return getAsyncStorageLoader();
    }
    
    if (args.path === '@react-native-cookies/cookies') {
      return getCookiesLoader();
    }
    
    // Wix SDK packages
    if (args.path === '@wix/wix-data-items-sdk') {
      return getWixDataItemsLoader();
    }
    
    if (args.path === '@wix/wix-stores-sdk') {
      return getWixStoresLoader();
    }
    
    if (args.path === '@wix/wix-bookings-sdk') {
      return getWixBookingsLoader();
    }
    
    if (args.path === '@wix/wix-members-sdk') {
      return getWixMembersLoader();
    }
    
    return null;
  });
}

// Loader functions
function getReactNativeWebLoader() {
  console.log(`🔧 [GLOBAL-EXTERNALS] Loading react-native-web with Dimensions API`);
  return {
    contents: `
      const ReactNativeWeb = window.ReactNativeWeb || {};
      
      // Ensure Dimensions API is available
      if (!ReactNativeWeb.Dimensions) {
        ReactNativeWeb.Dimensions = {
          get: (dimension) => {
            const screen = window.screen || { width: 375, height: 812 };
            const viewport = {
              width: window.innerWidth || 375,
              height: window.innerHeight || 812
            };
            
            console.log('📱 [Dimensions] Getting dimension:', dimension, viewport);
            
            if (dimension === 'window') {
              return viewport;
            } else if (dimension === 'screen') {
              return { width: screen.width, height: screen.height };
            }
            return viewport; // Default to window dimensions
          },
          addEventListener: () => {},
          removeEventListener: () => {}
        };
      }
      
      // Ensure Platform API is available  
      if (!ReactNativeWeb.Platform) {
        ReactNativeWeb.Platform = {
          OS: 'web',
          select: (obj) => obj.web || obj.default,
          Version: '0.19.13'
        };
      }
      
      module.exports = ReactNativeWeb;
    `,
    loader: 'js'
  };
}

function getReactNativeLoader() {
  console.log(`🔧 [GLOBAL-EXTERNALS] Loading react-native with Dimensions API`);
  return {
    contents: `
      const ReactNative = window.ReactNativeWeb || window.ReactNative || {};
      
      // Ensure Dimensions API is available
      if (!ReactNative.Dimensions) {
        ReactNative.Dimensions = {
          get: (dimension) => {
            const screen = window.screen || { width: 375, height: 812 };
            const viewport = {
              width: window.innerWidth || 375,
              height: window.innerHeight || 812
            };
            
            console.log('📱 [Dimensions] Getting dimension from react-native:', dimension, viewport);
            
            if (dimension === 'window') {
              return viewport;
            } else if (dimension === 'screen') {
              return { width: screen.width, height: screen.height };
            }
            return viewport; // Default to window dimensions
          },
          addEventListener: () => {},
          removeEventListener: () => {}
        };
      }
      
      // Ensure Platform API is available  
      if (!ReactNative.Platform) {
        ReactNative.Platform = {
          OS: 'web',
          select: (obj) => obj.web || obj.default,
          Version: '0.19.13'
        };
      }
      
      module.exports = ReactNative;
    `,
    loader: 'js'
  };
}

function getSafeAreaContextLoader() {
  console.log(`🔧 [GLOBAL-EXTERNALS] Loading react-native-safe-area-context mock`);
  return {
    contents: `
      const React = window.React || require('react');
      
      // Mock SafeAreaProvider component
      const SafeAreaProvider = ({ children }) => {
        return React.createElement('div', { 
          style: { height: '100%', width: '100%' },
          'data-mock': 'SafeAreaProvider'
        }, children);
      };
      
      // Mock useSafeAreaInsets hook
      const useSafeAreaInsets = () => ({
        top: 44,    // iPhone status bar height
        bottom: 34, // iPhone home indicator height
        left: 0,
        right: 0
      });
      
      // Mock useSafeAreaFrame hook  
      const useSafeAreaFrame = () => ({
        x: 0,
        y: 0,
        width: window.innerWidth || 375,
        height: window.innerHeight || 812
      });
      
      module.exports = {
        SafeAreaProvider,
        useSafeAreaInsets,
        useSafeAreaFrame,
        SafeAreaConsumer: ({ children }) => children({ 
          insets: useSafeAreaInsets(),
          frame: useSafeAreaFrame() 
        }),
        SafeAreaView: ({ children, style = {}, ...props }) => 
          React.createElement('div', { 
            style: { 
              paddingTop: 44, 
              paddingBottom: 34,
              ...style 
            },
            'data-mock': 'SafeAreaView',
            ...props
          }, children)
      };
    `,
    loader: 'js'
  };
}

function getWebViewLoader() {
  console.log(`🔧 [GLOBAL-EXTERNALS] Loading react-native-webview mock`);
  return {
    contents: `
      const React = window.React || require('react');
      
      const WebView = ({ source, style, ...props }) => {
        return React.createElement('iframe', {
          src: source?.uri || source?.html || 'about:blank',
          style: {
            border: 'none',
            width: '100%',
            height: '100%',
            ...style
          },
          'data-mock': 'WebView',
          ...props
        });
      };
      
      module.exports = { WebView, default: WebView };
    `,
    loader: 'js'
  };
}

function getReanimatedLoader() {
  console.log(`🔧 [GLOBAL-EXTERNALS] Loading react-native-reanimated mock`);
  return {
    contents: `
      const React = window.React || require('react');
      
      // Mock Animated components
      const Animated = {
        View: ({ style, ...props }) => React.createElement('div', { 
          style,
          'data-mock': 'Animated.View',
          ...props
        }),
        Text: ({ style, ...props }) => React.createElement('span', { 
          style,
          'data-mock': 'Animated.Text',
          ...props
        }),
        ScrollView: ({ style, ...props }) => React.createElement('div', { 
          style: { overflow: 'auto', ...style },
          'data-mock': 'Animated.ScrollView',
          ...props
        })
      };
      
      // Mock hooks and functions
      const useSharedValue = (initialValue) => ({ value: initialValue });
      const useAnimatedStyle = (styleFactory) => styleFactory();
      const withSpring = (value) => value;
      const withTiming = (value) => value;
      const runOnJS = (fn) => fn;
      
      module.exports = {
        default: Animated,
        Animated,
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

function getAsyncStorageLoader() {
  console.log(`🔧 [GLOBAL-EXTERNALS] Loading @react-native-async-storage/async-storage mock`);
  return {
    contents: `
      // Mock AsyncStorage using localStorage for web compatibility
      const AsyncStorage = {
        getItem: async (key) => {
          try {
            const value = localStorage.getItem(key);
            return Promise.resolve(value);
          } catch (error) {
            console.warn('[AsyncStorage Mock] getItem error:', error);
            return Promise.resolve(null);
          }
        },
        
        setItem: async (key, value) => {
          try {
            localStorage.setItem(key, value);
            return Promise.resolve();
          } catch (error) {
            console.warn('[AsyncStorage Mock] setItem error:', error);
            return Promise.reject(error);
          }
        },
        
        removeItem: async (key) => {
          try {
            localStorage.removeItem(key);
            return Promise.resolve();
          } catch (error) {
            console.warn('[AsyncStorage Mock] removeItem error:', error);
            return Promise.reject(error);
          }
        },
        
        clear: async () => {
          try {
            localStorage.clear();
            return Promise.resolve();
          } catch (error) {
            console.warn('[AsyncStorage Mock] clear error:', error);
            return Promise.reject(error);
          }
        },
        
        getAllKeys: async () => {
          try {
            const keys = Object.keys(localStorage);
            return Promise.resolve(keys);
          } catch (error) {
            console.warn('[AsyncStorage Mock] getAllKeys error:', error);
            return Promise.resolve([]);
          }
        },
        
        multiGet: async (keys) => {
          try {
            const result = keys.map(key => [key, localStorage.getItem(key)]);
            return Promise.resolve(result);
          } catch (error) {
            console.warn('[AsyncStorage Mock] multiGet error:', error);
            return Promise.resolve([]);
          }
        },
        
        multiSet: async (keyValuePairs) => {
          try {
            keyValuePairs.forEach(([key, value]) => {
              localStorage.setItem(key, value);
            });
            return Promise.resolve();
          } catch (error) {
            console.warn('[AsyncStorage Mock] multiSet error:', error);
            return Promise.reject(error);
          }
        },
        
        multiRemove: async (keys) => {
          try {
            keys.forEach(key => localStorage.removeItem(key));
            return Promise.resolve();
          } catch (error) {
            console.warn('[AsyncStorage Mock] multiRemove error:', error);
            return Promise.reject(error);
          }
        }
      };
      
      module.exports = AsyncStorage;
      module.exports.default = AsyncStorage;
    `,
    loader: 'js'
  };
}

function getCookiesLoader() {
  console.log(`🔧 [GLOBAL-EXTERNALS] Loading @react-native-cookies/cookies mock`);
  return {
    contents: `
      // Mock cookies using document.cookie for web compatibility
      const CookieManager = {
        set: async (cookie) => {
          try {
            const { name, value, domain, path, expires, httpOnly, secure } = cookie;
            let cookieString = \`\${name}=\${value}\`;
            
            if (path) cookieString += \`; path=\${path}\`;
            if (domain) cookieString += \`; domain=\${domain}\`;
            if (expires) cookieString += \`; expires=\${new Date(expires).toUTCString()}\`;
            if (secure) cookieString += '; secure';
            if (httpOnly) cookieString += '; httpOnly';
            
            document.cookie = cookieString;
            console.log('[Cookies Mock] Set cookie:', name, value);
            return Promise.resolve(true);
          } catch (error) {
            console.warn('[Cookies Mock] set error:', error);
            return Promise.resolve(false);
          }
        },
        
        get: async (name) => {
          try {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
              const [cookieName, cookieValue] = cookie.trim().split('=');
              if (cookieName === name) {
                console.log('[Cookies Mock] Get cookie:', name, cookieValue);
                return Promise.resolve({
                  name: cookieName,
                  value: cookieValue || ''
                });
              }
            }
            console.log('[Cookies Mock] Cookie not found:', name);
            return Promise.resolve(null);
          } catch (error) {
            console.warn('[Cookies Mock] get error:', error);
            return Promise.resolve(null);
          }
        },
        
        getAll: async () => {
          try {
            const cookies = document.cookie.split(';');
            const result = {};
            for (let cookie of cookies) {
              const [name, value] = cookie.trim().split('=');
              if (name && value !== undefined) {
                result[name] = { name, value: value || '' };
              }
            }
            console.log('[Cookies Mock] Get all cookies:', result);
            return Promise.resolve(result);
          } catch (error) {
            console.warn('[Cookies Mock] getAll error:', error);
            return Promise.resolve({});
          }
        },
        
        clearAll: async () => {
          try {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
              const name = cookie.trim().split('=')[0];
              if (name) {
                document.cookie = \`\${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/\`;
              }
            }
            console.log('[Cookies Mock] Cleared all cookies');
            return Promise.resolve(true);
          } catch (error) {
            console.warn('[Cookies Mock] clearAll error:', error);
            return Promise.resolve(false);
          }
        },
        
        clearByName: async (name) => {
          try {
            document.cookie = \`\${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/\`;
            console.log('[Cookies Mock] Cleared cookie:', name);
            return Promise.resolve(true);
          } catch (error) {
            console.warn('[Cookies Mock] clearByName error:', error);
            return Promise.resolve(false);
          }
        }
      };
      
      module.exports = CookieManager;
      module.exports.default = CookieManager;
    `,
    loader: 'js'
  };
}

function getWixDataItemsLoader() {
  console.log(`🔧 [GLOBAL-EXTERNALS] Loading @wix/wix-data-items-sdk mock`);
  return {
    contents: `
      // Mock Wix Data Items SDK for web compatibility
      const items = {
        query: () => ({
          find: async () => ({ items: [], totalCount: 0 }),
          limit: function(n) { return this; },
          skip: function(n) { return this; },
          ascending: function(field) { return this; },
          descending: function(field) { return this; },
          eq: function(field, value) { return this; },
          ne: function(field, value) { return this; },
          contains: function(field, value) { return this; }
        }),
        get: async (dataCollectionId, itemId) => null,
        insert: async (dataCollectionId, item) => ({ _id: 'mock-id', ...item }),
        update: async (dataCollectionId, itemId, item) => ({ _id: itemId, ...item }),
        save: async (dataCollectionId, item) => ({ _id: 'mock-id', ...item }),
        remove: async (dataCollectionId, itemId) => { console.log('[WixData Mock] Removed item:', itemId); },
        bulkInsert: async (dataCollectionId, items) => ({ 
          inserted: items.length, 
          skipped: 0,
          insertedItemIds: items.map(() => 'mock-id-' + Math.random())
        })
      };
      
      console.log('[Wix SDK Mock] @wix/wix-data-items-sdk loaded');
      module.exports = { items };
    `,
    loader: 'js'
  };
}

function getWixStoresLoader() {
  console.log(`🔧 [GLOBAL-EXTERNALS] Loading @wix/wix-stores-sdk mock`);
  return {
    contents: `
      // Mock Wix Stores SDK for web compatibility
      const cart = {
        getCurrentCart: async () => ({ 
          _id: 'mock-cart-id',
          lineItems: [],
          totals: { subtotal: 0, total: 0, tax: 0, shipping: 0 }
        }),
        addToCart: async (items) => ({ 
          cart: { _id: 'mock-cart-id', lineItems: items },
          addedItems: items
        }),
        removeLineItemsFromCart: async (lineItemIds) => ({
          cart: { _id: 'mock-cart-id', lineItems: [] }
        }),
        updateLineItemsInCart: async (lineItems) => ({
          cart: { _id: 'mock-cart-id', lineItems }
        })
      };
      
      const products = {
        getProduct: async (productId) => null,
        queryProducts: () => ({
          find: async () => ({ items: [], totalCount: 0 }),
          limit: function(n) { return this; },
          skip: function(n) { return this; }
        })
      };
      
      console.log('[Wix SDK Mock] @wix/wix-stores-sdk loaded');
      module.exports = { cart, products };
    `,
    loader: 'js'
  };
}

function getWixBookingsLoader() {
  console.log(`🔧 [GLOBAL-EXTERNALS] Loading @wix/wix-bookings-sdk mock`);
  return {
    contents: `
      // Mock Wix Bookings SDK for web compatibility
      const services = {
        getService: async (serviceId) => null,
        queryServices: () => ({
          find: async () => ({ items: [], totalCount: 0 })
        })
      };
      
      const bookings = {
        createBooking: async (booking) => ({ _id: 'mock-booking-id', ...booking }),
        getBooking: async (bookingId) => null,
        queryBookings: () => ({
          find: async () => ({ items: [], totalCount: 0 })
        })
      };
      
      console.log('[Wix SDK Mock] @wix/wix-bookings-sdk loaded');
      module.exports = { services, bookings };
    `,
    loader: 'js'
  };
}

function getWixMembersLoader() {
  console.log(`🔧 [GLOBAL-EXTERNALS] Loading @wix/wix-members-sdk mock`);
  return {
    contents: `
      // Mock Wix Members SDK for web compatibility
      const authentication = {
        login: async (credentials) => ({ 
          member: { _id: 'mock-member-id', loginEmail: credentials.email }
        }),
        logout: async () => { console.log('[WixMembers Mock] Logged out'); },
        register: async (memberInfo) => ({ 
          member: { _id: 'mock-member-id', ...memberInfo }
        })
      };
      
      const currentMember = {
        getMember: async () => null
      };
      
      console.log('[Wix SDK Mock] @wix/wix-members-sdk loaded');
      module.exports = { authentication, currentMember };
    `,
    loader: 'js'
  };
}

module.exports = { createGlobalExternalsPlugin };
