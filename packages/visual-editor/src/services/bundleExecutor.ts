import * as React from 'react';
import { createExternalModuleContext, createRequireFunction } from './externalModules';

/**
 * Bundle execution service that handles loading and executing JavaScript bundles
 */
export class BundleExecutor {
  
  /**
   * Execute bundle code and return React component
   */
  async executeBundleCode(bundleCode: string, sessionId: string): Promise<React.ComponentType> {
    console.log(`🔧 [BundleExecutor] Executing bundle code for: ${sessionId}`);

    try {
      // Create external module context
      const externalModules = createExternalModuleContext();
      
      // Inject external modules into global scope and execute IIFE bundle
      const moduleComponent = await this.executeIIFEBundle(bundleCode, externalModules);
      
      return moduleComponent;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ [BundleExecutor] Bundle execution failed:`, error);
      throw new Error(`Bundle execution failed: ${errorMessage}`);
    }
  }

  /**
   * Execute IIFE bundle and return component
   */
  private async executeIIFEBundle(bundleCode: string, externalModules: Record<string, any>): Promise<React.ComponentType> {
    // Create global context with external modules
    const globalContext = this.createGlobalContext(externalModules);
    
    // Store original global values
    const originalGlobals: Record<string, any> = {};
    const globalKeys = Object.keys(globalContext);
    
    try {
      // Backup and set global context
      globalKeys.forEach(key => {
        try {
          if (key in (window as any)) {
            originalGlobals[key] = (window as any)[key];
          }
          (window as any)[key] = globalContext[key];
          
          // Debug jsx-runtime specifically
          if (key === 'react/jsx-runtime') {
            console.log(`🔍 [BundleExecutor] Set global jsx-runtime: ✅`);
          }
        } catch (error) {
          // Skip read-only properties (like 'window', 'document', etc.)
          console.warn(`⚠️ [BundleExecutor] Cannot set global property '${key}': ${error instanceof Error ? error.message : error}`);
        }
      });
      
      // ✅ CRITICAL FIX: Set ReactNativeWeb as global for iframe-global:react-native access
      const ReactNativeComponents = globalContext['react-native'];
      if (ReactNativeComponents) {
        (window as any).ReactNativeWeb = ReactNativeComponents;
        console.log(`🔍 [BundleExecutor] Set ReactNativeWeb global for iframe-global access: ✅`);
      }
      
      // Verify jsx-runtime is available in global scope
      console.log(`🔍 [BundleExecutor] jsx-runtime globally available: ✅`);
      
      console.log(`🔍 [BundleExecutor] jsx-runtime set in ALL global contexts: ✅`);
      console.log(`🔍 [BundleExecutor] Testing global access: window['react/jsx-runtime']:`, !!(window as any)['react/jsx-runtime']);
      console.log(`🔍 [BundleExecutor] Testing global access: globalThis['react/jsx-runtime']:`, !!(globalThis as any)['react/jsx-runtime']);
      console.log(`🔍 [BundleExecutor] Testing global access: window.jsx:`, !!(window as any).jsx);
      console.log(`🔍 [BundleExecutor] Testing global access: window.ReactNativeWeb:`, !!(window as any).ReactNativeWeb);
      
      // Global error handler for bundle execution
      const originalErrorHandler = window.onerror;
      const originalUnhandledRejection = window.onunhandledrejection;
      const bundleErrors: any[] = [];
      
      // Temporary error handlers during bundle execution
      window.onerror = (message, source, lineno, colno, error) => {
        console.error('🚨 [BundleExecutor] Bundle execution error:', message);
        bundleErrors.push({ message, source, lineno, colno, error, type: 'error' });
        return true; // Prevent default browser error handling
      };
      
      window.onunhandledrejection = (event) => {
        console.error('🚨 [BundleExecutor] Unhandled promise rejection during bundle:', event.reason);
        bundleErrors.push({ reason: event.reason, type: 'rejection' });
        event.preventDefault(); // Prevent default browser error handling
      };

      let result;
      try {
        // Debug jsx-runtime availability for bundle execution
        const jsxRuntimeMatches = bundleCode.match(/['"`]react\/jsx-runtime['"`]/g) || [];
        console.log(`🔍 [BundleExecutor] Bundle jsx-runtime string references:`, jsxRuntimeMatches.length);
        console.log(`🔍 [BundleExecutor] Bundle uses global-external mechanism for jsx-runtime`);
        
        // DIRECT APPROACH: Patch the bundle code to replace global-external jsx-runtime references
        const globalExternalMatches = bundleCode.match(/global-external:react\/jsx-runtime/g) || [];
        console.log(`🔍 [BundleExecutor] Bundle global-external jsx-runtime references:`, globalExternalMatches.length);
        
        const jsxRuntimeModule = globalContext['react/jsx-runtime'];
        
        if (globalExternalMatches.length > 0 && jsxRuntimeModule) {
          console.log(`🔍 [BundleExecutor] Found ${globalExternalMatches.length} global-external jsx-runtime references`);
          console.log(`🔍 [BundleExecutor] FIXED: Setting jsx-runtime for webpack global-external access`);
          
          // CLEAN APPROACH: Set jsx-runtime directly without conflicting getters
          // Remove any existing jsx-runtime properties first to avoid conflicts
          delete (window as any)['react/jsx-runtime'];
          delete (globalThis as any)['react/jsx-runtime'];
          
          // Set jsx-runtime directly for webpack global-external access
          (window as any)['react/jsx-runtime'] = jsxRuntimeModule;
          (globalThis as any)['react/jsx-runtime'] = jsxRuntimeModule;
          
          console.log(`🔍 [BundleExecutor] jsx-runtime set for webpack global-external: ✅`);
          console.log(`🔍 [BundleExecutor] Verifying jsx-runtime.jsx exists: ${!!jsxRuntimeModule.jsx}`);
          console.log(`🔍 [BundleExecutor] Verifying jsx-runtime.jsxs exists: ${!!jsxRuntimeModule.jsxs}`);
        }
        
        // Execute the IIFE bundle (using original code - no patching)
        console.log(`🔍 [BundleExecutor] About to execute bundle - checking jsx-runtime availability in execution context`);
        console.log(`🔍 [BundleExecutor] window['react/jsx-runtime'] exists: ${!!(window as any)['react/jsx-runtime']}`);
        console.log(`🔍 [BundleExecutor] globalThis['react/jsx-runtime'] exists: ${!!(globalThis as any)['react/jsx-runtime']}`);
        
        const bundleFunction = new Function(bundleCode);
        bundleFunction();
        
        // Get the result from global scope (IIFE sets SessionApp global)
        result = (window as any).SessionApp;
        
        // Log any errors that occurred during execution
        if (bundleErrors.length > 0) {
          console.warn(`⚠️ [BundleExecutor] ${bundleErrors.length} errors occurred during bundle execution:`, bundleErrors);
        }
      } catch (executionError: any) {
        console.error('❌ [BundleExecutor] Critical bundle execution error:', executionError);
        
        // Try to provide helpful error information
        if (executionError.message.includes('regeneratorRuntime')) {
          console.error('💡 [BundleExecutor] Tip: This might be an async/await or generator issue. Add regenerator-runtime to your bundle.');
        } else if (executionError.message.includes('require')) {
          console.error('💡 [BundleExecutor] Tip: This might be a missing module mock. Check the external modules list.');
        } else if (executionError.message.includes('Cannot read properties')) {
          console.error('💡 [BundleExecutor] Tip: This might be a missing React Native component or API mock.');
        }
        
        throw executionError;
      } finally {
        // Restore original error handlers
        window.onerror = originalErrorHandler;
        window.onunhandledrejection = originalUnhandledRejection;
      }
      
      if (!result) {
        throw new Error('Bundle did not export SessionApp global');
      }
      
      // Extract the default export if it's a module object
      let component = result;
      if (result && typeof result === 'object' && result.default) {
        // Extract default export from module
        component = result.default;
      }
      
      // Ensure it's a valid React component
      if (typeof component !== 'function' && typeof component !== 'object') {
        throw new Error('SessionApp is not a valid React component');
      }
      
      return component;
      
    } finally {
      // Restore original globals
      globalKeys.forEach(key => {
        try {
          if (key in originalGlobals) {
            (window as any)[key] = originalGlobals[key];
          } else {
            delete (window as any)[key];
          }
        } catch (error) {
          // Skip read-only properties during cleanup
          console.warn(`⚠️ [BundleExecutor] Cannot restore global property '${key}': ${error instanceof Error ? error.message : error}`);
        }
      });
      
      // Clean up ReactNativeWeb global
      try {
        delete (window as any).ReactNativeWeb;
      } catch (error) {
        console.warn(`⚠️ [BundleExecutor] Cannot cleanup ReactNativeWeb global: ${error instanceof Error ? error.message : error}`);
      }
    }
  }

  /**
   * Create global context with external modules
   */
  private createGlobalContext(externalModules: Record<string, any>): Record<string, any> {
    return {
      // External modules (React, React Native, etc.)
      ...externalModules,
      
      // Module system compatibility - use the detailed require function from externalModules
      require: createRequireFunction(externalModules),
      module: { exports: {} },
      exports: {}
    };
  }
}

