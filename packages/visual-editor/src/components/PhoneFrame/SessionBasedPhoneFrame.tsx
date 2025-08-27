/**
 * Session-Based Phone Frame
 * 
 * NEW ARCHITECTURE: This replaces DynamicPhoneFrame with a session-based approach
 * that loads the full mobile app and enables real-time updates:
 * 
 * 1. Load full mobile app session (like packages/web)
 * 2. Screen hot-reload capability
 * 3. Dynamic screen injection
 * 4. Live navigation updates
 */

import React, { useEffect, useState, useRef, Suspense } from 'react';
import styled from 'styled-components';
import { useEditor } from '../../contexts/EditorContext';
import { useSession } from '../../contexts/SessionContext';
import { MobileAppSessionLoader, MobileAppSession, ScreenDefinition, NavigationConfig } from '../../services/MobileAppSessionLoader';
import { SessionWebSocketManager } from '../../services/SessionWebSocketManager';

// Styled Components (reusing from DynamicPhoneFrame)
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
  overflow: hidden;
`;

const SessionControls = styled.div`
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
  background: #f0f8ff;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  color: #666;
  border-left: 3px solid #007AFF;
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

export interface SessionBasedPhoneFrameProps {
  onSessionLoaded?: (session: MobileAppSession) => void;
  onError?: (error: string) => void;
}

/**
 * NEW: Session-Based Phone Frame Component
 */
