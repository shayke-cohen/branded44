const express = require('express');
const path = require('path');
const ValidationService = require('../services/ValidationService');
const FileWatcherService = require('../services/FileWatcherService');

/**
 * Session management routes
 * Extracted from the monolithic visualEditor.js route file
 */
class SessionRoutes {
  constructor() {
    this.router = express.Router();
    this.validationService = new ValidationService();
    this.fileWatcherService = new FileWatcherService();
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

      // Set up file change callback to emit socket events
      this.fileWatcherService.onFileChange((changeEvent) => {
        try {
          const io = req.io || req.app.get('io');
          if (io) {
            io.emit('file-changed', changeEvent);
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
        data: { workspacePath, srcPath, sessionPath }
      }, {
        message: 'Visual editor environment initialized successfully',
        requestId,
        meta: { duration: endTime - startTime }
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
