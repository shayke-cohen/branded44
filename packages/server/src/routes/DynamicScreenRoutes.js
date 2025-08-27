const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { performance } = require('perf_hooks');

/**
 * Dynamic Screen Routes - Handles individual screen file serving and metadata
 * Implements the dynamic screen loading system for the visual editor
 */
class DynamicScreenRoutes {
  constructor() {
    this.router = express.Router();
    this.screenCache = new Map(); // In-memory cache for screen definitions
    this.setupRoutes();
    
    console.log('🎭 [DynamicScreenRoutes] Dynamic screen routes initialized');
  }

  setupRoutes() {
    // Get screen definition and metadata
    this.router.get('/session/:sessionId/screen/:screenId', this.getScreenDefinition.bind(this));
    
    // Get individual screen file content
    this.router.get('/session/:sessionId/screen-file/:screenId/:fileName', this.getScreenFile.bind(this));
    
    // Load screen dependency
    this.router.get('/session/:sessionId/dependency/:depName', this.getDependency.bind(this));
    
    // List available screens in session
    this.router.get('/session/:sessionId/screens', this.listScreens.bind(this));
    
    // Update screen file (for live editing)
    this.router.put('/session/:sessionId/screen-file/:screenId/:fileName', this.updateScreenFile.bind(this));
    
    // Get screen metadata only (lightweight)
    this.router.get('/session/:sessionId/screen/:screenId/metadata', this.getScreenMetadata.bind(this));
    
    // Clear screen cache
    this.router.delete('/session/:sessionId/screen-cache', this.clearScreenCache.bind(this));
  }

