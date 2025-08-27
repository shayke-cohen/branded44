const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { performance } = require('perf_hooks');

/**
 * Direct Mobile App Routes - Enhanced for the new Direct Mobile App Loading system
 * 
 * NEW APPROACH: Load real mobile app as baseline with screen overrides
 * - Import real mobile app directly
 * - Hot-swap individual screens from session
 * - No complex bundling or transformations
 * - Much cleaner and more efficient!
 */
class DirectMobileAppRoutes {
  constructor() {
    this.router = express.Router();
    this.screenCache = new Map(); // Cache for screen overrides
    this.appCache = new Map(); // Cache for full app bundles
    this.setupRoutes();
    
    console.log('📱 [DirectMobileAppRoutes] Direct mobile app routes initialized (NEW APPROACH)');
  }

  setupRoutes() {
    // Enhanced endpoints for Direct Mobile App Loading (use unique paths to avoid conflicts)
    this.router.get('/session/:sessionId/direct-mobile-app', this.getMobileApp.bind(this));
    this.router.get('/session/:sessionId/direct-screens', this.listScreens.bind(this));
    this.router.get('/session/:sessionId/direct-screen/:screenId', this.getScreenDefinition.bind(this));
    this.router.get('/session/:sessionId/changed-files', this.getChangedFiles.bind(this)); // NEW: Session change detection
    
    // Real-time updates  
    this.router.delete('/session/:sessionId/cache', this.clearCache.bind(this));
    
    // Hot-reload triggers
    this.router.post('/session/:sessionId/direct-hot-reload', this.triggerHotReload.bind(this));
    this.router.post('/session/:sessionId/direct-inject-screen', this.injectNewScreen.bind(this));
    this.router.post('/session/:sessionId/direct-update-navigation', this.updateNavigation.bind(this));
  }

