import React, { useState, useEffect } from 'react';

interface Session {
  sessionId: string;
  workspacePath: string;
  sessionPath: string;
  created?: string;
  lastModified?: string;
}

interface SessionSelectorProps {
  currentSession: Session | null;
  onSessionChange: (session: Session) => void;
}

const SessionSelector: React.FC<SessionSelectorProps> = ({ 
  currentSession, 
  onSessionChange 
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available sessions
  const loadSessions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/editor/sessions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.sessions) {
        setSessions(data.sessions);
        console.log('📁 [SessionSelector] Loaded', data.sessions.length, 'sessions');
      } else {
        throw new Error(data.error || 'Failed to load sessions');
      }
    } catch (error) {
      console.error('📁 [SessionSelector] Error loading sessions:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Load sessions on component mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Handle session selection
  const handleSessionSelect = (session: Session) => {
    console.log('📁 [SessionSelector] Switching to session:', session.sessionId);
    onSessionChange(session);
    setIsOpen(false);
  };

  // Create new session (force creation of a new session)
  const handleCreateSession = async () => {
    setLoading(true);
    try {
      console.log('📁 [SessionSelector] Forcing creation of new session...');
      
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
        const newSession: Session = {
          sessionId: data.sessionId,
          workspacePath: data.data?.workspacePath || '',
          sessionPath: data.data?.sessionPath || '',
          startTime: Date.now(),
          age: 0,
          created: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };
        
        // Save the new session to localStorage
        localStorage.setItem('visual-editor-session-id', newSession.sessionId);
        
        // Update sessions list
        setSessions(prev => [newSession, ...prev]);
        
        // The session change will happen via page reload, which Src2Manager will handle
        console.log('✅ [SessionSelector] Created new session:', data.sessionId);
        console.log('📁 [SessionSelector] Reloading page to switch to new session...');
        
        // Trigger page reload to initialize with new session
        window.location.reload();
      }
    } catch (error) {
      console.error('❌ [SessionSelector] Error creating session:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Format session ID for display
  const formatSessionId = (sessionId: string) => {
    const parts = sessionId.split('-');
    if (parts.length >= 2) {
      const timestamp = new Date(parseInt(parts[1]));
      const shortId = parts[2] || 'unknown'; // Take full random ID part, don't truncate
      return `Session ${shortId}`;
    }
    return `Session ${sessionId.slice(-12)}`; // Fallback to last 12 chars for full display
  };

  // Format session display with timestamp for dropdown
  const formatSessionWithTime = (sessionId: string) => {
    const parts = sessionId.split('-');
    if (parts.length >= 2) {
      const timestamp = new Date(parseInt(parts[1]));
      const shortId = parts[2] || 'unknown'; // Take full random ID part, don't truncate
      const timeStr = timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString();
      return `Session ${shortId} (${timeStr})`;
    }
    return `Session ${sessionId.slice(-12)}`; // Fallback to last 12 chars for full display
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.label}>Session:</span>
        <button
          style={styles.currentSessionButton}
          onClick={() => setIsOpen(!isOpen)}
          disabled={loading}
        >
          {currentSession ? (
            <span style={styles.sessionInfo}>
              <span style={styles.sessionId}>
                {formatSessionId(currentSession.sessionId)}
              </span>
              <span style={styles.sessionStatus}>
                🟢 Active
              </span>
            </span>
          ) : (
            <span style={styles.noSession}>
              {loading ? 'Loading...' : 'No Active Session'}
            </span>
          )}
          <span style={styles.dropdownArrow}>
            {isOpen ? '▲' : '▼'}
          </span>
        </button>
      </div>

      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <button
              style={styles.createButton}
              onClick={handleCreateSession}
              disabled={loading}
            >
              {loading ? '⏳ Creating...' : '➕ New Session'}
            </button>
            <button
              style={styles.refreshButton}
              onClick={loadSessions}
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>

          {error && (
            <div style={styles.error}>
              ❌ {error}
            </div>
          )}

          <div style={styles.sessionsList}>
            {loading ? (
              <div style={styles.loadingState}>Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <div style={styles.emptyState}>No sessions found</div>
            ) : (
              sessions.map(session => (
                <div
                  key={session.sessionId}
                  style={{
                    ...styles.sessionItem,
                    ...(currentSession?.sessionId === session.sessionId 
                      ? styles.sessionItemActive 
                      : {})
                  }}
                  onClick={() => handleSessionSelect(session)}
                >
                  <div style={styles.sessionItemHeader}>
                    <span style={styles.sessionItemId}>
                      {formatSessionWithTime(session.sessionId)}
                    </span>
                    {currentSession?.sessionId === session.sessionId && (
                      <span style={styles.activeIndicator}>✓</span>
                    )}
                  </div>
                  <div style={styles.sessionItemPath}>
                    📁 {session.workspacePath || session.sessionPath || 'Unknown path'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: 'relative' as const,
    minWidth: '320px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold' as const,
    color: '#333',
  },
  currentSessionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    background: '#fff',
    border: '2px solid #e1e5e9',
    borderRadius: '6px',
    cursor: 'pointer',
    minWidth: '280px',
    fontSize: '13px',
    transition: 'all 0.2s ease',
  },
  sessionInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: '2px',
  },
  sessionId: {
    fontWeight: '600' as const,
    color: '#2c3e50',
  },
  sessionStatus: {
    fontSize: '11px',
    color: '#27ae60',
  },
  noSession: {
    color: '#7f8c8d',
    fontStyle: 'italic' as const,
  },
  dropdownArrow: {
    marginLeft: '8px',
    fontSize: '12px',
    color: '#666',
  },
  dropdown: {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    background: '#fff',
    border: '1px solid #e1e5e9',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 1000,
    marginTop: '4px',
  },
  dropdownHeader: {
    display: 'flex',
    gap: '8px',
    padding: '12px',
    borderBottom: '1px solid #e1e5e9',
  },
  createButton: {
    flex: 1,
    padding: '8px 12px',
    background: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600' as const,
  },
  refreshButton: {
    padding: '8px 12px',
    background: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  error: {
    padding: '8px 12px',
    background: '#fee',
    color: '#c0392b',
    fontSize: '12px',
    borderBottom: '1px solid #e1e5e9',
  },
  sessionsList: {
    maxHeight: '300px',
    overflowY: 'auto' as const,
  },
  loadingState: {
    padding: '20px',
    textAlign: 'center' as const,
    color: '#7f8c8d',
    fontSize: '13px',
  },
  emptyState: {
    padding: '20px',
    textAlign: 'center' as const,
    color: '#7f8c8d',
    fontSize: '13px',
  },
  sessionItem: {
    padding: '12px',
    cursor: 'pointer',
    borderBottom: '1px solid #f8f9fa',
    transition: 'background-color 0.15s ease',
    ':hover': {
      backgroundColor: '#f8f9fa',
    },
  },
  sessionItemActive: {
    backgroundColor: '#e8f4fd',
    borderLeft: '3px solid #3498db',
  },
  sessionItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  sessionItemId: {
    fontSize: '13px',
    fontWeight: '600' as const,
    color: '#2c3e50',
  },
  activeIndicator: {
    color: '#3498db',
    fontSize: '14px',
    fontWeight: 'bold' as const,
  },
  sessionItemPath: {
    fontSize: '11px',
    color: '#7f8c8d',
    fontFamily: 'monospace',
  },
};

export default SessionSelector;
