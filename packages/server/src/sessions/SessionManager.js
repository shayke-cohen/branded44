const path = require('path');
const fs = require('fs-extra');
const chokidar = require('chokidar');

/**
 * SessionManager handles the lifecycle of visual editor sessions
 * Each session gets a unique workspace directory for isolated editing
 */
class SessionManager {
  constructor() {
    this.activeSessions = new Map();
    this.tempDir = path.resolve(__dirname, '../../../../tmp/visual-editor-sessions');
    // Load existing sessions on startup
    this.loadExistingSessions();
  }

  /**
   * Load existing sessions from the filesystem on startup
   */
  async loadExistingSessions() {
    try {
      if (!fs.existsSync(this.tempDir)) {
        return;
      }

      const sessionDirs = await fs.readdir(this.tempDir);
      for (const sessionId of sessionDirs) {
        if (sessionId.startsWith('session-')) {
          const sessionPath = path.join(this.tempDir, sessionId);
          const workspacePath = path.join(sessionPath, 'workspace');
          
          // Check if workspace exists
          if (fs.existsSync(workspacePath)) {
            const sessionInfo = {
              sessionId,
              sessionPath,
              workspacePath,
              srcPath: path.resolve(__dirname, '../../../../packages/mobile/src'),
              createdAt: new Date(),
              lastAccessed: new Date()
            };
            
            this.activeSessions.set(sessionId, sessionInfo);
            console.log(`📁 [SessionManager] Loaded existing session: ${sessionId}`);
          }
        }
      }
      
      if (this.activeSessions.size > 0) {
        console.log(`📁 [SessionManager] Loaded ${this.activeSessions.size} existing sessions`);
      }
    } catch (error) {
      console.error('❌ [SessionManager] Error loading existing sessions:', error);
    }
  }

  /**
   * Load a specific session from filesystem if it exists
   * @param {string} sessionId - Session ID to load
   * @returns {Promise<Object|null>} Session information or null if not found
   */
  async loadSessionFromFilesystem(sessionId) {
    try {
      const sessionPath = path.join(this.tempDir, sessionId);
      const workspacePath = path.join(sessionPath, 'workspace');
      
      // Check if session directory exists
      if (!fs.existsSync(sessionPath) || !fs.existsSync(workspacePath)) {
        return null;
      }
      
      // Create session info object
      const sessionInfo = {
        sessionId,
        sessionPath,
        workspacePath,
        srcPath: path.resolve(__dirname, '../../../../packages/mobile/src'),
        createdAt: new Date(),
        lastAccessed: new Date()
      };
      
      // Add to active sessions
      this.activeSessions.set(sessionId, sessionInfo);
      console.log(`📁 [SessionManager] Loaded session from filesystem: ${sessionId}`);
      
      return sessionInfo;
    } catch (error) {
      console.error(`❌ [SessionManager] Error loading session ${sessionId} from filesystem:`, error);
      return null;
    }
  }

  /**
   * Create a new editing session
   * @param {string} srcPath - Path to the original source directory
   * @returns {Promise<Object>} Session information
   */
  async createSession(srcPath) {
    // Generate unique session ID
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const sessionPath = path.join(this.tempDir, sessionId);
    const workspacePath = path.join(sessionPath, 'workspace');

    // Ensure temp directory exists
    await fs.ensureDir(this.tempDir);

    // Ensure source directory exists
    if (!(await fs.pathExists(srcPath))) {
      throw new Error(`Source directory not found: ${srcPath}`);
    }

    // Copy source to workspace
    await fs.copy(srcPath, workspacePath, {
      filter: (src) => {
        const relativePath = path.relative(srcPath, src);
        const skipPatterns = [
          '__tests__',
          '*.test.ts',
          '*.test.tsx',
          '*.spec.ts',
          '*.spec.tsx',
          '.DS_Store',
          'node_modules',
        ];
        
        return !skipPatterns.some(pattern => {
          if (pattern.includes('*')) {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            return regex.test(relativePath);
          }
          return relativePath.includes(pattern);
        });
      }
    });

    // Also copy the ~ directory (UI components) from mobile package root
    const mobileRootPath = path.dirname(srcPath); // packages/mobile
    const tildeSourcePath = path.join(mobileRootPath, '~');
    const tildeDestPath = path.join(workspacePath, '~');
    
    console.log(`📁 [SessionManager] DEBUG: srcPath = ${srcPath}`);
    console.log(`📁 [SessionManager] DEBUG: mobileRootPath = ${mobileRootPath}`);
    console.log(`📁 [SessionManager] DEBUG: tildeSourcePath = ${tildeSourcePath}`);
    console.log(`📁 [SessionManager] DEBUG: tildeDestPath = ${tildeDestPath}`);
    
    if (await fs.pathExists(tildeSourcePath)) {
      console.log(`📁 [SessionManager] Copying ~ directory from ${tildeSourcePath} to ${tildeDestPath}`);
      try {
        await fs.copy(tildeSourcePath, tildeDestPath, {
          filter: (src) => {
            const relativePath = path.relative(tildeSourcePath, src);
            const skipPatterns = [
              '__tests__',
              '*.test.ts',
              '*.test.tsx',
              '*.spec.ts',
              '*.spec.tsx',
              '.DS_Store',
              'node_modules',
            ];
            
            return !skipPatterns.some(pattern => {
              if (pattern.includes('*')) {
                const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                return regex.test(relativePath);
              }
              return relativePath.includes(pattern);
            });
          }
        });
        console.log(`✅ [SessionManager] Successfully copied ~ directory to ${tildeDestPath}`);
      } catch (error) {
        console.error(`❌ [SessionManager] Error copying ~ directory:`, error);
      }
    } else {
      console.log(`⚠️ [SessionManager] ~ directory not found at ${tildeSourcePath}`);
    }

    // Create session object
    const session = {
      sessionId,
      sessionPath,
      workspacePath,
      srcPath,
      startTime: Date.now(),
      watcher: null
    };

    // Store session
    this.activeSessions.set(sessionId, session);

    console.log(`📁 [SessionManager] Created session: ${sessionId}`);
    return session;
  }

