import * as React from 'react';

/**
 * Style sanitizer to prevent React DOM CSS errors
 */
const sanitizeStyle = (style: any): React.CSSProperties => {
  if (!style) return {};
  
  // Handle React Native style arrays - flatten them
  if (Array.isArray(style)) {
    return style.reduce((acc, s) => ({ ...acc, ...sanitizeStyle(s) }), {});
  }
  
  // Handle style objects
  if (typeof style === 'object' && style !== null) {
    const sanitized: any = {};
    
    Object.keys(style).forEach(key => {
      const value = style[key];
      
      // Skip undefined/null values
      if (value === undefined || value === null) return;
      
      // Handle transform arrays (React Native format)
      if (key === 'transform' && Array.isArray(value)) {
        // Convert React Native transform array to CSS string
        const transformStrings = value.map(transform => {
          const [transformKey, transformValue] = Object.entries(transform)[0];
          return `${transformKey}(${transformValue})`;
        });
        sanitized.transform = transformStrings.join(' ');
        return;
      }
      
      // Handle shadow properties (React Native -> CSS)
      if (key === 'shadowOffset' && typeof value === 'object') {
        sanitized.boxShadow = `${value.width || 0}px ${value.height || 0}px 0px rgba(0,0,0,0.1)`;
        return;
      }
      
      // Skip React Native specific properties that don't exist in CSS
      const skipProps = ['elevation', 'shadowColor', 'shadowOpacity', 'shadowRadius'];
      if (skipProps.includes(key)) return;
      
      // Convert camelCase to kebab-case for CSS custom properties
      if (key.startsWith('--')) {
        sanitized[key] = value;
        return;
      }
      
      // Normal CSS properties - pass through
      sanitized[key] = value;
    });
    
    return sanitized;
  }
  
  return style;
};

/**
 * Create React Native Web components for development
 */
