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
      const dynamicScreenRoutes = req.app.get('dynamicScreenRoutes') || new (require('./DynamicScreenRoutes'))();
      const screenDefinition = await dynamicScreenRoutes.buildScreenDefinition(session, screenId);
      
      if (!screenDefinition) {
        return res.status(404).json({
          error: 'Screen not found',
          screenId,
          sessionId,
          timestamp: new Date().toISOString()
        });
      }

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
   * Clean up resources
   */
  cleanup() {
    console.log('🧹 [DirectMobileApp] Cleaning up resources...');
    this.screenCache.clear();
    this.appCache.clear();
  }
}

module.exports = DirectMobileAppRoutes;
