import { useState, useEffect, useRef } from 'react';
import { SessionInfo } from './types';
import { DynamicScreenLoader, dynamicScreenLoader } from './DynamicScreenLoader';

/**
 * Dynamic screen loading state
 */
export interface DynamicScreenState {
  isLoaded: boolean;
  screenComponent: React.ComponentType | null;
  error: string | null;
  isLoading: boolean;
  cacheStats: {
    memorySize: number;
    hitRate: number;
    totalUsage: number;
  };
}

/**
 * React hook to use dynamic screen loading
 */
export const useDynamicScreen = (
  screenId: string | null,
  sessionInfo: SessionInfo | null
): DynamicScreenState => {
  const [state, setState] = useState<DynamicScreenState>({
    isLoaded: false,
    screenComponent: null,
    error: null,
    isLoading: false,
    cacheStats: { memorySize: 0, hitRate: 0, totalUsage: 0 }
  });

  const loaderRef = useRef<DynamicScreenLoader>(dynamicScreenLoader);
  const currentScreenRef = useRef<string | null>(null);
  const currentSessionRef = useRef<SessionInfo | null>(null);

  // Load screen when screenId or session changes
  useEffect(() => {
    if (!screenId || !sessionInfo) {
      setState({
        isLoaded: false,
        screenComponent: null,
        error: screenId ? 'No session info provided' : null,
        isLoading: false,
        cacheStats: loaderRef.current.getCacheStats()
      });
      return;
    }

    // Check if screen or session changed
    const screenChanged = currentScreenRef.current !== screenId;
    const sessionChanged = currentSessionRef.current?.sessionId !== sessionInfo.sessionId;

    if (screenChanged || sessionChanged) {
      console.log(`🎭 [useDynamicScreen] Loading screen: ${screenId} (session: ${sessionInfo.sessionId})`);
      
      currentScreenRef.current = screenId;
      currentSessionRef.current = sessionInfo;

      const loadScreen = async () => {
        setState(prev => ({ 
          ...prev, 
          isLoading: true, 
          error: null,
          cacheStats: loaderRef.current.getCacheStats()
        }));

        try {
          const screenComponent = await loaderRef.current.loadScreen(screenId, sessionInfo);

          // Check if this request is still current (avoid race conditions)
          if (currentScreenRef.current === screenId && 
              currentSessionRef.current?.sessionId === sessionInfo.sessionId) {
            
            setState({
              isLoaded: true,
              screenComponent,
              error: null,
              isLoading: false,
              cacheStats: loaderRef.current.getCacheStats()
            });

            console.log(`✅ [useDynamicScreen] Screen loaded successfully: ${screenId}`);
          }

        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`❌ [useDynamicScreen] Failed to load screen ${screenId}:`, error);

          // Only update state if this request is still current
          if (currentScreenRef.current === screenId && 
              currentSessionRef.current?.sessionId === sessionInfo.sessionId) {
            
            setState({
              isLoaded: false,
              screenComponent: null,
              error: errorMessage,
              isLoading: false,
              cacheStats: loaderRef.current.getCacheStats()
            });
          }
        }
      };

      loadScreen();
    }
  }, [screenId, sessionInfo]);

  // Listen for screen updates via custom events (for live updates)
  useEffect(() => {
    if (!screenId || !sessionInfo) return;

    const handleScreenUpdate = (event: CustomEvent) => {
      const { screenId: updatedScreenId, sessionId } = event.detail;
      
      if (updatedScreenId === screenId && sessionId === sessionInfo.sessionId) {
        console.log(`🔄 [useDynamicScreen] Screen update detected: ${screenId}`);
        
        // Clear cache for this specific screen and reload
        loaderRef.current.clearCache(sessionInfo.sessionId);
        
        // Trigger reload by updating refs (will trigger useEffect above)
        currentScreenRef.current = null;
      }
    };

    // Listen for screen update events
    window.addEventListener('dynamicScreen:updated', handleScreenUpdate as EventListener);
    
    // Listen for file change events that might affect screens
    window.addEventListener('fileWatcher:screenChanged', handleScreenUpdate as EventListener);

    return () => {
      window.removeEventListener('dynamicScreen:updated', handleScreenUpdate as EventListener);
      window.removeEventListener('fileWatcher:screenChanged', handleScreenUpdate as EventListener);
    };
  }, [screenId, sessionInfo]);

  return state;
};

/**
 * Hook to manage multiple screens (for preloading, etc.)
 */
export const useDynamicScreenManager = (sessionInfo: SessionInfo | null) => {
  const [isPreloading, setIsPreloading] = useState(false);
  const loaderRef = useRef<DynamicScreenLoader>(dynamicScreenLoader);

  const preloadCriticalScreens = async () => {
    if (!sessionInfo || isPreloading) return;
    
    setIsPreloading(true);
    try {
      await loaderRef.current.preloadScreens(sessionInfo);
    } catch (error) {
      console.error('❌ [useDynamicScreenManager] Preload failed:', error);
    } finally {
      setIsPreloading(false);
    }
  };

  const clearAllCache = () => {
    loaderRef.current.clearCache();
  };

  const clearSessionCache = (sessionId: string) => {
    loaderRef.current.clearCache(sessionId);
  };

  const getCacheStats = () => {
    return loaderRef.current.getCacheStats();
  };

  // Preload screens when session is available
  useEffect(() => {
    if (sessionInfo && !isPreloading) {
      // Delay preloading to avoid interfering with current screen loading
      const timer = setTimeout(() => {
        preloadCriticalScreens();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [sessionInfo?.sessionId]);

  return {
    isPreloading,
    preloadCriticalScreens,
    clearAllCache,
    clearSessionCache,
    getCacheStats
  };
};

/**
 * Hook for development tools and debugging
 */
export const useDynamicScreenDebug = (sessionInfo: SessionInfo | null) => {
  const [debugInfo, setDebugInfo] = useState<{
    cacheStats: ReturnType<DynamicScreenLoader['getCacheStats']>;
    loadedScreens: string[];
    errorCount: number;
  }>({
    cacheStats: { memorySize: 0, hitRate: 0, totalUsage: 0 },
    loadedScreens: [],
    errorCount: 0
  });

  const loaderRef = useRef<DynamicScreenLoader>(dynamicScreenLoader);

  const refreshDebugInfo = () => {
    const cacheStats = loaderRef.current.getCacheStats();
    
    setDebugInfo({
      cacheStats,
      loadedScreens: [], // TODO: Track loaded screens
      errorCount: 0 // TODO: Track error count
    });
  };

  const simulateScreenUpdate = (screenId: string) => {
    if (sessionInfo) {
      window.dispatchEvent(new CustomEvent('dynamicScreen:updated', {
        detail: { screenId, sessionId: sessionInfo.sessionId }
      }));
    }
  };

  const forceClearCache = () => {
    loaderRef.current.clearCache(sessionInfo?.sessionId);
    refreshDebugInfo();
  };

  // Refresh debug info periodically
  useEffect(() => {
    const interval = setInterval(refreshDebugInfo, 2000);
    return () => clearInterval(interval);
  }, []);

  return {
    debugInfo,
    refreshDebugInfo,
    simulateScreenUpdate,
    forceClearCache
  };
};

