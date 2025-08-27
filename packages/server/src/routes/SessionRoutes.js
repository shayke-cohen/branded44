const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const ValidationService = require('../services/ValidationService');
const FileWatcherService = require('../services/FileWatcherService');
// const { SessionBundleService } = require('../services'); // Removed: Using Direct Mobile App Loading now

/**
 * Session management routes
 * Extracted from the monolithic visualEditor.js route file
 */
class SessionRoutes {
  constructor() {
    this.router = express.Router();
    this.validationService = new ValidationService();
    this.fileWatcherService = new FileWatcherService();
    // this.sessionBundleService = new SessionBundleService(); // Removed: Using Direct Mobile App Loading now
    this.setupRoutes();
  }

  setupRoutes() {
    // Initialize new session
    this.router.post('/init', this.initSession.bind(this));
    
    // List available sessions
    this.router.get('/sessions', this.listSessions.bind(this));
    
    // Sync to specific session
    this.router.post('/sync', this.syncSession.bind(this));
    
    // Get session info
    this.router.get('/session/:sessionId', this.getSession.bind(this));
    
    // Serve session bundle as JavaScript file - DISABLED: Using Direct Mobile App Loading now
    // this.router.get('/session/:sessionId/bundle.js', this.getSessionBundle.bind(this));
    
    // Serve mobile app for iframe preview
    this.router.get('/session/:sessionId/mobile-app', this.serveMobileAppForIframe.bind(this));
    
    // Serve self-contained iframe bundle - DISABLED: Using Direct Mobile App Loading now
    // this.router.get('/session/:sessionId/iframe-bundle.js', this.getIframeBundle.bind(this));
    
    // Clean up session
    this.router.delete('/session/:sessionId', this.cleanupSession.bind(this));
    
    // Clean up all sessions
    this.router.post('/cleanup', this.cleanupAllSessions.bind(this));
  }

  /**
   * Initialize new editing session
   */
  async initSession(req, res) {
    const startTime = Date.now();
    const requestId = Date.now().toString();

    console.log('🔧 [SessionRoutes] Init endpoint called, requestId:', requestId);

    try {
      req.log('info', 'Initializing visual editor environment', { requestId });

      // Get SessionManager from app
      const sessionManager = req.app.get('sessionManager');
      if (!sessionManager) {
        return res.status(500).json(
          this.validationService.createErrorResponse('SessionManager not available', { requestId })
        );
      }

      const srcPath = path.resolve(__dirname, '../../../mobile/src');
      req.log('info', 'Creating session using SessionManager...', { requestId });
      
      // Create session using SessionManager
      const sessionInfo = await sessionManager.createSession(srcPath);
      const { sessionId, sessionPath, workspacePath } = sessionInfo;

      // Start file watcher for this session
      this.fileWatcherService.setGlobalWatcher(sessionId, workspacePath);

      // Set up file change callback to emit socket events and rebuild bundles
      this.fileWatcherService.onFileChange(async (changeEvent) => {
        try {
          const io = req.io || req.app.get('io');
          if (io) {
            io.emit('file-changed', changeEvent);
          }
          
          // Trigger bundle rebuild for affected session
          if (changeEvent.sessionId && changeEvent.filePath) {
            console.log(`📝 [SessionRoutes] File changed: ${changeEvent.filePath}, rebuilding bundle...`);
            
            // Debounce bundle rebuilds (rebuild max once per 500ms per session)
            const rebuildKey = `rebuild_${changeEvent.sessionId}`;
            
            if (this.rebuildTimeouts) {
              clearTimeout(this.rebuildTimeouts[rebuildKey]);
            } else {
              this.rebuildTimeouts = {};
            }
            
            this.rebuildTimeouts[rebuildKey] = setTimeout(async () => {
              try {
                // Clear cached bundle first to ensure fresh rebuild
                this.sessionBundleService.clearCache(changeEvent.sessionId);
                await this.sessionBundleService.buildSessionBundle(changeEvent.sessionId, sessionInfo);
                console.log(`✅ [SessionRoutes] Bundle rebuilt successfully for session: ${changeEvent.sessionId}`);
                
                // Emit bundle updated event
                if (io) {
                  io.emit('bundle-updated', {
                    sessionId: changeEvent.sessionId,
                    filePath: changeEvent.filePath,
                    timestamp: Date.now()
                  });
                }
              } catch (bundleError) {
                console.error(`❌ [SessionRoutes] Bundle rebuild failed:`, bundleError);
                
                // Emit bundle error event
                if (io) {
                  io.emit('bundle-error', {
                    sessionId: changeEvent.sessionId,
                    error: bundleError.message,
                    timestamp: Date.now()
                  });
                }
              }
              
              delete this.rebuildTimeouts[rebuildKey];
            }, 500);
          }
        } catch (error) {
          console.warn('⚠️ [SessionRoutes] Could not emit file-changed event:', error.message);
        }
      });

      // Store session info globally for backward compatibility
      global.currentEditorSession = {
        sessionId,
        sessionPath,
        workspacePath,
        startTime: Date.now()
      };

      // Build initial bundle for the session
      req.log('info', 'Building initial session bundle...', { requestId, sessionId });
      let bundleReady = false;
      let bundleError = null;
      
      try {
        await this.sessionBundleService.buildSessionBundle(sessionId, sessionInfo);
        bundleReady = true;
        req.log('success', 'Initial session bundle built successfully', { requestId, sessionId });
      } catch (bundleErr) {
        bundleError = bundleErr.message;
        req.log('warning', 'Initial bundle build failed, will build on-demand', { 
          requestId, 
          sessionId, 
          error: bundleError 
        });
        // Don't fail session creation if bundle build fails - we can build on-demand
      }

      const endTime = Date.now();
      req.updateConnectionStats(true, endTime - startTime);

      req.log('success', 'Visual editor environment initialized', {
        requestId,
        sessionId,
        workspacePath,
        duration: endTime - startTime
      });

      res.json(this.validationService.createSuccessResponse({
        sessionId,
        data: { 
          workspacePath, 
          srcPath, 
          sessionPath,
          bundleReady,
          bundleError,
          bundleUrl: `/api/editor/session/${sessionId}/bundle.js`
        }
      }, {
        message: 'Visual editor environment initialized successfully',
        requestId,
        meta: { 
          duration: endTime - startTime,
          bundleStatus: bundleReady ? 'ready' : 'failed'
        }
      }));

    } catch (error) {
      const endTime = Date.now();
      req.updateConnectionStats(false, endTime - startTime);

      req.log('error', 'Failed to initialize visual editor environment', {
        requestId,
        error: error.message,
        duration: endTime - startTime
      });

      res.status(500).json(
        this.validationService.createErrorResponse(error.message, { requestId })
      );
    }
  }

