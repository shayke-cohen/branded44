const Metro = require('metro');
const path = require('path');
const fs = require('fs-extra');
const { createSessionMetroConfig } = require('./metro.session.config');

/**
 * Service for building React Native compatible bundles from session workspaces
 * These bundles can be sent to the mobile app for hot reloading
 */
class SessionMobileBundleBuilder {
  constructor() {
    this.activeBuilds = new Map(); // Track ongoing builds
  }

  /**
   * Build a React Native bundle from session workspace using Metro
   * @param {string} sessionId - Session ID
   * @param {string} sessionPath - Path to session directory
   * @param {Object} options - Build options
   * @returns {Promise<Object>} Build result with bundle info
   */
  async buildMobileBundle(sessionId, sessionPath, options = {}) {
    console.log(`📱 [SessionMobileBundleBuilder] Building mobile bundle for session: ${sessionId}`);
    
    // Check if build is already in progress
    if (this.activeBuilds.has(sessionId)) {
      console.log(`⏳ [SessionMobileBundleBuilder] Build already in progress for session: ${sessionId}`);
      return this.activeBuilds.get(sessionId);
    }

    const buildPromise = this._performMobileBuild(sessionId, sessionPath, options);
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
   * Perform the actual Metro build for mobile
   * @private
   */
  async _performMobileBuild(sessionId, sessionPath, options) {
    const workspacePath = path.join(sessionPath, 'workspace');
    const outputPath = path.join(sessionPath, 'mobile-dist');
    await fs.ensureDir(outputPath);

    const platform = options.platform || 'android';
    const dev = options.dev !== false;
    const minify = options.minify || false;

    try {
      // Create Metro config for this session
      const metroConfig = createSessionMetroConfig(workspacePath, {
        platform,
        dev,
        projectRoot: workspacePath
      });

      console.log(`📦 [SessionMobileBundleBuilder] Starting Metro bundler for ${platform}...`);
      
      // Entry file path
      const entryFile = path.join(workspacePath, 'App.tsx');
      
      // Check if entry file exists
      if (!await fs.pathExists(entryFile)) {
        throw new Error(`Entry file not found: ${entryFile}`);
      }
      
      console.log(`📦 [SessionMobileBundleBuilder] Building bundle for entry: ${entryFile}`);
      console.log(`📦 [SessionMobileBundleBuilder] Platform: ${platform}, Dev: ${dev}, Minify: ${minify}`);
      
      // Try to use Metro's newer API
      const bundleOptions = {
        entryFile: 'App.tsx',
        platform,
        dev,
        minify,
        bundleOutput: path.join(outputPath, `session-${sessionId}.${platform}.bundle`),
        sourceMapOutput: path.join(outputPath, `session-${sessionId}.${platform}.bundle.map`),
        config: metroConfig,
      };
      
      console.log(`📦 [SessionMobileBundleBuilder] Metro bundle options:`, bundleOptions);
      
      // Use Metro.runBuild to generate REAL React Native bundles
      const entryPoint = 'App.tsx'; // Metro expects entry relative to projectRoot
      console.log(`📦 [SessionMobileBundleBuilder] Running Metro build...`);
      console.log(`📦 [SessionMobileBundleBuilder] Entry: ${entryPoint}`);
      console.log(`📦 [SessionMobileBundleBuilder] Platform: ${platform}`);

      const { code, map } = await Metro.runBuild(metroConfig, {
        entry: entryPoint,
        platform,
        dev,
        minify,
        out: path.join(outputPath, `session-${sessionId}.${platform}.bundle`),
        sourceMap: true,
        sourceMapUrl: `session-${sessionId}.${platform}.bundle.map`,
      });

      console.log(`📦 [SessionMobileBundleBuilder] Metro build completed for ${platform}`);
      

      // Write bundle files
      const bundlePath = path.join(outputPath, `session-${sessionId}.${platform}.bundle`);
      const mapPath = path.join(outputPath, `session-${sessionId}.${platform}.bundle.map`);
      
      await fs.writeFile(bundlePath, code);
      if (map) {
        await fs.writeFile(mapPath, map);
      }

      const stats = {
        bundleSize: Buffer.byteLength(code, 'utf8'),
        mapSize: map ? Buffer.byteLength(map, 'utf8') : 0,
        platform,
        dev,
        minify
      };

      console.log(`✅ [SessionMobileBundleBuilder] Successfully built mobile bundle for ${sessionId}`);
      console.log(`📦 [SessionMobileBundleBuilder] Bundle: ${bundlePath} (${stats.bundleSize} bytes)`);
      
      return {
        sessionId,
        bundlePath,
        mapPath,
        outputPath,
        platform,
        stats
      };

    } catch (error) {
      console.error(`❌ [SessionMobileBundleBuilder] Failed to build mobile bundle:`, error);
      throw error;
    }
  }

  /**
   * Build bundles for multiple platforms
   * @param {string} sessionId - Session ID
   * @param {string} sessionPath - Path to session directory
   * @param {Array<string>} platforms - Platforms to build for ['ios', 'android']
   * @returns {Promise<Object>} Build results for all platforms
   */
  async buildMultiPlatformBundles(sessionId, sessionPath, platforms = ['android', 'ios']) {
    console.log(`🚀 [SessionMobileBundleBuilder] Building bundles for platforms: ${platforms.join(', ')}`);
    
    const results = {};
    
    for (const platform of platforms) {
      try {
        const result = await this.buildMobileBundle(sessionId, sessionPath, { platform });
        results[platform] = result;
      } catch (error) {
        console.error(`❌ [SessionMobileBundleBuilder] Failed to build ${platform} bundle:`, error);
        results[platform] = { error: error.message };
      }
    }
    
    return results;
  }

  /**
   * Check if a mobile bundle has been built for a session
   * @param {string} sessionPath - Path to session directory
   * @param {string} platform - Platform to check
   * @returns {boolean} True if bundle exists
   */
  isMobileBundleBuilt(sessionPath, platform = 'android') {
    const bundlePath = path.join(sessionPath, 'mobile-dist', `session-*.${platform}.bundle`);
    return fs.existsSync(bundlePath);
  }

  /**
   * Get the mobile bundle path for a session
   * @param {string} sessionPath - Path to session directory
   * @param {string} sessionId - Session ID
   * @param {string} platform - Platform
   * @returns {string|null} Path to bundle or null if not built
   */
  getMobileBundlePath(sessionPath, sessionId, platform = 'android') {
    const bundlePath = path.join(sessionPath, 'mobile-dist', `session-${sessionId}.${platform}.bundle`);
    return fs.existsSync(bundlePath) ? bundlePath : null;
  }

  /**
   * Clean mobile build artifacts for a session
   * @param {string} sessionPath - Path to session directory
   */
  async cleanMobileSession(sessionPath) {
    const outputPath = path.join(sessionPath, 'mobile-dist');
    if (await fs.pathExists(outputPath)) {
      await fs.remove(outputPath);
      console.log(`🧹 [SessionMobileBundleBuilder] Cleaned mobile build artifacts for session`);
    }
  }
}

module.exports = SessionMobileBundleBuilder;
