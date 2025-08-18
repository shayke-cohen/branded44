import React from 'react';
import { EventEmitter } from 'events';

export interface SessionModule {
  screens?: { [key: string]: React.ComponentType<any> };
  services?: { [key: string]: any };
  navigation?: any;
  App?: React.ComponentType<any>;
  default?: React.ComponentType<any>;
}

export interface RegistryStats {
  totalComponents: number;
  sessionComponents: number;
  lastUpdateTime: number;
  sessionId: string | null;
}

/**
 * Component Registry for Dynamic Bundle Loading
 * 
 * Manages hot-swapping of React components from session bundles
 * without requiring native app changes.
 */
export class ComponentRegistry extends EventEmitter {
  private sessionComponents = new Map<string, React.ComponentType<any>>();
  private sessionServices = new Map<string, any>();
  private sessionApp: React.ComponentType<any> | null = null;
  private sessionNavigation: any = null;
  private currentSessionId: string | null = null;
  private defaultComponents = new Map<string, React.ComponentType<any>>();

  constructor() {
    super();
    this.setupDefaultComponents();
  }

  /**
   * Register default components that can be overridden by sessions
   */
  private setupDefaultComponents() {
    // These will be populated with the app's original components
    console.log('📱 [ComponentRegistry] Initializing component registry...');
  }

  /**
   * Register a default component (from the main app)
   */
  registerDefaultComponent(name: string, component: React.ComponentType<any>): void {
    console.log(`📱 [ComponentRegistry] Registering default component: ${name}`);
    this.defaultComponents.set(name, component);
  }

  /**
   * Load and execute a session bundle
   */
  async loadSessionBundle(bundleCode: string, sessionId: string): Promise<void> {
    const startTime = Date.now();
    try {
      console.log(`🎯 [ComponentRegistry] Starting bundle execution for session: ${sessionId}`);
      console.log(`📄 [ComponentRegistry] Bundle size: ${bundleCode.length} characters (${Math.round(bundleCode.length / 1024)}KB)`);

      // Clear previous session components
      console.log(`🧹 [ComponentRegistry] Clearing previous session components...`);
      this.clearSessionComponents();

      // Execute the bundle and extract module
      console.log(`⚙️ [ComponentRegistry] Executing bundle JavaScript code...`);
      const execStartTime = Date.now();
      const sessionModule = await this.executeBundle(bundleCode);
      const execTime = Date.now() - execStartTime;
      console.log(`📦 [ComponentRegistry] Bundle execution completed in ${execTime}ms`);
      
      if (!sessionModule) {
        throw new Error('Bundle execution returned no module');
      }

      // Register session components
      console.log(`📝 [ComponentRegistry] Registering session module components...`);
      const regStartTime = Date.now();
      await this.registerSessionModule(sessionModule, sessionId);
      const regTime = Date.now() - regStartTime;
      console.log(`🔧 [ComponentRegistry] Component registration completed in ${regTime}ms`);
      
      const totalTime = Date.now() - startTime;
      const stats = this.getStats();
      console.log(`✅ [ComponentRegistry] Session bundle loaded successfully in ${totalTime}ms`);
      console.log(`📊 [ComponentRegistry] Components available: ${stats.sessionComponents} session + ${stats.totalComponents - stats.sessionComponents} default`);
      this.emit('bundle-executed', { sessionId, stats });

    } catch (error) {
      const errorTime = Date.now() - startTime;
      console.error(`❌ [ComponentRegistry] Bundle execution failed after ${errorTime}ms:`, error);
      console.error(`📍 [ComponentRegistry] Session: ${sessionId}, Error: ${error instanceof Error ? error.message : String(error)}`);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.emit('bundle-execution-error', { sessionId, error: errorMessage });
      throw error;
    }
  }