  /**
   * List all available sessions
   */
  async listSessions(req, res) {
    const startTime = Date.now();
    const requestId = Date.now().toString();
    
    try {
      const sessionManager = req.app.get('sessionManager');
      if (!sessionManager) {
        return res.status(500).json(
          this.validationService.createErrorResponse('SessionManager not available', { requestId })
        );
      }

      // Get all sessions and validate them
      const allSessions = sessionManager.getAllSessions();
      const validatedSessions = [];
      
      for (const session of allSessions) {
        const validation = await this.validationService.validateWorkspace(session.workspacePath);
        if (validation.valid) {
          validatedSessions.push(session);
        } else {
          console.log(`📁 [SessionRoutes] Removing stale session: ${session.sessionId}`);
          sessionManager.activeSessions.delete(session.sessionId);
        }
      }
      
      // Format sessions for frontend
      const sessions = validatedSessions.map(session => {
        const startTime = session.startTime || Date.now();
        const sessionTimestamp = parseInt(session.sessionId.split('-')[1]) || startTime;
        
        return {
          sessionId: session.sessionId,
          workspacePath: session.workspacePath,
          sessionPath: session.sessionPath,
          startTime: startTime,
          age: Date.now() - startTime,
          created: new Date(sessionTimestamp).toISOString(),
          lastModified: session.lastModified || new Date(sessionTimestamp).toISOString()
        };
      }).sort((a, b) => b.startTime - a.startTime);
      
      console.log(`📁 [SessionRoutes] Listed ${sessions.length} sessions`);
      
      res.json(this.validationService.createSuccessResponse({
        sessions,
        totalSessions: sessions.length
      }, {
        message: `Found ${sessions.length} sessions`,
        requestId,
        meta: { responseTime: `${Date.now() - startTime}ms` }
      }));
      
    } catch (error) {
      console.error(`❌ [SessionRoutes] Error listing sessions:`, error);
      res.status(500).json(
        this.validationService.createErrorResponse('Failed to list sessions', {
          requestId,
          details: error.message
        })
      );
    }
  }

