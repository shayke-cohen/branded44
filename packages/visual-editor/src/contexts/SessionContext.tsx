import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Session {
  sessionId: string;
  workspacePath: string;
  sessionPath: string;
  startTime?: number;
  age?: number;
  created: string;
  lastModified: string;
}

interface SessionContextType {
  currentSession: Session | null;
  setCurrentSession: (session: Session | null) => void;
  switchToSession: (session: Session) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const SessionContext = createContext<SessionContextType | null>(null);

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load current session from window global or localStorage on mount
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 10; // Wait up to 10 seconds
    
    const loadCurrentSession = async () => {
      try {
        // First try to get from window global (active session from Src2Manager)
        const windowSession = (window as any).__VISUAL_EDITOR_SESSION__;
        if (windowSession && windowSession.sessionId) {
          console.log('📁 [SessionContext] Loaded current session from window:', windowSession.sessionId);
          if (mounted) {
            setCurrentSession({
              sessionId: windowSession.sessionId,
              workspacePath: windowSession.workspacePath,
              sessionPath: windowSession.sessionPath,
              created: new Date().toISOString(),
              lastModified: new Date().toISOString(),
            });
          }
          return;
        }

        // If no window session yet, wait for Src2Manager to finish (it might still be initializing)
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`📁 [SessionContext] Window session not ready, retrying ${retryCount}/${maxRetries}...`);
          setTimeout(loadCurrentSession, 1000); // Retry in 1 second
          return;
        }

        // After max retries, try localStorage as fallback
        const savedSessionId = localStorage.getItem('visual-editor-session-id');
        if (savedSessionId) {
          console.log('📁 [SessionContext] Found saved session ID, fetching details:', savedSessionId);
          if (mounted) {
            await fetchSessionDetails(savedSessionId);
          }
        } else {
          console.log('📁 [SessionContext] No current session found after retries');
          if (mounted) {
            setCurrentSession(null);
          }
        }
      } catch (error) {
        console.error('📁 [SessionContext] Error loading current session:', error);
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Unknown error');
        }
      }
    };

    // Start loading immediately
    loadCurrentSession();
    
    // Also listen for changes to window session (when Src2Manager finishes)
    const handleStorageChange = () => {
      console.log('📁 [SessionContext] Storage changed, reloading session...');
      loadCurrentSession();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event listener for when Src2Manager finishes
    const handleSessionReady = (event: CustomEvent) => {
      console.log('📁 [SessionContext] Received session ready event:', event.detail);
      loadCurrentSession();
    };
    
    window.addEventListener('visual-editor-session-ready', handleSessionReady as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('visual-editor-session-ready', handleSessionReady as EventListener);
    };
  }, []);

  // Fetch session details by ID
  const fetchSessionDetails = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:3001/api/editor/sessions/${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch session: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.session) {
        const session: Session = {
          sessionId: data.session.sessionId,
          workspacePath: data.session.workspacePath,
          sessionPath: data.session.sessionPath,
          startTime: data.session.startTime,
          age: data.session.age,
          created: new Date(data.session.startTime).toISOString(),
          lastModified: new Date(data.session.startTime).toISOString(),
        };
        setCurrentSession(session);
        console.log('📁 [SessionContext] Loaded session details:', session.sessionId);
      }
    } catch (error) {
      console.error('📁 [SessionContext] Error fetching session details:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to a different session
  const switchToSession = async (session: Session): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('📁 [SessionContext] Switching to session:', session.sessionId);

      // Save to localStorage (this will be picked up by Src2Manager on next init)
      localStorage.setItem('visual-editor-session-id', session.sessionId);
      console.log('📁 [SessionContext] Session saved to localStorage');

      // Update window global immediately
      (window as any).__VISUAL_EDITOR_SESSION__ = {
        sessionId: session.sessionId,
        workspacePath: session.workspacePath,
        sessionPath: session.sessionPath,
      };

      // Update state
      setCurrentSession(session);

      // Trigger a page reload to reinitialize with the new session
      // This ensures all components get the new session context
      console.log('📁 [SessionContext] Reloading page to switch to new session...');
      window.location.reload();

    } catch (error) {
      console.error('📁 [SessionContext] Error switching session:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const value: SessionContextType = {
    currentSession,
    setCurrentSession,
    switchToSession,
    isLoading,
    error,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
