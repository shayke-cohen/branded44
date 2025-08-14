import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useEditor } from '../../contexts/EditorContext';
import { LiveRenderer } from '../../services/LiveRenderer';

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

const PhoneFrameComponent: React.FC = () => {
  const { state } = useEditor();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deviceType, setDeviceType] = useState<'iphone' | 'android'>('iphone');
  const [zoom, setZoom] = useState(1);
  const appContentRef = useRef<HTMLDivElement>(null);
  const liveRendererRef = useRef<LiveRenderer | null>(null);

  useEffect(() => {
    if (appContentRef.current && !liveRendererRef.current) {
      liveRendererRef.current = new LiveRenderer(appContentRef.current);
    }
  }, []);

  useEffect(() => {
    if (state.currentScreen && liveRendererRef.current) {
      setIsLoading(true);
      setError(null);
      
      liveRendererRef.current
        .renderScreen(state.currentScreen)
        .then(() => {
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Failed to render screen:', err);
          setError(err.message);
          setIsLoading(false);
        });
    }
  }, [state.currentScreen]);

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
            {isLoading && (
              <LoadingOverlay>
                <LoadingSpinner />
                <div>Loading {state.currentScreen}...</div>
              </LoadingOverlay>
            )}
            
            {error && (
              <ErrorMessage>
                <div>❌ Render Error</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>
                  {error}
                </div>
              </ErrorMessage>
            )}
            
            {!state.currentScreen && !isLoading && !error && (
              <PlaceholderContent>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
                <div style={{ fontSize: '18px', marginBottom: '8px' }}>
                  No Screen Selected
                </div>
                <div style={{ fontSize: '14px' }}>
                  Choose a screen from the header dropdown to start editing
                </div>
              </PlaceholderContent>
            )}
          </AppContent>
        </PhoneScreen>
      </PhoneFrame>
    </PhoneContainer>
  );
};

export default PhoneFrameComponent;
