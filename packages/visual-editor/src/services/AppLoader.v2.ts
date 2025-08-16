/**
 * AppLoader v2 - Simplified approach using session file serving
 */

import React, { useState, useEffect } from 'react';
import { WebpackSessionAppLoader } from './WebpackSessionAppLoader';

export interface AppLoadResult {
  success: boolean;
  component?: React.ComponentType;
  error?: string;
}

export class AppLoaderV2 {
  private serverUrl: string;

  constructor(serverUrl = 'http://localhost:3001') {
    this.serverUrl = serverUrl;
  }

  /**
   * Get the existing session from Src2Manager instead of creating a new one
   */
  async initializeSession(): Promise<{ sessionId: string; workspacePath: string } | null> {
    try {
      console.log('📁 [AppLoaderV2] Getting existing session from Src2Manager...');
      
      // Check if session is already available from Src2Manager
      const existingSession = (window as any).__VISUAL_EDITOR_SESSION__;
      console.log('📁 [AppLoaderV2] Current window session:', existingSession);
      
      if (existingSession && existingSession.sessionId) {
        console.log('✅ [AppLoaderV2] Using existing session:', existingSession.sessionId);
        return {
          sessionId: existingSession.sessionId,
          workspacePath: existingSession.workspacePath || ''
        };
      }
      
      // If no existing session, wait longer and try multiple times
      console.log('📁 [AppLoaderV2] No existing session found, waiting for Src2Manager...');
      
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const retrySession = (window as any).__VISUAL_EDITOR_SESSION__;
        console.log(`📁 [AppLoaderV2] Retry ${i + 1}/5, session:`, retrySession);
        
        if (retrySession && retrySession.sessionId) {
          console.log('✅ [AppLoaderV2] Found session after retry:', retrySession.sessionId);
          return {
            sessionId: retrySession.sessionId,
            workspacePath: retrySession.workspacePath || ''
          };
        }
      }
      
      throw new Error('No session available from Src2Manager after 5 retries');
    } catch (error) {
      console.error('❌ [AppLoaderV2] Failed to get session:', error);
      return null;
    }
  }

  /**
   * Create a fallback React Native Web app
   */
  createFallbackApp(): React.ComponentType {
    const FallbackApp: React.FC = () => {
      return React.createElement('div', {
        style: {
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          margin: '20px',
          border: '2px dashed #dee2e6'
        }
      }, [
        React.createElement('h2', { 
          key: 'title',
          style: { color: '#495057', marginBottom: '16px' }
        }, '📱 React Native Web App'),
        
        React.createElement('p', { 
          key: 'description',
          style: { color: '#6c757d', marginBottom: '24px' }
        }, 'This is a fallback representation of your mobile app running in the browser.'),
        
        React.createElement('div', {
          key: 'features',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginTop: '24px'
          }
        }, [
          React.createElement('div', {
            key: 'feature1',
            style: {
              padding: '16px',
              backgroundColor: '#e3f2fd',
              borderRadius: '8px'
            }
          }, [
            React.createElement('div', { key: 'icon1', style: { fontSize: '24px', marginBottom: '8px' } }, '🏠'),
            React.createElement('div', { key: 'text1' }, 'Home Screen')
          ]),
          
          React.createElement('div', {
            key: 'feature2',
            style: {
              padding: '16px',
              backgroundColor: '#f3e5f5',
              borderRadius: '8px'
            }
          }, [
            React.createElement('div', { key: 'icon2', style: { fontSize: '24px', marginBottom: '8px' } }, '🛍️'),
            React.createElement('div', { key: 'text2' }, 'Shopping')
          ]),
          
          React.createElement('div', {
            key: 'feature3',
            style: {
              padding: '16px',
              backgroundColor: '#e8f5e8',
              borderRadius: '8px'
            }
          }, [
            React.createElement('div', { key: 'icon3', style: { fontSize: '24px', marginBottom: '8px' } }, '👤'),
            React.createElement('div', { key: 'text3' }, 'Profile')
          ])
        ]),
        
        React.createElement('div', {
          key: 'status',
          style: {
            marginTop: '24px',
            padding: '12px',
            backgroundColor: '#fff3cd',
            borderRadius: '6px',
            border: '1px solid #ffeaa7'
          }
        }, '⚠️ Using fallback app - session loading in progress...')
      ]);
    };

    return FallbackApp;
  }
}

/**
 * Hook to use the new AppLoader
 */
export const useAppLoaderV2 = (shouldLoad: boolean = true) => {
  const [sessionInfo, setSessionInfo] = useState<{ sessionId: string; workspacePath: string } | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Use the webpack-based session app loader
  const [sessionApp, setSessionApp] = useState<React.ComponentType | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  
  // Build status tracking
  const [buildStatus, setBuildStatus] = useState<string>('');
  const [isBuildLoading, setIsBuildLoading] = useState(false);
  
  // Initialize session on mount
  useEffect(() => {
    if (!shouldLoad) {
      setIsInitializing(false);
      return;
    }

    const initSession = async () => {
      setIsInitializing(true);
      setInitError(null);
      
      try {
        const loader = new AppLoaderV2();
        const session = await loader.initializeSession();
        
        if (session) {
          setSessionInfo(session);
        } else {
          setInitError('Failed to initialize session');
        }
      } catch (error) {
        setInitError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsInitializing(false);
      }
    };

    initSession();
  }, [shouldLoad]);

  // Load app when session info is available
  useEffect(() => {
    if (!sessionInfo || sessionLoading || sessionApp) return;

    const loadApp = async () => {
      setSessionLoading(true);
      setSessionError(null);
      setBuildStatus('');
      setIsBuildLoading(true);

      try {
        console.log('📱 [AppLoaderV2] Loading app with webpack-based loader...');
        const loader = new WebpackSessionAppLoader(sessionInfo);
        
        // Status callback to update build progress
        const onStatusUpdate = (status: string, isLoading: boolean) => {
          setBuildStatus(status);
          setIsBuildLoading(isLoading);
        };
        
        const app = await loader.loadMobileApp(onStatusUpdate);
        
        if (app) {
          setSessionApp(app);
          console.log('✅ [AppLoaderV2] Successfully loaded app with webpack');
        } else {
          throw new Error('Webpack loader returned null component');
        }
      } catch (error) {
        console.error('❌ [AppLoaderV2] Failed to load app with webpack:', error);
        setSessionError(error instanceof Error ? error.message : String(error));
        setBuildStatus(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
        setIsBuildLoading(false);
      } finally {
        setSessionLoading(false);
      }
    };

    loadApp();
  }, [sessionInfo, sessionLoading, sessionApp]);

  // Determine what to return
  const loading = isInitializing || sessionLoading;
  const error = initError || sessionError;
  
  let app: React.ComponentType | null = null;
  if (sessionApp) {
    app = sessionApp;
  } else if (!loading && !error) {
    // Create fallback app
    const loader = new WebpackSessionAppLoader(sessionInfo || { sessionId: 'unknown', workspacePath: '', sessionPath: '' });
    app = loader.createFallbackApp('No session app loaded');
  }

  return {
    app,
    loading,
    error,
    sessionInfo,
    buildStatus,
    isBuildLoading,
  };
};
