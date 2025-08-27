import { useState, useEffect, useRef } from 'react';
import { SessionInfo, BundledAppState } from './types';
import SessionBundleLoader from './SessionBundleLoader';

/**
 * React hook to use session bundle loading
 */
export const useSessionBundle = (sessionInfo: SessionInfo | null): BundledAppState => {
  const [state, setState] = useState<BundledAppState>({
    isLoaded: false,
    appComponent: null,
    error: null,
    isLoading: false,
  });

  const bundleLoaderRef = useRef<SessionBundleLoader | null>(null);
  const sessionInfoRef = useRef<SessionInfo | null>(null);

  // Initialize bundle loader
  if (!bundleLoaderRef.current) {
    bundleLoaderRef.current = new SessionBundleLoader();
  }

  // Load bundle when session info changes
  useEffect(() => {
    if (!sessionInfo) {
      setState({
        isLoaded: false,
        appComponent: null,
        error: 'No session info provided',
        isLoading: false,
      });
      return;
    }

    // Check if session changed
    if (sessionInfoRef.current?.sessionId !== sessionInfo.sessionId) {
      console.log(`🔄 [useSessionBundle] Session changed: ${sessionInfoRef.current?.sessionId} -> ${sessionInfo.sessionId}`);
      sessionInfoRef.current = sessionInfo;
      
      // Clear cache for previous session
      if (sessionInfoRef.current?.sessionId) {
        bundleLoaderRef.current?.clearCache(sessionInfoRef.current.sessionId);
      }
    }

    const loadBundle = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        console.log(`📦 [useSessionBundle] Loading bundle for session: ${sessionInfo.sessionId}`);
        
        const appComponent = await bundleLoaderRef.current!.loadBundledApp(sessionInfo.sessionId);
        
        setState({
          isLoaded: true,
          appComponent,
          error: null,
          isLoading: false,
        });

        console.log(`✅ [useSessionBundle] Bundle loaded successfully for: ${sessionInfo.sessionId}`);

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ [useSessionBundle] Failed to load bundle:`, error);
        
        setState({
          isLoaded: false,
          appComponent: null,
          error: errorMessage,
          isLoading: false,
        });
      }
    };

    loadBundle();
  }, [sessionInfo]);

  // Listen for bundle updates via socket events
  useEffect(() => {
    if (!sessionInfo) return;

    const handleBundleUpdated = (event: CustomEvent) => {
      const { sessionId } = event.detail;
      if (sessionId === sessionInfo.sessionId) {
        console.log(`🔄 [useSessionBundle] Bundle updated for session: ${sessionId}`);
        bundleLoaderRef.current?.clearCache(sessionId);
        
        // Reload the bundle
        setState(prev => ({ ...prev, isLoading: true }));
        bundleLoaderRef.current?.loadBundledApp(sessionId)
          .then(appComponent => {
            setState({
              isLoaded: true,
              appComponent,
              error: null,
              isLoading: false,
            });
          })
          .catch(error => {
            setState({
              isLoaded: false,
              appComponent: null,
              error: error.message,
              isLoading: false,
            });
          });
      }
    };

    const handleBundleError = (event: CustomEvent) => {
      const { sessionId, error } = event.detail;
      if (sessionId === sessionInfo.sessionId) {
        console.error(`❌ [useSessionBundle] Bundle error for session: ${sessionId}`, error);
        setState(prev => ({
          ...prev,
          error: `Bundle build failed: ${error}`,
          isLoading: false,
        }));
      }
    };

    // Listen for socket events (these are dispatched by socket.io listeners)
    window.addEventListener('bundle-updated', handleBundleUpdated as EventListener);
    window.addEventListener('bundle-error', handleBundleError as EventListener);

    return () => {
      window.removeEventListener('bundle-updated', handleBundleUpdated as EventListener);
      window.removeEventListener('bundle-error', handleBundleError as EventListener);
    };
  }, [sessionInfo]);

  return state;
};
