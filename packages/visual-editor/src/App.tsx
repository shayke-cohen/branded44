import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MultiBackend } from 'react-dnd-multi-backend';

// Core services
import { EditorProvider } from './contexts/EditorContext';
import { SocketProvider } from './contexts/SocketContext';

// Main components
import Header from './components/Header/Header';
import ComponentPalette from './components/ComponentPalette/ComponentPalette';
import PhoneFrame from './components/PhoneFrame/PhoneFrame';
import PropertyPanel from './components/PropertyPanel/PropertyPanel';
import StatusBar from './components/StatusBar/StatusBar';

// Services
import { Src2Manager } from './services/Src2Manager';

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  overflow: hidden;
`;

const EditorContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const CenterPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #e8e8e8;
  position: relative;
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
  z-index: 1000;
`;

const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 2s linear infinite;
  margin-right: 16px;

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
`;

// Multi-backend options for drag and drop
const HTML5toTouch = {
  backends: [
    {
      id: 'html5',
      backend: HTML5Backend,
      transition: {
        dragDropManager: undefined,
      },
    },
    {
      id: 'touch',
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      preview: true,
      transition: {
        touchstart: (manager: any) => {
          return manager.getMonitor().isDragging();
        },
      },
    },
  ],
};

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [src2Manager] = useState(() => new Src2Manager());

  useEffect(() => {
    const initializeEditor = async () => {
      try {
        console.log('🎨 [Visual Editor] Initializing editor environment...');
        
        // Initialize src2 environment
        await src2Manager.initializeEditingEnvironment();
        
        console.log('🎨 [Visual Editor] Editor environment initialized successfully');
        setIsInitializing(false);
      } catch (err) {
        console.error('🎨 [Visual Editor] Failed to initialize editor:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize editor');
        setIsInitializing(false);
      }
    };

    initializeEditor();

    // Cleanup on unmount
    return () => {
      src2Manager.cleanupEditingEnvironment().catch(console.error);
    };
  }, [src2Manager]);

  const handleRetry = () => {
    setError(null);
    setIsInitializing(true);
    // Re-run initialization
    window.location.reload();
  };

  if (error) {
    return (
      <DndProvider backend={MultiBackend} options={HTML5toTouch}>
        <SocketProvider>
          <EditorProvider>
            <AppContainer>
              <Header />
              <ErrorMessage>
                <h3>❌ Initialization Error</h3>
                <p>{error}</p>
                <button 
                  onClick={handleRetry}
                  style={{
                    background: 'white',
                    color: '#ff6b6b',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                >
                  🔄 Retry
                </button>
              </ErrorMessage>
            </AppContainer>
          </EditorProvider>
        </SocketProvider>
      </DndProvider>
    );
  }

  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      <SocketProvider>
        <EditorProvider>
          <AppContainer>
            <Header />
            <EditorContent>
              <ComponentPalette />
              <CenterPanel>
                {isInitializing && (
                  <LoadingOverlay>
                    <LoadingSpinner />
                    <div>
                      <div>Initializing Visual Editor...</div>
                      <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                        Setting up src2 environment
                      </div>
                    </div>
                  </LoadingOverlay>
                )}
                <PhoneFrame />
              </CenterPanel>
              <PropertyPanel />
            </EditorContent>
            <StatusBar />
          </AppContainer>
        </EditorProvider>
      </SocketProvider>
    </DndProvider>
  );
};

export default App;
