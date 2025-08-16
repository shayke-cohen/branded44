import { useState, useEffect, useRef } from 'react';

interface SessionInfo {
  sessionId: string;
  workspacePath: string;
  sessionPath: string;
}

interface TemplateConfig {
  getScreenComponent: (screenId: string) => React.ComponentType<any> | null;
  getNavTabs: () => any[];
  getScreenIdForTab: (tabId: string) => string | null;
}

interface SessionWorkspaceState {
  isLoaded: boolean;
  templateConfig: TemplateConfig | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * Custom hook to dynamically load template configuration from session workspace
 * This enables real-time editing by loading from the session files instead of original package
 */
export const useSessionWorkspace = (): SessionWorkspaceState => {
  const [state, setState] = useState<SessionWorkspaceState>({
    isLoaded: false,
    templateConfig: null,
    error: null,
    isLoading: false
  });

  const sessionInfoRef = useRef<SessionInfo | null>(null);
  const moduleCache = useRef<Map<string, any>>(new Map());

  // Get session info from window global
  const getSessionInfo = (): SessionInfo | null => {
    const windowSession = (window as any).__VISUAL_EDITOR_SESSION__;
    return windowSession || null;
  };

  // Clear module cache to force re-imports
  const clearModuleCache = () => {
    moduleCache.current.clear();
    console.log('🧹 [SessionWorkspace] Cleared module cache');
  };

  // Dynamic import from session workspace with caching
  const dynamicImportFromSession = async (modulePath: string): Promise<any> => {
    const sessionInfo = getSessionInfo();
    if (!sessionInfo) {
      throw new Error('No active session found');
    }

    // Create cache key with session ID to ensure cache isolation
    const cacheKey = `${sessionInfo.sessionId}:${modulePath}`;
    
    // Check cache first
    if (moduleCache.current.has(cacheKey)) {
      console.log(`📦 [SessionWorkspace] Using cached module: ${modulePath}`);
      return moduleCache.current.get(cacheKey);
    }

    try {
      // Construct the session workspace URL with cache busting
      const timestamp = Date.now();
      const sessionModuleUrl = `http://localhost:3001/api/editor/session-module/${sessionInfo.sessionId}/${modulePath}?v=${timestamp}`;
      
      console.log(`🔄 [SessionWorkspace] Loading module from session: ${modulePath}`);
      console.log(`📡 [SessionWorkspace] URL: ${sessionModuleUrl}`);

      // Fetch the module content
      const response = await fetch(sessionModuleUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to load session module: ${response.status} ${response.statusText}`);
      }

      const moduleContent = await response.text();
      
      // Create a module URL for dynamic import
      const blob = new Blob([moduleContent], { type: 'application/javascript' });
      const moduleUrl = URL.createObjectURL(blob);
      
      try {
        // Dynamic import the module
        const module = await import(/* webpackIgnore: true */ moduleUrl);
        
        // Cache the result
        moduleCache.current.set(cacheKey, module);
        
        console.log(`✅ [SessionWorkspace] Successfully loaded session module: ${modulePath}`);
        return module;
      } finally {
        // Clean up the blob URL
        URL.revokeObjectURL(moduleUrl);
      }
    } catch (error) {
      console.error(`❌ [SessionWorkspace] Failed to load session module ${modulePath}:`, error);
      throw error;
    }
  };

  // Dynamic screen component loader with cache busting
  const loadScreenComponentFromSession = async (screenId: string): Promise<React.ComponentType | null> => {
    try {
      console.log(`🎬 [SessionWorkspace] Loading screen component: ${screenId}`);
      
      // Try actual paths based on session workspace structure
      const possiblePaths = [
        // Home screen - special case
        ...(screenId === 'home-screen' ? [`screens/HomeScreen/HomeNavigation.tsx`] : []),
        
        // Direct screen mappings
        `screens/${screenId.charAt(0).toUpperCase() + screenId.slice(1)}Screen/${screenId.charAt(0).toUpperCase() + screenId.slice(1)}Screen.tsx`,
        `screens/${screenId.charAt(0).toUpperCase() + screenId.slice(1)}/${screenId.charAt(0).toUpperCase() + screenId.slice(1)}.tsx`,
        
        // Wix navigation screens
        `screens/wix/navigation/${screenId.charAt(0).toUpperCase() + screenId.slice(1)}Navigation.tsx`,
        
        // Wix ecommerce screens
        `screens/wix/ecommerce/${screenId.charAt(0).toUpperCase() + screenId.slice(1)}Screen/${screenId.charAt(0).toUpperCase() + screenId.slice(1)}Screen.tsx`,
        
        // Wix auth screens
        `screens/wix/auth/${screenId.charAt(0).toUpperCase() + screenId.slice(1)}Screen/${screenId.charAt(0).toUpperCase() + screenId.slice(1)}Screen.tsx`,
        
        // Wix restaurant screens
        `screens/wix/restaurant/${screenId.charAt(0).toUpperCase() + screenId.slice(1)}Screen/${screenId.charAt(0).toUpperCase() + screenId.slice(1)}Screen.tsx`,
        
        // Other specific mappings based on actual structure
        ...(screenId === 'settings-screen' ? [`screens/SettingsScreen/SettingsScreen.tsx`] : []),
        ...(screenId === 'cart-screen' || screenId === 'wix-cart' ? [`screens/wix/ecommerce/CartScreen/CartScreen.tsx`] : []),
      ];
      
      for (const path of possiblePaths) {
        try {
          const module = await dynamicImportFromSession(path);
          if (module.default) {
            console.log(`✅ [SessionWorkspace] Found screen component at: ${path}`);
            return module.default;
          }
        } catch (error) {
          // Continue to next path
        }
      }
      
      console.warn(`❌ [SessionWorkspace] Screen component not found in session: ${screenId}`);
      return null;
    } catch (error) {
      console.error(`❌ [SessionWorkspace] Error loading screen component ${screenId}:`, error);
      return null;
    }
  };

  // Load template configuration from session workspace
  const loadTemplateConfig = async (): Promise<TemplateConfig> => {
    console.log('🔄 [SessionWorkspace] Loading template config from session...');
    
    try {
      // Load the session's templateConfig.ts
      const templateModule = await dynamicImportFromSession('screen-templates/templateConfig.ts');
      
      const templateConfig: TemplateConfig = {
        getScreenComponent: (screenId: string) => {
          console.log(`🔍 [SessionWorkspace] Getting screen component: ${screenId}`);
          
          // Check if we have a cached session component
          const cacheKey = `${getSessionInfo()?.sessionId}:screen:${screenId}`;
          if (moduleCache.current.has(cacheKey)) {
            const cached = moduleCache.current.get(cacheKey);
            if (cached) {
              console.log(`✅ [SessionWorkspace] Using cached session component for: ${screenId}`);
              return cached;
            }
          }
          
          // Fallback to template module (static imports)
          const result = templateModule.getScreenComponent?.(screenId);
          if (result) {
            console.log(`📦 [SessionWorkspace] Using template component for: ${screenId}`);
          } else {
            console.warn(`❌ [SessionWorkspace] No component found for: ${screenId}`);
          }
          return result || null;
        },
        getNavTabs: templateModule.getNavTabs || (() => []),
        getScreenIdForTab: (tabId: string) => {
          const result = templateModule.getScreenIdForTab?.(tabId);
          return result || null;
        },
      };

      console.log('✅ [SessionWorkspace] Successfully loaded template config from session');
      console.log('📊 [SessionWorkspace] Available navigation tabs:', templateConfig.getNavTabs().length);
      
      return templateConfig;
    } catch (error) {
      console.error('❌ [SessionWorkspace] Failed to load template config from session:', error);
      
      // Fallback to original package if session loading fails
      console.log('🔄 [SessionWorkspace] Falling back to original package...');
      const originalModule = await import('@mobile/screen-templates/templateConfig');
      
      return {
        getScreenComponent: (screenId: string) => {
          const result = originalModule.getScreenComponent?.(screenId);
          return result || null;
        },
        getNavTabs: originalModule.getNavTabs || (() => []),
        getScreenIdForTab: (tabId: string) => {
          const result = originalModule.getScreenIdForTab?.(tabId);
          return result || null;
        },
      };
    }
  };

  // Initialize session workspace loading
  const initializeWorkspace = async () => {
    const sessionInfo = getSessionInfo();
    if (!sessionInfo) {
      setState(prev => ({
        ...prev,
        error: 'No active session found',
        isLoading: false
      }));
      return;
    }

    // Check if session has changed
    if (sessionInfoRef.current?.sessionId !== sessionInfo.sessionId) {
      console.log(`🔄 [SessionWorkspace] Session changed: ${sessionInfoRef.current?.sessionId} -> ${sessionInfo.sessionId}`);
      clearModuleCache(); // Clear cache when session changes
      sessionInfoRef.current = sessionInfo;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const templateConfig = await loadTemplateConfig();
      
      setState({
        isLoaded: true,
        templateConfig,
        error: null,
        isLoading: false
      });
      
      console.log('🎉 [SessionWorkspace] Session workspace initialized successfully');
    } catch (error: any) {
      setState({
        isLoaded: false,
        templateConfig: null,
        error: error.message,
        isLoading: false
      });
      
      console.error('❌ [SessionWorkspace] Failed to initialize session workspace:', error);
    }
  };

  // Preload screen components that might be affected by file changes
  const preloadScreenComponents = async () => {
    console.log('🎬 [SessionWorkspace] Preloading screen components...');
    
    const sessionInfo = getSessionInfo();
    if (!sessionInfo) return;

    // List of screen IDs to preload (based on actual screen registrations)
    const screenIds = [
      'home-screen', 'HomeScreen', 'Home', // Home variations
      'store-screen', 'StoreScreen', 'Store', 'wix-store-screen', // Store variations
      'products-screen', 'ProductsScreen', 'Products', // Products variations
      'settings-screen', 'SettingsScreen', 'Settings', // Settings variations
      'cart-screen', 'CartScreen', 'Cart', 'wix-cart' // Cart variations
    ];
    
    for (const screenId of screenIds) {
      try {
        const component = await loadScreenComponentFromSession(screenId);
        if (component) {
          const cacheKey = `${sessionInfo.sessionId}:screen:${screenId}`;
          moduleCache.current.set(cacheKey, component);
          console.log(`✅ [SessionWorkspace] Preloaded screen component: ${screenId}`);
        }
      } catch (error) {
        // Ignore errors - screen might not exist
      }
    }
  };

  // File change handler for real-time updates
  const handleFileChange = (filePath: string) => {
    console.log(`📝 [SessionWorkspace] File changed: ${filePath}`);
    
    // Check if the changed file affects our app (any TypeScript/JavaScript file)
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
      console.log('🔄 [SessionWorkspace] App file changed, reloading session workspace...');
      clearModuleCache();
      
      // If it's a screen file, try to preload specific screen components
      if (filePath.includes('screens/')) {
        console.log('🎬 [SessionWorkspace] Screen file changed, preloading components...');
        preloadScreenComponents().then(() => {
          initializeWorkspace(); // Re-initialize after preloading
        });
      } else {
        initializeWorkspace(); // Re-initialize to pick up changes
      }
    }
  };

  // Initialize on mount and when session changes
  useEffect(() => {
    initializeWorkspace();
    
    // Listen for session ready events (when session changes)
    const handleSessionReady = () => {
      console.log('🔔 [SessionWorkspace] Session ready event received, reinitializing...');
      initializeWorkspace();
    };
    
    window.addEventListener('visual-editor-session-ready', handleSessionReady);
    
    return () => {
      window.removeEventListener('visual-editor-session-ready', handleSessionReady);
    };
  }, []);

  // Listen for file changes
  useEffect(() => {
    const handleCustomFileChange = (event: CustomEvent) => {
      const { filePath } = event.detail;
      handleFileChange(filePath);
    };

    window.addEventListener('file-change', handleCustomFileChange as EventListener);
    
    return () => {
      window.removeEventListener('file-change', handleCustomFileChange as EventListener);
    };
  }, []);

  return state;
};

export default useSessionWorkspace;
