import React, { useRef, useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useEditor } from '../../contexts/EditorContext';
import { liveRenderer } from '../../services/LiveRenderer.v2';
import { useAppLoaderV2 } from '../../services/AppLoader.v2';
import { componentInspector, InspectableComponent } from '../../services/ComponentInspector';
import { dropZoneManager } from '../../services/DropZoneManager';

// Error Boundary Component to handle removeChild errors gracefully
class PhoneFrameErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Only log if it's not a DOM manipulation error (which we expect and handle)
    const errorMessage = error.message || '';
    if (!errorMessage.includes('removeChild') && !errorMessage.includes('insertBefore') && !errorMessage.includes('Target container is not a DOM element')) {
      console.error('🚨 [PhoneFrame] Error caught by boundary:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Auto-recover from DOM manipulation errors
      const errorMessage = this.state.error?.message || '';
      if (errorMessage.includes('removeChild') || errorMessage.includes('insertBefore') || errorMessage.includes('Target container is not a DOM element')) {
        console.log('🔄 [PhoneFrameErrorBoundary] Auto-recovering from DOM error:', errorMessage.substring(0, 50));
        // Reset error state after a brief delay to allow DOM to stabilize
        setTimeout(() => {
          if (this.state.hasError) {
            this.setState({ hasError: false, error: undefined });
          }
        }, 50);
        return this.props.children;
      }
      
      return (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          color: '#666',
          fontSize: '14px'
        }}>
          <div>⚠️ Render Error</div>
          <div style={{ fontSize: '12px', marginTop: '8px' }}>
            {this.state.error?.message || 'Unknown error'}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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

const BuildStatusOverlay = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 999;
  backdrop-filter: blur(4px);
  text-align: center;
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

interface PhoneFrameProps {
  src2Status?: 'initializing' | 'ready' | 'error';
}

const PhoneFrameComponent: React.FC<PhoneFrameProps> = ({ src2Status }) => {
  const { state, selectComponent } = useEditor();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use the new app loader only when src2 is ready
  const shouldLoadApp = src2Status === 'ready';
  const { app: sessionApp, loading: appLoading, error: appError, sessionInfo, buildStatus, isBuildLoading } = useAppLoaderV2(shouldLoadApp);
  const [deviceType, setDeviceType] = useState<'iphone' | 'android'>('iphone');
  const [zoom, setZoom] = useState(1);
  const [isInspecting, setIsInspecting] = useState(false);
  const appContentRef = useRef<HTMLDivElement>(null);
  const sessionAppRootRef = useRef<any>(null);
  const isRenderingRef = useRef<boolean>(false);
  const renderTimeoutRef = useRef<number | null>(null);

  // Set up the LiveRenderer container when component mounts
  useEffect(() => {
    if (appContentRef.current) {
      liveRenderer.setContainer(appContentRef.current);
      console.log('📱 [PhoneFrame] LiveRenderer container set');
    }
    
    // Cleanup function
    return () => {
      if (sessionAppRootRef.current) {
        try {
          // Use setTimeout to avoid synchronous unmount during render
          const rootToCleanup = sessionAppRootRef.current;
          sessionAppRootRef.current = null;
          setTimeout(() => {
            try {
              rootToCleanup.unmount();
              console.log('🧹 [PhoneFrame] Cleaned up session app root');
            } catch (error) {
              console.warn('⚠️ [PhoneFrame] Error during delayed cleanup:', error);
            }
          }, 0);
        } catch (error) {
          console.warn('⚠️ [PhoneFrame] Error cleaning up session app root:', error);
        }
      }
    };
  }, []);

  // Handle rendering the main app
  const handleRenderApp = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await liveRenderer.renderApp({ deviceType });
      // selectComponent(null) removed to prevent potential infinite loop - let the useEffect handle selection logic
      console.log('✅ [PhoneFrame] Successfully rendered main app');
    } catch (err: any) {
      setError(err.message);
      console.error('❌ [PhoneFrame] Failed to render main app:', err);
    } finally {
      setIsLoading(false);
    }
  };

    const handleRenderSessionApp = useCallback(async () => {
    if (!sessionApp || isRenderingRef.current) return;

    isRenderingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // Render the session app directly
      const React = require('react');
      const ReactDOM = require('react-dom/client');

      // Get the main container
      const mainContainer = appContentRef.current;
      if (!mainContainer || !mainContainer.isConnected) {
        console.warn('⚠️ [PhoneFrame] Main container not available or not connected to DOM');
        return;
      }

      // Instead of unmounting, create a fresh container div each time
      // This completely avoids removeChild errors
      console.log('🔧 [PhoneFrame] Creating fresh container for session app...');
      
      // Clear the main container
      mainContainer.innerHTML = '';
      
      // Create a new div container for this render
      const newContainer = document.createElement('div');
      newContainer.style.width = '100%';
      newContainer.style.height = '100%';
      mainContainer.appendChild(newContainer);
      
      // Clean up any existing root reference (but don't unmount it)
      if (sessionAppRootRef.current) {
        console.log('🧹 [PhoneFrame] Clearing old root reference (no unmount)');
        sessionAppRootRef.current = null;
      }
      
      // Create and store the new root on the fresh container
      console.log('🔧 [PhoneFrame] Creating new React root on fresh container...');
      sessionAppRootRef.current = ReactDOM.createRoot(newContainer);
      sessionAppRootRef.current.render(React.createElement(sessionApp));
      console.log('✅ [PhoneFrame] Created new root and rendered session app');
      
    } catch (err: any) {
      setError(err.message);
      console.error('❌ [PhoneFrame] Failed to render session app:', err);
      // Clean up on error by clearing the container
      if (appContentRef.current) {
        appContentRef.current.innerHTML = '';
      }
      sessionAppRootRef.current = null;
    } finally {
      setIsLoading(false);
      isRenderingRef.current = false;
    }
  }, [sessionApp]);

    // Cleanup effect to prevent renders during unmount
  useEffect(() => {
    return () => {
      isRenderingRef.current = false;
      
      // Clear any pending render timeouts
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
        renderTimeoutRef.current = null;
      }
      
      // Clean up by clearing the container instead of unmounting React root
      // This avoids removeChild errors during component unmount
      if (appContentRef.current) {
        try {
          appContentRef.current.innerHTML = '';
          console.log('🧹 [PhoneFrame] Cleared container during cleanup');
        } catch (error) {
          console.warn('⚠️ [PhoneFrame] Error during container cleanup:', error);
        }
      }
      
      // Clear the root reference without unmounting
      sessionAppRootRef.current = null;
    };
  }, []);

  // Consolidated render effect - handles both session app and component rendering
  useEffect(() => {
    // Prevent concurrent renders
    if (isRenderingRef.current) return;
    
    if (state.selectedComponent) {
      // Render selected component
      setIsLoading(true);
      setError(null);

      liveRenderer
        .renderComponent(state.selectedComponent, { deviceType })
        .then(() => {
          if (!isRenderingRef.current) { // Check if component is still mounted
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error('❌ [PhoneFrame] Failed to render component:', err);
          if (!isRenderingRef.current) { // Check if component is still mounted
            setError(err.message);
            setIsLoading(false);
          }
        });
    } else {
      // Clear renderer when no component selected
      liveRenderer.clear();
      setError(null);
      setIsLoading(false);

      // Auto-render session app when no component is selected
      // Add more defensive checks and debouncing
      if (sessionApp && !appLoading && !appError && !isLoading && appContentRef.current?.isConnected) {
        // Clear any existing timeout
        if (renderTimeoutRef.current) {
          clearTimeout(renderTimeoutRef.current);
        }
        
        // Debounce the render to prevent rapid re-renders
        renderTimeoutRef.current = setTimeout(() => {
          console.log('📱 [PhoneFrame] Auto-rendering session app (debounced)');
          handleRenderSessionApp();
        }, 100);
      }
    }
  }, [sessionApp, appLoading, appError, state.selectedComponent, isLoading, deviceType, handleRenderSessionApp]);



  // Handle component selection from inspector
  const handleComponentSelect = (component: InspectableComponent) => {
    console.log('📱 [PhoneFrame] Component selected via inspector:', component);
    selectComponent(component.id);
    setIsInspecting(false);
    
    // Stop inspection mode
    if (appContentRef.current) {
      componentInspector.stopInspection(appContentRef.current);
    }
    
    // Keep the Properties panel focused on the selected component
    console.log('📱 [PhoneFrame] Component selected - Properties panel will show details for:', component.id);
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

  // Handle component drop
  const handleComponentDrop = (componentType: string, data: any) => {
    console.log('📱 [PhoneFrame] Component dropped:', { componentType, data });
    
    // Select the dropped component
    selectComponent(componentType);
    
    // Render the component in the LiveRenderer
    liveRenderer.renderComponent(componentType, { deviceType })
      .then(() => {
        console.log('📱 [PhoneFrame] Dropped component rendered successfully');
      })
      .catch((err) => {
        console.error('❌ [PhoneFrame] Failed to render dropped component:', err);
        setError(err.message);
      });
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

      console.log('📱 [PhoneFrame] Drop zone registered');

      return () => {
        // Cleanup drop zone on unmount
        dropZoneManager.unregisterDropZone('phone-frame');
        console.log('📱 [PhoneFrame] Drop zone unregistered');
      };
    }
  }, [deviceType]); // Re-register when device type changes

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
              title="Render the main App.tsx from src2"
              disabled={isLoading}
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
            {isLoading && (
              <LoadingOverlay>
                <LoadingSpinner />
                <div>Loading {state.currentScreen}...</div>
              </LoadingOverlay>
            )}
            
            {/* Build status indicator */}
            {(isBuildLoading || (buildStatus && buildStatus.startsWith('❌'))) && (
              <BuildStatusOverlay>
                {isBuildLoading && <LoadingSpinner />}
                <div style={{ 
                  fontSize: '14px', 
                  marginTop: isBuildLoading ? '8px' : '0',
                  color: buildStatus?.startsWith('❌') ? '#dc3545' : buildStatus?.startsWith('✅') ? '#28a745' : '#007bff'
                }}>
                  {buildStatus || 'Preparing build...'}
                </div>
              </BuildStatusOverlay>
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
              <PlaceholderContent key="placeholder-content">
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

// Wrap with Error Boundary to handle removeChild errors
const PhoneFrameWithErrorBoundary: React.FC<PhoneFrameProps> = (props) => {
  return (
    <PhoneFrameErrorBoundary>
      <PhoneFrameComponent {...props} />
    </PhoneFrameErrorBoundary>
  );
};

export default PhoneFrameWithErrorBoundary;