const createReactNativeComponents = () => ({
  View: ({ children, style, ...props }: any) => 
    React.createElement('div', { 
      style: { 
        ...sanitizeStyle(style), 
        display: 'flex', 
        flexDirection: 'column' 
      }, 
      ...props 
    }, children),
  Text: ({ children, style, ...props }: any) => 
    React.createElement('span', { style: sanitizeStyle(style), ...props }, children),
  TouchableOpacity: ({ children, onPress, style, ...props }: any) => 
    React.createElement('div', { 
      style: { ...sanitizeStyle(style), cursor: 'pointer' }, 
      onClick: onPress,
      ...props 
    }, children),
  ScrollView: ({ children, style, ...props }: any) => 
    React.createElement('div', { 
      style: { ...sanitizeStyle(style), overflow: 'auto' }, 
      ...props 
    }, children),
  SafeAreaView: ({ children, style, ...props }: any) => 
    React.createElement('div', { 
      style: { ...sanitizeStyle(style), padding: '20px' }, 
      ...props 
    }, children),
  ActivityIndicator: ({ size, color, style, ...props }: any) => 
    React.createElement('div', { 
      style: { 
        ...sanitizeStyle(style),
        width: size === 'large' ? '40px' : '20px',
        height: size === 'large' ? '40px' : '20px',
        border: `2px solid ${color || '#007AFF'}`,
        borderTop: '2px solid transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      },
      ...props 
    }),
  StatusBar: ({ barStyle, backgroundColor, ...props }: any) => null, // StatusBar is a no-op on web
  Pressable: ({ children, onPress, style, ...props }: any) => 
    React.createElement('div', { 
      onClick: onPress,
      style: { cursor: 'pointer', ...sanitizeStyle(style) }, 
      ...props 
    }, children),

  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (styles: any) => styles,
    hairlineWidth: 1,
    absoluteFill: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
  },
  Dimensions: {
    get: () => ({ width: 375, height: 812 }),
  },
  Platform: {
    OS: 'web',
    select: (obj: any) => obj.web || obj.default || Object.values(obj)[0],
    Version: '1.0.0',
  },
  NativeModules: {
    RNCookieManagerIOS: {
      get: () => Promise.resolve({}),
      set: () => Promise.resolve(true),
      clearAll: () => Promise.resolve(true),
      clear: () => Promise.resolve(true),
    },
    RNCookieManagerAndroid: {
      get: () => Promise.resolve({}),
      set: () => Promise.resolve(true),
      clearAll: () => Promise.resolve(true),
      clear: () => Promise.resolve(true),
    },
  },
  
  // PanResponder mock
  PanResponder: {
    create: (config: any = {}) => ({
      panHandlers: {
        onMoveShouldSetResponder: () => false,
        onMoveShouldSetResponderCapture: () => false,
        onStartShouldSetResponder: () => false,
        onStartShouldSetResponderCapture: () => false,
        onResponderGrant: () => {},
        onResponderReject: () => {},
        onResponderMove: () => {},
        onResponderRelease: () => {},
        onResponderStart: () => {},
        onResponderEnd: () => {},
        onResponderTerminate: () => {},
        onResponderTerminationRequest: () => true,
      }
    })
  },
  
  // Touchable component mock with Mixin
  Touchable: {
    Mixin: {
      // Mock the Mixin methods that are commonly used
      touchableHandlePress: () => {},
      touchableHandleActivePressIn: () => {},
      touchableHandleActivePressOut: () => {},
      touchableHandleLongPress: () => {},
      touchableGetPressRectOffset: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
      touchableGetHitSlop: () => null,
      touchableGetHighlightDelayMS: () => 0,
      touchableGetLongPressDelayMS: () => 500,
      touchableGetPressOutDelayMS: () => 100,
      touchableGetPressInDelayMS: () => 0,
    },
  },
  // processColor function for color processing
  processColor: (color: any): number | null => {
    if (!color) return null;
    if (typeof color === 'number') return color;
    if (typeof color === 'string') {
      // Handle hex colors
      if (color.startsWith('#')) {
        const hex = color.slice(1);
        if (hex.length === 3) {
          const expanded = hex.split('').map(char => char + char).join('');
          return parseInt('ff' + expanded, 16);
        } else if (hex.length === 6) {
          return parseInt('ff' + hex, 16);
        } else if (hex.length === 8) {
          return parseInt(hex, 16);
        }
      }
      // Handle named colors (basic set)
      const namedColors: Record<string, number> = {
        'transparent': 0x00000000,
        'black': 0xff000000,
        'white': 0xffffffff,
        'red': 0xffff0000,
        'green': 0xff00ff00,
        'blue': 0xff0000ff,
        'yellow': 0xffffff00,
        'cyan': 0xff00ffff,
        'magenta': 0xffff00ff,
      };
      if (namedColors[color.toLowerCase()]) {
        return namedColors[color.toLowerCase()];
      }
      // Fallback for unknown colors
      return 0xff000000;
    }
    return null;
  },
  
  // React Native hooks
  useColorScheme: () => {
    // Return 'light' as default, could also detect system preference
    return 'light';
  },
  
  useWindowDimensions: () => ({
    width: 375, // iPhone X width as default
    height: 812, // iPhone X height as default
    scale: 2,
    fontScale: 1,
  }),
  
  // ✅ CRITICAL FIX: Add Animated to main ReactNative object
  Animated: {
    View: ({ style, children, ...props }: any) => 
      React.createElement('div', {
        style: { 
          ...sanitizeStyle(style), 
          transition: 'all 0.3s ease',
        },
        ...props
      }, children),
    
    Text: ({ style, children, ...props }: any) =>
      React.createElement('span', {
        style: { 
          ...sanitizeStyle(style), 
          transition: 'all 0.3s ease',
        },
        ...props
      }, children),
      
    ScrollView: ({ style, children, ...props }: any) =>
      React.createElement('div', {
        style: { 
          ...sanitizeStyle(style), 
          overflow: 'auto',
          transition: 'all 0.3s ease',
        },
        ...props
      }, children),

    // ✅ THE KEY FIX: Value class for new Animated.Value()
    Value: class {
      value: number;
      constructor(value: number) { 
        this.value = value; 
      }
      addListener(callback: (value: any) => void) { return 'listener-id'; }
      removeListener(id: string) {}
      removeAllListeners() {}
      setValue(value: number) { this.value = value; }
      setOffset(offset: number) {}
      flattenOffset() {}
      extractOffset() {}
      stopAnimation(callback?: (value: number) => void) { callback?.(this.value); }
      resetAnimation(callback?: (value: number) => void) { callback?.(this.value); }
      interpolate(config: any) { 
        return {
          inputRange: config.inputRange || [0, 1],
          outputRange: config.outputRange || [0, 1],
          // Mock interpolation that returns reasonable values
          ...config
        };
      }
    },

    // Animation functions that return animation objects
    timing: (value: any, config: any) => ({ 
      start: (callback?: (finished: { finished: boolean }) => void) => {
        // Mock animation completion
        setTimeout(() => callback?.({ finished: true }), config.duration || 0);
      }
    }),
    spring: (value: any, config: any) => ({ 
      start: (callback?: (finished: { finished: boolean }) => void) => {
        setTimeout(() => callback?.({ finished: true }), config.duration || 300);
      }
    }),
    sequence: (animations: any[]) => ({ 
      start: (callback?: (finished: { finished: boolean }) => void) => {
        callback?.({ finished: true });
      }
    }),
    loop: (animation: any, config?: any) => ({ 
      start: (callback?: (finished: { finished: boolean }) => void) => {
        // For loops, don't automatically call callback since they run indefinitely
        // callback?.({ finished: true }); 
      }
    }),
    parallel: (animations: any[], config?: any) => ({ 
      start: (callback?: (finished: { finished: boolean }) => void) => {
        callback?.({ finished: true });
      }
    }),
    stagger: (time: number, animations: any[]) => ({ 
      start: (callback?: (finished: { finished: boolean }) => void) => {
        callback?.({ finished: true });
      }
    }),
    delay: (time: number) => ({ 
      start: (callback?: (finished: { finished: boolean }) => void) => {
        setTimeout(() => callback?.({ finished: true }), time);
      }
    }),
    decay: (value: any, config: any) => ({ 
      start: (callback?: (finished: { finished: boolean }) => void) => {
        callback?.({ finished: true });
      }
    }),
    
    // Easing functions
    Easing: {
      linear: () => {},
      ease: () => {},
      quad: () => {},
      cubic: () => {},
      poly: (n: number) => () => {},
      sin: () => {},
      circle: () => {},
      exp: () => {},
      elastic: (bounciness?: number) => () => {},
      back: (s?: number) => () => {},
      bounce: () => {},
      bezier: (x1: number, y1: number, x2: number, y2: number) => () => {},
      in: (easing: any) => () => {},
      out: (easing: any) => () => {},
      inOut: (easing: any) => () => {},
    },
  },
});

