/**
 * SimpleRealAppRenderer - Dead simple approach using React patterns
 * 
 * Instead of 2000+ lines of complex compilation/emulation:
 * - Use React-friendly rendering (no DOM manipulation)
 * - Event-driven communication with React components
 * - Let React handle the DOM properly
 */
export class SimpleRealAppRenderer {
  private currentSessionId: string | null = null;

  setContainer(container: HTMLElement) {
    // We don't need to store the container since we'll use React events
    console.log('📱 [SimpleRenderer] Container set');
  }

  async renderMobileApp(): Promise<void> {
    console.log('🚀 [SimpleRenderer] Loading real mobile app...');

    try {
      // Step 1: Get session info (or use existing from window)
      const sessionInfo = this.getSessionInfo();
      this.currentSessionId = sessionInfo.sessionId;

      // Step 2: Emit React-friendly event with iframe JSX
      this.emitRenderEvent(sessionInfo);

    } catch (error) {
      console.error('❌ [SimpleRenderer] Failed to load mobile app:', error);
      this.emitErrorEvent(error);
    }
  }

  private getSessionInfo() {
    // Get session info from window (already initialized by Src2Manager)
    console.log('🔍 [SimpleRenderer] Checking for session info on window...');
    console.log('🔍 [SimpleRenderer] Available window properties:', Object.keys(window).filter(key => key.includes('SESSION') || key.includes('session')));
    
    const sessionInfo = (window as any).__VISUAL_EDITOR_SESSION__;
    console.log('🔍 [SimpleRenderer] Session info found:', sessionInfo ? '✅ YES' : '❌ NO');
    
    if (!sessionInfo) {
      throw new Error('No session info available - check timing of Src2Manager initialization');
    }
    return sessionInfo;
  }

  private emitRenderEvent(sessionInfo: any) {
    // Create React-friendly render data with absolute URL and cache-busting
    const cacheBuster = Date.now();
    const renderData = {
      type: 'iframe-app',
      sessionId: sessionInfo.sessionId,
      iframeUrl: `http://localhost:3001/real-app/${sessionInfo.sessionId}?v=${cacheBuster}`
    };

    // Emit custom event for React to handle
    const event = new CustomEvent('simpleRenderer:render', {
      detail: renderData
    });
    window.dispatchEvent(event);
  }

  private emitErrorEvent(error: any) {
    const errorData = {
      type: 'error',
      message: error.toString()
    };

    const event = new CustomEvent('simpleRenderer:error', {
      detail: errorData
    });
    window.dispatchEvent(event);
  }

  // Optional: Direct file loading approach (alternative to iframe)
  async loadScreenDirectly(screenPath: string) {
    if (!this.currentSessionId) return null;
    
    try {
      // This would work if the backend serves files properly
      const response = await fetch(`/api/editor/files/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: this.currentSessionId,
          filePath: `src/${screenPath}`
        })
      });
      
      const fileData = await response.json();
      return fileData.content;
    } catch (error) {
      console.error('Failed to load screen:', screenPath, error);
      return null;
    }
  }
}
