const webpack = require('webpack');
const path = require('path');
const fs = require('fs-extra');
const { createSessionWebpackConfig } = require('./webpack.session.config');

/**
 * Service for building session workspace files using webpack
 * This replaces the runtime transformation approach with proper compilation
 */
class SessionBuilder {
  constructor() {
    this.activeBuilds = new Map(); // Track ongoing builds
  }

  /**
   * Build a session workspace using webpack
   * @param {string} sessionId - Session ID
   * @param {string} sessionPath - Path to session directory
   * @returns {Promise<Object>} Build result with compiled app info
   */
  async buildSession(sessionId, sessionPath, options = {}) {
    const { forceRebuild = false } = options;
    console.log(`🔨 [SessionBuilder] Building session: ${sessionId}${forceRebuild ? ' (force rebuild)' : ''}`);
    
    // Check if build is already in progress (unless force rebuild)
    if (!forceRebuild && this.activeBuilds.has(sessionId)) {
      console.log(`⏳ [SessionBuilder] Build already in progress for session: ${sessionId}`);
      return this.activeBuilds.get(sessionId);
    }

    const buildPromise = this._performBuild(sessionId, sessionPath);
    this.activeBuilds.set(sessionId, buildPromise);

    try {
      const result = await buildPromise;
      this.activeBuilds.delete(sessionId);
      return result;
    } catch (error) {
      this.activeBuilds.delete(sessionId);
      throw error;
    }
  }

  /**
   * Perform the actual webpack build
   * @private
   */
  async _performBuild(sessionId, sessionPath) {
    const outputPath = path.join(sessionPath, 'dist');
    await fs.ensureDir(outputPath);

    // Create webpack config for this session
    const webpackConfig = createSessionWebpackConfig(sessionPath, outputPath);
    
    return new Promise((resolve, reject) => {
      const compiler = webpack(webpackConfig);
      
      compiler.run((err, stats) => {
        if (err) {
          console.error(`❌ [SessionBuilder] Webpack compilation error for ${sessionId}:`, err);
          reject(err);
          return;
        }

        if (stats.hasErrors()) {
          const errors = stats.toJson().errors;
          console.error(`❌ [SessionBuilder] Build errors for ${sessionId}:`, errors);
          reject(new Error(`Build failed: ${errors.map(e => e.message).join(', ')}`));
          return;
        }

        if (stats.hasWarnings()) {
          const warnings = stats.toJson().warnings;
          console.warn(`⚠️ [SessionBuilder] Build warnings for ${sessionId}:`, warnings.map(w => w.message));
        }

        const compiledAppPath = path.join(outputPath, 'session-app.js');
        
        console.log(`✅ [SessionBuilder] Successfully built session: ${sessionId}`);
        console.log(`📦 [SessionBuilder] Output: ${compiledAppPath}`);
        
        resolve({
          sessionId,
          compiledAppPath,
          outputPath,
          stats: stats.toJson({ all: false, assets: true, timings: true })
        });
      });
    });
  }

  /**
   * Check if a session has been built
   * @param {string} sessionPath - Path to session directory
   * @returns {boolean} True if built app exists
   */
  isSessionBuilt(sessionPath) {
    const compiledAppPath = path.join(sessionPath, 'dist', 'session-app.js');
    return fs.existsSync(compiledAppPath);
  }

  /**
   * Get the compiled app path for a session
   * @param {string} sessionPath - Path to session directory
   * @returns {string|null} Path to compiled app or null if not built
   */
  getCompiledAppPath(sessionPath) {
    const compiledAppPath = path.join(sessionPath, 'dist', 'session-app.js');
    return fs.existsSync(compiledAppPath) ? compiledAppPath : null;
  }

  /**
   * Clean build artifacts for a session
   * @param {string} sessionPath - Path to session directory
   */
  async cleanSession(sessionPath) {
    const outputPath = path.join(sessionPath, 'dist');
    if (await fs.pathExists(outputPath)) {
      await fs.remove(outputPath);
      console.log(`🧹 [SessionBuilder] Cleaned build artifacts for session`);
    }
  }
}

module.exports = SessionBuilder;
