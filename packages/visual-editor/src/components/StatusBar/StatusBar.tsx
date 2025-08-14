import React from 'react';
import styled from 'styled-components';
import { useEditor } from '../../contexts/EditorContext';
import { useSocket } from '../../contexts/SocketContext';

const StatusContainer = styled.div`
  height: 32px;
  background: #2c3e50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-size: 12px;
  border-top: 1px solid #34495e;
`;

const StatusLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatusRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatusIndicator = styled.div<{ $status: 'success' | 'warning' | 'error' | 'info' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    switch (props.$status) {
      case 'success': return '#2ecc71';
      case 'warning': return '#f1c40f';
      case 'error': return '#e74c3c';
      case 'info': return '#3498db';
      default: return '#95a5a6';
    }
  }};
`;

const ClickableStatus = styled.div`
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 3px;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const StatusBar: React.FC = () => {
  const { state } = useEditor();
  const { isConnected, connectionError } = useSocket();

  const getConnectionStatus = () => {
    if (connectionError) return 'error';
    return isConnected ? 'success' : 'warning';
  };

  const getConnectionText = () => {
    if (connectionError) return `Connection Error: ${connectionError}`;
    return isConnected ? 'Connected to Server' : 'Connecting...';
  };

  const getSrc2Status = () => {
    switch (state.src2Status) {
      case 'ready': return 'success';
      case 'initializing': return 'info';
      case 'error': return 'error';
      default: return 'warning';
    }
  };

  const getSrc2Text = () => {
    switch (state.src2Status) {
      case 'ready': return 'src2 Ready';
      case 'initializing': return 'Initializing src2...';
      case 'error': return 'src2 Error';
      default: return 'src2 Unknown';
    }
  };

  const getSelectedComponentText = () => {
    if (!state.selectedComponent) return 'No component selected';
    return `Selected: ${state.selectedComponent.name || state.selectedComponent.type}`;
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <StatusContainer>
      <StatusLeft>
        <StatusItem>
          <StatusIndicator $status={getConnectionStatus()} />
          <ClickableStatus title={getConnectionText()}>
            {isConnected ? '🔗 Connected' : '⚠️ Disconnected'}
          </ClickableStatus>
        </StatusItem>

        <StatusItem>
          <StatusIndicator $status={getSrc2Status()} />
          <span>{getSrc2Text()}</span>
        </StatusItem>

        <StatusItem>
          <span>{getSelectedComponentText()}</span>
        </StatusItem>

        {state.currentScreen && (
          <StatusItem>
            <span>📱 {state.currentScreen}</span>
          </StatusItem>
        )}

        {state.isDragging && (
          <StatusItem>
            <span>🎯 Dragging component...</span>
          </StatusItem>
        )}

        {state.isInspecting && (
          <StatusItem>
            <StatusIndicator $status="info" />
            <span>🔍 Inspection Mode</span>
          </StatusItem>
        )}
      </StatusLeft>

      <StatusRight>
        <StatusItem>
          <span>Files: {state.openFiles.length}</span>
        </StatusItem>

        <StatusItem>
          <span>Components: {state.componentTree.length}</span>
        </StatusItem>

        <StatusItem>
          <span>{getCurrentTime()}</span>
        </StatusItem>

        <ClickableStatus
          title="Visual Editor v1.0.0"
          onClick={() => {
            console.log('Visual Editor Status:', {
              version: '1.0.0',
              state,
              connection: { isConnected, connectionError },
              timestamp: new Date().toISOString(),
            });
          }}
        >
          v1.0.0
        </ClickableStatus>
      </StatusRight>
    </StatusContainer>
  );
};

export default StatusBar;