/**
 * Create mock context providers
 */
const createMockContextProviders = () => ({
  ThemeProvider: ({ children }: any) => React.createElement(React.Fragment, {}, children),
  CartProvider: ({ children }: any) => React.createElement(React.Fragment, {}, children),
  MemberProvider: ({ children }: any) => React.createElement(React.Fragment, {}, children),
  AlertProvider: ({ children }: any) => React.createElement(React.Fragment, {}, children),
  ProductCacheProvider: ({ children }: any) => React.createElement(React.Fragment, {}, children),
  WixCartProvider: ({ children }: any) => React.createElement(React.Fragment, {}, children),
});

/**
 * Create mock components
 */
const createMockComponents = () => ({
  BottomNavigation: ({ activeTab, onTabPress }: any) => 
    React.createElement('div', { 
      style: { 
        padding: '10px', 
        background: '#f0f0f0', 
        borderTop: '1px solid #ccc',
        textAlign: 'center'
      }
    }, `Bottom Navigation - Active: ${activeTab}`),
  Button: ({ title, onPress, style, ...props }: any) =>
    React.createElement('button', {
      onClick: onPress,
      style: {
        padding: '12px 24px',
        backgroundColor: '#007AFF',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '500',
        ...style
      },
      ...props
    }, title),
  Card: ({ children, style, ...props }: any) =>
    React.createElement('div', {
      style: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '16px',
        margin: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
        ...style
      },
      ...props
    }, children),
});

