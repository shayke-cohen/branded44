const chokidar = require('chokidar');
const path = require('path');

/**
 * Service for managing file watching across sessions
 * Extracted from the monolithic visualEditor.js route file
 */
class FileWatcherService {
  constructor() {
    this.watchers = new Map(); // sessionId -> watcher instance
    this.globalWatcher = null;
    this.eventCallbacks = new Set();
  }

  /**
   * Start watching a session workspace
   * @param {string} sessionId - Session ID
   * @param {string} workspacePath - Path to watch
   * @param {Object} options - Watch options
   * @returns {Object} Watcher instance
   */
  startWatching(sessionId, workspacePath, options = {}) {
    console.log(`👁️ [FileWatcher] Starting watcher for session: ${sessionId}`);
    console.log(`👁️ [FileWatcher] Watching path: ${workspacePath}`);

    // Stop existing watcher for this session
    this.stopWatching(sessionId);

    // Create new watcher
    const watcher = chokidar.watch(workspacePath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
      ...options
    });

    // Set up event handlers
    const handleFileChange = (eventType, filePath) => {
      const relativePath = path.relative(workspacePath, filePath);
      const changeEvent = {
        sessionId,
        eventType,
        filePath: relativePath,
        fullPath: filePath,
        timestamp: Date.now()
      };

      console.log(`📝 [FileWatcher] ${eventType} in ${sessionId}: ${relativePath}`);
      
      // Notify all registered callbacks
      this.eventCallbacks.forEach(callback => {
        try {
          callback(changeEvent);
        } catch (error) {
          console.error('❌ [FileWatcher] Error in callback:', error);
        }
      });
    };

    watcher
      .on('change', (filePath) => handleFileChange('change', filePath))
      .on('add', (filePath) => handleFileChange('add', filePath))
      .on('unlink', (filePath) => handleFileChange('unlink', filePath))
      .on('error', (error) => {
        console.error(`❌ [FileWatcher] Error watching ${sessionId}:`, error);
      });

    // Store watcher
    this.watchers.set(sessionId, {
      watcher,
      sessionId,
      workspacePath,
      startTime: Date.now()
    });

    return watcher;
  }

  /**
   * Stop watching a specific session
   * @param {string} sessionId - Session ID
   */
  stopWatching(sessionId) {
    const watcherInfo = this.watchers.get(sessionId);
    if (watcherInfo) {
      console.log(`🛑 [FileWatcher] Stopping watcher for session: ${sessionId}`);
      watcherInfo.watcher.close();
      this.watchers.delete(sessionId);
    }
  }

  /**
   * Stop global watcher
   */
  stopGlobalWatcher() {
    if (this.globalWatcher) {
      console.log('🛑 [FileWatcher] Stopping global watcher');
      this.globalWatcher.close();
      this.globalWatcher = null;
    }
  }

  /**
   * Set global watcher (for backward compatibility)
   * @param {string} sessionId - Session ID
   * @param {string} workspacePath - Path to watch
   */
  setGlobalWatcher(sessionId, workspacePath) {
    this.stopGlobalWatcher();
    this.globalWatcher = this.startWatching(`global-${sessionId}`, workspacePath);
    
    // Store reference globally for backward compatibility
    global.workspaceWatcher = this.globalWatcher;
    global.currentEditorSession = {
      sessionId,
      workspacePath,
      startTime: Date.now()
    };

    return this.globalWatcher;
  }

  /**
   * Register a callback for file change events
   * @param {Function} callback - Callback function
   * @returns {Function} Unregister function
   */
  onFileChange(callback) {
    this.eventCallbacks.add(callback);
    
    return () => {
      this.eventCallbacks.delete(callback);
    };
  }

  /**
   * Get active watchers info
   * @returns {Array} Array of watcher information
   */
  getActiveWatchers() {
    return Array.from(this.watchers.values()).map(({ sessionId, workspacePath, startTime }) => ({
      sessionId,
      workspacePath,
      startTime,
      uptime: Date.now() - startTime
    }));
  }

  /**
   * Get watcher for a specific session
   * @param {string} sessionId - Session ID
   * @returns {Object|null} Watcher info or null
   */
  getWatcher(sessionId) {
    return this.watchers.get(sessionId) || null;
  }

  /**
   * Clean up all watchers
   */
  cleanup() {
    console.log(`🧹 [FileWatcher] Cleaning up ${this.watchers.size} watchers`);
    
    for (const [sessionId] of this.watchers) {
      this.stopWatching(sessionId);
    }
    
    this.stopGlobalWatcher();
    this.eventCallbacks.clear();
  }

  /**
   * Get service statistics
   * @returns {Object} Service stats
   */
  getStats() {
    return {
      activeWatchers: this.watchers.size,
      eventCallbacks: this.eventCallbacks.size,
      hasGlobalWatcher: !!this.globalWatcher,
      watchers: this.getActiveWatchers()
    };
  }
}

module.exports = FileWatcherService;
