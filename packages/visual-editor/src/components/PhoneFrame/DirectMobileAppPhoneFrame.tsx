/**
 * Direct Mobile App Phone Frame
 * 
 * NEW SIMPLIFIED APPROACH:
 * 1. Load the REAL mobile app as baseline (like packages/web)
 * 2. Hot-swap only individual screen files from session
 * 3. No bundling, no complex evaluation
 * 4. Much cleaner and more efficient
 */

import React, { useEffect, useState, useRef, Suspense } from 'react';
import styled from 'styled-components';
import { useEditor } from '../../contexts/EditorContext';
import { useSession } from '../../contexts/SessionContext';
import { MobileAppDirectLoader, MobileAppDirectSession, ScreenOverride } from '../../services/MobileAppDirectLoader';
import { io, Socket } from 'socket.io-client';
import { MobileAppWithOverrides } from '../MobileAppWithOverrides';
import { ComponentInspector, InspectableComponent } from '../../services/ComponentInspector';

// Styled Components (reusing from SessionBasedPhoneFrame)
const PhoneContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
`;

const PhoneFrame = styled.div`
  width: 375px;
  height: 812px;
  background: #1a1a1a;
  border-radius: 40px;
  padding: 12px;
  position: relative;
  box-shadow: 
    0 0 0 2px #333,
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
`;

const PhoneScreen = styled.div`
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 28px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const StatusBar = styled.div`
  height: 44px;
  background: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid #f0f0f0;
`;

const AppContent = styled.div`
  flex: 1;
  position: relative;
  overflow: auto; /* Enable scrolling for content */
  display: flex;
  flex-direction: column;
  
  /* React Native Web layout fixes */
  & > * {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  /* Ensure ScrollView and Views work properly */
  [data-focusable="true"] {
    outline: none;
  }
  
  /* Fix React Native Web SafeAreaView */
  [style*="SafeAreaView"] {
    display: flex !important;
    flex-direction: column !important;
  }
  
  /* Fix React Native Web View with flex: 1 */
  div[style*="flex:1"], div[style*="flex: 1"] {
    display: flex !important;
    flex: 1 !important;
  }
`;

const DirectControls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const ControlButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'warning' }>`
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: #007AFF;
          color: white;
          &:hover { background: #0056CC; }
        `;
      case 'warning':
        return `
          background: #FF9500;
          color: white;
          &:hover { background: #CC7700; }
        `;
      default:
        return `
          background: #E5E5EA;
          color: #333;
          &:hover { background: #D1D1D6; }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusInfo = styled.div`
  background: #e8f5e8;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #2d5a2d;
  border-left: 3px solid #4caf50;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #ff4444;
  font-size: 14px;
  padding: 20px;
