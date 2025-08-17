const SessionBuilder = require('./SessionBuilder');

/**
 * AutoRebuildManager handles automatic rebuilding of sessions when files change
 */
class AutoRebuildManager {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
    this.sessionBuilder = new SessionBuilder();
    this.pendingRebuilds = new Map(); // Track pending rebuilds with debouncing
    this.rebuildQueue = new Map(); // Track active rebuilds
    this.debounceTime = 1000; // 1 second debounce
  }

  /**
   * Initialize auto-rebuild by setting up event listeners
   * @param {Object} io - Socket.IO instance
   */
  initialize(io) {
    this.io = io;
    
    // Listen for file changes
    io.on('connection', (socket) => {
      console.log('🔄 [AutoRebuildManager] Client connected for auto-rebuild');
    });

    // Set up global listener for file changes
    this.setupFileChangeListener();
    
    console.log('✅ [AutoRebuildManager] Initialized auto-rebuild system');
  }

  /**
   * Set up listener for file change events
   */
  setupFileChangeListener() {
    // Store reference to this manager globally so it can be called from file watchers
    global.autoRebuildManager = this;
    
    console.log('👂 [AutoRebuildManager] Listening for file changes');
  }

  /**
   * Handle file change event (called by file watchers)
   * @param {Object} changeEvent - File change event data
   */
  onFileChange(changeEvent) {
    const { sessionId, filePath, fullPath, timestamp } = changeEvent;
    
    console.log(`📝 [AutoRebuildManager] File change detected: ${filePath} in session ${sessionId}`);
    
    // Only rebuild for relevant file types
    if (!this.isRelevantFile(filePath)) {
      console.log(`⏭️ [AutoRebuildManager] Skipping rebuild for non-relevant file: ${filePath}`);
      return;
    }
    
    // Debounce the rebuild
    this.scheduleRebuild(sessionId, filePath);
  }

  /**
   * Check if file change should trigger a rebuild
   * @param {string} filePath - Path to changed file
   * @returns {boolean} True if file should trigger rebuild
   */
  isRelevantFile(filePath) {
    const relevantExtensions = ['.ts', '.tsx', '.js', '.jsx'];
    const irrelevantPaths = ['node_modules/', '__tests__/', '.DS_Store', '.git/'];
    
    // Check extension
    const hasRelevantExtension = relevantExtensions.some(ext => filePath.endsWith(ext));
    if (!hasRelevantExtension) {
      return false;
    }
    
    // Check for irrelevant paths
    const hasIrrelevantPath = irrelevantPaths.some(path => filePath.includes(path));
    if (hasIrrelevantPath) {
      return false;
    }
    
    return true;
  }

  /**
   * Schedule a rebuild with debouncing
   * @param {string} sessionId - Session ID to rebuild
   * @param {string} filePath - Path to changed file
   */
  scheduleRebuild(sessionId, filePath) {
    // Clear existing timeout for this session
    if (this.pendingRebuilds.has(sessionId)) {
      clearTimeout(this.pendingRebuilds.get(sessionId).timeout);
    }
    
    // Schedule new rebuild
    const timeout = setTimeout(() => {
      this.executeRebuild(sessionId, filePath);
      this.pendingRebuilds.delete(sessionId);
    }, this.debounceTime);
    
    this.pendingRebuilds.set(sessionId, {
      timeout,
      filePath,
      scheduledAt: Date.now()
    });
    
    console.log(`⏱️ [AutoRebuildManager] Scheduled rebuild for session ${sessionId} (${this.debounceTime}ms delay)`);
  }

  /**
   * Execute the actual rebuild
   * @param {string} sessionId - Session ID to rebuild
   * @param {string} triggerFilePath - File that triggered the rebuild
   */
  async executeRebuild(sessionId, triggerFilePath) {
    // Check if rebuild is already in progress
    if (this.rebuildQueue.has(sessionId)) {
      console.log(`⏳ [AutoRebuildManager] Rebuild already in progress for session ${sessionId}`);
      return;
    }
    
    const session = this.sessionManager.getSession(sessionId);
    if (!session) {
      console.error(`❌ [AutoRebuildManager] Session not found: ${sessionId}`);
      return;
    }
    
    console.log(`🔨 [AutoRebuildManager] Starting auto-rebuild for session ${sessionId}`);
    console.log(`📁 [AutoRebuildManager] Triggered by: ${triggerFilePath}`);
    
    // Mark rebuild as in progress
    this.rebuildQueue.set(sessionId, {
      startTime: Date.now(),
      triggerFile: triggerFilePath
    });
    
    // Notify frontend that rebuild started
    if (this.io) {
      this.io.emit('rebuild-started', {
        sessionId,
        triggerFile: triggerFilePath,
        timestamp: Date.now()
      });
    }
    
    try {
      // Execute the rebuild
      const buildResult = await this.sessionBuilder.buildSession(sessionId, session.sessionPath);
      
      const duration = Date.now() - this.rebuildQueue.get(sessionId).startTime;
      
      console.log(`✅ [AutoRebuildManager] Auto-rebuild completed for session ${sessionId} (${duration}ms)`);
      console.log(`📦 [AutoRebuildManager] Output: ${buildResult.compiledAppPath}`);
      
      // Notify frontend that rebuild completed successfully
      if (this.io) {
        this.io.emit('rebuild-completed', {
          sessionId,
          triggerFile: triggerFilePath,
          duration,
          success: true,
          buildResult,
          timestamp: Date.now()
        });
      }
      
    } catch (error) {
      const duration = Date.now() - this.rebuildQueue.get(sessionId).startTime;
      
      console.error(`❌ [AutoRebuildManager] Auto-rebuild failed for session ${sessionId}:`, error);
      
      // Notify frontend that rebuild failed
      if (this.io) {
        this.io.emit('rebuild-completed', {
          sessionId,
          triggerFile: triggerFilePath,
          duration,
          success: false,
          error: error.message,
          timestamp: Date.now()
        });
      }
    } finally {
      // Remove from rebuild queue
      this.rebuildQueue.delete(sessionId);
    }
  }

  /**
   * Get status of auto-rebuild system
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      pendingRebuilds: Array.from(this.pendingRebuilds.keys()),
      activeRebuilds: Array.from(this.rebuildQueue.keys()),
      debounceTime: this.debounceTime,
      isEnabled: true
    };
  }

  /**
   * Manually trigger a rebuild (for API endpoints)
   * @param {string} sessionId - Session ID to rebuild
   * @returns {Promise<Object>} Rebuild result
   */
  async manualRebuild(sessionId) {
    console.log(`🔨 [AutoRebuildManager] Manual rebuild triggered for session ${sessionId}`);
    
    const session = this.sessionManager.getSession(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }
    
    return await this.sessionBuilder.buildSession(sessionId, session.sessionPath);
  }

  /**
   * Clean up resources
   */
  cleanup() {
    // Clear all pending rebuilds
    for (const [sessionId, pendingRebuild] of this.pendingRebuilds) {
      clearTimeout(pendingRebuild.timeout);
      console.log(`🧹 [AutoRebuildManager] Cancelled pending rebuild for session ${sessionId}`);
    }
    this.pendingRebuilds.clear();
    
    // Clear global reference
    if (global.autoRebuildManager === this) {
      global.autoRebuildManager = null;
    }
    
    console.log('🧹 [AutoRebuildManager] Cleaned up auto-rebuild system');
  }
}

module.exports = AutoRebuildManager;