  /**
   * Get the real mobile app for direct loading
   * This provides the app structure and metadata needed for direct import
   */
  async getMobileApp(req, res) {
    const startTime = performance.now();
    const { sessionId } = req.params;
    
    try {
      console.log(`📱 [DirectMobileApp] Getting real mobile app for session: ${sessionId}`);
      
      const sessionManager = req.app.get('sessionManager');
      const session = sessionManager?.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ 
          error: 'Session not found',
          sessionId,
          timestamp: new Date().toISOString()
        });
      }

      // Check cache first
      const cacheKey = `app:${sessionId}`;
      if (this.appCache.has(cacheKey)) {
        const cached = this.appCache.get(cacheKey);
        if (Date.now() - cached.timestamp < 60000) { // 1 minute cache
          console.log(`💾 [DirectMobileApp] Using cached app for session: ${sessionId}`);
          return res.json(cached.app);
        }
      }

      // Build mobile app metadata
      const mobileApp = await this.buildMobileAppDefinition(session);
      
      if (!mobileApp) {
        return res.status(404).json({
          error: 'Mobile app not found',
          sessionId,
          timestamp: new Date().toISOString()
        });
      }

      // Cache the result
      this.appCache.set(cacheKey, {
        app: mobileApp,
        timestamp: Date.now()
      });

      // Set cache headers
      res.set({
        'Cache-Control': 'no-cache',
        'ETag': `"app-${sessionId}-${Date.now()}"`,
        'X-App-Build-Time': `${(performance.now() - startTime).toFixed(2)}ms`
      });

      res.json(mobileApp);
      console.log(`✅ [DirectMobileApp] Mobile app definition sent: ${sessionId} (${(performance.now() - startTime).toFixed(2)}ms)`);

    } catch (error) {
      console.error(`❌ [DirectMobileApp] Error getting mobile app ${sessionId}:`, error);
      res.status(500).json({
        error: 'Failed to get mobile app',
        message: error.message,
        sessionId,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Build mobile app definition from session
   */
  async buildMobileAppDefinition(session) {
    try {
      const srcPath = session.srcPath || path.join(session.workspacePath, 'src');
      
      // Look for main App component
      const appPaths = [
        path.join(srcPath, 'App.tsx'),
        path.join(srcPath, 'App.js'),
        path.join(srcPath, 'index.tsx'),
        path.join(srcPath, 'index.js')
      ];

      let appPath = null;
      for (const possiblePath of appPaths) {
        if (await fs.pathExists(possiblePath)) {
          appPath = possiblePath;
          break;
        }
      }

      if (!appPath) {
        console.warn(`⚠️ [DirectMobileApp] No main App component found for session: ${session.sessionId}`);
        return null;
      }

      // Get available screens
      const availableScreens = await this.getAvailableScreens(session);
      
      // Read package.json for dependencies
      const packageJsonPath = path.join(session.workspacePath, 'package.json');
      let dependencies = {};
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath);
        dependencies = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies
        };
      }

      // Create mobile app definition
      const mobileAppDefinition = {
        sessionId: session.sessionId,
        version: '1.0.0-direct',
        platform: 'universal',
        approach: 'direct-mobile-app-loading',
        
        // App structure
        app: {
          mainComponent: path.relative(session.workspacePath, appPath),
          importPath: '../../../mobile/src/App', // Relative to visual-editor
          availableScreens: availableScreens.length,
          screens: availableScreens.map(screen => ({
            id: screen.id,
            name: screen.name,
            path: screen.path,
            type: screen.type
          }))
        },

        // Session metadata
        session: {
          sessionId: session.sessionId,
          workspacePath: session.workspacePath,
          srcPath: srcPath,
          lastModified: new Date().toISOString()
        },

        // Runtime configuration
        configuration: {
          hotReloadEnabled: true,
          screenOverridesEnabled: true,
          realTimeUpdates: true,
          webSocketEnabled: true
        },

        // Dependencies (for reference)
        dependencies: Object.keys(dependencies).slice(0, 10), // Limit for response size
        
        // API endpoints this app uses
        endpoints: {
          screens: `/api/editor/session/${session.sessionId}/screens`,
          screenOverride: `/api/editor/session/${session.sessionId}/screen/{screenId}`,
          hotReload: `/api/editor/session/${session.sessionId}/hot-reload`,
          webSocket: `/socket.io/`
        }
      };

      return mobileAppDefinition;

    } catch (error) {
      console.error(`❌ [DirectMobileApp] Error building mobile app definition:`, error);
      return null;
    }
  }

  /**
   * Get available screens in the session (reuse from DynamicScreenRoutes)
   */
  async getAvailableScreens(session) {
    const srcPath = session.srcPath || path.join(session.workspacePath, 'src');
    const screensDir = path.join(srcPath, 'screens');
    const screens = [];
    
    if (await fs.pathExists(screensDir)) {
      const items = await fs.readdir(screensDir, { withFileTypes: true });
      
      for (const item of items) {
        if (item.isDirectory()) {
          const screenDir = path.join(screensDir, item.name);
          const componentFile = path.join(screenDir, `${item.name}.tsx`);
          const indexFile = path.join(screenDir, 'index.tsx');
          
          if (await fs.pathExists(componentFile) || await fs.pathExists(indexFile)) {
            screens.push({
              id: item.name,
              name: item.name,
              path: screenDir,
              type: 'directory'
            });
          }
        } else if (item.name.endsWith('.tsx') && !item.name.startsWith('index')) {
          const screenId = item.name.replace('.tsx', '');
          screens.push({
            id: screenId,
            name: screenId,
            path: path.join(screensDir, item.name),
            type: 'file'
          });
        }
      }
    }

    return screens;
  }

  /**
   * List available screens (reuse existing DynamicScreenRoutes implementation)
   */
  async listScreens(req, res) {
    const { sessionId } = req.params;
    
    try {
      const sessionManager = req.app.get('sessionManager');
      const session = sessionManager?.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const screens = await this.getAvailableScreens(session);

      res.json({
        sessionId,
        screens,
        count: screens.length,
        timestamp: new Date().toISOString(),
        approach: 'direct-mobile-app-loading'
      });

    } catch (error) {
      console.error(`❌ [DirectMobileApp] Error listing screens:`, error);
      res.status(500).json({
        error: 'Failed to list screens',
        message: error.message,
        sessionId
      });
    }
  }

  /**
   * Get screen definition (delegate to DynamicScreenRoutes for compatibility)
   */
  async getScreenDefinition(req, res) {
    const { sessionId, screenId } = req.params;
    
    try {
      console.log(`📱 [DirectMobileApp] Getting screen override: ${screenId} (session: ${sessionId})`);
      
      const sessionManager = req.app.get('sessionManager');
      const session = sessionManager?.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ 
          error: 'Session not found',
          sessionId,
          timestamp: new Date().toISOString()
        });
      }

      // Use DynamicScreenRoutes logic for screen transformation
      const dynamicScreenRoutes = req.app.get('dynamicScreenRoutes');
      if (!dynamicScreenRoutes) {
        console.log(`⚠️ [DirectMobileApp] dynamicScreenRoutes not found in app context, creating new instance`);
      } else {
        console.log(`✅ [DirectMobileApp] Found dynamicScreenRoutes in app context`);
      }
      
      const dynamicScreenRoutesInstance = dynamicScreenRoutes || new (require('./DynamicScreenRoutes'))();
      console.log(`📱 [DirectMobileApp] Building screen definition for ${screenId} in session ${sessionId}`);
      console.log(`📁 [DirectMobileApp] Session workspace path: ${session.workspacePath}`);
      console.log(`📁 [DirectMobileApp] Session src path: ${session.srcPath || 'undefined'}`);
      
      // DEBUG: Add detailed logging before calling buildScreenDefinition
      console.log(`🔍 [DirectMobileApp] About to call buildScreenDefinition with:`);
      console.log(`🔍 [DirectMobileApp] - screenId: ${screenId}`);
      console.log(`🔍 [DirectMobileApp] - session.sessionId: ${session.sessionId}`);
      console.log(`🔍 [DirectMobileApp] - session keys:`, Object.keys(session));
      
      const screenDefinition = await dynamicScreenRoutesInstance.buildScreenDefinition(session, screenId);
      
      // DEBUG: Log what buildScreenDefinition returned
      console.log(`🔍 [DirectMobileApp] buildScreenDefinition returned:`);
      console.log(`🔍 [DirectMobileApp] - screenDefinition keys:`, Object.keys(screenDefinition || {}));
      if (screenDefinition?.code?.component) {
        const codePreview = screenDefinition.code.component.substring(0, 150) + '...';
        console.log(`🔍 [DirectMobileApp] - code preview:`, codePreview);
        
        // Look for user's unique test text
        const hasTestText = screenDefinition.code.component.includes('TEST UNIQUE CHANGE 12345');
        console.log(`🔍 [DirectMobileApp] - contains test text:`, hasTestText);
        
        // Extract text content from the code
        const textMatches = screenDefinition.code.component.match(/"[^"]*"/g) || [];
        console.log(`🔍 [DirectMobileApp] - text content found:`, textMatches.slice(0, 5));
      }
      
      if (!screenDefinition) {
        console.error(`❌ [DirectMobileApp] buildScreenDefinition returned null for ${screenId}`);
        return res.status(404).json({
          error: 'Screen not found',
          screenId,
          sessionId,
          timestamp: new Date().toISOString(),
          details: `Failed to build screen definition for ${screenId}. Check if screen files exist in session workspace.`
        });
      }
      
      console.log(`✅ [DirectMobileApp] Successfully built screen definition for ${screenId}`);

      // Add direct loading metadata
      screenDefinition.approach = 'direct-mobile-app-loading';
      screenDefinition.hotReloadEnabled = true;
      
      res.set({
        'Cache-Control': 'no-cache',
        'ETag': `"screen-${screenId}-${Date.now()}"`,
        'X-Screen-Approach': 'direct-loading'
      });

      res.json(screenDefinition);

    } catch (error) {
      console.error(`❌ [DirectMobileApp] Error getting screen definition ${screenId}:`, error);
      res.status(500).json({
        error: 'Failed to get screen definition',
        message: error.message,
        screenId,
        sessionId,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Trigger hot-reload for a screen
   */
  async triggerHotReload(req, res) {
    const { sessionId } = req.params;
    const { screenId } = req.body;
    
    try {
      console.log(`🔥 [DirectMobileApp] Triggering hot-reload for screen: ${screenId} (session: ${sessionId})`);
      
      // Clear screen cache
      const screenCacheKey = `${sessionId}:${screenId}`;
      this.screenCache.delete(screenCacheKey);
      
      // Use dedicated WebSocket manager for hot-reload
      const directMobileAppWS = req.app.get('directMobileAppWS');
      if (directMobileAppWS) {
        directMobileAppWS.triggerScreenHotReload(sessionId, screenId, { timestamp: new Date().toISOString() });
      } else {
        // Fallback to direct Socket.IO
        const io = req.io || global.io;
        if (io) {
          io.emit('screen-hot-reload', {
            sessionId,
            screenId,
            timestamp: new Date().toISOString(),
            type: 'hot-reload'
          });
          console.log(`📡 [DirectMobileApp] WebSocket hot-reload event sent for: ${screenId}`);
        }
      }
      
      res.json({
        success: true,
        message: 'Hot-reload triggered',
        sessionId,
        screenId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`❌ [DirectMobileApp] Error triggering hot-reload:`, error);
      res.status(500).json({
        error: 'Failed to trigger hot-reload',
        message: error.message,
        sessionId,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Inject new screen to running app
   */
  async injectNewScreen(req, res) {
    const { sessionId } = req.params;
    const { screenId, screenDefinition } = req.body;
    
    try {
      console.log(`➕ [DirectMobileApp] Injecting new screen: ${screenId} (session: ${sessionId})`);
      
      // Use dedicated WebSocket manager for screen injection
      const directMobileAppWS = req.app.get('directMobileAppWS');
      if (directMobileAppWS) {
        directMobileAppWS.injectNewScreen(sessionId, { ...screenDefinition, id: screenId });
      } else {
        // Fallback to direct Socket.IO
        const io = req.io || global.io;
        if (io) {
          io.emit('screen-injection', {
            sessionId,
            screenId,
            screenDefinition,
            timestamp: new Date().toISOString(),
            type: 'new-screen'
          });
          console.log(`📡 [DirectMobileApp] WebSocket screen injection event sent for: ${screenId}`);
        }
      }
      
      res.json({
        success: true,
        message: 'Screen injection triggered',
        sessionId,
        screenId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`❌ [DirectMobileApp] Error injecting screen:`, error);
      res.status(500).json({
        error: 'Failed to inject screen',
        message: error.message,
        sessionId,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update navigation/routing
   */
  async updateNavigation(req, res) {
    const { sessionId } = req.params;
    const { navigationConfig } = req.body;
    
    try {
      console.log(`🧭 [DirectMobileApp] Updating navigation for session: ${sessionId}`);
      
      // Use dedicated WebSocket manager for navigation updates
      const directMobileAppWS = req.app.get('directMobileAppWS');
      if (directMobileAppWS) {
        directMobileAppWS.updateNavigation(sessionId, navigationConfig);
      } else {
        // Fallback to direct Socket.IO
        const io = req.io || global.io;
        if (io) {
          io.emit('navigation-update', {
            sessionId,
            navigationConfig,
            timestamp: new Date().toISOString(),
            type: 'navigation-change'
          });
          console.log(`📡 [DirectMobileApp] WebSocket navigation update event sent`);
        }
      }
      
      res.json({
        success: true,
        message: 'Navigation update triggered',
        sessionId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`❌ [DirectMobileApp] Error updating navigation:`, error);
      res.status(500).json({
        error: 'Failed to update navigation',
        message: error.message,
        sessionId,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Clear cache for session
   */
  async clearCache(req, res) {
    const { sessionId } = req.params;
    
    try {
      // Clear all caches for this session
      for (const [key] of this.screenCache.entries()) {
        if (key.startsWith(`${sessionId}:`)) {
          this.screenCache.delete(key);
        }
      }
      
      this.appCache.delete(`app:${sessionId}`);
      
      console.log(`🧹 [DirectMobileApp] Cache cleared for session: ${sessionId}`);

      res.json({
        success: true,
        message: 'Cache cleared',
        sessionId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`❌ [DirectMobileApp] Error clearing cache:`, error);
      res.status(500).json({
        error: 'Failed to clear cache',
        message: error.message,
        sessionId
      });
    }
  }

  /**
   * Get the router instance
   */
  getRouter() {
    return this.router;
  }

  /**
   * Get stats for monitoring
   */
  getStats() {
    return {
      screenCacheSize: this.screenCache.size,
      appCacheSize: this.appCache.size,
      approach: 'direct-mobile-app-loading',
      features: [
        'real-mobile-app-import',
        'screen-hot-swap',
        'websocket-updates',
        'no-bundling-complexity'
      ]
    };
  }

  /**
   * NEW: Get changed files for a session (Session Change Detection API)
   * Returns list of files that have been modified in the session workspace
   */
  async getChangedFiles(req, res) {
    const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const { sessionId } = req.params;
    
    console.log(`📋 [${new Date().toISOString()}] Incoming request`);
    console.log(`  Summary: 6 fields - requestId, method, path...`);
    console.log(`🔄 [VisualEditor] GET /session/${sessionId}/changed-files - Start (${requestId})`);
    
    try {
      const sessionManager = req.app.get('sessionManager');
      const session = sessionManager?.getSession(sessionId);
      
      if (!session) {
        console.log(`❌ [DirectMobileApp] Session not found: ${sessionId}`);
        return res.status(404).json({ error: 'Session not found' });
      }
      
      console.log(`📁 [DirectMobileApp] Detecting changed files for session: ${sessionId}`);
      const changedFiles = await this.detectChangedFilesInSession(session);
      console.log(`📊 [DirectMobileApp] Found ${changedFiles.length} changed files:`, changedFiles.map(f => f.screenId));
      
      res.json({
        sessionId,
        changedFiles,
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ [VisualEditor] GET /session/${sessionId}/changed-files - 200 (${Date.now() % 1000}ms)`);
    } catch (error) {
      console.error(`❌ [DirectMobileApp] Error getting changed files:`, error);
      res.status(500).json({ error: error.message });
      console.log(`❌ [VisualEditor] GET /session/${sessionId}/changed-files - 500`);
    }
  }

  /**
   * Detect which files have been changed in the session workspace
   */
  async detectChangedFilesInSession(session) {
    const changedFiles = [];
    
    try {
      const sessionScreensDir = path.join(session.workspacePath, 'screens');
      const sourceScreensDir = path.join(session.srcPath || path.join(session.workspacePath, 'src'), 'screens');
      
      console.log(`🔍 [DirectMobileApp] DETAILED SCANNING for changes:`);
      console.log(`🔍 [DirectMobileApp] - Session: ${sessionScreensDir}`);
      console.log(`🔍 [DirectMobileApp] - Source: ${sourceScreensDir}`);
      console.log(`🔍 [DirectMobileApp] - Session workspace: ${session.workspacePath}`);
      console.log(`🔍 [DirectMobileApp] - Session srcPath: ${session.srcPath}`);
      console.log(`🔍 [DirectMobileApp] - Session createdAt: ${session.createdAt}`);
      console.log(`🔍 [DirectMobileApp] - Session startTime: ${session.startTime}`);
      
      const sessionDirExists = await fs.pathExists(sessionScreensDir);
      console.log(`🔍 [DirectMobileApp] - Session screens dir exists: ${sessionDirExists}`);
      
      if (!sessionDirExists) {
        console.log(`📁 [DirectMobileApp] No session screens directory found`);
        return changedFiles;
      }
      
      const sessionItems = await fs.readdir(sessionScreensDir, { withFileTypes: true });
      console.log(`🔍 [DirectMobileApp] - Found ${sessionItems.length} items in session screens:`);
      
      for (const item of sessionItems) {
        console.log(`🔍 [DirectMobileApp] - Item: ${item.name} (isDirectory: ${item.isDirectory()})`);
        
        if (item.isDirectory()) {
          const screenId = item.name;
          const sessionScreenDir = path.join(sessionScreensDir, screenId);
          const sourceScreenDir = path.join(sourceScreensDir, screenId);
          
          console.log(`🔍 [DirectMobileApp] - Checking screen: ${screenId}`);
          console.log(`🔍 [DirectMobileApp] - Session screen dir: ${sessionScreenDir}`);
          console.log(`🔍 [DirectMobileApp] - Source screen dir: ${sourceScreenDir}`);
          
          // Check if this screen has changes
          const hasChanges = await this.screenHasChanges(sessionScreenDir, sourceScreenDir, session);
          
          console.log(`🔍 [DirectMobileApp] - Screen ${screenId} has changes: ${hasChanges}`);
          
          if (hasChanges) {
            // Find the main component file
            const componentFile = await this.findMainComponentFile(sessionScreenDir, screenId);
            
            console.log(`🔍 [DirectMobileApp] - Component file for ${screenId}: ${componentFile}`);
            
            if (componentFile) {
              const fileStats = await fs.stat(componentFile);
              changedFiles.push({
                screenId,
                screenDir: screenId, // Directory name
                filePath: componentFile,
                relativePath: path.relative(session.workspacePath, componentFile),
                changeType: 'modified',
                lastModified: fileStats.mtime
              });
              
              console.log(`✅ [DirectMobileApp] Changed screen detected: ${screenId} (modified: ${fileStats.mtime})`);
            }
          }
        }
      }
      
      console.log(`📊 [DirectMobileApp] FINAL RESULT: Found ${changedFiles.length} changed files`);
      
    } catch (error) {
      console.error(`❌ [DirectMobileApp] Error detecting changed files:`, error);
    }
    
    return changedFiles;
  }

  /**
   * Check if a screen has changes compared to source
   */
  async screenHasChanges(sessionScreenDir, sourceScreenDir, session) {
    try {
      const sessionExists = await fs.pathExists(sessionScreenDir);
      const sourceExists = await fs.pathExists(sourceScreenDir);
      
      console.log(`🔍 [DirectMobileApp] - Session dir exists: ${sessionExists}`);
      console.log(`🔍 [DirectMobileApp] - Source dir exists: ${sourceExists}`);
      
      // If session screen doesn't exist, no changes
      if (!sessionExists) {
        console.log(`🔍 [DirectMobileApp] - Session screen doesn't exist, no changes`);
        return false;
      }
      
      // If source screen doesn't exist, session screen is definitely a change
      if (!sourceExists) {
        console.log(`🔍 [DirectMobileApp] - Source screen doesn't exist, session is a change`);
        return true;
      }
      
      // SIMPLIFIED LOGIC: If session directory exists, it's a change (user must have edited it)
      // This is much more reliable than timestamp checking
      console.log(`🔍 [DirectMobileApp] - Both dirs exist, considering session as changed (user edited)`);
      
      // Optional: Add timestamp debugging for analysis
      try {
        const sessionStats = await fs.stat(sessionScreenDir);
        const sessionCreatedAt = new Date(session.createdAt || session.startTime || 0);
        
        console.log(`🔍 [DirectMobileApp] - Session created: ${sessionCreatedAt.toISOString()}`);
        console.log(`🔍 [DirectMobileApp] - Session dir modified: ${sessionStats.mtime.toISOString()}`);
        console.log(`🔍 [DirectMobileApp] - Time comparison: ${sessionStats.mtime > sessionCreatedAt}`);
      } catch (timeError) {
        console.log(`🔍 [DirectMobileApp] - Could not check timestamps:`, timeError.message);
      }
      
      return true; // If session directory exists, assume it's changed
      
    } catch (error) {
      console.error(`❌ [DirectMobileApp] Error checking screen changes:`, error);
      return false;
    }
  }

  /**
   * Find the main component file in a screen directory
   */
  async findMainComponentFile(screenDir, screenId) {
    const possibleFiles = [
      path.join(screenDir, `${screenId}.tsx`),
      path.join(screenDir, `${screenId}.ts`),
      path.join(screenDir, 'index.tsx'),
      path.join(screenDir, 'index.ts')
    ];
    
    for (const filePath of possibleFiles) {
      if (await fs.pathExists(filePath)) {
        return filePath;
      }
    }
    
    return null;
  }

  /**
   * Clean up resources
   */
  cleanup() {
    console.log('🧹 [DirectMobileApp] Cleaning up resources...');
    this.screenCache.clear();
    this.appCache.clear();
  }
}

module.exports = DirectMobileAppRoutes;
