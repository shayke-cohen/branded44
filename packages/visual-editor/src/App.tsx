import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MultiBackend } from 'react-dnd-multi-backend';

// Core services
import { EditorProvider, useEditor } from './contexts/EditorContext';
import { SocketProvider } from './contexts/SocketContext';
import { SessionProvider } from './contexts/SessionContext';

// Main components
import Header from './components/Header/Header';
import ComponentPalette from './components/ComponentPalette/ComponentPalette';
import SimplifiedPhoneFrame from './components/PhoneFrame/SimplifiedPhoneFrame';
import PropertyPanel from './components/PropertyPanel/PropertyPanel';
import StatusBar from './components/StatusBar/StatusBar';

// Services
import { Src2Manager } from './services/Src2Manager';
import { fileWatcher } from './services/FileWatcher';

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

// Inner component that uses the editor context
const AppContent: React.FC = () => {
  const { state, setSrc2Status, updateFileTree } = useEditor();
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [src2Manager] = useState(() => new Src2Manager());
  const isUnmountingRef = useRef(false);

  useEffect(() => {
    const initializeEditor = async () => {
      // Declare timeout outside try block so it's accessible in catch
      let initializationTimeout: NodeJS.Timeout | null = null;
      
      try {
        isUnmountingRef.current = false; // Reset unmounting flag
        console.log('🎨 [Visual Editor] Initializing editor environment...');
        setSrc2Status('initializing');

        // Add a timeout to prevent hanging indefinitely
        initializationTimeout = setTimeout(() => {
          console.warn('⚠️ [Visual Editor] Initialization taking too long, forcing completion...');
          setSrc2Status('ready');
          setIsInitializing(false);
        }, 15000) as unknown as NodeJS.Timeout; // 15 second timeout
        
        // Initialize src2 environment
        await src2Manager.initializeEditingEnvironment();
        
        // Connect file watcher (with fallback if it fails)
        console.log('👁️ [Visual Editor] Connecting file watcher...');
        try {
          await fileWatcher.connect();
          console.log('✅ [Visual Editor] File watcher connected successfully');
        } catch (fileWatcherError) {
          console.warn('⚠️ [Visual Editor] File watcher connection failed, continuing without it:', fileWatcherError);
          // Continue initialization even if file watcher fails
        }
        
        // File watching for Simple Real App approach
        // Note: With iframe-based rendering, file changes are handled automatically
        // by the backend server serving updated files. No complex DOM manipulation needed.
        console.log('📁 [Visual Editor] Simple file watching setup - iframe handles updates automatically');
        
        console.log('🎨 [Visual Editor] Editor environment initialized successfully');
        console.log('🎨 [Visual Editor] Setting src2Status to ready and isInitializing to false');
        
        // Clear the timeout since initialization completed successfully
        if (initializationTimeout) {
          clearTimeout(initializationTimeout);
        }
        
        setSrc2Status('ready'); // Mark session as ready
        setIsInitializing(false);
        
        // Load file tree when session is ready
        try {
          console.log('📁 [Visual Editor] Loading file tree...');
          const src2Manager = new Src2Manager();
          const fileTree = await src2Manager.getFileTree();
          updateFileTree(fileTree);
          console.log('✅ [Visual Editor] File tree loaded:', fileTree.length, 'items');
        } catch (treeError) {
          console.warn('⚠️ [Visual Editor] Failed to load file tree:', treeError);
          // Don't fail the entire initialization just because file tree failed
        }
      } catch (err) {
        console.error('🎨 [Visual Editor] Failed to initialize editor:', err);
        
        // Clear the timeout since initialization failed
        if (initializationTimeout) {
          clearTimeout(initializationTimeout);
        }
        
        // Check if it's a timeout error - if so, continue with fallback instead of error state
        console.log('🎨 [Visual Editor] Error details for timeout detection:', {
          message: (err as any).message,
          code: (err as any).code,
          name: (err as any).name,
          isError: err instanceof Error
        });
        
        const isTimeoutError = err instanceof Error && (
          err.message.includes('timeout') || 
          err.message.includes('ECONNABORTED') ||
          (err as any).code === 'ECONNABORTED'
        );
        
        console.log('🎨 [Visual Editor] Is timeout error?', isTimeoutError);
        
        if (isTimeoutError) {
          console.log('🎨 [Visual Editor] Server timeout detected, continuing with fallback session...');
          console.log('🎨 [Visual Editor] Setting src2Status to ready and isInitializing to false (fallback mode)');
          setSrc2Status('ready'); // Continue as if initialization succeeded
          setIsInitializing(false);
          
          // Try to load file tree even in fallback mode
          try {
            console.log('📁 [Visual Editor] Loading file tree in fallback mode...');
            const src2Manager = new Src2Manager();
            const fileTree = await src2Manager.getFileTree();
            updateFileTree(fileTree);
            console.log('✅ [Visual Editor] File tree loaded in fallback mode:', fileTree.length, 'items');
          } catch (treeError) {
            console.warn('⚠️ [Visual Editor] Failed to load file tree in fallback mode:', treeError);
          }
          // Don't set error state for timeout - let fallback session handle it
        } else {
          console.log('🎨 [Visual Editor] Setting src2Status to error and isInitializing to false due to non-timeout error');
          setSrc2Status('error');
          setError(err instanceof Error ? err.message : 'Failed to initialize editor');
          setIsInitializing(false);
        }
      }
    };

    initializeEditor();

    // Cleanup on unmount
    return () => {
      isUnmountingRef.current = true;
      // Add a small delay to prevent cleanup during React's development mode re-renders
      setTimeout(() => {
        if (isUnmountingRef.current) {
          console.log('🧹 [Visual Editor] Component unmounting, cleaning up...');
          fileWatcher.destroy();
          src2Manager.cleanupEditingEnvironment().catch(console.error);
        }
      }, 100);
    };
  }, []); // Empty dependency array - setSrc2Status is not stable, causes infinite loop

  const handleRetry = () => {
    setError(null);
    setIsInitializing(true);
    // Re-run initialization
    window.location.reload();
  };

  if (error) {
    return (
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
    );
  }

  return (
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
          <SimplifiedPhoneFrame src2Status={state.src2Status} />
        </CenterPanel>
        <PropertyPanel />
      </EditorContent>
      <StatusBar />
    </AppContainer>
  );
};

// Main App component that provides the context
const App: React.FC = () => {
  return (
    <SessionProvider>
      <DndProvider backend={MultiBackend} options={HTML5toTouch}>
        <SocketProvider>
          <EditorProvider>
            <AppContent />
          </EditorProvider>
        </SocketProvider>
      </DndProvider>
    </SessionProvider>
  );
};

export default App;