/**
 * Add required CSS animations
 */
const addCSSSAnimations = () => {
  if (typeof document !== 'undefined' && !document.querySelector('#bundle-loader-styles')) {
    const style = document.createElement('style');
    style.id = 'bundle-loader-styles';
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
};

/**
 * Create external module context for bundle execution
 */
export const createExternalModuleContext = (): Record<string, any> => {
  // Import external dependencies that the bundle expects to be available
  const React = require('react');
  
  // Create global object for browser environment (Node.js compatibility)
  const globalObject = typeof window !== 'undefined' ? window : {};
  
  // Mock process object for Node.js compatibility
  const processObject = {
    env: {
      NODE_ENV: 'development',
      __DEV__: true,
      ...((typeof process !== 'undefined' && process.env) || {})
    },
    platform: 'browser',
    version: '16.0.0'
  };

  const ReactNative = createReactNativeComponents();
  const mockContextProviders = createMockContextProviders();
  const mockComponents = createMockComponents();

  // Add CSS animation for spinner
  addCSSSAnimations();

  const externalModules = {
    'react': React,
    'react/jsx-runtime': {
      jsx: function(type: any, props: any, key?: string) {
        console.log(`🔍 [jsx-runtime] jsx called with:`, type, props, key);
        // Handle props properly - jsx-runtime expects props to be an object or null
        const actualProps = props || {};
        if (key) {
          actualProps.key = key;
        }
        
        // Extract children from props if present
        if (actualProps.children !== undefined) {
          const { children, ...restProps } = actualProps;
          return React.createElement(type, restProps, children);
        }
        
        return React.createElement(type, actualProps);
      },
      jsxs: function(type: any, props: any, key?: string) {
        console.log(`🔍 [jsx-runtime] jsxs called with:`, type, props, key);
        // jsxs is the same as jsx in most React versions
        const actualProps = props || {};
        if (key) {
          actualProps.key = key;
        }
        
        if (actualProps.children !== undefined) {
          const { children, ...restProps } = actualProps;
          return React.createElement(type, restProps, children);
        }
        
        return React.createElement(type, actualProps);
      },
      Fragment: React.Fragment,
    },
    'react-native': ReactNative,
    'react-native-web': ReactNative,
    'react-native-safe-area-context': {
      SafeAreaProvider: ({ children }: any) => React.createElement(React.Fragment, {}, children),
      useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    },
    'react-native-webview': {
      WebView: ({ source, style, ...props }: any) => 
        React.createElement('div', {
          style: { 
            border: '1px solid #ccc', 
            padding: '20px', 
            textAlign: 'center',
            backgroundColor: '#f9f9f9',
            ...style 
          },
          ...props
        }, `WebView: ${source?.uri || 'No URL'}`),
    },
    
    'react-native-reanimated': {
      // Basic animation mocks for react-native-reanimated
      default: {
        Value: class { constructor(value: number) { this.value = value; } value: number; },
        Clock: class {},
        timing: () => ({ start: () => {} }),
        spring: () => ({ start: () => {} }),
        interpolate: () => 0,
        Extrapolate: { EXTEND: 'extend', CLAMP: 'clamp', IDENTITY: 'identity' },
        createAnimatedComponent: (component: any) => component,
        Animated: {
          View: () => null,
          Text: () => null,
          ScrollView: () => null,
          Value: class { constructor(value: number) { this.value = value; } value: number; },
          timing: () => ({ start: () => {} }),
          spring: () => ({ start: () => {} }),
          Clock: class {},
          interpolate: () => 0,
        },
        Easing: {
          linear: () => {},
          ease: () => {},
          quad: () => {},
          cubic: () => {},
        },
        worklet: () => {},
        runOnUI: (fn: Function) => fn(),
        runOnJS: (fn: Function) => fn(),
        useSharedValue: (initial: any) => ({ value: initial }),
        useAnimatedStyle: (styleFactory: Function) => styleFactory(),
        useAnimatedGestureHandler: () => ({}),
        withSpring: (value: any) => value,
        withTiming: (value: any) => value,
      },
      Easing: {
        linear: () => {},
        ease: () => {},
        quad: () => {},
        cubic: () => {},
      },
      timing: () => ({ start: () => {} }),
      spring: () => ({ start: () => {} }),
      Value: class { constructor(value: number) { this.value = value; } value: number; },
      Clock: class {},
      interpolate: () => 0,
      Extrapolate: { EXTEND: 'extend', CLAMP: 'clamp', IDENTITY: 'identity' },
      createAnimatedComponent: (component: any) => component,
      Animated: {
        View: () => null,
        Text: () => null,
        ScrollView: () => null,
        Value: class { constructor(value: number) { this.value = value; } value: number; },
        timing: () => ({ start: () => {} }),
        spring: () => ({ start: () => {} }),
        Clock: class {},
        interpolate: () => 0,
      },
      // Worklets and shared values mocks
      worklet: () => {},
      runOnUI: (fn: Function) => fn(),
      runOnJS: (fn: Function) => fn(),
      useSharedValue: (initial: any) => ({ value: initial }),
      useAnimatedStyle: (styleFactory: Function) => styleFactory(),
      useAnimatedGestureHandler: () => ({}),
      withSpring: (value: any) => value,
      withTiming: (value: any) => value,
      withDelay: (delay: number, animation: any) => animation,
      withRepeat: (animation: any) => animation,
      interpolateColor: () => '#000000',
      // Gesture handler mocks
      PanGestureHandler: () => null,
      TapGestureHandler: () => null,
      State: {
        UNDETERMINED: 0,
        FAILED: 1,
        BEGAN: 2,
        CANCELLED: 3,
        ACTIVE: 4,
        END: 5,
      },
    },
    // Real Wix SDK - use actual implementation for full functionality
    '@wix/sdk': require('@wix/sdk'),
    '@wix/data': require('@wix/data'),
    '@wix/data-collections': require('@wix/data-collections'),
    '@wix/ecom': require('@wix/ecom'),
    '@wix/redirects': require('@wix/redirects'),
    '@wix/restaurants': require('@wix/restaurants'),

    '@mobile/context': mockContextProviders,
    '@mobile/components': mockComponents,
    '@mobile/lib': {},
    '@mobile/utils': {},
    
    // Browser compatibility - Node.js globals
    global: globalObject,
    process: processObject,
    
    // React Native cookies package mock
    '@react-native-cookies/cookies': {
      default: {
        get: (url: string) => Promise.resolve({}),
        set: (url: string, cookie: any) => Promise.resolve(true),
        clearAll: () => Promise.resolve(true),
        clear: (url: string, name?: string) => Promise.resolve(true),
        flush: () => Promise.resolve(),
        getAll: (url: string) => Promise.resolve({}),
        setFromResponse: (url: string, cookie: string) => Promise.resolve(true),
      },
    },
    
    // AsyncStorage mock - comprehensive coverage for different import patterns
    '@react-native-async-storage/async-storage': {
      default: {
        getItem: (key: string) => Promise.resolve(null),
        setItem: (key: string, value: string) => Promise.resolve(),
        removeItem: (key: string) => Promise.resolve(),
        clear: () => Promise.resolve(),
        getAllKeys: () => Promise.resolve([]),
        multiGet: (keys: string[]) => Promise.resolve(keys.map(key => [key, null])),
        multiSet: (keyValuePairs: string[][]) => Promise.resolve(),
        multiRemove: (keys: string[]) => Promise.resolve(),
      },
      // Add root-level methods to handle direct import patterns
      getItem: (key: string) => Promise.resolve(null),
      setItem: (key: string, value: string) => Promise.resolve(),
      removeItem: (key: string) => Promise.resolve(),
      clear: () => Promise.resolve(),
      getAllKeys: () => Promise.resolve([]),
      multiGet: (keys: string[]) => Promise.resolve(keys.map(key => [key, null])),
      multiSet: (keyValuePairs: string[][]) => Promise.resolve(),
      multiRemove: (keys: string[]) => Promise.resolve(),
    },

    // React Native Web internal utilities 
    'react-native-web/Libraries/Utilities/codegenNativeComponent': (name: string, config?: any) => {
      // Mock function that generates a basic React component
      // Create mock native component silently (reduces log noise)
      return React.forwardRef((props: any, ref: any) => 
        React.createElement('div', { 
          ...props, 
          ref,
          'data-component': name,
          style: { 
            ...props.style, 
            border: '1px dashed #999', 
            padding: '8px', 
            margin: '2px',
            fontSize: '11px',
            backgroundColor: '#f5f5f5',
            color: '#666',
            display: 'inline-block'
          }
        }, `${name}`)
      );
    },
  };
  
  // Debug jsx-runtime module creation
  const jsxRuntime = externalModules['react/jsx-runtime'];
  console.log(`🔍 [SessionBundleLoader] jsx-runtime created:`, !!jsxRuntime);
  console.log(`🔍 [SessionBundleLoader] jsx-runtime.jsx available:`, !!jsxRuntime?.jsx);
  console.log(`🔍 [SessionBundleLoader] jsx-runtime.jsxs available:`, !!jsxRuntime?.jsxs);
  
  return externalModules;
};

/**
 * Create a require function for module resolution
 */
export const createRequireFunction = (externalModules: Record<string, any>) => {
  return (moduleName: string) => {
    // Debug jsx-runtime specifically since it's failing
    if (moduleName === 'react/jsx-runtime') {
      console.log(`🔍 [SessionBundleLoader] require('react/jsx-runtime') called`);
      console.log(`🔍 [SessionBundleLoader] Available modules:`, Object.keys(externalModules));
      console.log(`🔍 [SessionBundleLoader] jsx-runtime value:`, externalModules[moduleName]);
      console.log(`🔍 [SessionBundleLoader] jsx-runtime type:`, typeof externalModules[moduleName]);
      if (externalModules[moduleName]) {
        console.log(`🔍 [SessionBundleLoader] jsx-runtime.jsx:`, externalModules[moduleName].jsx);
        console.log(`🔍 [SessionBundleLoader] jsx-runtime.jsxs:`, externalModules[moduleName].jsxs);
      }
    }
    
    // Only log missing modules (not successful ones)
    if (!externalModules[moduleName]) {
      console.log(`🔍 [SessionBundleLoader] require('${moduleName}') missing`);
    }
    
    if (externalModules[moduleName]) {
      const module = externalModules[moduleName];
      
      // Only log critical modules or errors, not every successful require
      if (['react-native-reanimated'].includes(moduleName)) {
        // Keep error detection for problematic modules
        return new Proxy(module, {
          get(target, prop) {
            const value = target[prop];
            if (prop === 'Value' && value === undefined) {
              console.error(`❌ [SessionBundleLoader] Missing '${String(prop)}' on ${moduleName}`);
            }
            return value;
          }
        });
      }
      
      return module;
    }
    
    console.error(`❌ [SessionBundleLoader] Module not found: ${moduleName}`);
    console.error(`❌ [SessionBundleLoader] Available modules:`, Object.keys(externalModules));
    
    // Return a proxy that logs when .Value is accessed on undefined modules
    return new Proxy({}, {
      get(target, prop) {
        console.error(`❌ [SessionBundleLoader] Trying to access '${String(prop)}' on undefined module '${moduleName}'`);
        if (prop === 'Value') {
          console.error(`❌ [SessionBundleLoader] *** This is likely the cause of the Value error! ***`);
        }
        return undefined;
      }
    });
  };
};
