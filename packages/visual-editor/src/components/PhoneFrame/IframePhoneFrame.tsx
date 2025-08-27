import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSession } from '../../contexts/SessionContext';

// Styled Components (reuse phone frame styling)
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

const IframeContainer = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  background: #f5f5f5;
`;

const MobileIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: #ffffff;
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

const PhoneLabel = styled.div`
  background: #2196f3;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

interface IframePhoneFrameProps {
  src2Status?: 'initializing' | 'ready' | 'error';
}

const IframePhoneFrame: React.FC<IframePhoneFrameProps> = ({ src2Status }) => {
  const { currentSession } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceType, setDeviceType] = useState<'iphone' | 'android'>('iphone');
  const [zoom, setZoom] = useState(1);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Generate iframe URL when session is ready
  useEffect(() => {
    if (currentSession?.sessionId && src2Status === 'ready') {
      const url = `http://localhost:3001/api/editor/session/${currentSession.sessionId}/mobile-app?device=${deviceType}&iframe=true`;
      setIframeUrl(url);
      console.log('🖼️ [IframePhoneFrame] Setting iframe URL:', url);
    } else {
      setIframeUrl(null);
    }
  }, [currentSession, src2Status, deviceType]);

  // Handle iframe load events
  const handleIframeLoad = () => {
    console.log('🖼️ [IframePhoneFrame] Iframe loaded successfully');
    setIsLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    console.error('🖼️ [IframePhoneFrame] Iframe failed to load');
    setIsLoading(false);
    setError('Failed to load mobile app in iframe');
  };

  // Reload iframe
  const handleReload = () => {
    if (iframeRef.current && iframeUrl) {
      setIsLoading(true);
      setError(null);
      iframeRef.current.src = iframeUrl + `&t=${Date.now()}`; // Add cache buster
    }
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
      <PhoneLabel>📱 Iframe Preview</PhoneLabel>
      
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
          onClick={handleReload}
          title="Reload iframe"
          disabled={!iframeUrl}
        >
          🔄 Reload
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
          
          <IframeContainer>
            {/* Loading overlay */}
            {isLoading && (
              <LoadingOverlay>
                <LoadingSpinner />
                <div>Loading iframe app...</div>
              </LoadingOverlay>
            )}
            
            {/* Error overlay */}
            {error && !isLoading && (
              <ErrorMessage>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                <div style={{ fontSize: '18px', marginBottom: '8px', color: '#c53030' }}>
                  Iframe Error
                </div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>
                  {error}
                </div>
                <DeviceButton
                  onClick={handleReload}
                  style={{ marginTop: '16px' }}
                  disabled={!iframeUrl}
                >
                  🔄 Try Again
                </DeviceButton>
              </ErrorMessage>
            )}
            
            {/* Initialization message */}
            {src2Status !== 'ready' && (
              <ErrorMessage>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                <div style={{ fontSize: '18px', marginBottom: '8px' }}>
                  {src2Status === 'initializing' ? 'Initializing...' : 'Session Not Ready'}
                </div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>
                  {src2Status === 'initializing' 
                    ? 'Setting up editor environment...' 
                    : 'Waiting for session to initialize'
                  }
                </div>
              </ErrorMessage>
            )}
            
            {/* No session message */}
            {!currentSession && src2Status === 'ready' && (
              <ErrorMessage>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
                <div style={{ fontSize: '18px', marginBottom: '8px' }}>
                  No Active Session
                </div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>
                  Create a session to preview your mobile app
                </div>
              </ErrorMessage>
            )}
            
            {/* Main iframe */}
            {iframeUrl && !error && (
              <MobileIframe
                ref={iframeRef}
                src={iframeUrl}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                title="Mobile App Preview"
                sandbox="allow-scripts allow-same-origin allow-forms"
                allow="accelerometer; camera; encrypted-media; gyroscope; picture-in-picture"
              />
            )}
          </IframeContainer>
        </PhoneScreen>
      </PhoneFrame>
    </PhoneContainer>
  );
};

export default IframePhoneFrame;
