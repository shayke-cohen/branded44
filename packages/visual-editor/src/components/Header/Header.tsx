import React, { useState } from 'react';
import styled from 'styled-components';
import { useEditor } from '../../contexts/EditorContext';
import { useSocket } from '../../contexts/SocketContext';
import { useSession } from '../../contexts/SessionContext';
import SessionSelector from '../SessionSelector';
import DeployProgress from '../DeployProgress';

// Navigation tabs are now handled in the left pane ScreenSelector

const HeaderContainer = styled.div`
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: relative;
  z-index: 100;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const Logo = styled.div`
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const NewAppButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Screen selector moved to left pane

const CenterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ActionButton = styled.button<{ $active?: boolean }>`
  background: ${props => props.$active ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
  }

  &:active {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatusIndicator = styled.div<{ $status: 'connected' | 'disconnected' | 'error' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  background: ${props => {
    switch (props.$status) {
      case 'connected': return 'rgba(46, 204, 113, 0.2)';
      case 'disconnected': return 'rgba(241, 196, 15, 0.2)';
      case 'error': return 'rgba(231, 76, 60, 0.2)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => {
      switch (props.$status) {
        case 'connected': return '#2ecc71';
        case 'disconnected': return '#f1c40f';
        case 'error': return '#e74c3c';
        default: return '#95a5a6';
      }
    }};
  }
`;

const Src2Status = styled.div<{ $status: 'initializing' | 'ready' | 'error' }>`
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  background: ${props => {
    switch (props.$status) {
      case 'ready': return 'rgba(46, 204, 113, 0.2)';
      case 'initializing': return 'rgba(52, 152, 219, 0.2)';
      case 'error': return 'rgba(231, 76, 60, 0.2)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'ready': return '#2ecc71';
      case 'initializing': return '#3498db';
      case 'error': return '#e74c3c';
      default: return 'white';
    }
  }};
`;

// Screen selection moved to left pane

const Header: React.FC = () => {
  const { state, toggleInspection } = useEditor();
  const { isConnected, connectionError } = useSocket();
  const { currentSession, switchToSession } = useSession();
  const [isCreatingSession, setIsCreatingSession] = React.useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);

  const getConnectionStatus = () => {
    if (connectionError) return 'error';
    return isConnected ? 'connected' : 'disconnected';
  };

  const getConnectionText = () => {
    if (connectionError) return 'Connection Error';
    return isConnected ? 'Connected' : 'Connecting...';
  };

  const getSrc2StatusText = () => {
    switch (state.src2Status) {
      case 'ready': return '🎨 Ready';
      case 'initializing': return '⏳ Initializing...';
      case 'error': return '❌ Error';
      default: return '⚪ Unknown';
    }
  };

  // Create new session/app
  const handleCreateNewApp = async () => {
    setIsCreatingSession(true);
    try {
      console.log('📁 [Header] Creating new app session...');
      
      // Clear localStorage to force creation of new session
      localStorage.removeItem('visual-editor-session-id');
      
      const response = await fetch('http://localhost:3001/api/editor/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forceNew: true }), // Indicate we want a new session
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.sessionId) {
        // Save the new session to localStorage
        localStorage.setItem('visual-editor-session-id', data.sessionId);
        
        console.log('✅ [Header] Created new app session:', data.sessionId);
        console.log('📁 [Header] Reloading page to switch to new session...');
        
        // Trigger page reload to initialize with new session
        window.location.reload();
      }
    } catch (error) {
      console.error('❌ [Header] Error creating new app session:', error);
      alert(`Failed to create new app: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingSession(false);
    }
  };

  return (
    <>
    <HeaderContainer>
      <LeftSection>
        <Logo>
          🎨 Branded44 Visual Editor
        </Logo>
        
        <NewAppButton
          onClick={handleCreateNewApp}
          disabled={isCreatingSession}
        >
          {isCreatingSession ? (
            <>
              <span>⏳</span>
              Creating...
            </>
          ) : (
            <>
              <span>✨</span>
              New App
            </>
          )}
        </NewAppButton>
        
        <SessionSelector
          currentSession={currentSession}
          onSessionChange={switchToSession}
        />
      </LeftSection>

      <CenterSection>
        <ActionButton
          $active={state.isInspecting}
          onClick={() => toggleInspection()}
          disabled={state.src2Status !== 'ready'}
        >
          🔍 {state.isInspecting ? 'Stop Inspecting' : 'Inspect'}
        </ActionButton>
        
        <ActionButton disabled={state.src2Status !== 'ready'}>
          💾 Save All
        </ActionButton>
        
        <ActionButton 
          disabled={state.src2Status !== 'ready' || !currentSession}
          onClick={() => setShowDeployModal(true)}
        >
          🚀 Deploy
        </ActionButton>
      </CenterSection>

      <RightSection>
        <Src2Status $status={state.src2Status}>
          {getSrc2StatusText()}
        </Src2Status>
        
        <StatusIndicator $status={getConnectionStatus()}>
          {getConnectionText()}
        </StatusIndicator>
      </RightSection>
    </HeaderContainer>
    
    <DeployProgress
      visible={showDeployModal}
      onClose={() => setShowDeployModal(false)}
      sessionId={currentSession?.sessionId || null}
    />
    </>
  );
};

export default Header;