  /**
   * Sync file watcher to specific session
   */
  async syncSession(req, res) {
    const startTime = Date.now();
    const requestId = Date.now().toString();

    try {
      const bodyValidation = this.validationService.validateRequestBody(req.body, ['sessionId']);
      if (!bodyValidation.valid) {
        return res.status(400).json(
          this.validationService.createErrorResponse(bodyValidation.error, { requestId })
        );
      }

      const { sessionId } = req.body;
      console.log(`🔄 [SessionRoutes] Syncing to session: ${sessionId}`);

      const sessionManager = req.app.get('sessionManager');
      const sessionValidation = await this.validationService.validateSession(sessionManager, sessionId);
      if (!sessionValidation.valid) {
        return res.status(404).json(
          this.validationService.createErrorResponse(sessionValidation.error, { requestId })
        );
      }

      const session = sessionValidation.session;

      // Update file watcher
      this.fileWatcherService.setGlobalWatcher(sessionId, session.workspacePath);

      // Set up file change callback
      this.fileWatcherService.onFileChange((changeEvent) => {
        try {
          const io = req.app.get('io');
          if (io) {
            io.emit('file-changed', changeEvent);
          }
        } catch (error) {
          console.warn('⚠️ [SessionRoutes] Could not emit file-changed event:', error.message);
        }
      });

      // Update global session info for backward compatibility
      global.currentEditorSession = {
        sessionId: session.sessionId,
        sessionPath: session.sessionPath,
        workspacePath: session.workspacePath,
        startTime: Date.now()
      };

      console.log(`✅ [SessionRoutes] Successfully synced to session: ${sessionId}`);

      res.json(this.validationService.createSuccessResponse({
        sessionId,
        workspacePath: session.workspacePath
      }, {
        message: `File watcher synced to session: ${sessionId}`,
        requestId,
        meta: { responseTime: `${Date.now() - startTime}ms` }
      }));

    } catch (error) {
      console.error(`❌ [SessionRoutes] Error syncing session:`, error);
      res.status(500).json(
        this.validationService.createErrorResponse(error.message, { requestId })
      );
    }
  }

  /**
   * Get specific session information
   */
  async getSession(req, res) {
    const startTime = Date.now();
    const requestId = Date.now().toString();

    try {
      const { sessionId } = req.params;
      
      const sessionValidation = this.validationService.validateSessionId(sessionId);
      if (!sessionValidation.valid) {
        return res.status(400).json(
          this.validationService.createErrorResponse(sessionValidation.error, { requestId })
        );
      }

      const sessionManager = req.app.get('sessionManager');
      const fullSessionValidation = await this.validationService.validateSession(sessionManager, sessionId);
      if (!fullSessionValidation.valid) {
        return res.status(404).json(
          this.validationService.createErrorResponse(fullSessionValidation.error, { requestId })
        );
      }

      const session = fullSessionValidation.session;
      
      res.json(this.validationService.createSuccessResponse({
        session: {
          sessionId: session.sessionId,
          workspacePath: session.workspacePath,
          sessionPath: session.sessionPath,
          startTime: session.startTime,
          age: Date.now() - (session.startTime || Date.now())
        }
      }, {
        message: 'Session retrieved successfully',
        requestId,
        meta: { responseTime: `${Date.now() - startTime}ms` }
      }));

    } catch (error) {
      console.error(`❌ [SessionRoutes] Error getting session:`, error);
      res.status(500).json(
        this.validationService.createErrorResponse(error.message, { requestId })
      );
    }
  }

