import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { aggressiveReloadManager } from '../../services/AggressiveReloadManager';

const PanelContainer = styled.div`
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PanelTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const ToggleLabel = styled.label`
  font-size: 13px;
  color: #666;
  flex: 1;
`;

const ToggleSwitch = styled.button<{ $enabled: boolean }>`
  width: 40px;
  height: 20px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s;
  background-color: ${props => props.$enabled ? '#4CAF50' : '#ccc'};

  &::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: ${props => props.$enabled ? '22px' : '2px'};
    transition: left 0.2s;
  }
`;

const StatsContainer = styled.div`
  font-size: 12px;
  color: #666;
  background: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
  margin-top: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;

  &:hover {
    background: #f5f5f5;
  }

  &.primary {
    background: #007bff;
    color: white;
    border-color: #007bff;

    &:hover {
      background: #0056b3;
    }
  }
`;

const ConfigRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const ConfigInput = styled.input`
  width: 60px;
  padding: 4px 6px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 12px;
`;

export const AggressiveReloadPanel: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [debounceMs, setDebounceMs] = useState(300);

  // Load initial state
  useEffect(() => {
    const updateStats = () => {
      const currentStats = aggressiveReloadManager.getStats();
      setStats(currentStats);
      setEnabled(currentStats.enabled);
      setDebounceMs(currentStats.config.debounceMs);
    };

    updateStats();
    
    // Update stats every second
    const interval = setInterval(updateStats, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleToggleEnabled = () => {
    const newEnabled = !enabled;
    aggressiveReloadManager.setEnabled(newEnabled);
    setEnabled(newEnabled);
  };

  const handleDebounceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setDebounceMs(value);
    aggressiveReloadManager.updateConfig({ debounceMs: value });
  };

  const handleManualReload = () => {
    aggressiveReloadManager.triggerReload('manual-ui-trigger');
  };

  const handleClearCache = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('session:clear-cache', {
        detail: { timestamp: Date.now(), manual: true }
      }));
    }
  };

  const handleTestFileChange = () => {
    if (typeof window !== 'undefined') {
      console.log('🧪 [AggressiveReloadPanel] Testing file change event...');
      (window as any).__DEBUG_FILE_WATCHER__?.testFileChange('test/manual-test.tsx');
    }
  };

  const handleTestSessionLoading = () => {
    if (typeof window !== 'undefined') {
      console.log('🔍 [AggressiveReloadPanel] Testing session loading...');
      (window as any).__DEBUG_SESSION__?.testAll();
    }
  };

  const handleToggleVerboseLogging = () => {
    const newVerbose = !stats.config?.logVerbose;
    aggressiveReloadManager.updateConfig({ logVerbose: newVerbose });
  };

  return (
    <PanelContainer>
      <PanelTitle>
        🔥 Aggressive Reload
      </PanelTitle>

      <ToggleContainer>
        <ToggleLabel>
          Auto-reload app on ANY file change
        </ToggleLabel>
        <ToggleSwitch 
          $enabled={enabled} 
          onClick={handleToggleEnabled}
          title={enabled ? 'Disable aggressive reload' : 'Enable aggressive reload'}
        />
      </ToggleContainer>

      {enabled && (
        <>
          <ConfigRow>
            <span style={{ fontSize: '12px', color: '#666' }}>Debounce (ms):</span>
            <ConfigInput
              type="number"
              value={debounceMs}
              onChange={handleDebounceChange}
              min="0"
              max="5000"
              title="Wait time before triggering reload after file changes"
            />
          </ConfigRow>

          <ConfigRow>
            <span style={{ fontSize: '12px', color: '#666' }}>Verbose logging:</span>
            <ToggleSwitch 
              $enabled={stats.config?.logVerbose || false}
              onClick={handleToggleVerboseLogging}
              style={{ width: '30px', height: '16px' }}
            />
          </ConfigRow>

          <StatsContainer>
            <div><strong>Status:</strong> {enabled ? '🟢 Active' : '🔴 Disabled'}</div>
            <div><strong>Pending reloads:</strong> {stats.pendingReloads || 0}</div>
            <div><strong>Debounce:</strong> {stats.config?.debounceMs || 0}ms</div>
            <div><strong>Include patterns:</strong> {stats.config?.includePatterns?.length || 0}</div>
            <div><strong>Exclude patterns:</strong> {stats.config?.excludePatterns?.length || 0}</div>
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#888' }}>
              <strong>Debug:</strong> Open browser console to see event logs
            </div>
          </StatsContainer>

          <ButtonGroup>
            <ActionButton 
              className="primary" 
              onClick={handleManualReload}
              title="Manually trigger app reload"
            >
              🔄 Reload Now
            </ActionButton>
            <ActionButton 
              onClick={handleClearCache}
              title="Clear module cache"
            >
              🧹 Clear Cache
            </ActionButton>
            <ActionButton 
              onClick={handleTestFileChange}
              title="Test file change event for debugging"
            >
              🧪 Test Event
            </ActionButton>
            <ActionButton 
              onClick={handleTestSessionLoading}
              title="Test session workspace file loading"
            >
              🔍 Test Session
            </ActionButton>
          </ButtonGroup>
        </>
      )}

      {!enabled && (
        <div style={{ 
          fontSize: '12px', 
          color: '#666', 
          fontStyle: 'italic',
          marginTop: '8px'
        }}>
          Enable to automatically reload the app whenever any file in the session changes.
          This provides immediate feedback but may impact performance.
        </div>
      )}
    </PanelContainer>
  );
};

export default AggressiveReloadPanel;