`;

export interface DirectMobileAppPhoneFrameProps {
  onSessionLoaded?: (session: MobileAppDirectSession) => void;
  onScreenSwapped?: (screenId: string, override: ScreenOverride) => void;
  onError?: (error: string) => void;
}

/**
 * NEW: Direct Mobile App Phone Frame Component
 * Uses real mobile app with screen overrides (no bundling)
 */
const DirectMobileAppPhoneFrame: React.FC<DirectMobileAppPhoneFrameProps> = ({ 
  onSessionLoaded,
  onScreenSwapped,
  onError 
}) => {
  // ========== STATE ==========
  const { currentSession } = useSession();
  const { state, selectComponent, toggleInspection: editorToggleInspection } = useEditor();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [directLoader, setDirectLoader] = useState<MobileAppDirectLoader | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [mobileAppSession, setMobileAppSession] = useState<MobileAppDirectSession | null>(null);
  const [screenSwapCount, setScreenSwapCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const appContentRef = useRef<HTMLDivElement>(null);
  
  // ========== INSPECTION ==========
  const componentInspector = useRef<ComponentInspector | null>(null);
  const { isInspecting } = state;
  
  // Initialize component inspector only once
  if (!componentInspector.current) {
    componentInspector.current = new ComponentInspector();
  }

  // ========== INITIALIZATION ==========
  useEffect(() => {
    if (currentSession?.sessionId) {
      initializeDirectLoader();
    } else {
      cleanup();
    }
  }, [currentSession?.sessionId]);

  const initializeDirectLoader = async () => {
    if (!currentSession) return;

    console.log('🚀 [DirectMobileAppPhoneFrame] Initializing direct loader for:', currentSession.sessionId);
    
    try {
      setIsLoading(true);
      setError(null);
      
      // 1. Create direct loader
      const loader = new MobileAppDirectLoader(currentSession);
      setDirectLoader(loader);
      
      // 2. Load real mobile app with session overrides
      console.log('📱 [DirectMobileAppPhoneFrame] Loading real mobile app with session overrides...');
      const session = await loader.loadMobileAppWithOverrides();
      setMobileAppSession(session);
      
      // 3. Setup hot-swap listeners
      setupHotSwapListeners(loader);
      
      // 4. Setup Socket.IO for real-time updates with new DirectMobileAppWS
      console.log('🔌 [DirectMobileAppPhoneFrame] Setting up Socket.IO connection...');
      
      const socketInstance = io('http://localhost:3001', {
        forceNew: true,
        reconnection: true,
        timeout: 5000,
      });
      
      // Join direct mobile app session
      socketInstance.emit('join-direct-mobile-app-session', {
        sessionId: currentSession.sessionId,
        clientType: 'direct-mobile-app-frame'
      });
      
      // Set up event listeners for our new DirectMobileAppWS events
      socketInstance.on('direct-mobile-app-session-joined', (data: any) => {
        console.log('✅ [DirectMobileAppPhoneFrame] Joined direct mobile app session:', data);
        setConnectionStatus('connected');
      });
      
      socketInstance.on('screen-hot-reload', (data: any) => {
        console.log('🔥 [DirectMobileAppPhoneFrame] Screen hot-reload received:', data);
        if (data.screenId && loader) {
          loader.hotSwapScreen(data.screenId);
          setScreenSwapCount(prev => prev + 1);
        }
      });
      
      socketInstance.on('screen-injection', (data: any) => {
        console.log('➕ [DirectMobileAppPhoneFrame] Screen injection received:', data);
        if (data.screenDefinition && loader) {
          loader.addScreenOverride(data.screenDefinition.id);
        }
      });
      
      socketInstance.on('navigation-update', (data: any) => {
        console.log('🧭 [DirectMobileAppPhoneFrame] Navigation update received:', data);
        // Navigation updates handled by real app
      });
      
      socketInstance.on('connect_error', (error: any) => {
        console.error('❌ [DirectMobileAppPhoneFrame] Socket.IO connection error:', error);
        setConnectionStatus('disconnected');
        setError('WebSocket connection failed');
      });
      
      setSocket(socketInstance);
      setConnectionStatus('connecting');
      
      // Success!
      console.log('✅ [DirectMobileAppPhoneFrame] Real mobile app loaded with session overrides!');
      setIsLoading(false);
      onSessionLoaded?.(session);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ [DirectMobileAppPhoneFrame] Failed to initialize direct loader:', err);
      setError(errorMessage);
      setIsLoading(false);
      onError?.(errorMessage);
    }
  };

  const setupHotSwapListeners = (loader: MobileAppDirectLoader) => {
    console.log('🔥 [DirectMobileAppPhoneFrame] Setting up hot-swap listeners...');
    
    // Listen for screen swaps
    loader.onScreenSwap('*' as any, (screenOverride: ScreenOverride) => {
      console.log(`🔥 [DirectMobileAppPhoneFrame] Screen hot-swapped: ${screenOverride.screenId}`);
      setScreenSwapCount(prev => prev + 1);
      onScreenSwapped?.(screenOverride.screenId, screenOverride);
    });
    
    // Listen for app updates
    loader.onAppUpdate((session: MobileAppDirectSession) => {
      console.log('📱 [DirectMobileAppPhoneFrame] App updated');
      setMobileAppSession(session);
    });
  };

  const cleanup = () => {
    console.log('🧹 [DirectMobileAppPhoneFrame] Cleaning up...');
    
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    
    setDirectLoader(null);
    setMobileAppSession(null);
    setConnectionStatus('disconnected');
    setError(null);
  };

  // ========== CONTROLS ==========
  const handleReloadApp = async () => {
    if (directLoader) {
      try {
        setIsLoading(true);
        const session = await directLoader.loadMobileAppWithOverrides();
        setMobileAppSession(session);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Reload failed');
        setIsLoading(false);
      }
    }
  };

  const handleReconnectWebSocket = async () => {
    if (socket) {
      try {
        setConnectionStatus('connecting');
        socket.connect();
        // Connection status will be updated by the 'connect' event listener
      } catch (err) {
        setConnectionStatus('disconnected');
        console.error('Failed to reconnect Socket.IO:', err);
      }
    }
  };

  const handleClearOverrides = () => {
    if (directLoader && mobileAppSession) {
      console.log('🧹 [DirectMobileAppPhoneFrame] Clearing all screen overrides...');
      
      // Remove all overrides
      const overrideIds = Array.from(mobileAppSession.screenOverrides.keys());
      overrideIds.forEach(screenId => {
        directLoader.removeScreenOverride(screenId);
      });
      
      setScreenSwapCount(0);
    }
  };

  // ========== INSPECTION HANDLERS ==========
  const handleComponentSelect = (component: InspectableComponent) => {
    console.log('📱 [DirectMobileAppPhoneFrame] Component selected via inspector:', component);
    selectComponent(component.id);
    editorToggleInspection(false);
    
    // Stop inspection mode
    if (appContentRef.current && componentInspector.current) {
      componentInspector.current.stopInspection(appContentRef.current);
    }
    
    console.log('📱 [DirectMobileAppPhoneFrame] Component selected - Properties panel will show details for:', component.id);
  };

  const toggleInspection = () => {
    console.log('🔍 [DirectMobileAppPhoneFrame] toggleInspection called, appContentRef.current:', !!appContentRef.current);
    console.log('🔍 [DirectMobileAppPhoneFrame] Current isInspecting state:', isInspecting);
    console.log('🔍 [DirectMobileAppPhoneFrame] componentInspector.current:', !!componentInspector.current);
    
    if (!appContentRef.current || !componentInspector.current) {
      console.error('❌ [DirectMobileAppPhoneFrame] appContentRef or componentInspector is null, cannot toggle inspection');
      return;
    }

    if (isInspecting) {
      console.log('🔍 [DirectMobileAppPhoneFrame] Stopping inspection...');
      componentInspector.current.stopInspection(appContentRef.current);
      editorToggleInspection(false);
    } else {
      console.log('🔍 [DirectMobileAppPhoneFrame] Starting inspection...');
      componentInspector.current.startInspection(appContentRef.current, handleComponentSelect);
      editorToggleInspection(true);
      console.log('🔍 [DirectMobileAppPhoneFrame] Inspection started, new state should be:', true);
    }
  };

  // ========== RENDER METHODS ==========
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // ========== MAIN RENDER ==========
  return (
    <PhoneContainer>
      {/* Direct App Controls */}
      <DirectControls>
        <ControlButton 
          $variant="primary" 
          onClick={handleReloadApp}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Reload App'}
        </ControlButton>
        
        <ControlButton 
          $variant="secondary"
          onClick={handleReconnectWebSocket}
          disabled={connectionStatus === 'connecting'}
        >
          WebSocket: {connectionStatus === 'connected' ? '✅' : connectionStatus === 'connecting' ? '🔄' : '❌'}
        </ControlButton>

        <ControlButton 
          $variant="warning"
          onClick={handleClearOverrides}
          disabled={!mobileAppSession || mobileAppSession.screenOverrides.size === 0}
        >
          Clear Overrides
        </ControlButton>

        <ControlButton 
          $variant={isInspecting ? "primary" : "secondary"}
          onClick={toggleInspection}
          title={isInspecting ? 'Stop inspecting components' : 'Start inspecting components'}
        >
          🔍 {isInspecting ? 'Stop' : 'Inspect'}
        </ControlButton>
        
        <div style={{ fontSize: '12px', color: '#666' }}>
          Hot-swaps: {screenSwapCount}
        </div>
      </DirectControls>



      {/* Phone Frame */}
      <PhoneFrame>
        <PhoneScreen>
          {/* Status Bar */}
          <StatusBar>
            <div>{getCurrentTime()}</div>
            <div>
              <span style={{ marginRight: '4px' }}>📶</span>
              <span style={{ marginRight: '4px' }}>📶</span>
              <span>🔋</span>
            </div>
          </StatusBar>

          {/* App Content */}
          <AppContent ref={appContentRef}>
            {/* Loading Overlay */}
            {isLoading && (
              <LoadingOverlay>
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>📱</div>
                <div>Loading Real Mobile App...</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  Importing real mobile app with session overrides...
                </div>
              </LoadingOverlay>
            )}

            {/* Error Message */}
            {error && !isLoading && (
              <ErrorMessage>
                <div>❌ Direct App Load Error</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>{error}</div>
                <div style={{ fontSize: '10px', marginTop: '8px' }}>
                  Check the browser console for details
                </div>
              </ErrorMessage>
            )}

            {/* Real Mobile App with Session Overrides */}
            {!isLoading && !error && mobileAppSession && (
              <Suspense fallback={<div>Loading mobile app...</div>}>
                <div style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  /* React Native Web container fixes */
                  position: 'relative',
                  overflow: 'hidden' /* Let the inner ScrollView handle scrolling */
                }}>
                  <MobileAppWithOverrides
                    session={mobileAppSession}
                    activeTabId={state.currentTabId}
                    onScreenOverrideUsed={(screenId) => {
                      console.log(`🔄 [DirectMobileAppPhoneFrame] Session override used: ${screenId}`);
                    }}
                    onError={(err) => {
                      console.error('❌ [DirectMobileAppPhoneFrame] Mobile app render error:', err);
                      setError(err);
                    }}
                  />
                </div>
              </Suspense>
            )}
          </AppContent>
        </PhoneScreen>
      </PhoneFrame>

      {/* Session Info Footer */}
      <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
        {currentSession && (
          <>
            <div>Session: {currentSession.sessionId}</div>
            <div>WebSocket: {connectionStatus}</div>
            <div>Approach: Direct Mobile App + Screen Overrides</div>
          </>
        )}
      </div>
    </PhoneContainer>
  );
};

export default DirectMobileAppPhoneFrame;