  /**
   * Clean up specific session
   */
  async cleanupSession(req, res) {
    const startTime = Date.now();
    const requestId = Date.now().toString();

    try {
      const { sessionId } = req.params;
      
      const sessionValidation = this.validationService.validateSessionId(sessionId);
      if (!sessionValidation.valid) {
        return res.status(400).json(
          this.validationService.createErrorResponse(sessionValidation.error, { requestId })
        );
      }

      const sessionManager = req.app.get('sessionManager');
      if (!sessionManager) {
        return res.status(500).json(
          this.validationService.createErrorResponse('SessionManager not available', { requestId })
        );
      }

      // Stop file watcher for this session
      this.fileWatcherService.stopWatching(sessionId);

      // Clean up session
      await sessionManager.cleanupSession(sessionId);

      // Clear global session if it matches
      if (global.currentEditorSession && global.currentEditorSession.sessionId === sessionId) {
        global.currentEditorSession = null;
      }

      const endTime = Date.now();
      req.updateConnectionStats(true, endTime - startTime);

      req.log('success', 'Session cleaned up', {
        requestId,
        sessionId,
        duration: endTime - startTime
      });

      res.json(this.validationService.createSuccessResponse({
        sessionId
      }, {
        message: `Session ${sessionId} cleaned up successfully`,
        requestId,
        meta: { duration: endTime - startTime }
      }));

    } catch (error) {
      const endTime = Date.now();
      req.updateConnectionStats(false, endTime - startTime);

      req.log('error', 'Failed to cleanup session', {
        requestId,
        error: error.message,
        duration: endTime - startTime
      });

      res.status(500).json(
        this.validationService.createErrorResponse(error.message, { requestId })
      );
    }
  }

  /**
   * Clean up all sessions
   */
  async cleanupAllSessions(req, res) {
    const startTime = Date.now();
    const requestId = Date.now().toString();

    try {
      req.log('info', 'Cleaning up all visual editor sessions', { requestId });

      const sessionManager = req.app.get('sessionManager');
      if (!sessionManager) {
        return res.status(500).json(
          this.validationService.createErrorResponse('SessionManager not available', { requestId })
        );
      }

      // Stop all file watchers
      this.fileWatcherService.cleanup();

      // Clean up all sessions
      await sessionManager.cleanupAllSessions();

      // Clear global session
      global.currentEditorSession = null;

      const endTime = Date.now();
      req.updateConnectionStats(true, endTime - startTime);

      req.log('success', 'All sessions cleaned up', {
        requestId,
        duration: endTime - startTime
      });

      res.json(this.validationService.createSuccessResponse({}, {
        message: 'All sessions cleaned up successfully',
        requestId,
        meta: { duration: endTime - startTime }
      }));

    } catch (error) {
      const endTime = Date.now();
      req.updateConnectionStats(false, endTime - startTime);

      req.log('error', 'Failed to cleanup all sessions', {
        requestId,
        error: error.message,
        duration: endTime - startTime
      });

      res.status(500).json(
        this.validationService.createErrorResponse(error.message, { requestId })
      );
    }
  }

