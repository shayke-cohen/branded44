/**
 * Debug utility to check session information and workspace loading
 */

export class DebugSessionInfo {
  static logSessionInfo(): void {
    console.log('🔍 [DEBUG SESSION] === SESSION INFO DEBUG ===');
    
    // Check window session
    const windowSession = (window as any).__VISUAL_EDITOR_SESSION__;
    console.log('🔍 [DEBUG SESSION] Window session:', windowSession);
    
    // Check localStorage
    const storageSessionId = localStorage.getItem('visual-editor-session-id');
    console.log('🔍 [DEBUG SESSION] Storage session ID:', storageSessionId);
    
    // Check if they match
    if (windowSession?.sessionId && storageSessionId) {
      console.log('🔍 [DEBUG SESSION] Session ID match:', windowSession.sessionId === storageSessionId);
    }
    
    return windowSession;
  }
  
  static async testSessionModuleEndpoint(sessionId: string, modulePath: string): Promise<void> {
    console.log('🔍 [DEBUG SESSION] === TESTING SESSION MODULE ENDPOINT ===');
    
    const url = `http://localhost:3001/api/editor/session-module/${sessionId}/${modulePath}`;
    console.log('🔍 [DEBUG SESSION] Testing URL:', url);
    
    try {
      const response = await fetch(url);
      console.log('🔍 [DEBUG SESSION] Response status:', response.status);
      console.log('🔍 [DEBUG SESSION] Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const content = await response.text();
        console.log('🔍 [DEBUG SESSION] Response content (first 200 chars):', content.substring(0, 200));
      } else {
        const errorText = await response.text();
        console.log('🔍 [DEBUG SESSION] Error response:', errorText);
      }
    } catch (error) {
      console.error('🔍 [DEBUG SESSION] Fetch error:', error);
    }
  }
  
  static async testWorkspaceFiles(sessionId: string): Promise<void> {
    console.log('🔍 [DEBUG SESSION] === TESTING WORKSPACE FILES ===');
    
    const testFiles = [
      'App.tsx',
      'screens/HomeScreen/HomeNavigation.tsx',
      'screens/SettingsScreen/SettingsScreen.tsx'
    ];
    
    for (const file of testFiles) {
      await this.testSessionModuleEndpoint(sessionId, file);
    }
  }
  
  static installGlobalDebugger(): void {
    // Install global debug functions
    (window as any).__DEBUG_SESSION__ = {
      logSessionInfo: this.logSessionInfo,
      testSessionModuleEndpoint: this.testSessionModuleEndpoint,
      testWorkspaceFiles: this.testWorkspaceFiles,
      testAll: async () => {
        const sessionInfo = this.logSessionInfo();
        if (sessionInfo?.sessionId) {
          await this.testWorkspaceFiles(sessionInfo.sessionId);
        } else {
          console.error('🔍 [DEBUG SESSION] No session ID found!');
        }
      }
    };
    
    console.log('🔍 [DEBUG SESSION] Global debugger installed! Use window.__DEBUG_SESSION__.testAll()');
  }
}
