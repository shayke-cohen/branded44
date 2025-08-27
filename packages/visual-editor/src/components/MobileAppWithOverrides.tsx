/**
 * Mobile App with Screen Overrides
 * 
 * This component wraps the REAL mobile app and intercepts screen rendering
 * to use session-based screen overrides when available.
 * 
 * How it works:
 * 1. Renders the real mobile app as baseline
 * 2. Intercepts screen component requests
 * 3. Returns session override if available, otherwise original screen
 * 4. Hot-swaps screens seamlessly
 */

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { MobileAppDirectSession, ScreenOverride } from '../services/MobileAppDirectLoader';

// Context for screen override provider
interface ScreenOverrideContextType {
  getScreenOverride: (screenId: string) => React.ComponentType<any> | null;
  hasOverride: (screenId: string) => boolean;
  getAllOverrides: () => ScreenOverride[];
  session: MobileAppDirectSession | null;
}

const ScreenOverrideContext = createContext<ScreenOverrideContextType | null>(null);



export const useScreenOverride = () => {
  const context = useContext(ScreenOverrideContext);
  if (!context) {
    throw new Error('useScreenOverride must be used within ScreenOverrideProvider');
  }
  return context;
};



interface ScreenOverrideProviderProps {
  children: ReactNode;
  session: MobileAppDirectSession;
}

/**
 * Provider that makes screen overrides available to the mobile app
 */
export const ScreenOverrideProvider: React.FC<ScreenOverrideProviderProps> = ({ 
  children, 
  session 
}) => {
  const getScreenOverride = (screenId: string): React.ComponentType<any> | null => {
    const override = session.screenOverrides.get(screenId);
    return override ? override.component : null;
  };

  const hasOverride = (screenId: string): boolean => {
    return session.screenOverrides.has(screenId);
  };

  const getAllOverrides = (): ScreenOverride[] => {
    return Array.from(session.screenOverrides.values());
  };

  const contextValue: ScreenOverrideContextType = {
    getScreenOverride,
    hasOverride,
    getAllOverrides,
    session
  };

  return (
    <ScreenOverrideContext.Provider value={contextValue}>
      {children}
    </ScreenOverrideContext.Provider>
  );
};

interface MobileAppWithOverridesProps {
  session: MobileAppDirectSession;
  activeTabId?: string | null;
  onScreenOverrideUsed?: (screenId: string) => void;
  onError?: (error: string) => void;
}

/**
 * Main component that renders the real mobile app with session screen overrides
 */
export const MobileAppWithOverrides: React.FC<MobileAppWithOverridesProps> = ({ 
  session, 
  activeTabId,
  onScreenOverrideUsed,
  onError 
}) => {
  console.log('📱 [MobileAppWithOverrides] Rendering real mobile app with screen overrides');
  console.log(`📊 [MobileAppWithOverrides] ${session.screenOverrides.size} screen overrides available`);
  if (activeTabId) {
    console.log(`🎯 [MobileAppWithOverrides] External tab control: ${activeTabId}`);
  }

  // Set global navigation control and screen override context for mobile app to access
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__VISUAL_EDITOR_NAVIGATION_CONTROL__ = {
        externalActiveTabId: activeTabId || null
      };
      
      // DISABLED: Using simple registry approach instead
      // (window as any).__SCREEN_OVERRIDE_CONTEXT__ = {
      //   session: session
      // };
      
      console.log('🌐 [MobileAppWithOverrides] Set global navigation control:', activeTabId);
      console.log('🌐 [MobileAppWithOverrides] SIMPLE: Using registry approach, no override context needed');
    }
    
    // Cleanup
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__VISUAL_EDITOR_NAVIGATION_CONTROL__;
        // No need to delete override context since we're using simple registry approach
      }
    };
  }, [activeTabId, session]);

  try {
    const { MobileApp } = session;

    // Wrap the real mobile app with screen override provider
    return (
      <ScreenOverrideProvider session={session}>
        <MobileApp />
      </ScreenOverrideProvider>
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown rendering error';
    console.error('❌ [MobileAppWithOverrides] Failed to render mobile app:', error);
    
    onError?.(errorMessage);

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '12px' }}>❌</div>
        <div style={{ fontSize: '16px', marginBottom: '8px' }}>Mobile App Render Error</div>
        <div style={{ fontSize: '12px', color: '#666' }}>{errorMessage}</div>
        <div style={{ fontSize: '10px', color: '#999', marginTop: '8px' }}>
          Session: {session.sessionId.slice(0, 8)}...
        </div>
      </div>
    );
  }
};

/**
 * HOC to wrap screen components with override capability
 * This can be used in the mobile app to make screens overrideable
 */
export function withScreenOverride<P extends object>(
  screenId: string,
  OriginalComponent: React.ComponentType<P>
): React.ComponentType<P> {
  const OverridableScreen: React.FC<P> = (props) => {
    const screenOverrideContext = useContext(ScreenOverrideContext);
    
    // If no override context, just render original
    if (!screenOverrideContext) {
      return React.createElement(OriginalComponent, props);
    }
    
    // Check for screen override
    const override = screenOverrideContext.session?.screenOverrides.get(screenId);
    
    if (override) {
      // Prefer real component overrides from session files
      if (override.component) {
        console.log(`🔄 [withScreenOverride] Using session screen override for: ${screenId}`);
        return React.createElement(override.component, props);
      }
      // Fallback: Direct refresh (re-render original component)
      else if (override.component === null && override.isDirectRefresh) {
        console.log(`🔄 [withScreenOverride] Direct refresh fallback for: ${screenId} - re-rendering original component`);
        // For direct refresh, just render the original component (it will pick up file changes)
        return React.createElement(OriginalComponent, props);
      }
    }
    
    // No override or invalid override, use original component
    return React.createElement(OriginalComponent, props);
  };
  
  OverridableScreen.displayName = `OverridableScreen(${screenId})`;
  
  return OverridableScreen;
}

/**
 * Hook for screens to check if they're being overridden
 */
export const useScreenOverrideInfo = (screenId: string) => {
  const context = useContext(ScreenOverrideContext);
  
  return {
    isOverridden: context?.hasOverride(screenId) || false,
    overrideInfo: context?.session?.screenOverrides.get(screenId) || null,
    sessionId: context?.session?.sessionId || null,
    allOverrides: context?.getAllOverrides() || []
  };
};

export default MobileAppWithOverrides;