  /**
   * Get self-contained iframe bundle (includes all dependencies)
   * GET /session/:sessionId/iframe-bundle.js
   */
  async getIframeBundle(req, res) {
    try {
      const { sessionId } = req.params;
      console.log(`📦 [SessionRoutes] Iframe bundle request for session: ${sessionId}`);
      
      // Get SessionManager from app
      const sessionManager = req.app.get('sessionManager');
      if (!sessionManager) {
        console.log(`❌ [SessionRoutes] SessionManager not available`);
        return res.status(500).json({ error: 'SessionManager not available' });
      }

      // Get session info
      const session = sessionManager.getSession(sessionId);
      if (!session) {
        console.log(`❌ [SessionRoutes] Session not found: ${sessionId}`);
        return res.status(404).json({ error: 'Session not found' });
      }
      
      const startTime = Date.now();
      
      // Build iframe-specific bundle with all dependencies included
      const bundleCode = await this.sessionBundleService.buildSessionBundle(sessionId, session, { 
        forIframe: true 
      });
      
      const duration = Date.now() - startTime;
      console.log(`📦 [SessionRoutes] Iframe bundle built successfully for ${sessionId} in ${duration}ms`);
      
      // Set headers for JavaScript content
      res.set({
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      res.send(bundleCode);
      
    } catch (error) {
      console.error(`❌ [SessionRoutes] Iframe bundle error for ${req.params.sessionId}:`, error);
      res.status(500).json({ 
        error: 'Failed to build iframe bundle', 
        details: error.message 
      });
    }
  }

  /**
   * Serve session bundle as JavaScript file
   */
  async getSessionBundle(req, res) {
    const { sessionId } = req.params;
    const startTime = Date.now();
    const requestId = Date.now().toString();

    try {
      console.log(`📦 [SessionRoutes] Bundle request for session: ${sessionId}`);
      
      // Get SessionManager from app
      const sessionManager = req.app.get('sessionManager');
      if (!sessionManager) {
        return res.status(500).json(
          this.validationService.createErrorResponse('SessionManager not available', { requestId })
        );
      }

      // Get session info
      const sessionInfo = sessionManager.getSession(sessionId);
      if (!sessionInfo) {
        return res.status(404).json(
          this.validationService.createErrorResponse('Session not found', { requestId, sessionId })
        );
      }

      // Check for cached bundle first
      let bundleCode = this.sessionBundleService.getCachedBundle(sessionId);
      
      if (!bundleCode) {
        console.log(`📦 [SessionRoutes] No cached bundle, building fresh for: ${sessionId}`);
        bundleCode = await this.sessionBundleService.buildSessionBundle(sessionId, sessionInfo);
      } else {
        console.log(`📦 [SessionRoutes] Serving cached bundle for: ${sessionId}`);
      }

      // Get bundle stats for response headers
      const bundleStats = this.sessionBundleService.getBundleStats(sessionId);
      
      // Set headers
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      if (bundleStats) {
        res.setHeader('X-Bundle-Size', bundleStats.size.toString());
        res.setHeader('X-Bundle-Build-Time', bundleStats.buildTime.toString());
        res.setHeader('X-Bundle-Age', bundleStats.age.toString());
      }

      const endTime = Date.now();
      console.log(`📦 [SessionRoutes] Bundle served successfully for ${sessionId} in ${endTime - startTime}ms`);
      
      res.send(bundleCode);

    } catch (error) {
      const endTime = Date.now();
      console.error(`❌ [SessionRoutes] Bundle request failed for ${sessionId}:`, error);

      res.status(500).json(
        this.validationService.createErrorResponse(error.message, { 
          requestId, 
          sessionId,
          duration: endTime - startTime 
        })
      );
    }
  }

  /**
   * Serve mobile app for iframe preview
   */
  async serveMobileAppForIframe(req, res) {
    const { sessionId } = req.params;
    const { device = 'iphone', iframe = 'false' } = req.query;
    const startTime = Date.now();
    const requestId = Date.now().toString();

    try {
      console.log(`🖼️ [SessionRoutes] Iframe mobile app request for session: ${sessionId}, device: ${device}`);
      
      // Get SessionManager from app
      const sessionManager = req.app.get('sessionManager');
      if (!sessionManager) {
        return res.status(500).json(
          this.validationService.createErrorResponse('SessionManager not available', { requestId })
        );
      }

      // Get session info
      const sessionInfo = sessionManager.getSession(sessionId);
      if (!sessionInfo) {
        return res.status(404).json(
          this.validationService.createErrorResponse('Session not found', { requestId, sessionId })
        );
      }

      // Create HTML page that loads the self-contained iframe bundle
      const bundleUrl = `/api/editor/session/${sessionId}/iframe-bundle.js?t=${Date.now()}`;
      const iframeHtml = this.createSimpleIframeHtml(bundleUrl, device, sessionId);

      // Set headers for iframe
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Allow framing from localhost development ports
      // Remove X-Frame-Options and rely on CSP frame-ancestors for more flexibility
      res.setHeader('Content-Security-Policy', "frame-ancestors 'self' http://localhost:3000 http://localhost:3001 http://localhost:3002 http://127.0.0.1:3000 http://127.0.0.1:3001 http://127.0.0.1:3002");

      const endTime = Date.now();
      console.log(`🖼️ [SessionRoutes] Iframe HTML served for ${sessionId} in ${endTime - startTime}ms`);
      
      res.send(iframeHtml);

    } catch (error) {
      const endTime = Date.now();
      console.error(`❌ [SessionRoutes] Iframe request failed for ${sessionId}:`, error);

      res.status(500).send(`
        <html>
          <body style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: Arial, sans-serif; background: #f5f5f5;">
            <div style="text-align: center; color: #666;">
              <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
              <div style="font-size: 18px; margin-bottom: 8px; color: #c53030;">Iframe Load Error</div>
              <div style="font-size: 14px;">${error.message}</div>
            </div>
          </body>
        </html>
      `);
    }
  }

  /**
   * Create HTML content for iframe
   */
  createIframeHtml(bundleUrl, device, sessionId) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mobile App Preview - ${sessionId}</title>
    
    <!-- React and ReactDOM from CDN for iframe -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    
    <!-- React Native Web from CDN -->
    <script src="https://unpkg.com/react-native-web@0.19.13/dist/index.umd.js"></script>
    <script>
      // Make React Native Web available globally
      window.ReactNativeWeb = window.ReactNativeWeb || {};
      window.ReactNative = window.ReactNativeWeb;
      console.log('🖼️ [Iframe] React Native Web loaded via UMD');
    </script>
    
    <!-- Ensure React JSX runtime and RN Web are available -->
    <script>
      // Make JSX runtime available for esbuild bundles
      if (window.React && window.React.createElement) {
        window.React.jsx = window.React.createElement;
        window.React.jsxs = window.React.createElement;
        window.React.Fragment = window.React.Fragment || 'React.Fragment';
      }
      
      // Make React Native Web available globally
      if (window.ReactNativeWeb) {
        window.ReactNative = window.ReactNativeWeb;
        console.log('🖼️ [Iframe] React Native Web loaded successfully');
      }
    </script>
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: #ffffff;
            overflow: hidden;
            height: 100vh;
        }
        
        #app-container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        
        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            flex-direction: column;
            gap: 16px;
            background: #f5f5f5;
        }
        