  /**
   * Start file watching for a session
   * @param {string} sessionId - Session ID
   * @param {Function} onFileChange - Callback for file changes
   */
  startWatching(sessionId, onFileChange) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Stop existing watcher if any
    if (session.watcher) {
      session.watcher.close();
    }

    // Start new watcher
    session.watcher = chokidar.watch(session.workspacePath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });

    session.watcher.on('change', (filePath) => {
      const relativePath = path.relative(session.workspacePath, filePath);
      console.log(`📝 [SessionManager] File changed in ${sessionId}: ${relativePath}`);
      
      if (onFileChange) {
        onFileChange({
          sessionId,
          filePath: relativePath,
          fullPath: filePath,
          timestamp: Date.now()
        });
      }
    });

    console.log(`👁️ [SessionManager] Started watching session: ${sessionId}`);
  }

  /**
   * Get the most recent session (by creation time)
   * @returns {Object|null} Most recent session or null if none exist
   */
  getMostRecentSession() {
    if (this.activeSessions.size === 0) {
      return null;
    }

    let mostRecent = null;
    let latestTime = 0;

    for (const [sessionId, session] of this.activeSessions) {
      // Extract timestamp from session ID (session-{timestamp}-{random})
      const timestamp = parseInt(sessionId.split('-')[1]) || 0;
      if (timestamp > latestTime) {
        latestTime = timestamp;
        mostRecent = session;
      }
    }

    return mostRecent;
  }

  /**
   * Start watching the most recent session automatically
   * Called on server startup to resume watching after restart
   * @param {Object} io - Socket.IO instance for emitting events
   */
  startWatchingMostRecent(io) {
    const mostRecentSession = this.getMostRecentSession();
    
    if (!mostRecentSession) {
      console.log('📁 [SessionManager] No sessions found to watch');
      return null;
    }

    const { sessionId, workspacePath } = mostRecentSession;
    
    console.log(`🔄 [SessionManager] Auto-starting file watcher for most recent session: ${sessionId}`);
    console.log(`🔄 [SessionManager] Watching: ${workspacePath}`);

    // Stop any existing global watcher
    if (global.workspaceWatcher) {
      global.workspaceWatcher.close();
      global.workspaceWatcher = null;
    }

    // Create new file watcher for this session
    const chokidar = require('chokidar');
    global.workspaceWatcher = chokidar.watch(workspacePath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });

    global.workspaceWatcher
      .on('change', (filePath) => {
        const relativePath = require('path').relative(workspacePath, filePath);
        console.log(`👁️ [FileWatcher] File changed in ${sessionId}: ${relativePath}`);
        
        // Emit Socket.IO event for file change
        if (io) {
          io.emit('file-changed', {
            filePath: relativePath,
            sessionId: sessionId,
            timestamp: Date.now()
          });
        }
      });

    // Set global session info
    global.currentEditorSession = {
      sessionId: mostRecentSession.sessionId,
      sessionPath: mostRecentSession.sessionPath,
      workspacePath: mostRecentSession.workspacePath,
      startTime: Date.now()
    };

    console.log(`✅ [SessionManager] Auto-watching session: ${sessionId}`);
    return mostRecentSession;
  }

  /**
   * Get session information
   * @param {string} sessionId - Session ID
   * @returns {Object|null} Session object or null if not found
   */
  getSession(sessionId) {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * Get all active sessions
   * @returns {Array} Array of session objects
   */
  getAllSessions() {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Clean up a specific session
   * @param {string} sessionId - Session ID to clean up
   */
  async cleanupSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      console.warn(`⚠️ [SessionManager] Session not found for cleanup: ${sessionId}`);
      return;
    }

    // Stop file watcher
    if (session.watcher) {
      session.watcher.close();
      session.watcher = null;
    }

    // Remove session directory
    if (await fs.pathExists(session.sessionPath)) {
      await fs.remove(session.sessionPath);
      console.log(`🗑️ [SessionManager] Removed session directory: ${sessionId}`);
    }

    // Remove from active sessions
    this.activeSessions.delete(sessionId);
    console.log(`🧹 [SessionManager] Cleaned up session: ${sessionId}`);
  }

  /**
   * Clean up all sessions
   */
  async cleanupAllSessions() {
    const sessionIds = Array.from(this.activeSessions.keys());
    
    for (const sessionId of sessionIds) {
      await this.cleanupSession(sessionId);
    }

    console.log(`🧹 [SessionManager] Cleaned up ${sessionIds.length} sessions`);
  }

  /**
   * Get session statistics
   * @returns {Object} Statistics about active sessions
   */
  getStats() {
    const sessions = this.getAllSessions();
    const now = Date.now();

    return {
      totalSessions: sessions.length,
      sessionIds: sessions.map(s => s.sessionId),
      oldestSession: sessions.length > 0 ? 
        Math.min(...sessions.map(s => s.startTime)) : null,
      newestSession: sessions.length > 0 ? 
        Math.max(...sessions.map(s => s.startTime)) : null,
      averageAge: sessions.length > 0 ? 
        sessions.reduce((sum, s) => sum + (now - s.startTime), 0) / sessions.length : 0
    };
  }
}

module.exports = SessionManager;
