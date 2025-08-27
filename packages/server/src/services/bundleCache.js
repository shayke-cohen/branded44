/**
 * Bundle caching and statistics management
 */
class BundleCache {
  constructor() {
    this.cache = new Map();
    this.buildInProgress = new Set();
  }

  /**
   * Store bundle in cache
   * @param {string} sessionId - Session identifier
   * @param {string} bundleCode - Bundle code
   * @param {number} buildTime - Build time in milliseconds
   * @param {Object} metafile - esbuild metafile
   */
  set(sessionId, bundleCode, buildTime, metafile) {
    this.cache.set(sessionId, {
      code: bundleCode,
      timestamp: Date.now(),
      buildTime,
      size: bundleCode.length,
      metafile,
    });
  }

  /**
   * Get cached bundle
   * @param {string} sessionId - Session identifier
   * @returns {string|null} - Cached bundle code or null
   */
  get(sessionId) {
    const cached = this.cache.get(sessionId);
    return cached ? cached.code : null;
  }

  /**
   * Check if bundle exists in cache
   * @param {string} sessionId - Session identifier
   * @returns {boolean}
   */
  has(sessionId) {
    return this.cache.has(sessionId);
  }

  /**
   * Clear cache for specific session
   * @param {string} sessionId - Session identifier
   */
  clear(sessionId) {
    this.cache.delete(sessionId);
    console.log(`🧹 [BundleCache] Cleared cache for session: ${sessionId}`);
  }

  /**
   * Clear all cached bundles
   */
  clearAll() {
    this.cache.clear();
    console.log(`🧹 [BundleCache] Cleared all cache`);
  }

  /**
   * Get bundle statistics for specific session
   * @param {string} sessionId - Session identifier
   * @returns {Object|null} - Bundle statistics or null
   */
  getStats(sessionId) {
    const cached = this.cache.get(sessionId);
    if (!cached) return null;
    
    return {
      size: cached.size,
      buildTime: cached.buildTime,
      timestamp: cached.timestamp,
      age: Date.now() - cached.timestamp,
    };
  }

  /**
   * Get overall cache statistics
   * @returns {Object} - Cache statistics
   */
  getOverallStats() {
    return {
      totalSessions: this.cache.size,
      buildsInProgress: this.buildInProgress.size,
      cacheSize: Array.from(this.cache.values())
        .reduce((total, cached) => total + cached.size, 0),
    };
  }

  /**
   * Mark build as in progress
   * @param {string} sessionId - Session identifier
   */
  markBuildInProgress(sessionId) {
    this.buildInProgress.add(sessionId);
  }

  /**
   * Mark build as complete
   * @param {string} sessionId - Session identifier
   */
  markBuildComplete(sessionId) {
    this.buildInProgress.delete(sessionId);
  }

  /**
   * Check if build is in progress
   * @param {string} sessionId - Session identifier
   * @returns {boolean}
   */
  isBuildInProgress(sessionId) {
    return this.buildInProgress.has(sessionId);
  }

  /**
   * Wait for ongoing build to complete
   * @param {string} sessionId - Session identifier
   * @returns {Promise<string>} - Bundle code when build completes
   */
  async waitForBuild(sessionId) {
    return new Promise((resolve, reject) => {
      const checkBuild = () => {
        if (!this.buildInProgress.has(sessionId)) {
          const cached = this.cache.get(sessionId);
          if (cached) {
            resolve(cached.code);
          } else {
            reject(new Error('Build completed but no result found'));
          }
        } else {
          setTimeout(checkBuild, 100);
        }
      };
      checkBuild();
    });
  }
}

module.exports = BundleCache;

