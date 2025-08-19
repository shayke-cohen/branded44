const express = require('express');
const ValidationService = require('../services/ValidationService');
const ComponentScannerService = require('../services/ComponentScannerService');
const ContentTracingService = require('../services/ContentTracingService');

/**
 * Component-related routes (scanning, tracing)
 * Extracted from the monolithic visualEditor.js route file
 */
class ComponentRoutes {
  constructor() {
    this.router = express.Router();
    this.validationService = new ValidationService();
    this.componentScannerService = new ComponentScannerService();
    this.contentTracingService = new ContentTracingService();
    this.setupRoutes();
  }

  setupRoutes() {
    // Component scanning
    this.router.get('/scan-components', this.scanComponents.bind(this));
    
    // Content tracing
    this.router.post('/trace-content', this.traceContent.bind(this));
    
    // Server-Sent Events for real-time updates
    this.router.get('/events', this.handleEventStream.bind(this));
  }

  /**
   * Scan workspace for components
   */
  async scanComponents(req, res) {
    const startTime = Date.now();
    const requestId = Date.now().toString();

    try {
      req.log('info', 'Scanning components in workspace directory', { requestId });

      // Get current session workspace path
      const currentSession = global.currentEditorSession;
      if (!currentSession || !currentSession.workspacePath) {
        return res.status(404).json(
          this.validationService.createErrorResponse('No active editing session. Please initialize first.', { requestId })
        );
      }

      const workspacePath = currentSession.workspacePath;

      // Validate workspace
      const workspaceValidation = await this.validationService.validateWorkspace(workspacePath);
      if (!workspaceValidation.valid) {
        return res.status(404).json(
          this.validationService.createErrorResponse('Workspace directory not found. Please initialize first.', { requestId })
        );
      }

      // Scan for components
      const components = await this.componentScannerService.scanComponents(workspacePath);

      req.log('info', `Found ${components.length} components`, { requestId, duration: Date.now() - startTime });

      res.json(this.validationService.createSuccessResponse({
        components,
        count: components.length
      }, {
        message: `Found ${components.length} components`,
        requestId,
        meta: { duration: Date.now() - startTime }
      }));

    } catch (error) {
      req.log('error', 'Failed to scan components', { requestId, error: error.message });
      res.status(500).json(
        this.validationService.createErrorResponse(error.message, { requestId })
      );
    }
  }

  /**
   * Trace content across session files
   */
  async traceContent(req, res) {
    const startTime = Date.now();
    const requestId = Date.now().toString();

    try {
      const bodyValidation = this.validationService.validateRequestBody(req.body, ['sessionId', 'contentInfo']);
      if (!bodyValidation.valid) {
        return res.status(400).json(
          this.validationService.createErrorResponse(bodyValidation.error, { requestId })
        );
      }

      const { sessionId, contentInfo } = req.body;
      
      console.log(`🔍 [ComponentRoutes] Searching for content in session: ${sessionId}`);
      console.log(`📝 [ComponentRoutes] Content info:`, contentInfo);
      
      // Validate session
      const sessionManager = req.app.get('sessionManager');
      const sessionValidation = await this.validationService.validateSession(sessionManager, sessionId);
      if (!sessionValidation.valid) {
        return res.status(404).json(
          this.validationService.createErrorResponse(sessionValidation.error, { requestId })
        );
      }

      // Validate content info
      const contentValidation = this.validationService.validateContentInfo(contentInfo);
      if (!contentValidation.valid) {
        return res.status(400).json(
          this.validationService.createErrorResponse(contentValidation.error, { requestId })
        );
      }

      const session = sessionValidation.session;
      const sessionPath = session.workspacePath || session.sessionPath + '/workspace';
      
      // Trace content
      const traceResults = await this.contentTracingService.traceContent(sessionPath, contentInfo);
      
      console.log(`📍 [ComponentRoutes] Found ${traceResults.length} matches`);
      
      res.json(this.validationService.createSuccessResponse({
        sessionId,
        contentInfo,
        matches: traceResults,
        matchCount: traceResults.length
      }, {
        message: `Found ${traceResults.length} content matches`,
        requestId,
        meta: { duration: Date.now() - startTime }
      }));

    } catch (error) {
      console.error('❌ [ComponentRoutes] Error tracing content:', error);
      res.status(500).json(
        this.validationService.createErrorResponse('Failed to trace content', {
          requestId,
          details: error.message
        })
      );
    }
  }

  /**
   * Handle Server-Sent Events for real-time updates
   */
  handleEventStream(req, res) {
    // Set headers for Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Send initial connection message
    res.write('data: {"type":"connected","message":"Component events stream connected"}\n\n');

    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write('data: {"type":"ping","timestamp":"' + new Date().toISOString() + '"}\n\n');
    }, 30000);

    // Handle client disconnect
    req.on('close', () => {
      clearInterval(keepAlive);
      console.log('📡 [ComponentRoutes] Client disconnected from events stream');
    });

    // Listen for file changes from active session
    const currentSession = global.currentEditorSession;
    if (currentSession && global.workspaceWatcher) {
      const handleFileChange = (filePath) => {
        const eventData = {
          type: 'file:changed',
          path: filePath,
          sessionId: currentSession.sessionId,
          timestamp: new Date().toISOString()
        };
        res.write(`data: ${JSON.stringify(eventData)}\n\n`);
      };

      // Set up file change listeners
      if (global.workspaceWatcher) {
        global.workspaceWatcher.on('change', handleFileChange);
        global.workspaceWatcher.on('add', handleFileChange);
        global.workspaceWatcher.on('unlink', handleFileChange);

        // Clean up listeners when client disconnects
        req.on('close', () => {
          if (global.workspaceWatcher) {
            global.workspaceWatcher.off('change', handleFileChange);
            global.workspaceWatcher.off('add', handleFileChange);
            global.workspaceWatcher.off('unlink', handleFileChange);
          }
        });
      }
    } else {
      // Send message that no active session exists
      res.write('data: {"type":"info","message":"No active editing session. File watching will start after initialization."}\n\n');
    }

    console.log('📡 [ComponentRoutes] Client connected to events stream');
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
      validationStats: this.validationService.getStats(),
      componentScannerStats: this.componentScannerService.getStats(),
      contentTracingStats: this.contentTracingService.getStats()
    };
  }
}

module.exports = ComponentRoutes;