        .spinner {
            width: 32px;
            height: 32px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .error {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            flex-direction: column;
            color: #666;
            text-align: center;
            padding: 20px;
            background: #f5f5f5;
        }
    </style>
</head>
<body>
    <div id="app-container">
        <div class="loading" id="loading">
            <div class="spinner"></div>
            <div>Loading Mobile App...</div>
            <div style="font-size: 12px; opacity: 0.7;">Session: ${sessionId}</div>
        </div>
    </div>
    
    <script>
        console.log('🖼️ [Iframe] Loading mobile app bundle for session: ${sessionId}');
        
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('🖼️ [Iframe] Global error:', event.error);
            showError('JavaScript Error: ' + event.error.message);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('🖼️ [Iframe] Unhandled promise rejection:', event.reason);
            showError('Promise Rejection: ' + event.reason);
        });
        
        function showError(message) {
            const container = document.getElementById('app-container');
            container.innerHTML = \`
                <div class="error">
                    <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                    <div style="font-size: 18px; margin-bottom: 8px; color: #c53030;">Bundle Error</div>
                    <div style="font-size: 14px;">\${message}</div>
                    <div style="font-size: 12px; margin-top: 8px; opacity: 0.7;">Session: ${sessionId}</div>
                </div>
            \`;
        }
        
        function hideLoading() {
            const loading = document.getElementById('loading');
            if (loading) {
                loading.style.display = 'none';
            }
        }
        
        // Load and execute the bundle
        async function loadBundle() {
            try {
                console.log('🖼️ [Iframe] Fetching bundle from: ${bundleUrl}');
                
                const response = await fetch('${bundleUrl}');
                if (!response.ok) {
                    throw new Error(\`Bundle fetch failed: \${response.status} \${response.statusText}\`);
                }
                
                const bundleCode = await response.text();
                console.log('🖼️ [Iframe] Bundle loaded, size:', (bundleCode.length / 1024).toFixed(1) + 'KB');
                
                // Execute the bundle
                const script = document.createElement('script');
                script.textContent = bundleCode;
                document.head.appendChild(script);
                
                // Wait a bit for bundle to execute
                setTimeout(() => {
                    if (window.SessionApp) {
                        console.log('🖼️ [Iframe] SessionApp available, rendering...');
                        renderApp();
                    } else {
                        console.error('🖼️ [Iframe] SessionApp not found after bundle execution');
                        showError('SessionApp component not found in bundle');
                    }
                }, 100);
                
            } catch (error) {
                console.error('🖼️ [Iframe] Bundle loading error:', error);
                showError(error.message);
            }
        }
        
        function renderApp() {
            try {
                hideLoading();
                
                // Create React root and render the app
                const React = window.React;
                const ReactDOM = window.ReactDOM;
                
                if (!React || !ReactDOM) {
                    throw new Error('React or ReactDOM not available');
                }
                
                const container = document.getElementById('app-container');
                const root = ReactDOM.createRoot(container);
                
                let AppComponent = window.SessionApp;
                if (AppComponent && AppComponent.default) {
                    AppComponent = AppComponent.default;
                }
                
                console.log('🖼️ [Iframe] Rendering SessionApp component...');
                root.render(React.createElement(AppComponent));
                
                console.log('✅ [Iframe] Mobile app rendered successfully');
                
            } catch (error) {
                console.error('🖼️ [Iframe] Render error:', error);
                showError('Render Error: ' + error.message);
            }
        }
        
        // Start loading when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadBundle);
        } else {
            loadBundle();
        }
    </script>
</body>
</html>
    `.trim();
  }

  /**
   * Create simple HTML content for self-contained iframe bundle
   */
  createSimpleIframeHtml(bundleUrl, device, sessionId) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mobile App Preview - ${sessionId}</title>
    
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: #ffffff;
            overflow: hidden;
        }
        
        #root {
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        #error-display {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff6b6b;
            color: white;
            padding: 20px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 9999;
            max-width: 80%;
            text-align: center;
            display: none;
        }
        
        #loading-display {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #666;
            font-size: 16px;
            z-index: 1000;
        }
    </style>
