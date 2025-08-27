import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useEditor } from '../../contexts/EditorContext';
import { useSession } from '../../contexts/SessionContext';
import { useDynamicScreen, useDynamicScreenManager, useDynamicScreenDebug } from '../../services/useDynamicScreen';

// Dynamic screen context is now handled via mock hooks in the evaluation context
// This provides better compatibility and avoids provider wrapping complexity

// Phone frame styling (reusing from PhoneFrame.tsx)
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
  
  &::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 134px;
    height: 6px;
    background: #333;
    border-radius: 3px;
    z-index: 10;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 134px;
    height: 5px;
    background: #333;
    border-radius: 2.5px;
  }
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
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 600;
  color: #000;
  position: relative;
  z-index: 5;
`;

const StatusLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StatusRight = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const AppContent = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;
  z-index: 100;
`;

const LoadingSpinner = styled.div`
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #ff6b6b;
  color: white;
  padding: 16px;
  border-radius: 8px;
  margin: 20px;
  text-align: center;
  font-size: 14px;
`;

const PlaceholderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  text-align: center;
  padding: 40px;
`;

const DynamicControls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
`;

const ControlButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'warning' }>`
  background: ${props => 
    props.$variant === 'primary' ? '#3498db' : 
    props.$variant === 'warning' ? '#f39c12' : '#6c757d'
  };
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;

const DebugInfo = styled.div`
  font-size: 10px;
  color: #7f8c8d;
  background: #ecf0f1;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
  font-family: 'Courier New', monospace;