  /**
   * Execute JavaScript bundle and return the module
   */
  private async executeBundle(bundleCode: string): Promise<SessionModule | null> {
    try {
      console.log(`🔧 [ComponentRegistry] Creating Metro-compatible execution context...`);
      
      // Create Metro-compatible module system
      const modules = new Map();
      const moduleCache = new Map();
      
      // Metro-compatible module definition function
      const __d = (factory: Function, moduleId: number, dependencyMap: number[]) => {
        console.log(`📦 [Bundle] Defining module ${moduleId} with dependencies:`, dependencyMap);
        modules.set(moduleId, {
          factory,
          dependencyMap,
          loaded: false,
          exports: {}
        });
      };
      
      // Metro-compatible require function  
      const __r = (moduleId: number) => {
        console.log(`📦 [Bundle] Requiring module ${moduleId}`);
        
        if (moduleCache.has(moduleId)) {
          return moduleCache.get(moduleId);
        }
        
        const moduleInfo = modules.get(moduleId);
        if (!moduleInfo) {
          console.error(`❌ [Bundle] Module ${moduleId} not found`);
          return {};
        }
        
        const { factory, dependencyMap } = moduleInfo;
        const module = { exports: {} };
        const exports = module.exports;
        
        // Create require function for this module
        const require = (localId: number) => {
          try {
            const globalId = dependencyMap[localId];
            if (globalId !== undefined) {
              console.log(`📦 [Bundle] Module ${moduleId} requiring dependency ${localId} -> ${globalId}`);
              return __r(globalId);
            }
            // Fallback to our custom require for string-based requires
            console.log(`🔄 [Bundle] Module ${moduleId} using fallback require for: ${localId}`);
            return this.createBundleRequire()(localId.toString());
          } catch (requireError) {
            console.warn(`⚠️ [Bundle] Module ${moduleId} require failed for ${localId}:`, requireError);
            // Return safe fallback
            return {};
          }
        };
        
        try {
          factory(global, require, moduleId, exports, module);
          moduleCache.set(moduleId, module.exports);
          return module.exports;
        } catch (error) {
          console.error(`❌ [Bundle] Error loading module ${moduleId}:`, error);
          return {};
        }
      };
      
      // Create execution context with Metro globals
      const executionContext = {
        global: global,
        console: console,
        React: React,
        require: this.createBundleRequire(),
        __d: __d,
        __r: __r,
        __c: () => modules.clear(),
        __registerSegment: () => {},
        // Metro globals
        __BUNDLE_START_TIME__: Date.now(),
        __DEV__: true,
        process: process,
        __METRO_GLOBAL_PREFIX__: '',
        __requireCycleIgnorePatterns: [],
        nativePerformanceNow: Date.now,
        // React DevTools support
        $RefreshReg$: () => {},
        $RefreshSig$: () => (type: any) => type,
      };

      console.log(`📝 [ComponentRegistry] Preparing bundle execution with Metro context...`);
      
      // Create isolated execution environment to prevent property conflicts
      console.log(`🔒 [ComponentRegistry] Setting up isolated execution environment...`);
      
      // Store original globals that we'll override
      const originalGlobals: any = {};
      const globalKeysToOverride = ['__d', '__r', '__c', '__registerSegment'];
      
      globalKeysToOverride.forEach(key => {
        if (key in global) {
          originalGlobals[key] = (global as any)[key];
        }
      });
      
      // Set only the essential Metro globals, avoiding conflicts with existing properties
      try {
        Object.defineProperty(global, '__d', { 
          value: __d, 
          writable: true, 
          configurable: true,
          enumerable: false 
        });
        Object.defineProperty(global, '__r', { 
          value: __r, 
          writable: true, 
          configurable: true,
          enumerable: false 
        });
        Object.defineProperty(global, '__c', { 
          value: () => modules.clear(), 
          writable: true, 
          configurable: true,
          enumerable: false 
        });
        Object.defineProperty(global, '__registerSegment', { 
          value: () => {}, 
          writable: true, 
          configurable: true,
          enumerable: false 
        });
      } catch (propertyError) {
        console.warn(`⚠️ [ComponentRegistry] Could not set global property:`, propertyError);
        // Fallback to direct assignment
        (global as any).__d = __d;
        (global as any).__r = __r;
        (global as any).__c = () => modules.clear();
        (global as any).__registerSegment = () => {};
      }

      console.log(`⚡ [ComponentRegistry] Executing Metro bundle with error handling...`);
      
      try {
        // Execute bundle with defensive error handling for property conflicts
        const executionPromise = new Promise((resolve, reject) => {
          try {
            console.log("🎯 [Bundle] Starting Metro bundle execution...");
            
            // Patch Object.defineProperty to handle conflicts gracefully during bundle execution
            const originalDefineProperty = Object.defineProperty;
            let propertyConflicts = 0;
            
            Object.defineProperty = function(obj: any, prop: string | symbol, descriptor: PropertyDescriptor) {
              try {
                return originalDefineProperty.call(this, obj, prop, descriptor);
              } catch (error) {
                propertyConflicts++;
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.log(`🔧 [Bundle] Resolving property conflict for '${String(prop)}': ${errorMsg}`);
                
                // Strategy 1: Try with more permissive descriptor
                if (descriptor.value !== undefined) {
                  try {
                    const permissiveDescriptor = {
                      value: descriptor.value,
                      configurable: true,
                      writable: true,
                      enumerable: descriptor.enumerable !== false
                    };
                    return originalDefineProperty.call(this, obj, prop, permissiveDescriptor);
                  } catch (retryError) {
                    // Strategy 2: Check if property already exists and skip if same value
                    if (obj.hasOwnProperty(prop) && obj[prop] === descriptor.value) {
                      console.log(`⏭️ [Bundle] Property '${String(prop)}' already exists with same value, skipping`);
                      return obj;
                    }
                    
                    // Strategy 3: Direct assignment as last resort
                    console.log(`🔄 [Bundle] Using direct assignment for '${String(prop)}'`);
                    try {
                      obj[prop] = descriptor.value;
                    } catch (assignError) {
                      console.warn(`⚠️ [Bundle] Could not assign property '${String(prop)}':`, assignError);
                    }
                    return obj;
                  }
                } else {
                  // For getter/setter descriptors
                  console.log(`🔄 [Bundle] Skipping complex descriptor for '${String(prop)}'`);
                  return obj;
                }
              }
            };
            
            // Execute the bundle
            eval(bundleCode);
            
            // Restore original defineProperty
            Object.defineProperty = originalDefineProperty;
            
            console.log(`📦 [Bundle] Metro bundle executed successfully (${propertyConflicts} conflicts resolved)`);
            
            // Try to find the main module exports
            // Usually the main module is the highest numbered module or module 0
            const moduleIds = Array.from(modules.keys());
            console.log(`🎯 [Bundle] Available modules: ${moduleIds.join(', ')}`);
            
            let mainExports = {};
            
            // Try different strategies to find the main module
            if (moduleIds.length > 0) {
              // Strategy 1: Try the highest numbered module (often the entry)
              const mainModuleId = Math.max(...moduleIds);
              console.log(`🎯 [Bundle] Attempting to load main module: ${mainModuleId}`);
              
              try {
                mainExports = __r(mainModuleId);
                console.log("📊 [Bundle] Main module exports:", Object.keys(mainExports || {}));
              } catch (moduleError) {
                console.warn(`⚠️ [Bundle] Could not load module ${mainModuleId}:`, moduleError);
                
                // Strategy 2: Try module 0
                if (modules.has(0)) {
                  console.log(`🔄 [Bundle] Trying module 0 as fallback`);
                  mainExports = __r(0);
                }
              }
            }
            
            resolve(mainExports || {});
          } catch (bundleError) {
            console.error("❌ [Bundle] Error during Metro bundle execution:", bundleError);
            reject(bundleError);
          }
        });
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Bundle execution timeout after 10 seconds'));
          }, 10000);
        });
        
        const sessionModule = await Promise.race([executionPromise, timeoutPromise]) as SessionModule | null;

        console.log(`📦 [ComponentRegistry] Bundle executed, module keys:`, Object.keys(sessionModule || {}));
        console.log(`🔍 [ComponentRegistry] Module type:`, typeof sessionModule);
        console.log(`📋 [ComponentRegistry] Module structure:`, sessionModule);
        
        return sessionModule;
        
      } finally {
        // Restore original globals
        console.log(`🧹 [ComponentRegistry] Restoring original globals...`);
        globalKeysToOverride.forEach(key => {
          if (originalGlobals.hasOwnProperty(key)) {
            try {
              Object.defineProperty(global, key, {
                value: originalGlobals[key],
                writable: true,
                configurable: true,
                enumerable: false
              });
            } catch (restoreError) {
              console.warn(`⚠️ [ComponentRegistry] Could not restore global ${key}, using direct assignment`);
              (global as any)[key] = originalGlobals[key];
            }
          } else {
            try {
              delete (global as any)[key];
            } catch (deleteError) {
              console.warn(`⚠️ [ComponentRegistry] Could not delete global ${key}`);
            }
          }
        });
      }

    } catch (error) {
      console.error(`❌ [ComponentRegistry] Bundle execution failed:`, error);
      console.error(`📍 [ComponentRegistry] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
      const errorMessage = error instanceof Error ? error.message : 'Bundle execution failed';
      throw new Error(`Bundle execution failed: ${errorMessage}`);
    }
  }

  /**
   * Create a custom require function for the bundle context
   * Metro bundler doesn't allow dynamic requires, so we provide a static mapping
   */
  private createBundleRequire() {
    // Import React Native modules statically to avoid Metro bundler issues
    const ReactNative = require('react-native');
    
    // Define Babel runtime helpers that Metro bundles commonly use
    const babelHelpers = {
      '@babel/runtime/helpers/createClass': function(Constructor: any, protoProps?: any, staticProps?: any) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
      },
      '@babel/runtime/helpers/classCallCheck': function(instance: any, Constructor: any) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      },
      '@babel/runtime/helpers/possibleConstructorReturn': function(self: any, call: any) {
        if (call && (typeof call === "object" || typeof call === "function")) {
          return call;
        }
        return assertThisInitialized(self);
      },
      '@babel/runtime/helpers/getPrototypeOf': function(o: any) {
        return Object.getPrototypeOf(o);
      },
      '@babel/runtime/helpers/inherits': function(subClass: any, superClass: any) {
        if (typeof superClass !== "function" && superClass !== null) {
          throw new TypeError("Super expression must either be null or a function");
        }
        subClass.prototype = Object.create(superClass && superClass.prototype, {
          constructor: {
            value: subClass,
            writable: true,
            configurable: true
          }
        });
        if (superClass) setPrototypeOf(subClass, superClass);
      },
      '@babel/runtime/helpers/wrapNativeSuper': function(_Class: any) {
        return function WrappedNativeSuper(this: any) {
          return _Class.apply(this, arguments) || this;
        };
      },
      '@babel/runtime/helpers/assertThisInitialized': function(self: any) {
        if (self === void 0) {
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }
        return self;
      },
    };

    // Helper functions for Babel helpers
    function defineProperties(target: any, props: any) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function setPrototypeOf(o: any, p: any) {
      return Object.setPrototypeOf(o, p);
    }

    function assertThisInitialized(self: any) {
      if (self === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }
      return self;
    }
    
    // Static module mapping for bundle execution
    const moduleMap: { [key: string]: any } = {
      'react': React,
      'react-native': ReactNative,
      // Babel runtime helpers (critical for ES6 class support)
      ...babelHelpers,
      // Add commonly used React Native modules
      '@react-native-async-storage/async-storage': null, // Will be handled gracefully
      'react-native-safe-area-context': null,
      'react-native-reanimated': null,
      'react-native-svg': null,
      '@react-navigation/native': null,
      // Minimal fallbacks for problematic modules (should not be needed in pure RN code)
      'fast-base64-decode': {
        default: (data: string) => data, // Simple fallback
      },
    };

    return (moduleName: string) => {
      console.log(`📦 [ComponentRegistry] Requiring module: ${moduleName}`);
      
      // Check our static module map first
      if (moduleMap.hasOwnProperty(moduleName)) {
        const module = moduleMap[moduleName];
        if (module) {
          console.log(`✅ [ComponentRegistry] Module found: ${moduleName}`);
          return module;
        } else {
          console.log(`🚫 [ComponentRegistry] Module is null: ${moduleName}`);
          // Return a safe empty object for null modules
          return {};
        }
      }
      
      // For unknown modules, return a safe fallback
      console.warn(`⚠️ [ComponentRegistry] Module not available in bundle context: ${moduleName}`);
      
      // Return a safe mock object that won't break the bundle
      const fallback = {
        default: () => null,
        // Add common React component patterns
        View: ReactNative.View,
        Text: ReactNative.Text,
        TouchableOpacity: ReactNative.TouchableOpacity,
      };
      
      console.log(`🔄 [ComponentRegistry] Returning fallback for: ${moduleName}`);
      return fallback;
    };
  }

  /**
   * Register components from a session module
   */
  private async registerSessionModule(sessionModule: SessionModule, sessionId: string): Promise<void> {
    this.currentSessionId = sessionId;

    // Register screens
    if (sessionModule.screens) {
      console.log(`📱 [ComponentRegistry] Registering ${Object.keys(sessionModule.screens).length} session screens`);
      Object.entries(sessionModule.screens).forEach(([name, component]) => {
        this.sessionComponents.set(name, component);
        console.log(`  ✅ Registered screen: ${name}`);
      });
    }

    // Register services
    if (sessionModule.services) {
      console.log(`📱 [ComponentRegistry] Registering ${Object.keys(sessionModule.services).length} session services`);
      Object.entries(sessionModule.services).forEach(([name, service]) => {
        this.sessionServices.set(name, service);
        console.log(`  ✅ Registered service: ${name}`);
      });
    }

    // Register App component
    if (sessionModule.App || sessionModule.default) {
      this.sessionApp = sessionModule.App || sessionModule.default || null;
      console.log(`📱 [ComponentRegistry] Registered session App component`);
    }

    // Register navigation config
    if (sessionModule.navigation) {
      this.sessionNavigation = sessionModule.navigation;
      console.log(`📱 [ComponentRegistry] Registered session navigation config`);
    }

    // Emit update event
    this.emit('components-updated', {
      sessionId,
      componentsCount: this.sessionComponents.size,
      servicesCount: this.sessionServices.size,
      hasApp: !!this.sessionApp,
      hasNavigation: !!this.sessionNavigation
    });
  }

  /**
   * Get a component (session component takes precedence over default)
   */
  getComponent(name: string): React.ComponentType<any> | null {
    // First check session components
    if (this.sessionComponents.has(name)) {
      return this.sessionComponents.get(name)!;
    }
    
    // Fallback to default components
    if (this.defaultComponents.has(name)) {
      return this.defaultComponents.get(name)!;
    }

    console.warn(`⚠️ [ComponentRegistry] Component not found: ${name}`);
    return null;
  }

  /**
   * Get a service
   */
  getService(name: string): any {
    return this.sessionServices.get(name) || null;
  }

  /**
   * Get the session App component
   */
  getSessionApp(): React.ComponentType<any> | null {
    return this.sessionApp;
  }

  /**
   * Get session navigation config
   */
  getSessionNavigation(): any {
    return this.sessionNavigation;
  }

  /**
   * Check if a component is from a session (vs default app)
   */
  isSessionComponent(name: string): boolean {
    return this.sessionComponents.has(name);
  }

  /**
   * Clear all session components
   */
  clearSessionComponents(): void {
    console.log(`📱 [ComponentRegistry] Clearing session components (${this.sessionComponents.size} components)`);
    
    this.sessionComponents.clear();
    this.sessionServices.clear();
    this.sessionApp = null;
    this.sessionNavigation = null;
    this.currentSessionId = null;

    this.emit('session-cleared');
  }

  /**
   * Get registry statistics
   */
  getStats(): RegistryStats {
    return {
      totalComponents: this.defaultComponents.size + this.sessionComponents.size,
      sessionComponents: this.sessionComponents.size,
      lastUpdateTime: Date.now(),
      sessionId: this.currentSessionId
    };
  }

  /**
   * List all available components
   */
  listComponents(): { name: string; isSession: boolean }[] {
    const components: { name: string; isSession: boolean }[] = [];
    
    // Add default components
    this.defaultComponents.forEach((_, name) => {
      components.push({ name, isSession: false });
    });
    
    // Add session components (these override defaults)
    this.sessionComponents.forEach((_, name) => {
      const existingIndex = components.findIndex(c => c.name === name);
      if (existingIndex >= 0) {
        components[existingIndex].isSession = true; // Override default
      } else {
        components.push({ name, isSession: true }); // New component
      }
    });
    
    return components.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Create a higher-order component that uses the registry
   */
  createDynamicComponent(componentName: string): React.ComponentType<any> {
    return (props: any) => {
      const Component = this.getComponent(componentName);
      
      if (!Component) {
        // Return a fallback component
        const { View, Text, StyleSheet } = require('react-native');
        return React.createElement(View, { style: styles.fallback },
          React.createElement(Text, { style: styles.fallbackText },
            `Component "${componentName}" not found`
          )
        );
      }
      
      return React.createElement(Component, props);
    };
  }
}

const styles = {
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  fallbackText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
};

// Singleton instance
export const componentRegistry = new ComponentRegistry();

console.log('✅ [ComponentRegistry] Component registry initialized');
