import React from 'react';

/**
 * Webpack-based session app loader
 * Uses proper webpack compilation instead of runtime transformation
 */
export class WebpackSessionAppLoader {
  private sessionInfo: any;

  constructor(sessionInfo: any) {
    this.sessionInfo = sessionInfo;
  }

  /**
   * Load mobile app from session workspace using webpack build
   */
  async loadMobileApp(onStatusUpdate?: (status: string, isLoading: boolean) => void): Promise<React.ComponentType | null> {
    if (!this.sessionInfo) {
      throw new Error('Session info not available');
    }

    try {
      console.log('📱 [WebpackSessionAppLoader] Loading mobile app from session workspace...');
      onStatusUpdate?.('📱 Initializing mobile app loader...', true);
      
      console.log('🔨 [WebpackSessionAppLoader] Building session workspace with webpack...');
      onStatusUpdate?.('🔨 Building session workspace with webpack...', true);
      
      // Build the session using webpack
      const buildResult = await this.buildSession(this.sessionInfo.sessionId);
      
      if (!buildResult.success) {
        throw new Error(`Failed to build session: ${buildResult.error}`);
      }
      
      console.log('✅ [WebpackSessionAppLoader] Session built successfully');
      onStatusUpdate?.('✅ Webpack build completed successfully', true);
      
      // Load the compiled app
      onStatusUpdate?.('📦 Loading compiled mobile app...', true);
      const AppComponent = await this.loadCompiledApp(this.sessionInfo.sessionId);
      
      if (AppComponent) {
        console.log('✅ [WebpackSessionAppLoader] Successfully loaded mobile app from session workspace!');
        onStatusUpdate?.('✅ Mobile app loaded successfully!', false);
        return AppComponent;
      } else {
        throw new Error('Failed to load compiled app component');
      }
      
    } catch (error) {
      console.error('❌ [WebpackSessionAppLoader] Failed to load mobile app:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      onStatusUpdate?.(`❌ Build failed: ${errorMessage}`, false);
      return this.createFallbackApp(`Failed to load real app: ${errorMessage}`);
    }
  }

  /**
   * Build session workspace using webpack
   */
  private async buildSession(sessionId: string): Promise<any> {
    try {
      const buildUrl = `http://localhost:3001/api/editor/session/${sessionId}/build`;
      console.log('🔨 [WebpackSessionAppLoader] Calling build endpoint:', buildUrl);
      
      const response = await fetch(buildUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(`Build failed: ${result.error || response.statusText}`);
      }
      
      return result;
    } catch (error) {
      console.error('❌ [WebpackSessionAppLoader] Build failed:', error);
      throw error;
    }
  }

  /**
   * Load compiled app from server
   */
  private async loadCompiledApp(sessionId: string): Promise<React.ComponentType | null> {
    try {
      const appUrl = `http://localhost:3001/api/editor/session/${sessionId}/app.js`;
      console.log('📦 [WebpackSessionAppLoader] Loading compiled app from:', appUrl);
      
      // Dynamically import the compiled app
      const script = document.createElement('script');
      script.src = appUrl;
      script.type = 'text/javascript';
      
      return new Promise((resolve, reject) => {
        script.onload = () => {
          // Add a small delay to ensure the UMD module has time to execute
          setTimeout(() => {
            try {
              console.log('✅ [WebpackSessionAppLoader] Script loaded successfully');
              console.log('🔍 [WebpackSessionAppLoader] Checking global SessionApp:', (window as any).SessionApp);
              
              // The webpack build should expose the app as a UMD module
              const SessionApp = (window as any).SessionApp;
              if (SessionApp && SessionApp.default) {
                console.log('✅ [WebpackSessionAppLoader] Found SessionApp.default');
                resolve(SessionApp.default);
              } else if (SessionApp) {
                console.log('✅ [WebpackSessionAppLoader] Found SessionApp (no default)');
                resolve(SessionApp);
              } else {
                console.error('❌ [WebpackSessionAppLoader] SessionApp not found in global scope');
                console.log('🔍 [WebpackSessionAppLoader] Available globals:', Object.keys(window).filter(k => k.includes('Session') || k.includes('App')));
                reject(new Error('Compiled app not found in global scope'));
              }
            } catch (error) {
              console.error('❌ [WebpackSessionAppLoader] Error in script onload:', error);
              reject(error);
            }
          }, 100); // Small delay to ensure UMD execution
        };
        
        script.onerror = (e) => {
          console.error('❌ [WebpackSessionAppLoader] Failed to load script:', e);
          reject(new Error('Failed to load compiled app script'));
        };
        
        document.head.appendChild(script);
      });
      
    } catch (error) {
      console.error('❌ [WebpackSessionAppLoader] Failed to load compiled app:', error);
      throw error;
    }
  }

  /**
   * Create fallback app component
   */
  createFallbackApp(message: string = 'Building session workspace with webpack...'): React.ComponentType {
    const FallbackComponent: React.FC = () => {
      return React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            color: '#343a40',
            fontFamily: 'Arial, sans-serif'
          },
        },
        React.createElement('h2', { 
          style: { color: '#007bff', marginBottom: '10px' } 
        }, '📱 Mobile App Preview'),
        React.createElement('p', { 
          style: { color: '#6c757d', marginBottom: '15px' } 
        }, message),
        React.createElement('p', { 
          style: { fontSize: '0.9em', color: '#adb5bd' } 
        }, 'Using webpack-based compilation for proper React Native Web support.')
      );
    };
    
    return FallbackComponent;
  }
}

export default WebpackSessionAppLoader;
