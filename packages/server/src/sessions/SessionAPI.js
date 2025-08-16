const SessionManager = require('./SessionManager');

/**
 * SessionAPI provides HTTP endpoints for session management
 */
class SessionAPI {
  constructor(app, io) {
    this.app = app;
    this.io = io;
    this.sessionManager = new SessionManager();
    this.setupRoutes();
  }

  setupRoutes() {
    // Get all active sessions
    this.app.get('/api/sessions', (req, res) => {
      try {
        const stats = this.sessionManager.getStats();
        const sessions = this.sessionManager.getAllSessions().map(session => ({
          sessionId: session.sessionId,
          startTime: session.startTime,
          age: Date.now() - session.startTime,
          workspacePath: session.workspacePath
        }));

        res.json({
          success: true,
          stats,
          sessions
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Get specific session info
    this.app.get('/api/sessions/:sessionId', (req, res) => {
      try {
        const { sessionId } = req.params;
        const session = this.sessionManager.getSession(sessionId);

        if (!session) {
          return res.status(404).json({
            success: false,
            error: 'Session not found'
          });
        }

        res.json({
          success: true,
          session: {
            sessionId: session.sessionId,
            startTime: session.startTime,
            age: Date.now() - session.startTime,
            workspacePath: session.workspacePath,
            srcPath: session.srcPath
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Clean up specific session
    this.app.delete('/api/sessions/:sessionId', async (req, res) => {
      try {
        const { sessionId } = req.params;
        await this.sessionManager.cleanupSession(sessionId);

        res.json({
          success: true,
          message: `Session ${sessionId} cleaned up successfully`
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Clean up all sessions
    this.app.delete('/api/sessions', async (req, res) => {
      try {
        await this.sessionManager.cleanupAllSessions();

        res.json({
          success: true,
          message: 'All sessions cleaned up successfully'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
  }

  /**
   * Get the session manager instance
   * @returns {SessionManager}
   */
  getSessionManager() {
    return this.sessionManager;
  }
}

module.exports = SessionAPI;
