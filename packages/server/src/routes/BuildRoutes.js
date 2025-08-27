const express = require('express');
const ValidationService = require('../services/ValidationService');

/**
 * Build operation routes
 * Extracted from the monolithic visualEditor.js route file
 */
class BuildRoutes {
  constructor() {
    this.router = express.Router();
    this.validationService = new ValidationService();
    this.setupRoutes();
  }

  setupRoutes() {
    // Build session - DISABLED: Using Direct Mobile App Loading now
    // this.router.post('/session/:sessionId/build', this.buildSession.bind(this));
    
    // Serve built session app - DISABLED: Using Direct Mobile App Loading now
    // this.router.get('/session/:sessionId/app.js', this.serveBuildApp.bind(this));
    
    // Auto-rebuild status - DISABLED: Using Direct Mobile App Loading now
    // this.router.get('/auto-rebuild/status', this.getAutoRebuildStatus.bind(this));
    
    // Manual rebuild trigger - DISABLED: Using Direct Mobile App Loading now
    // this.router.post('/auto-rebuild/trigger/:sessionId', this.triggerManualRebuild.bind(this));
  }

  /**
   * Build session workspace
   */
  async buildSession(req, res) {
    const startTime = Date.now();
    const requestId = req.headers['x-request-id'] || `build-${Date.now()}`;
    
    try {
      const { sessionId } = req.params;
      const { forceRebuild = false } = req.body;
      
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

      // const SessionBuilder = require('../sessions/SessionBuilder'); // Disabled: Using Direct Mobile App Loading now
      // const sessionBuilder = new SessionBuilder();
      
      req.log('info', 'Building session workspace', {
        requestId,
        sessionId,
        forceRebuild
      });

      // Get session info
      const fullSessionValidation = await this.validationService.validateSession(sessionManager, sessionId);
      if (!fullSessionValidation.valid) {
        return res.status(404).json(
          this.validationService.createErrorResponse(fullSessionValidation.error, { requestId })
        );
      }

      const session = fullSessionValidation.session;

      // Build the session
      // const buildResult = await sessionBuilder.buildSession(sessionId, session.sessionPath, { forceRebuild }); // Disabled: Using Direct Mobile App Loading now
      return res.status(501).json({ 
        error: 'Session bundling disabled', 
        message: 'Using Direct Mobile App Loading instead of session bundling',
        requestId 
      });
      
      const endTime = Date.now();
      req.updateConnectionStats(true, endTime - startTime);

      req.log('success', 'Session built successfully', {
        requestId,
        sessionId,
        duration: endTime - startTime,
        outputPath: buildResult.outputPath
      });

      res.json(this.validationService.createSuccessResponse({
        sessionId,
        buildResult
      }, {
        message: 'Session built successfully',
        requestId,
        meta: { duration: endTime - startTime }
      }));

    } catch (error) {
      const endTime = Date.now();
      req.updateConnectionStats(false, endTime - startTime);

      req.log('error', 'Failed to build session', {
        requestId,
        sessionId: req.params.sessionId,
        error: error.message,
        duration: endTime - startTime
      });

      res.status(500).json(
        this.validationService.createErrorResponse('Failed to build session', {
          requestId,
          details: error.message
        })
      );
    }
  }

  /**
   * Serve built session app
   */
  async serveBuildApp(req, res) {
    try {
      const { sessionId } = req.params;
      
      const sessionValidation = this.validationService.validateSessionId(sessionId);
      if (!sessionValidation.valid) {
        return res.status(400).json({ error: sessionValidation.error });
      }
      
      const sessionManager = req.app.get('sessionManager');
      // const SessionBuilder = require('../sessions/SessionBuilder'); // Disabled: Using Direct Mobile App Loading now
      // const sessionBuilder = new SessionBuilder();
      
      // Get session info
      const fullSessionValidation = await this.validationService.validateSession(sessionManager, sessionId);
      if (!fullSessionValidation.valid) {
        return res.status(404).json({ error: fullSessionValidation.error });
      }

      const session = fullSessionValidation.session;

      // Get compiled app path
      // const compiledAppPath = sessionBuilder.getCompiledAppPath(session.sessionPath); // Disabled: Using Direct Mobile App Loading now
      return res.status(501).json({ 
        error: 'Session bundling disabled', 
        message: 'Using Direct Mobile App Loading instead of session bundling',
        requestId 
      });
      
      if (!compiledAppPath) {
        return res.status(404).json({ 
          error: 'Session not built. Please build the session first.',
          buildEndpoint: `/api/editor/session/${sessionId}/build`
        });
      }

      // Serve the compiled JavaScript file
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(compiledAppPath);

    } catch (error) {
      console.error('❌ [BuildRoutes] Error serving session app:', error);
      res.status(500).json({
        error: 'Failed to serve session app',
        details: error.message
      });
    }
  }

  /**
   * Get auto-rebuild status
   */
  getAutoRebuildStatus(req, res) {
    const startTime = Date.now();
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    req.log('info', 'Auto-rebuild status requested', { requestId });

    const autoRebuildManager = req.app.get('autoRebuildManager');
    if (!autoRebuildManager) {
      return res.status(500).json(
        this.validationService.createErrorResponse('Auto-rebuild manager not available', { requestId })
      );
    }

    const status = autoRebuildManager.getStatus();
    
    res.json(this.validationService.createSuccessResponse({
      status
    }, {
      message: 'Auto-rebuild status retrieved',
      requestId,
      meta: { responseTime: `${Date.now() - startTime}ms` }
    }));
  }

  /**
   * Trigger manual rebuild
   */
  async triggerManualRebuild(req, res) {
    const startTime = Date.now();
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const { sessionId } = req.params;

    req.log('info', 'Manual rebuild triggered', { sessionId, requestId });

    try {
      const sessionValidation = this.validationService.validateSessionId(sessionId);
      if (!sessionValidation.valid) {
        return res.status(400).json(
          this.validationService.createErrorResponse(sessionValidation.error, { requestId })
        );
      }

      const autoRebuildManager = req.app.get('autoRebuildManager');
      if (!autoRebuildManager) {
        return res.status(500).json(
          this.validationService.createErrorResponse('Auto-rebuild manager not available', { requestId })
        );
      }

      const buildResult = await autoRebuildManager.manualRebuild(sessionId);
      
      req.log('info', 'Manual rebuild completed', {
        sessionId,
        buildResult: buildResult.compiledAppPath,
        requestId,
        duration: `${Date.now() - startTime}ms`
      });

      res.json(this.validationService.createSuccessResponse({
        sessionId,
        buildResult
      }, {
        message: `Manual rebuild completed for session ${sessionId}`,
        requestId,
        meta: { responseTime: `${Date.now() - startTime}ms` }
      }));

    } catch (error) {
      req.log('error', 'Manual rebuild failed', {
        sessionId,
        error: error.message,
        requestId,
        responseTime: `${Date.now() - startTime}ms`
      });

      res.status(500).json(
        this.validationService.createErrorResponse(error.message, { requestId })
      );
    }
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
      validationStats: this.validationService.getStats()
    };
  }
}

module.exports = BuildRoutes;
