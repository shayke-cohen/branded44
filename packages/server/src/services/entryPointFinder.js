const path = require('path');
const fs = require('fs-extra');

/**
 * Entry point discovery utilities for session workspaces
 */
class EntryPointFinder {
  /**
   * Find the entry point for the session workspace
   * @param {string} workspacePath - Path to session workspace
   * @returns {Promise<string|null>} - Path to entry point or null
   */
  static async findEntryPoint(workspacePath) {
    const possibleEntryPoints = [
      'src/App.tsx',
      'src/App.ts', 
      'src/index.tsx',
      'src/index.ts',
      'App.tsx',
      'App.ts',
      'index.tsx',
      'index.ts'
    ];
    
    for (const entryPoint of possibleEntryPoints) {
      const fullPath = path.join(workspacePath, entryPoint);
      if (await fs.pathExists(fullPath)) {
        return fullPath;
      }
    }
    
    return null;
  }
}

module.exports = EntryPointFinder;

