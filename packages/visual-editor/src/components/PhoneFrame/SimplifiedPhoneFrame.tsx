import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useEditor } from '../../contexts/EditorContext';
import { SimpleRealAppRenderer } from '../../services/SimpleRealAppRenderer';
import { componentInspector, InspectableComponent } from '../../services/ComponentInspector';
import { dropZoneManager } from '../../services/DropZoneManager';

// Styled Components (simplified)
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

const DeviceControls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const DeviceButton = styled.button<{ $active?: boolean }>`
  background: ${props => props.$active ? '#3498db' : '#fff'};
  color: ${props => props.$active ? '#fff' : '#666'};
  border: 2px solid ${props => props.$active ? '#3498db' : '#ddd'};
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #3498db;
    color: ${props => props.$active ? '#fff' : '#3498db'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ZoomControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 4px;
`;

const ZoomButton = styled.button`
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-radius: 4px;

  &:hover {
    background: #f0f0f0;
  }
`;

const ZoomLevel = styled.span`
  font-size: 12px;
  color: #666;
  min-width: 40px;
  text-align: center;
`;

interface SimplifiedPhoneFrameProps {
  src2Status?: 'initializing' | 'ready' | 'error';
}

const SimplifiedPhoneFrame: React.FC<SimplifiedPhoneFrameProps> = ({ src2Status }) => {
  const { state, selectComponent } = useEditor();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceType, setDeviceType] = useState<'iphone' | 'android'>('iphone');
  const [zoom, setZoom] = useState(1);
  const [isInspecting, setIsInspecting] = useState(false);
  const [renderedComponent, setRenderedComponent] = useState<React.ComponentType | null>(null);
  const [iframeData, setIframeData] = useState<{ sessionId: string; iframeUrl: string } | null>(null);
  const appContentRef = useRef<HTMLDivElement>(null);
  const simpleRenderer = useRef(new SimpleRealAppRenderer());

  // Set up the SimpleRealAppRenderer container when component mounts
  useEffect(() => {
    if (appContentRef.current) {
      simpleRenderer.current.setContainer(appContentRef.current);
      console.log('📱 [SimplifiedPhoneFrame] SimpleRealAppRenderer container set');
    }
  }, []);

  // Listen for SimpleRenderer events (React-friendly approach)
  useEffect(() => {
    const handleRender = (event: CustomEvent) => {
      const { type, sessionId, iframeUrl } = event.detail;
      if (type === 'iframe-app') {
        console.log('📱 [SimplifiedPhoneFrame] Received iframe render event:', sessionId);
        setIframeData({ sessionId, iframeUrl });
        setIsLoading(false);
        setError(null);
      }
    };

    const handleError = (event: CustomEvent) => {
      const { message } = event.detail;
      console.error('📱 [SimplifiedPhoneFrame] Received error event:', message);
      setError(message);
      setIsLoading(false);
      setIframeData(null);
    };

    window.addEventListener('simpleRenderer:render', handleRender as EventListener);
    window.addEventListener('simpleRenderer:error', handleError as EventListener);

    return () => {
      window.removeEventListener('simpleRenderer:render', handleRender as EventListener);
      window.removeEventListener('simpleRenderer:error', handleError as EventListener);
    };
  }, []);

  // Auto-load the real app when ready
  useEffect(() => {
    if (src2Status === 'ready') {
      setIsLoading(true);
      simpleRenderer.current.renderMobileApp()
        .catch(err => {
          console.error('📱 [SimplifiedPhoneFrame] Failed to trigger render:', err);
          setIsLoading(false);
          setError(err.toString());
        });
    }
  }, [src2Status]);

  // Simple approach: Just render the real app (no component switching complexity)
  // This replaces the complex component selection logic with the simple iframe approach

  // Handle component selection from inspector
  const handleComponentSelect = (component: InspectableComponent) => {
    console.log('📱 [SimplifiedPhoneFrame] Component selected via inspector:', component);
    selectComponent(component.id);
    setIsInspecting(false);
    
    // Stop inspection mode
    if (appContentRef.current) {
      componentInspector.stopInspection(appContentRef.current);
    }
  };

  // Toggle inspection mode
  const toggleInspection = () => {
    if (!appContentRef.current) return;

    if (isInspecting) {
      componentInspector.stopInspection(appContentRef.current);
      setIsInspecting(false);
    } else {
      componentInspector.startInspection(appContentRef.current, handleComponentSelect);
      setIsInspecting(true);
    }
  };

  // Handle component drop from palette
  const handleComponentDrop = (componentType: string, data: any) => {
    console.log('📱 [SimplifiedPhoneFrame] Component dropped:', { componentType, data });
    selectComponent(componentType);
  };

  // Setup drop zone when component mounts
  useEffect(() => {
    if (appContentRef.current) {
      // Register the phone frame as a drop zone
      dropZoneManager.registerDropZone(
        'phone-frame',
        appContentRef.current,
        ['*'], // Accept all component types
        handleComponentDrop
      );

      console.log('📱 [SimplifiedPhoneFrame] Drop zone registered');

      return () => {
        // Cleanup drop zone on unmount
        dropZoneManager.unregisterDropZone('phone-frame');
        console.log('📱 [SimplifiedPhoneFrame] Drop zone unregistered');
      };
    }
  }, [deviceType]); // Re-register when device type changes

  // Manual render app button handler
  const handleRenderApp = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the same event-driven approach
      await simpleRenderer.current.renderMobileApp();
      // Clear selected component to show app
      selectComponent(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown render error';
      setError(errorMessage);
      setIsLoading(false);
      console.error('❌ [SimplifiedPhoneFrame] Manual app render error:', err);
    }
    // Note: setIsLoading(false) is now handled by the render event listener
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleZoomReset = () => {
    setZoom(1);
  };

  return (
    <PhoneContainer>
      <DeviceControls>
        <DeviceButton
          $active={deviceType === 'iphone'}
          onClick={() => setDeviceType('iphone')}
        >
          📱 iPhone
        </DeviceButton>
        <DeviceButton
          $active={deviceType === 'android'}
          onClick={() => setDeviceType('android')}
        >
          🤖 Android
        </DeviceButton>
        
        <DeviceButton
          $active={isInspecting}
          onClick={toggleInspection}
          title={isInspecting ? 'Stop inspecting components' : 'Start inspecting components'}
        >
          🔍 {isInspecting ? 'Stop' : 'Inspect'}
        </DeviceButton>
        
        <DeviceButton
          onClick={handleRenderApp}
          title="Render the main App.tsx"
          disabled={isLoading || src2Status !== 'ready'}
        >
          📱 Render App
        </DeviceButton>
        
        <ZoomControls>
          <ZoomButton onClick={handleZoomOut}>−</ZoomButton>
          <ZoomLevel>{Math.round(zoom * 100)}%</ZoomLevel>
          <ZoomButton onClick={handleZoomIn}>+</ZoomButton>
          <ZoomButton onClick={handleZoomReset}>⌂</ZoomButton>
        </ZoomControls>
      </DeviceControls>

      <PhoneFrame style={{ transform: `scale(${zoom})` }}>
        <PhoneScreen>
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
          
          <AppContent ref={appContentRef}>
            {/* Loading overlay */}
            {isLoading && (
              <LoadingOverlay>
                <LoadingSpinner />
                <div>
                  {state.selectedComponent ? 
                    `Loading ${state.selectedComponent}...` : 
                    'Loading mobile app...'
                  }
                </div>
              </LoadingOverlay>
            )}
            
            {/* Error overlay */}
            {error && !isLoading && (
              <LoadingOverlay style={{ background: 'rgba(255, 245, 245, 0.9)' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>⚠️</div>
                <div style={{ color: '#c53030', fontWeight: 'bold' }}>Render Error</div>
                <div style={{ color: '#742a2a', fontSize: 14, textAlign: 'center', maxWidth: 280 }}>
                  {error}
                </div>
              </LoadingOverlay>
            )}
            
            {/* Initialization message */}
            {src2Status === 'initializing' && (
              <LoadingOverlay>
                <LoadingSpinner />
                <div>Initializing editor environment...</div>
              </LoadingOverlay>
            )}
            
            {/* Error state message */}
            {src2Status === 'error' && (
              <LoadingOverlay style={{ background: 'rgba(255, 245, 245, 0.9)' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>❌</div>
                <div style={{ color: '#c53030', fontWeight: 'bold' }}>Initialization Error</div>
                <div style={{ color: '#742a2a', fontSize: 14 }}>
                  Failed to initialize editor environment
                </div>
              </LoadingOverlay>
            )}

            {/* Render the real app iframe using React (no DOM manipulation) */}
            {iframeData && !isLoading && !error && src2Status === 'ready' && (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}>
                <iframe 
                  src={iframeData.iframeUrl}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    border: 'none',
                    borderRadius: '0px'
                  }}
                  title={`Real Mobile App - ${iframeData.sessionId}`}
                />
              </div>
            )}
            
            {/* Fallback message when no iframe data */}
            {!iframeData && !isLoading && !error && src2Status === 'ready' && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                color: '#64748b',
                textAlign: 'center',
                padding: '20px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                  Real App Preview
                </div>
                <div style={{ fontSize: '14px', opacity: 0.7 }}>
                  Loading your mobile app...
                </div>
              </div>
            )}
          </AppContent>
        </PhoneScreen>
      </PhoneFrame>
    </PhoneContainer>
  );
};

export default SimplifiedPhoneFrame;
