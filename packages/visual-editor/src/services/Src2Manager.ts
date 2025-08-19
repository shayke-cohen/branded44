import axios from 'axios';

export class Src2Manager {
  private serverUrl = 'http://localhost:3001';
  private sessionInfo: {
    sessionId: string;
    workspacePath: string;
    sessionPath: string;
  } | null = null;

  async initializeEditingEnvironment(): Promise<void> {
    try {
      console.log('📁 [Src2Manager] Initializing editing environment...');
      
      // First, check if there's already an active session stored locally
      const savedSessionId = localStorage.getItem('visual-editor-session-id');
      if (savedSessionId) {
        console.log('📁 [Src2Manager] Found saved session ID:', savedSessionId);
        
        try {
          // Try to use the existing session
          const existingSessionResponse = await axios.get(`${this.serverUrl}/api/editor/sessions`, {
            timeout: 5000,
          });
          
          if (existingSessionResponse.data.success && existingSessionResponse.data.sessions) {
            const existingSession = existingSessionResponse.data.sessions.find(
              (s: any) => s.sessionId === savedSessionId
            );
            
            if (existingSession) {
              console.log('✅ [Src2Manager] Using existing session:', savedSessionId);
              this.sessionInfo = {
                sessionId: existingSession.sessionId,
                workspacePath: existingSession.workspacePath,
                sessionPath: existingSession.sessionPath
              };
              
              // Make session info globally available
              (window as any).__VISUAL_EDITOR_SESSION__ = this.sessionInfo;
              console.log('📁 [Src2Manager] Existing session loaded successfully:', this.sessionInfo);
              
              // Notify other components that session is ready
              const event = new CustomEvent('visual-editor-session-ready', { 
                detail: { sessionId: this.sessionInfo.sessionId, type: 'existing' } 
              });
              window.dispatchEvent(event);
              
              return; // Use existing session, don't create new one
            } else {
              console.log('⚠️ [Src2Manager] Saved session not found on server, will create new one');
            }
          }
        } catch (error) {
          console.log('⚠️ [Src2Manager] Failed to check existing sessions:', error);
        }
      }
      
      // No existing session or failed to load existing, create a new one
      console.log('📁 [Src2Manager] Creating new session...');
      console.log('📁 [Src2Manager] Making request to:', `${this.serverUrl}/api/editor/init`);
      
      // Make API call to server to initialize src2 with timeout
      const response = await axios.post(`${this.serverUrl}/api/editor/init`, {
        action: 'initialize'
      }, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📁 [Src2Manager] Received response:', response.status, response.data);

      if (response.data.success) {
        // Store session information
        this.sessionInfo = {
          sessionId: response.data.sessionId,
          workspacePath: response.data.data.workspacePath,
          sessionPath: response.data.data.sessionPath
        };
        
        console.log('📁 [Src2Manager] Storing new session info:', this.sessionInfo);
        
        // Save session ID to localStorage for future use
        localStorage.setItem('visual-editor-session-id', this.sessionInfo.sessionId);
        
        // Make session info globally available for webpack resolution
        (window as any).__VISUAL_EDITOR_SESSION__ = this.sessionInfo;
        
        console.log('📁 [Src2Manager] Session info stored on window:', (window as any).__VISUAL_EDITOR_SESSION__);
        
        console.log('✅ [Src2Manager] New editing session created successfully', {
          sessionId: this.sessionInfo.sessionId,
          workspacePath: this.sessionInfo.workspacePath
        });
        
        // Notify other components that session is ready
        const event = new CustomEvent('visual-editor-session-ready', { 
          detail: { sessionId: this.sessionInfo.sessionId, type: 'new' } 
        });
        window.dispatchEvent(event);
      } else {
        throw new Error(response.data.error || 'Failed to initialize src2');
      }
    } catch (error) {
      console.error('📁 [Src2Manager] Failed to initialize editing environment:', error);
      console.log('📁 [Src2Manager] Error details:', {
        code: (error as any).code,
        message: (error as any).message,
        name: (error as any).name
      });
      
      // If server initialization fails, create a fallback session
      const isTimeoutError = (error as any).code === 'ECONNABORTED' || 
                            (error as any).message?.includes('timeout') ||
                            (error as any).message?.includes('ECONNABORTED');
      
      console.log('📁 [Src2Manager] Is timeout error?', isTimeoutError);
      
      if (isTimeoutError) {
        console.log('📁 [Src2Manager] Server timeout, creating fallback session...');
        
        // Create a fallback session info
        const fallbackSessionId = `fallback-${Date.now()}`;
        this.sessionInfo = {
          sessionId: fallbackSessionId,
          workspacePath: '/tmp/fallback-workspace',
          sessionPath: '/tmp/fallback-session'
        };
        
        console.log('📁 [Src2Manager] Created fallback session:', this.sessionInfo);
        
        // Make session info globally available
        (window as any).__VISUAL_EDITOR_SESSION__ = this.sessionInfo;
        
        console.log('📁 [Src2Manager] Fallback session stored on window:', (window as any).__VISUAL_EDITOR_SESSION__);
        
        // Don't throw the error, continue with fallback
        return;
      }
      
      // For non-timeout errors, still throw
      throw error;
    }
  }

  getSessionInfo() {
    return this.sessionInfo;
  }

  async cleanupEditingEnvironment(): Promise<void> {
    try {
      console.log('📁 [Src2Manager] Cleaning up editing environment...');

      // Make API call to server to cleanup src2
      const response = await axios.post(`${this.serverUrl}/api/editor/cleanup`, {
        action: 'cleanup'
      });

      if (response.data.success) {
        console.log('📁 [Src2Manager] Editing environment cleaned up successfully');
      } else {
        console.warn('📁 [Src2Manager] Cleanup warning:', response.data.error);
      }
    } catch (error) {
      console.error('📁 [Src2Manager] Failed to cleanup editing environment:', error);
      // Don't throw on cleanup errors
    }
  }

  async writeFile(relativePath: string, content: string): Promise<void> {
    try {
      console.log('📁 [Src2Manager] Writing file:', relativePath);

      // Make API call to server to write file
      const response = await axios.post(`${this.serverUrl}/api/editor/files/write`, {
        filePath: relativePath,
        content,
      });

      if (response.data.success) {
        console.log('📁 [Src2Manager] File written successfully:', relativePath);
      } else {
        throw new Error(response.data.error || 'Failed to write file');
      }
    } catch (error) {
      console.error('📁 [Src2Manager] Failed to write file:', error);
      throw error;
    }
  }

  async readFile(relativePath: string): Promise<string> {
    try {
      console.log('📁 [Src2Manager] Reading file:', relativePath);

      // Make API call to server to read file
      const response = await axios.get(`${this.serverUrl}/api/editor/files/read`, {
        params: { filePath: relativePath }
      });

      if (response.data.success) {
        return response.data.content;
      } else {
        throw new Error(response.data.error || 'Failed to read file');
      }
    } catch (error) {
      console.error('📁 [Src2Manager] Failed to read file:', error);
      throw error;
    }
  }

  async getFileTree(): Promise<any[]> {
    try {
      console.log('📁 [Src2Manager] Getting file tree...');

      // Make API call to server to get file tree
      const response = await axios.get(`${this.serverUrl}/api/editor/files/tree`);

      if (response.data.success) {
        // Handle both old and new API response formats
        return response.data.fileTree || response.data.tree || [];
      } else {
        throw new Error(response.data.error || 'Failed to get file tree');
      }
    } catch (error) {
      console.error('📁 [Src2Manager] Failed to get file tree:', error);
      throw error;
    }
  }
}
