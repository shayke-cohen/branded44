import React from 'react';
import styled from 'styled-components';
import { useEditor } from '../../contexts/EditorContext';
import { useSocket } from '../../contexts/SocketContext';

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

const ScreenSelector = styled.select`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  min-width: 150px;

  option {
    background: #333;
    color: white;
  }

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

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

// Mock screen options - will be replaced with actual screen registry
const SCREEN_OPTIONS = [
  { id: 'HomeScreen', name: 'Home Screen' },
  { id: 'ComponentsShowcaseScreen', name: 'Components Showcase' },
  { id: 'TemplateIndexScreen', name: 'Template Index' },
  { id: 'SettingsScreen', name: 'Settings' },
];

const Header: React.FC = () => {
  const { state, toggleInspection, setCurrentScreen } = useEditor();
  const { isConnected, connectionError } = useSocket();

  const handleScreenChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentScreen(event.target.value);
  };

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

  return (
    <HeaderContainer>
      <LeftSection>
        <Logo>
          🎨 Branded44 Visual Editor
        </Logo>
        <ScreenSelector 
          value={state.currentScreen || ''} 
          onChange={handleScreenChange}
        >
          <option value="">Select Screen...</option>
          {SCREEN_OPTIONS.map(screen => (
            <option key={screen.id} value={screen.id}>
              {screen.name}
            </option>
          ))}
        </ScreenSelector>
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
        
        <ActionButton disabled={state.src2Status !== 'ready'}>
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
  );
};

export default Header;
