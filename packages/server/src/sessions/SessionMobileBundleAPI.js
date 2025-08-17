const SessionMobileBundleBuilder = require('./SessionMobileBundleBuilder');
const path = require('path');
const fs = require('fs-extra');

/**
 * API endpoints for mobile bundle operations
 */
class SessionMobileBundleAPI {
  constructor(app, io) {
    this.app = app;
    this.io = io;
    this.bundleBuilder = new SessionMobileBundleBuilder();
    this.setupRoutes();
  }

  setupRoutes() {
    // Build mobile bundle for session
    this.app.post('/api/editor/session/:sessionId/build-mobile', async (req, res) => {
      try {
        const { sessionId } = req.params;
        const { platform = 'android', dev = true, minify = false } = req.body;
        
        console.log(`📱 [SessionMobileBundleAPI] Building mobile bundle for session: ${sessionId}`);
        
        // Get session info
        const sessionManager = req.app.get('sessionManager');
        const session = sessionManager.getSession(sessionId);
        
        if (!session) {
          return res.status(404).json({
            success: false,
            error: 'Session not found'
          });
        }

        // Build mobile bundle using Metro
        const result = await this.bundleBuilder.buildMobileBundle(
          sessionId, 
          session.sessionPath, 
          { platform, dev, minify }
        );
        
        // Emit bundle ready event to connected clients
        this.io.emit('mobile-bundle-ready', {
          sessionId,
          platform,
          bundleSize: result.stats.bundleSize,
          timestamp: Date.now()
        });

        res.json({
          success: true,
          result: {
            sessionId: result.sessionId,
            platform: result.platform,
            stats: result.stats,
            bundleUrl: `/api/editor/session/${sessionId}/mobile-bundle/${platform}`
          }
        });

      } catch (error) {
        console.error(`❌ [SessionMobileBundleAPI] Failed to build mobile bundle:`, error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Serve mobile bundle file
    this.app.get('/api/editor/session/:sessionId/mobile-bundle/:platform', (req, res) => {
      try {
        const { sessionId, platform } = req.params;
        
        // Get session info
        const sessionManager = req.app.get('sessionManager');
        const session = sessionManager.getSession(sessionId);
        
        if (!session) {
          return res.status(404).json({
            success: false,
            error: 'Session not found'
          });
        }

        // Get bundle path
        const bundlePath = this.bundleBuilder.getMobileBundlePath(
          session.sessionPath, 
          sessionId, 
          platform
        );
        
        if (!bundlePath || !fs.existsSync(bundlePath)) {
          return res.status(404).json({
            success: false,
            error: 'Bundle not found. Build the bundle first.'
          });
        }

        // Serve bundle file
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'no-cache');
        res.sendFile(bundlePath);

      } catch (error) {
        console.error(`❌ [SessionMobileBundleAPI] Failed to serve bundle:`, error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Serve source map file
    this.app.get('/api/editor/session/:sessionId/mobile-bundle/:platform/map', (req, res) => {
      try {
        const { sessionId, platform } = req.params;
        
        // Get session info
        const sessionManager = req.app.get('sessionManager');
        const session = sessionManager.getSession(sessionId);
        
        if (!session) {
          return res.status(404).send('Session not found');
        }

        // Get source map path
        const mapPath = path.join(
          session.sessionPath, 
          'mobile-dist', 
          `session-${sessionId}.${platform}.bundle.map`
        );
        
        if (!fs.existsSync(mapPath)) {
          return res.status(404).send('Source map not found');
        }

        // Serve source map
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache');
        res.sendFile(mapPath);

      } catch (error) {
        console.error(`❌ [SessionMobileBundleAPI] Failed to serve source map:`, error);
        res.status(500).send('Failed to serve source map');
      }
    });

    // Build bundles for multiple platforms
    this.app.post('/api/editor/session/:sessionId/build-mobile-all', async (req, res) => {
      try {
        const { sessionId } = req.params;
        const { platforms = ['android', 'ios'], dev = true, minify = false } = req.body;
        
        console.log(`🚀 [SessionMobileBundleAPI] Building mobile bundles for platforms: ${platforms.join(', ')}`);
        
        // Get session info
        const sessionManager = req.app.get('sessionManager');
        const session = sessionManager.getSession(sessionId);
        
        if (!session) {
          return res.status(404).json({
            success: false,
            error: 'Session not found'
          });
        }

        // Build bundles for all platforms
        const results = await this.bundleBuilder.buildMultiPlatformBundles(
          sessionId, 
          session.sessionPath, 
          platforms
        );
        
        // Emit bundle ready events
        for (const [platform, result] of Object.entries(results)) {
          if (!result.error) {
            this.io.emit('mobile-bundle-ready', {
              sessionId,
              platform,
              bundleSize: result.stats?.bundleSize,
              timestamp: Date.now()
            });
          }
        }

        res.json({
          success: true,
          results: Object.entries(results).reduce((acc, [platform, result]) => {
            if (result.error) {
              acc[platform] = { error: result.error };
            } else {
              acc[platform] = {
                stats: result.stats,
                bundleUrl: `/api/editor/session/${sessionId}/mobile-bundle/${platform}`
              };
            }
            return acc;
          }, {})
        });

      } catch (error) {
        console.error(`❌ [SessionMobileBundleAPI] Failed to build multi-platform bundles:`, error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get bundle info
    this.app.get('/api/editor/session/:sessionId/mobile-bundle/:platform/info', (req, res) => {
      try {
        const { sessionId, platform } = req.params;
        
        // Get session info
        const sessionManager = req.app.get('sessionManager');
        const session = sessionManager.getSession(sessionId);
        
        if (!session) {
          return res.status(404).json({
            success: false,
            error: 'Session not found'
          });
        }

        // Check if bundle exists
        const bundlePath = this.bundleBuilder.getMobileBundlePath(
          session.sessionPath, 
          sessionId, 
          platform
        );
        
        if (!bundlePath) {
          return res.json({
            success: true,
            exists: false,
            message: 'Bundle not built yet'
          });
        }

        // Get bundle stats
        const stats = fs.statSync(bundlePath);
        
        res.json({
          success: true,
          exists: true,
          info: {
            sessionId,
            platform,
            bundlePath: path.basename(bundlePath),
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            bundleUrl: `/api/editor/session/${sessionId}/mobile-bundle/${platform}`,
            mapUrl: `/api/editor/session/${sessionId}/mobile-bundle/${platform}/map`
          }
        });

      } catch (error) {
        console.error(`❌ [SessionMobileBundleAPI] Failed to get bundle info:`, error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Clean mobile build artifacts
    this.app.delete('/api/editor/session/:sessionId/mobile-build', async (req, res) => {
      try {
        const { sessionId } = req.params;
        
        // Get session info
        const sessionManager = req.app.get('sessionManager');
        const session = sessionManager.getSession(sessionId);
        
        if (!session) {
          return res.status(404).json({
            success: false,
            error: 'Session not found'
          });
        }

        // Clean mobile build artifacts
        await this.bundleBuilder.cleanMobileSession(session.sessionPath);
        
        res.json({
          success: true,
          message: `Mobile build artifacts cleaned for session ${sessionId}`
        });

      } catch (error) {
        console.error(`❌ [SessionMobileBundleAPI] Failed to clean mobile build:`, error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // WebSocket endpoint for real-time mobile bundle updates
    this.io.on('connection', (socket) => {
      console.log('📱 [SessionMobileBundleAPI] Client connected for mobile bundle updates');
      
      // Handle mobile bundle request
      socket.on('request-mobile-bundle', async (data) => {
        try {
          const { sessionId, platform = 'android' } = data;
          
          console.log(`📱 [SessionMobileBundleAPI] Mobile bundle requested for session: ${sessionId}, platform: ${platform}`);
          
          // Get session info
          const sessionManager = this.app.get('sessionManager');
          const session = sessionManager.getSession(sessionId);
          
          if (!session) {
            socket.emit('mobile-bundle-error', { error: 'Session not found' });
            return;
          }

          // Check if bundle exists
          const bundlePath = this.bundleBuilder.getMobileBundlePath(
            session.sessionPath, 
            sessionId, 
            platform
          );
          
          if (bundlePath) {
            // Send existing bundle info
            socket.emit('mobile-bundle-available', {
              sessionId,
              platform,
              bundleUrl: `/api/editor/session/${sessionId}/mobile-bundle/${platform}`,
              timestamp: Date.now()
            });
          } else {
            // Build bundle
            socket.emit('mobile-bundle-building', { sessionId, platform });
            
            const result = await this.bundleBuilder.buildMobileBundle(
              sessionId, 
              session.sessionPath, 
              { platform }
            );
            
            socket.emit('mobile-bundle-ready', {
              sessionId,
              platform,
              bundleUrl: `/api/editor/session/${sessionId}/mobile-bundle/${platform}`,
              bundleSize: result.stats.bundleSize,
              timestamp: Date.now()
            });
          }
          
        } catch (error) {
          console.error(`❌ [SessionMobileBundleAPI] Failed to handle mobile bundle request:`, error);
          socket.emit('mobile-bundle-error', { 
            error: error.message,
            sessionId: data.sessionId,
            platform: data.platform 
          });
        }
      });

      socket.on('disconnect', () => {
        console.log('📱 [SessionMobileBundleAPI] Client disconnected');
      });
    });
  }

  /**
   * Get the bundle builder instance
   * @returns {SessionMobileBundleBuilder}
   */
  getBundleBuilder() {
    return this.bundleBuilder;
  }
}

module.exports = SessionMobileBundleAPI;