</head>
<body>
    <div id="loading-display">📱 Loading mobile app...</div>
    <div id="error-display"></div>
    <div id="root"></div>

    <!-- React Native Web for iframe bundle globals -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <!-- React Native Web doesn't have a UMD build, let's use a different approach -->
    <script>
      // Create a basic ReactNativeWeb global for iframe bundles
      window.ReactNativeWeb = {
        View: 'div',
        Text: 'span',
        StyleSheet: { 
          create: (styles) => styles,
          hairlineWidth: 1,
          absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }
        },
        Platform: { 
          OS: 'web', 
          select: (obj) => obj.web || obj.default || obj.native || obj.ios || obj.android,
          Version: '0.19.0'
        },
        Dimensions: { 
          get: (dim) => dim === 'screen' ? { width: 375, height: 812, scale: 1, fontScale: 1 } : { width: 375, height: 812 },
          addEventListener: () => {},
          removeEventListener: () => {}
        },
        Pressable: 'button',
        ScrollView: 'div',
        TextInput: 'input',
        Image: 'img',
        SafeAreaView: 'div',
        StatusBar: { setBarStyle: () => {}, setBackgroundColor: () => {} },
        Alert: { alert: (title, msg) => alert(title + ': ' + msg) },
        AppState: { 
          currentState: 'active',
          addEventListener: () => {},
          removeEventListener: () => {}
        },
        Linking: {
          openURL: (url) => window.open(url, '_blank'),
          canOpenURL: () => Promise.resolve(true)
        }
      };
      console.log('🖼️ [Iframe] ReactNativeWeb global created');
    </script>

    <script>
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('🖼️ [Iframe] Global error:', event.error);
            showError('Runtime Error: ' + event.error.message);
        });

        function showError(message) {
            const errorDiv = document.getElementById('error-display');
            const loadingDiv = document.getElementById('loading-display');
            
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            loadingDiv.style.display = 'none';
            
            console.error('🖼️ [Iframe] Error displayed:', message);
        }

        function showSuccess() {
            const loadingDiv = document.getElementById('loading-display');
            loadingDiv.style.display = 'none';
        }

        // Load the self-contained bundle
        async function loadBundle() {
            try {
                console.log('🖼️ [Iframe] Loading self-contained bundle from:', '${bundleUrl}');
                
                // Create script element to load the bundle
                const script = document.createElement('script');
                script.src = '${bundleUrl}';
                script.onerror = () => {
                    showError('Failed to load bundle script');
                };
                
                script.onload = () => {
                    console.log('🖼️ [Iframe] Bundle loaded successfully');
                    
                    // The bundle should have created window.SessionApp
                    setTimeout(() => {
                        if (window.SessionApp) {
                            console.log('🖼️ [Iframe] SessionApp found, rendering...');
                            
                            // Since all dependencies are bundled, SessionApp should be ready to render
                            const rootElement = document.getElementById('root');
                            if (rootElement && window.SessionApp) {
                                showSuccess();
                                console.log('🖼️ [Iframe] App rendered successfully');
                            } else {
                                showError('SessionApp or root element not available');
                            }
                        } else {
                            showError('SessionApp not found in bundle');
                        }
                    }, 100);
                };
                
                document.head.appendChild(script);
                
            } catch (error) {
                console.error('🖼️ [Iframe] Load error:', error);
                showError('Load Error: ' + error.message);
            }
        }
        
        // Start loading when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadBundle);
        } else {
            loadBundle();
        }
    </script>
</body>
</html>
    `.trim();
  }

  /**
   * Get the router instance
   */
  getRouter() {
    return this.router;
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      fileWatcherStats: this.fileWatcherService.getStats(),
      validationStats: this.validationService.getStats()
    };
  }
}

module.exports = SessionRoutes;