const SessionBasedPhoneFrame: React.FC<SessionBasedPhoneFrameProps> = ({ 
  onSessionLoaded,
  onError 
}) => {
  // ========== STATE ==========
  const { currentSession } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionLoader, setSessionLoader] = useState<MobileAppSessionLoader | null>(null);
  const [wsManager, setWsManager] = useState<SessionWebSocketManager | null>(null);
  const [mobileAppSession, setMobileAppSession] = useState<MobileAppSession | null>(null);
  const [hotReloadCount, setHotReloadCount] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  const appContentRef = useRef<HTMLDivElement>(null);

  // ========== INITIALIZATION ==========
  useEffect(() => {
    if (currentSession?.sessionId) {
      initializeSessionLoader();
    } else {
      cleanup();
    }
  }, [currentSession?.sessionId]);

  const initializeSessionLoader = async () => {
    if (!currentSession) return;

    console.log('🚀 [SessionBasedPhoneFrame] Initializing session loader for:', currentSession.sessionId);
    
    try {
      setIsLoading(true);
      setError(null);
      
      // 1. Create session loader
      const loader = new MobileAppSessionLoader(currentSession);
      setSessionLoader(loader);
      
      // 2. Load mobile app session
      console.log('📱 [SessionBasedPhoneFrame] Loading mobile app session...');
      const session = await loader.loadMobileAppSession();
      setMobileAppSession(session);
      
      // 3. Setup WebSocket for real-time updates
      console.log('🔌 [SessionBasedPhoneFrame] Setting up WebSocket connection...');
      const wsManager = new SessionWebSocketManager(loader, currentSession.sessionId);
      setWsManager(wsManager);
      
      // Setup event listeners for hot-reload
      setupHotReloadListeners(loader);
      
      // Connect WebSocket
      setConnectionStatus('connecting');
      await wsManager.connect();
      setConnectionStatus('connected');
      
      // Success!
      console.log('✅ [SessionBasedPhoneFrame] Session-based mobile app loaded successfully!');
      setIsLoading(false);
      onSessionLoaded?.(session);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ [SessionBasedPhoneFrame] Failed to initialize session loader:', err);
      setError(errorMessage);
      setIsLoading(false);
      onError?.(errorMessage);
    }
  };

  const setupHotReloadListeners = (loader: MobileAppSessionLoader) => {
    console.log('🔥 [SessionBasedPhoneFrame] Setting up hot-reload listeners...');
    
    // Listen for screen updates (hot-reload)
    loader.onScreenUpdate('*', (screen: ScreenDefinition) => {
      console.log(`🔥 [SessionBasedPhoneFrame] Screen hot-reloaded: ${screen.id}`);
      setHotReloadCount(prev => prev + 1);
      // Force re-render by updating session
      setMobileAppSession(loader.getCurrentSession());
    });
    
    // Listen for new screen injections
    loader.onScreenInjection((screen: ScreenDefinition) => {
      console.log(`➕ [SessionBasedPhoneFrame] New screen injected: ${screen.id}`);
      setMobileAppSession(loader.getCurrentSession());
    });
    
    // Listen for navigation updates
    loader.onNavigationUpdate((nav: NavigationConfig) => {
      console.log('🧭 [SessionBasedPhoneFrame] Navigation updated');
      setMobileAppSession(loader.getCurrentSession());
    });
  };

  const cleanup = () => {
    console.log('🧹 [SessionBasedPhoneFrame] Cleaning up...');
    
    if (wsManager) {
      wsManager.disconnect();
      setWsManager(null);
    }
    
    setSessionLoader(null);
    setMobileAppSession(null);
    setConnectionStatus('disconnected');
    setError(null);
  };

  // ========== CONTROLS ==========
  const handleReloadSession = async () => {
    if (sessionLoader) {
      try {
        setIsLoading(true);
        const session = await sessionLoader.loadMobileAppSession();
        setMobileAppSession(session);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Reload failed');
        setIsLoading(false);
      }
    }
  };

  const handleReconnectWebSocket = async () => {
    if (wsManager) {
      try {
        setConnectionStatus('connecting');
        await wsManager.connect();
        setConnectionStatus('connected');
      } catch (err) {
        setConnectionStatus('disconnected');
        console.error('Failed to reconnect WebSocket:', err);
      }
    }
  };

  // ========== RENDER METHODS ==========
  const renderMobileApp = () => {
    if (!mobileAppSession) {
      return <div>No mobile app session loaded</div>;
    }

    try {
      // Render the full mobile app
      const { app: AppComponent } = mobileAppSession;
      return React.createElement(AppComponent);
    } catch (renderError) {
      console.error('❌ [SessionBasedPhoneFrame] Mobile app render error:', renderError);
      return (
        <ErrorMessage>
          <div>❌ Mobile App Render Error</div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>
            {renderError instanceof Error ? renderError.message : 'Unknown render error'}
          </div>
        </ErrorMessage>
      );
    }
  };

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
      {/* Session Controls */}
      <SessionControls>
        <ControlButton 
          $variant="primary" 
          onClick={handleReloadSession}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Reload Session'}
        </ControlButton>
        
        <ControlButton 
          $variant="secondary"
          onClick={handleReconnectWebSocket}
          disabled={connectionStatus === 'connecting'}
        >
          WebSocket: {connectionStatus === 'connected' ? '✅' : connectionStatus === 'connecting' ? '🔄' : '❌'}
        </ControlButton>
        
        <div style={{ fontSize: '12px', color: '#666' }}>
          Hot-reloads: {hotReloadCount}
        </div>
      </SessionControls>

      {/* Status Info */}
      <StatusInfo>
        <div><strong>NEW Architecture:</strong> Session-Based Mobile App Loader</div>
        <div>Session: {currentSession?.sessionId?.slice(0, 8)}...</div>
        <div>Screens: {mobileAppSession?.screens.size || 0} loaded</div>
        <div>Version: {mobileAppSession?.version || 'N/A'}</div>
      </StatusInfo>

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
                <div>Loading Mobile App Session...</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  This may take a few moments...
                </div>
              </LoadingOverlay>
            )}

            {/* Error Message */}
            {error && !isLoading && (
              <ErrorMessage>
                <div>❌ Session Load Error</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>{error}</div>
                <div style={{ fontSize: '10px', marginTop: '8px' }}>
                  Check the browser console for details
                </div>
              </ErrorMessage>
            )}

            {/* Mobile App */}
            {!isLoading && !error && mobileAppSession && (
              <Suspense fallback={<div>Loading app...</div>}>
                {renderMobileApp()}
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
          </>
        )}
      </div>
    </PhoneContainer>
  );
};

export default SessionBasedPhoneFrame;
