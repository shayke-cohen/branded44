const path = require('path');
const fs = require('fs-extra');

/**
 * Create esbuild plugin to handle session workspace imports
 * @param {Object} session - Session info
 * @returns {Object} - esbuild plugin
 */
function createSessionImportPlugin(session) {
  return {
    name: 'session-imports',
    setup(build) {
      // Resolve relative imports within session workspace
      build.onResolve({ filter: /^\./ }, args => {
        const resolved = path.resolve(args.resolveDir, args.path);
        
        // Add common extensions if not present
        if (!path.extname(resolved)) {
          const extensions = ['.tsx', '.ts', '.jsx', '.js'];
          for (const ext of extensions) {
            const withExt = resolved + ext;
            if (fs.existsSync(withExt)) {
              return { path: withExt };
            }
          }
          
          // Try index files
          for (const ext of extensions) {
            const indexPath = path.join(resolved, 'index' + ext);
            if (fs.existsSync(indexPath)) {
              return { path: indexPath };
            }
          }
        }
        
        return { path: resolved };
      });
      
      // Handle TypeScript/JSX files
      build.onLoad({ filter: /\.(ts|tsx|js|jsx|mjs)$/ }, async (args) => {
        try {
          const contents = await fs.readFile(args.path, 'utf8');
          
          // Determine loader based on file extension
          let loader = 'jsx'; // Default to jsx to handle JSX syntax
          if (args.path.endsWith('.tsx')) loader = 'tsx';
          else if (args.path.endsWith('.ts')) loader = 'ts';
          else if (args.path.endsWith('.jsx')) loader = 'jsx';
          else if (args.path.endsWith('.mjs')) loader = 'jsx'; // Handle JSX in .mjs files
          else if (args.path.endsWith('.js')) loader = 'jsx';  // Handle JSX in .js files
          
          return {
            contents,
            loader,
          };
        } catch (error) {
          return {
            errors: [{
              text: `Failed to load file: ${error.message}`,
              location: { file: args.path }
            }]
          };
        }
      });
    }
  };
}

module.exports = { createSessionImportPlugin };