`;

interface DynamicPhoneFrameProps {
  src2Status?: 'initializing' | 'ready' | 'error';
}

const DynamicPhoneFrame: React.FC<DynamicPhoneFrameProps> = ({ src2Status }) => {
  const { state } = useEditor();
  const { currentSession } = useSession();
  const [selectedScreenId, setSelectedScreenId] = useState<string>('DynamicTestScreen');
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [availableScreens, setAvailableScreens] = useState<string[]>([
    'HomeScreen',
    'DynamicTestScreen',
    'ComponentsShowcaseScreen', 
    'TemplateIndexScreen',
    'SettingsScreen'
  ]);
  const [isLoadingScreens, setIsLoadingScreens] = useState(false);
  const appContentRef = useRef<HTMLDivElement>(null);

  // Dynamic screen loading
  const { 
    isLoaded, 
    screenComponent, 
    error, 
    isLoading, 
    cacheStats 
  } = useDynamicScreen(selectedScreenId, currentSession);

  // Screen management
  const { 
    isPreloading, 
    preloadCriticalScreens, 
    clearAllCache, 
    clearSessionCache,
    getCacheStats 
  } = useDynamicScreenManager(currentSession);

  // Debug tools
  const { 
    debugInfo, 
    refreshDebugInfo, 
    simulateScreenUpdate, 
    forceClearCache 
  } = useDynamicScreenDebug(currentSession);

  // Fetch available screens from server
  const fetchAvailableScreens = async () => {
    if (!currentSession || isLoadingScreens) return;
    
    setIsLoadingScreens(true);
    try {
      const response = await fetch(`http://localhost:3001/api/editor/session/${currentSession.sessionId}/screens`);
      if (response.ok) {
        const data = await response.json();
        const screenIds = data.screens.map((screen: any) => screen.id);
        setAvailableScreens(screenIds);
        console.log(`🎭 [DynamicPhoneFrame] Discovered ${screenIds.length} screens:`, screenIds);
      }
    } catch (error) {
      console.warn('⚠️ [DynamicPhoneFrame] Failed to fetch available screens, using defaults:', error);
    } finally {
      setIsLoadingScreens(false);
    }
  };

  // Auto-discover screens when session is available
  useEffect(() => {
    if (currentSession && availableScreens.length === 5) { // Only if using default list
      fetchAvailableScreens();
    }
  }, [currentSession?.sessionId]);

  // Render the screen component
  const renderScreenComponent = () => {
    if (isLoading) {
      return null; // Loading overlay will show
    }

    if (error) {
      return null; // Error message will show
    }

    if (!screenComponent) {
      return (
        <PlaceholderContent>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎭</div>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>
            Dynamic Screen Loading
          </div>
          <div style={{ fontSize: '14px' }}>
            Select a screen to load dynamically from server files
          </div>
        </PlaceholderContent>
      );
    }

    try {
      // Dynamic screens now use mock context hooks that return real data
      // No provider wrapping needed since hooks are mocked in evaluation context
      return React.createElement(screenComponent);
    } catch (renderError) {
      console.error('❌ [DynamicPhoneFrame] Screen render error:', renderError);
      return (
        <ErrorMessage>
          <div>❌ Screen Render Error</div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>
            {renderError instanceof Error ? renderError.message : 'Unknown render error'}
          </div>
        </ErrorMessage>
      );
    }
  };

  // Handle screen selection
  const handleScreenSelect = (screenId: string) => {
    console.log(`🎭 [DynamicPhoneFrame] Selecting screen: ${screenId}`);
    setSelectedScreenId(screenId);
  };

  // Get current time for status bar
  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <PhoneContainer>
      {/* Dynamic Screen Controls */}
      <DynamicControls>
        <select 
          value={selectedScreenId} 
          onChange={(e) => handleScreenSelect(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd' }}
        >
          {availableScreens.map(screenId => (
            <option key={screenId} value={screenId}>{screenId}</option>
          ))}
        </select>

        <ControlButton 
          $variant="primary"
          onClick={preloadCriticalScreens}
          disabled={isPreloading}
        >
          {isPreloading ? '⏳ Preloading...' : '🚀 Preload'}
        </ControlButton>

        <ControlButton 
          $variant="warning"
          onClick={() => clearSessionCache(currentSession?.sessionId || '')}
        >
          🧹 Clear Cache
        </ControlButton>

        <ControlButton 
          $variant="secondary"
          onClick={() => setShowDebugInfo(!showDebugInfo)}
        >
          🔍 Debug
        </ControlButton>

        <ControlButton 
          $variant="secondary"
          onClick={fetchAvailableScreens}
          disabled={isLoadingScreens}
        >
          {isLoadingScreens ? '⏳ Discovering...' : '🔄 Refresh Screens'}
        </ControlButton>
      </DynamicControls>

      {/* Debug Information */}
      {showDebugInfo && (
        <DebugInfo>
          <div>Cache: {cacheStats.memorySize} entries, {cacheStats.hitRate.toFixed(2)} hit rate</div>
          <div>Screen: {selectedScreenId} | Session: {currentSession?.sessionId}</div>
          <div>Status: {isLoading ? 'Loading' : isLoaded ? 'Loaded' : 'Not Loaded'}</div>
          <div>Available Screens: {availableScreens.length} discovered</div>
          <div>Screen Discovery: {isLoadingScreens ? 'In Progress' : 'Complete'}</div>
        </DebugInfo>
      )}

      {/* Phone Frame */}
      <PhoneFrame>
        <PhoneScreen>
          {/* Status Bar */}
          <StatusBar>
            <StatusLeft>
              <span>{getCurrentTime()}</span>
            </StatusLeft>
            <StatusRight>
              <span>📶</span>
              <span>📶</span>
              <span>🔋</span>
            </StatusRight>
          </StatusBar>
          
          {/* App Content */}
          <AppContent ref={appContentRef}>
            {isLoading && (
              <LoadingOverlay>
                <LoadingSpinner />
                <div>Loading {selectedScreenId}...</div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Dynamic screen loading from server files
                </div>
              </LoadingOverlay>
            )}
            
            {error && (
              <ErrorMessage>
                <div>❌ Dynamic Screen Load Error</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>
                  {error}
                </div>
                <div style={{ fontSize: '10px', marginTop: '8px' }}>
                  Screen: {selectedScreenId}
                </div>
              </ErrorMessage>
            )}
            
            {/* Render the dynamic screen */}
            {renderScreenComponent()}
          </AppContent>
        </PhoneScreen>
      </PhoneFrame>

      {/* Status Information */}
      <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
        🎭 Dynamic Screen Loading
        {currentSession && (
          <div>Session: {currentSession.sessionId}</div>
        )}
        {src2Status && (
          <div>Src2: {src2Status}</div>
        )}
      </div>
    </PhoneContainer>
  );
};

export default DynamicPhoneFrame;
