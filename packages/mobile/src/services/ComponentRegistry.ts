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
    try {
      console.log(`📱 [ComponentRegistry] Loading session bundle for: ${sessionId}`);
      console.log(`📱 [ComponentRegistry] Bundle size: ${bundleCode.length} characters`);

      // Clear previous session components
      this.clearSessionComponents();

      // Execute the bundle and extract module
      const sessionModule = await this.executeBundle(bundleCode);
      
      if (!sessionModule) {
        throw new Error('Bundle execution returned no module');
      }

      // Register session components
      await this.registerSessionModule(sessionModule, sessionId);
      
      console.log(`✅ [ComponentRegistry] Session bundle loaded successfully: ${sessionId}`);
      this.emit('bundle-executed', { sessionId, stats: this.getStats() });

    } catch (error) {
      console.error(`❌ [ComponentRegistry] Failed to load session bundle:`, error);
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
      // Create a safer execution context
      const moduleContext = {
        exports: {},
        module: { exports: {} },
        require: this.createBundleRequire(),
        global: global,
        console: console,
        React: React,
        // Add more safe globals as needed
      };

      // Wrap bundle code in function to provide module context
      const wrappedCode = `
        (function(exports, module, require, global, console, React) {
          ${bundleCode}
          return module.exports || exports;
        })
      `;

      // Execute the bundle
      const bundleFunction = eval(wrappedCode);
      const sessionModule = bundleFunction(
        moduleContext.exports,
        moduleContext.module,
        moduleContext.require,
        moduleContext.global,
        moduleContext.console,
        moduleContext.React
      );

      console.log(`📦 [ComponentRegistry] Bundle executed, module keys:`, Object.keys(sessionModule || {}));
      return sessionModule;

    } catch (error) {
      console.error(`❌ [ComponentRegistry] Bundle execution failed:`, error);
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
      // Check our static module map first
      if (moduleMap.hasOwnProperty(moduleName)) {
        const module = moduleMap[moduleName];
        if (module) {
          return module;
        }
      }
      
      // For unknown modules, return a safe fallback
      console.warn(`⚠️ [ComponentRegistry] Module not available in bundle context: ${moduleName}`);
      
      // Return a safe mock object that won't break the bundle
      return {
        default: () => null,
        // Add common React component patterns
        View: ReactNative.View,
        Text: ReactNative.Text,
        TouchableOpacity: ReactNative.TouchableOpacity,
      };
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