  /**
   * Get screen definition with component code and metadata
   */
  async getScreenDefinition(req, res) {
    const startTime = performance.now();
    const { sessionId, screenId } = req.params;
    
    try {
      console.log(`🎭 [DynamicScreenRoutes] Getting screen definition: ${screenId} (session: ${sessionId})`);
      
      const sessionManager = req.app.get('sessionManager');
      const session = sessionManager?.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ 
          error: 'Session not found',
          sessionId,
          timestamp: new Date().toISOString()
        });
      }

      // Check cache first
      const cacheKey = `${sessionId}:${screenId}`;
      if (this.screenCache.has(cacheKey)) {
        const cached = this.screenCache.get(cacheKey);
        if (Date.now() - cached.timestamp < 30000) { // 30 second cache
          console.log(`💾 [DynamicScreenRoutes] Using cached screen: ${screenId}`);
          return res.json(cached.definition);
        }
      }

      // Find screen file in session workspace
      const screenDefinition = await this.buildScreenDefinition(session, screenId);
      
      if (!screenDefinition) {
        return res.status(404).json({
          error: 'Screen not found',
          screenId,
          sessionId,
          timestamp: new Date().toISOString()
        });
      }

      // Cache the result
      this.screenCache.set(cacheKey, {
        definition: screenDefinition,
        timestamp: Date.now()
      });

      // Set cache headers
      res.set({
        'Cache-Control': 'no-cache',
        'ETag': `"${screenId}-${Date.now()}"`,
        'X-Screen-Build-Time': `${(performance.now() - startTime).toFixed(2)}ms`
      });

      res.json(screenDefinition);
      console.log(`✅ [DynamicScreenRoutes] Screen definition sent: ${screenId} (${(performance.now() - startTime).toFixed(2)}ms)`);

    } catch (error) {
      console.error(`❌ [DynamicScreenRoutes] Error getting screen definition ${screenId}:`, error);
      res.status(500).json({
        error: 'Failed to get screen definition',
        message: error.message,
        screenId,
        sessionId,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Build screen definition from session files
   */
  async buildScreenDefinition(session, screenId) {
    try {
      const screenPaths = await this.findScreenFiles(session, screenId);
      
      if (!screenPaths.component) {
        console.warn(`⚠️ [DynamicScreenRoutes] No component file found for screen: ${screenId}`);
        return null;
      }

      // Read component code and transform TypeScript
      let componentCode = await fs.readFile(screenPaths.component, 'utf8');
      if (screenPaths.component.endsWith('.ts') || screenPaths.component.endsWith('.tsx')) {
        componentCode = this.transformTypeScript(componentCode, 'component');
        console.log(`🔄 [DynamicScreenRoutes] Transformed component TypeScript for ${screenId}`);
      }
      
      // Read additional files if they exist and transform them too
      const hooks = [];
      const utils = [];
      let styles = '';

      if (screenPaths.hooks && screenPaths.hooks.length > 0) {
        for (const hookPath of screenPaths.hooks) {
          let hookCode = await fs.readFile(hookPath, 'utf8');
          if (hookPath.endsWith('.ts') || hookPath.endsWith('.tsx')) {
            hookCode = this.transformTypeScript(hookCode, path.basename(hookPath));
            console.log(`🔄 [DynamicScreenRoutes] Transformed hook TypeScript: ${path.basename(hookPath)}`);
          }
          hooks.push(hookCode);
        }
      }

      if (screenPaths.utils && screenPaths.utils.length > 0) {
        for (const utilPath of screenPaths.utils) {
          let utilCode = await fs.readFile(utilPath, 'utf8');
          if (utilPath.endsWith('.ts') || utilPath.endsWith('.tsx')) {
            utilCode = this.transformTypeScript(utilCode, path.basename(utilPath));
            console.log(`🔄 [DynamicScreenRoutes] Transformed util TypeScript: ${path.basename(utilPath)}`);
          }
          utils.push(utilCode);
        }
      }

      if (screenPaths.styles) {
        styles = await fs.readFile(screenPaths.styles, 'utf8');
        // Styles are usually CSS/JSON, no need to transform
      }

      // Extract dependencies from imports
      const dependencies = this.extractDependencies(componentCode);

      // Create screen definition
      const screenDefinition = {
        id: screenId,
        version: '1.0.0', // TODO: Implement versioning
        platform: 'universal',
        dependencies,
        metadata: {
          title: screenId,
          description: `Dynamic screen: ${screenId}`,
          author: 'Visual Editor',
          tags: ['dynamic', 'screen'],
          minAppVersion: '1.0.0'
        },
        code: {
          component: componentCode,
          styles: styles || undefined,
          hooks: hooks.length > 0 ? hooks : undefined,
          utils: utils.length > 0 ? utils : undefined
        },
        configuration: {
          screenId,
          sessionId: session.sessionId,
          loadedAt: new Date().toISOString()
        }
      };

      return screenDefinition;

    } catch (error) {
      console.error(`❌ [DynamicScreenRoutes] Error building screen definition for ${screenId}:`, error);
      return null;
    }
  }

  /**
   * Find screen files in session workspace
   */
  async findScreenFiles(session, screenId) {
    const srcPath = session.srcPath || path.join(session.workspacePath, 'src');
    const screenPaths = {
      component: null,
      hooks: [],
      utils: [],
      styles: null
    };

    try {
      // Look for screen in screens directory
      const screensDir = path.join(srcPath, 'screens');
      const screenDir = path.join(screensDir, screenId);
      
      if (await fs.pathExists(screenDir)) {
        // Look for main component file
        const componentFile = path.join(screenDir, `${screenId}.tsx`);
        const indexFile = path.join(screenDir, 'index.tsx');
        
        if (await fs.pathExists(componentFile)) {
          screenPaths.component = componentFile;
        } else if (await fs.pathExists(indexFile)) {
          screenPaths.component = indexFile;
        }

        // Look for hooks directory
        const hooksDir = path.join(screenDir, 'hooks');
        if (await fs.pathExists(hooksDir)) {
          const hookFiles = await fs.readdir(hooksDir);
          for (const file of hookFiles) {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
              screenPaths.hooks.push(path.join(hooksDir, file));
            }
          }
        }

        // Look for utils directory
        const utilsDir = path.join(screenDir, 'utils');
        if (await fs.pathExists(utilsDir)) {
          const utilFiles = await fs.readdir(utilsDir);
          for (const file of utilFiles) {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
              screenPaths.utils.push(path.join(utilsDir, file));
            }
          }
        }

        // Look for styles file
        const stylesFile = path.join(screenDir, 'styles.ts');
        if (await fs.pathExists(stylesFile)) {
          screenPaths.styles = stylesFile;
        }
      } else {
        // Look for screen as a single file
        const componentFile = path.join(screensDir, `${screenId}.tsx`);
        if (await fs.pathExists(componentFile)) {
          screenPaths.component = componentFile;
        }
      }

    } catch (error) {
      console.error(`❌ [DynamicScreenRoutes] Error finding screen files for ${screenId}:`, error);
    }

    return screenPaths;
  }

  /**
   * Extract dependencies from component code
   */
  extractDependencies(code) {
    const dependencies = [];
    
    // Extract import statements
    const importRegex = /import\s+.*?\s+from\s+['"`](.+?)['"`]/g;
    let match;
    
    while ((match = importRegex.exec(code)) !== null) {
      const importPath = match[1];
      
      // Skip relative imports and built-in modules
      if (!importPath.startsWith('.') && !importPath.startsWith('react') && !importPath.startsWith('react-native')) {
        dependencies.push(importPath);
      }
    }

    return [...new Set(dependencies)]; // Remove duplicates
  }

  /**
   * Get individual screen file content
   */
  async getScreenFile(req, res) {
    const { sessionId, screenId, fileName } = req.params;
    
    try {
      const sessionManager = req.app.get('sessionManager');
      const session = sessionManager?.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const screenPaths = await this.findScreenFiles(session, screenId);
      
      let filePath;
      if (fileName === 'component') {
        filePath = screenPaths.component;
      } else if (fileName === 'styles') {
        filePath = screenPaths.styles;
      } else {
        // Look in hooks or utils
        const hookFile = screenPaths.hooks.find(h => path.basename(h, '.tsx') === fileName);
        const utilFile = screenPaths.utils.find(u => path.basename(u, '.tsx') === fileName);
        filePath = hookFile || utilFile;
      }

      if (!filePath || !await fs.pathExists(filePath)) {
        return res.status(404).json({ 
          error: 'Screen file not found',
          fileName,
          screenId,
          sessionId
        });
      }

      let fileContent = await fs.readFile(filePath, 'utf8');
      
      // Transform TypeScript to JavaScript on the server - much cleaner!
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        fileContent = this.transformTypeScript(fileContent, fileName);
        console.log(`🔄 [DynamicScreenRoutes] Transformed TypeScript: ${fileName}`);
      }
      
      res.set({
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache'
      });
      
      res.send(fileContent);

    } catch (error) {
      console.error(`❌ [DynamicScreenRoutes] Error getting screen file ${fileName}:`, error);
      res.status(500).json({
        error: 'Failed to get screen file',
        message: error.message,
        fileName,
        screenId,
        sessionId
      });
    }
  }

  /**
   * Get dependency file
   */
  async getDependency(req, res) {
    const { sessionId, depName } = req.params;
    
    try {
      const sessionManager = req.app.get('sessionManager');
      const session = sessionManager?.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Look for dependency in various locations
      const srcPath = session.srcPath || path.join(session.workspacePath, 'src');
      const possiblePaths = [
        path.join(srcPath, 'utils', `${depName}.ts`),
        path.join(srcPath, 'utils', `${depName}.tsx`),
        path.join(srcPath, 'lib', `${depName}.ts`),
        path.join(srcPath, 'lib', `${depName}.tsx`),
        path.join(srcPath, 'components', depName, 'index.tsx'),
        path.join(srcPath, 'hooks', `${depName}.ts`),
      ];

      let dependencyPath = null;
      for (const possiblePath of possiblePaths) {
        if (await fs.pathExists(possiblePath)) {
          dependencyPath = possiblePath;
          break;
        }
      }

      if (!dependencyPath) {
        return res.status(404).json({
          error: 'Dependency not found',
          depName,
          sessionId
        });
      }

      const depCode = await fs.readFile(dependencyPath, 'utf8');
      
      res.set({
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache'
      });
      
      res.send(depCode);

    } catch (error) {
      console.error(`❌ [DynamicScreenRoutes] Error getting dependency ${depName}:`, error);
      res.status(500).json({
        error: 'Failed to get dependency',
        message: error.message,
        depName,
        sessionId
      });
    }
  }

  /**
   * List available screens in session
   */
  async listScreens(req, res) {
    const { sessionId } = req.params;
    
    try {
      const sessionManager = req.app.get('sessionManager');
      const session = sessionManager?.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const srcPath = session.srcPath || path.join(session.workspacePath, 'src');
      const screensDir = path.join(srcPath, 'screens');
      
      const screens = [];
      
      if (await fs.pathExists(screensDir)) {
        const items = await fs.readdir(screensDir, { withFileTypes: true });
        
        for (const item of items) {
          if (item.isDirectory()) {
            const screenDir = path.join(screensDir, item.name);
            const componentFile = path.join(screenDir, `${item.name}.tsx`);
            const indexFile = path.join(screenDir, 'index.tsx');
            
            if (await fs.pathExists(componentFile) || await fs.pathExists(indexFile)) {
              screens.push({
                id: item.name,
                name: item.name,
                path: screenDir,
                type: 'directory'
              });
            }
          } else if (item.name.endsWith('.tsx') && !item.name.startsWith('index')) {
            const screenId = item.name.replace('.tsx', '');
            screens.push({
              id: screenId,
              name: screenId,
              path: path.join(screensDir, item.name),
              type: 'file'
            });
          }
        }
      }

      res.json({
        sessionId,
        screens,
        count: screens.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`❌ [DynamicScreenRoutes] Error listing screens:`, error);
      res.status(500).json({
        error: 'Failed to list screens',
        message: error.message,
        sessionId
      });
    }
  }

  /**
   * Update screen file (for live editing)
   */
  async updateScreenFile(req, res) {
    const { sessionId, screenId, fileName } = req.params;
    const { content } = req.body;
    
    try {
      // Clear cache for this screen
      const cacheKey = `${sessionId}:${screenId}`;
      this.screenCache.delete(cacheKey);
      
      // Update file...
      // Implementation would go here for live editing
      
      res.json({
        success: true,
        message: 'Screen file updated',
        sessionId,
        screenId,
        fileName,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`❌ [DynamicScreenRoutes] Error updating screen file:`, error);
      res.status(500).json({
        error: 'Failed to update screen file',
        message: error.message,
        sessionId,
        screenId,
        fileName
      });
    }
  }

  /**
   * Get screen metadata only (lightweight)
   */
  async getScreenMetadata(req, res) {
    const { sessionId, screenId } = req.params;
    
    try {
      const sessionManager = req.app.get('sessionManager');
      const session = sessionManager?.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const screenPaths = await this.findScreenFiles(session, screenId);
      
      if (!screenPaths.component) {
        return res.status(404).json({
          error: 'Screen not found',
          screenId,
          sessionId
        });
      }

      // Get file stats
      const stats = await fs.stat(screenPaths.component);
      
      const metadata = {
        id: screenId,
        title: screenId,
        description: `Dynamic screen: ${screenId}`,
        filePath: screenPaths.component,
        size: stats.size,
        lastModified: stats.mtime.toISOString(),
        hasHooks: screenPaths.hooks.length > 0,
        hasUtils: screenPaths.utils.length > 0,
        hasStyles: !!screenPaths.styles
      };

      res.json(metadata);

    } catch (error) {
      console.error(`❌ [DynamicScreenRoutes] Error getting screen metadata:`, error);
      res.status(500).json({
        error: 'Failed to get screen metadata',
        message: error.message,
        sessionId,
        screenId
      });
    }
  }

  /**
   * Clear screen cache
   */
  async clearScreenCache(req, res) {
    const { sessionId } = req.params;
    
    try {
      // Clear all entries for this session
      for (const [key] of this.screenCache.entries()) {
        if (key.startsWith(`${sessionId}:`)) {
          this.screenCache.delete(key);
        }
      }

      res.json({
        success: true,
        message: 'Screen cache cleared',
        sessionId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`❌ [DynamicScreenRoutes] Error clearing screen cache:`, error);
      res.status(500).json({
        error: 'Failed to clear screen cache',
        message: error.message,
        sessionId
      });
    }
  }

  /**
   * Transform TypeScript to JavaScript on the server side
   * Much cleaner and more reliable than client-side regex transformations!
   */
  transformTypeScript(code, fileName) {
    try {
      const ts = require('typescript');
      
      console.log(`🔄 [TypeScript Transform] Using official TS compiler for ${fileName}`);
      
      // Determine file type - only main component gets __exportedComponent
      const isMainComponent = fileName === 'component' || fileName.includes('Screen.tsx');
      
      // Create transformation context - pure ES5/ES2018 output for browser evaluation
      const compilerOptions = {
        target: ts.ScriptTarget.ES2018,
        module: ts.ModuleKind.None, // No module system at all
        jsx: ts.JsxEmit.React,
        removeComments: false,
        strict: false,
        skipLibCheck: true,
        allowJs: true,
        declaration: false,
        allowSyntheticDefaultImports: false, // Disable to avoid CommonJS
        esModuleInterop: false, // Disable to avoid CommonJS
        isolatedModules: false, // Allow non-module files
        noEmitHelpers: true, // Don't emit TypeScript helpers
      };

      // Pre-process code to remove imports before TypeScript compilation
      let preprocessedCode = code;
      
      // Remove import statements completely to prevent TypeScript from generating react_1 variables
      preprocessedCode = preprocessedCode.replace(
        /import\s+(?:(?:[\w*\s{},]*)\s+from\s+)?['"][^'"]*['"];?\s*/g, 
        ''
      );
      
      console.log(`🧹 [TypeScript Transform] Removed imports for ${fileName}`);
      
      // Transform TypeScript to JavaScript using the official compiler
      const result = ts.transpileModule(preprocessedCode, {
        compilerOptions,
        transformers: {
          before: [
            // Custom transformer to handle exports and imports
            (context) => {
              return (sourceFile) => {
                const visitor = (node) => {
                  // Remove import statements
                  if (ts.isImportDeclaration(node)) {
                    return undefined; // Remove import
                  }
                  
                  // Transform export default - different handling for component vs utils/hooks
                  if (ts.isExportAssignment(node) && !node.isExportEquals) {
                    if (isMainComponent) {
                      // Main component gets __exportedComponent
                      return ts.factory.createVariableStatement(
                        undefined,
                        ts.factory.createVariableDeclarationList([
                          ts.factory.createVariableDeclaration(
                            '__exportedComponent',
                            undefined,
                            undefined,
                            node.expression
                          )
                        ], ts.NodeFlags.Const)
                      );
                    } else {
                      // Utils/hooks: remove export default entirely - let CommonJS handle it
                      return undefined;
                    }
                  }
                  
                  // Transform export declarations
                  if (ts.isExportDeclaration(node)) {
                    if (node.exportClause && ts.isNamedExports(node.exportClause)) {
                      // Handle named exports like export { foo, bar }
                      const exportComment = `// Exported: ${node.exportClause.elements.map(el => el.name.text).join(', ')}`;
                      return ts.factory.createNotEmittedStatement(ts.factory.createStringLiteral(exportComment));
                    }
                    return undefined; // Remove other export declarations
                  }
                  
                  // Remove export keyword from declarations (let TS compiler handle CommonJS exports)
                  if (node.modifiers) {
                    const newModifiers = node.modifiers.filter(mod => mod.kind !== ts.SyntaxKind.ExportKeyword);
                    if (newModifiers.length !== node.modifiers.length) {
                      return ts.visitEachChild(
                        { ...node, modifiers: ts.factory.createNodeArray(newModifiers) },
                        visitor,
                        context
                      );
                    }
                  }
                  
                  return ts.visitEachChild(node, visitor, context);
                };
                
                return ts.visitNode(sourceFile, visitor);
              };
            }
          ]
        }
      });

      if (result.diagnostics?.length > 0) {
        console.warn(`⚠️ [TypeScript Transform] Warnings for ${fileName}:`, 
          result.diagnostics.map(d => d.messageText).join(', '));
      }

      // Post-process to remove CommonJS artifacts that TypeScript compiler insists on adding
      let cleanedCode = result.outputText
        .replace('"use strict";\n', '') // Remove strict mode
        .replace(/Object\.defineProperty\(exports,\s*"__esModule",\s*\{\s*value:\s*true\s*\}\);\s*\n?/g, '') // Remove esModule property
        .replace(/exports\.__exportedComponent\s*=/g, 'const __exportedComponent =') // Fix exports to const
        .trim();
      
      console.log(`✅ [TypeScript Transform] ${fileName} (${isMainComponent ? 'COMPONENT' : 'HELPER'}): ${code.length} → ${cleanedCode.length} chars`);
      console.log(`🧹 [TypeScript Transform] Cleaned CommonJS artifacts for ${fileName}`);
      return cleanedCode;
      
    } catch (error) {
      console.error(`❌ [TypeScript Transform] Error transforming ${fileName}:`, error);
      console.log(`🔄 [TypeScript Transform] Falling back to regex for ${fileName}`);
      
      // Fallback to simple regex if TypeScript compiler fails
      let jsCode = code.replace(/import\s+.*?from\s+['"'][^'"]*['"];?\s*\n?/gm, '');
      jsCode = jsCode.replace(/^export\s+(const|let|var|function|class)/gm, '$1');
      
      // Only main component gets __exportedComponent in fallback
      const isMainComponent = fileName === 'component' || fileName.includes('Screen.tsx');
      if (isMainComponent) {
        jsCode = jsCode.replace(/^export\s+default\s+/gm, 'const __exportedComponent = ');
      } else {
        jsCode = jsCode.replace(/^export\s+default\s+/gm, '// export default ');
      }
      
      jsCode = jsCode.replace(/^export\s*\{\s*([^}]+)\s*\};?\s*$/gm, '// Exported: $1');
      
      return jsCode; // Return basic transformation as fallback
    }
  }

  /**
   * Get the router instance
   */
  getRouter() {
    return this.router;
  }
}

module.exports = DynamicScreenRoutes;

