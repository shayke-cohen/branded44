const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const ValidationService = require('../services/ValidationService');
// const { SessionBundleService } = require('../services'); // Removed: Using Direct Mobile App Loading now

/**
 * File operation routes (read, write, tree, serving)
 * Extracted from the monolithic visualEditor.js route file
 */
class FileRoutes {
  constructor() {
    this.router = express.Router();
    this.validationService = new ValidationService();
    // this.sessionBundleService = new SessionBundleService(); // Removed: Using Direct Mobile App Loading now
    this.setupRoutes();
  }

  setupRoutes() {
    // File operations
    this.router.post('/files/read', this.readFile.bind(this));
    this.router.post('/files/write', this.writeFile.bind(this));
    this.router.get('/files/tree', this.getFileTree.bind(this));
    
    // Session file operations
    this.router.get('/session/:sessionId/files/*', this.serveSessionFile.bind(this));
    this.router.get('/session-file/:sessionId/*', this.getSessionFile.bind(this));
    this.router.put('/session-file/:sessionId/*', this.updateSessionFile.bind(this));
    this.router.get('/session-module/:sessionId/*', this.serveSessionModule.bind(this));
    
    // Session bundle operations - DISABLED: Using Direct Mobile App Loading now
    // this.router.get('/session/:sessionId/bundle.js', this.serveSessionBundle.bind(this));
    // this.router.get('/session/:sessionId/test-bundle', this.testBundleExecution.bind(this));
  }

  /**
   * Read file content from workspace
   */
  async readFile(req, res) {
    const startTime = Date.now();
    const requestId = Date.now().toString();
    
    try {
      const bodyValidation = this.validationService.validateRequestBody(req.body, ['filePath']);
      if (!bodyValidation.valid) {
        return res.status(400).json(
          this.validationService.createErrorResponse(bodyValidation.error, { requestId })
        );
      }

      const { filePath, sessionId } = req.body;
      
      // Get session workspace
      let session;
      if (sessionId) {
        const sessionManager = req.app.get('sessionManager');
        const sessionValidation = await this.validationService.validateSession(sessionManager, sessionId);
        if (!sessionValidation.valid) {
          return res.status(404).json(
            this.validationService.createErrorResponse(sessionValidation.error, { requestId })
          );
        }
        session = sessionValidation.session;
      } else {
        // Fallback to global session
        session = global.currentEditorSession;
        if (!session || !session.workspacePath) {
          return res.status(404).json(
            this.validationService.createErrorResponse('No active editing session. Please initialize first.', { requestId })
          );
        }
      }
      
      // Validate file path
      const pathValidation = this.validationService.validateFilePath(filePath, session.workspacePath);
      if (!pathValidation.valid) {
        const statusCode = pathValidation.securityViolation ? 403 : 400;
        return res.status(statusCode).json(
          this.validationService.createErrorResponse(pathValidation.error, { requestId })
        );
      }

      const fullPath = pathValidation.fullPath;
      
      // Check if file exists
      if (!(await fs.pathExists(fullPath))) {
        return res.status(404).json(
          this.validationService.createErrorResponse(`File not found: ${filePath}`, { requestId })
        );
      }
      
      // Read file content
      const content = await fs.readFile(fullPath, 'utf8');
      
      const endTime = Date.now();
      req.log('info', `File read successfully: ${filePath}`, {
        requestId,
        filePath,
        size: content.length,
        duration: endTime - startTime
      });
      
      res.json(this.validationService.createSuccessResponse({
        content,
        filePath,
        size: content.length
      }, {
        message: 'File read successfully',
        requestId,
        meta: { duration: endTime - startTime }
      }));
      
    } catch (error) {
      const endTime = Date.now();
      req.log('error', 'Failed to read file', {
        requestId,
        error: error.message,
        duration: endTime - startTime
      });
      res.status(500).json(
        this.validationService.createErrorResponse(error.message, { requestId })
      );
    }
  }

  /**
   * Write file content to workspace
   */
  async writeFile(req, res) {
    const startTime = Date.now();
    const requestId = Date.now().toString();
    
    try {
      const bodyValidation = this.validationService.validateRequestBody(req.body, ['filePath', 'content']);
      if (!bodyValidation.valid) {
        return res.status(400).json(
          this.validationService.createErrorResponse(bodyValidation.error, { requestId })
        );
      }

      const { filePath, content } = req.body;
      
      // Validate content
      const contentValidation = this.validationService.validateFileContent(content);
      if (!contentValidation.valid) {
        return res.status(400).json(
          this.validationService.createErrorResponse(contentValidation.error, { requestId })
        );
      }
      
      // Get current session workspace path
      const currentSession = global.currentEditorSession;
      if (!currentSession || !currentSession.workspacePath) {
        return res.status(404).json(
          this.validationService.createErrorResponse('No active editing session. Please initialize first.', { requestId })
        );
      }
      
      // Validate file path
      const pathValidation = this.validationService.validateFilePath(filePath, currentSession.workspacePath);
      if (!pathValidation.valid) {
        const statusCode = pathValidation.securityViolation ? 403 : 400;
        return res.status(statusCode).json(
          this.validationService.createErrorResponse(pathValidation.error, { requestId })
        );
      }

      const fullPath = pathValidation.fullPath;
      
      // Ensure directory exists
      await fs.ensureDir(path.dirname(fullPath));
      
      // Write file content
      await fs.writeFile(fullPath, content, 'utf8');
      
      const endTime = Date.now();
      req.log('info', `File written successfully: ${filePath}`, {
        requestId,
        filePath,
        size: content.length,
        duration: endTime - startTime
      });
      
      res.json(this.validationService.createSuccessResponse({
        filePath,
        size: content.length
      }, {
        message: 'File written successfully',
        requestId,
        meta: { duration: endTime - startTime }
      }));
      
    } catch (error) {
      const endTime = Date.now();
      req.log('error', 'Failed to write file', {
        requestId,
        error: error.message,
        duration: endTime - startTime
      });
      res.status(500).json(
        this.validationService.createErrorResponse(error.message, { requestId })
      );
    }
  }

  /**
   * Get file tree for workspace
   */
  async getFileTree(req, res) {
    const startTime = Date.now();
    const requestId = Date.now().toString();
    
    try {
      // Get current session workspace path
      const currentSession = global.currentEditorSession;
      if (!currentSession || !currentSession.workspacePath) {
        return res.status(404).json(
          this.validationService.createErrorResponse('No active editing session. Please initialize first.', { requestId })
        );
      }
      
      const workspacePath = currentSession.workspacePath;
      
      // Build file tree
      const tree = await this.buildFileTree(workspacePath);
      
      const endTime = Date.now();
      req.log('info', 'File tree generated successfully', {
        requestId,
        itemCount: this.countTreeItems(tree),
        duration: endTime - startTime
      });
      
      res.json(this.validationService.createSuccessResponse({
        fileTree: tree,
        workspacePath,
        sessionId: currentSession.sessionId
      }, {
        message: 'File tree generated successfully',
        requestId,
        meta: { duration: endTime - startTime }
      }));
      
    } catch (error) {
      const endTime = Date.now();
      req.log('error', 'Failed to generate file tree', {
        requestId,
        error: error.message,
        duration: endTime - startTime
      });
      res.status(500).json(
        this.validationService.createErrorResponse(error.message, { requestId })
      );
    }
  }

  /**
   * Serve session file for runtime access
   */
  async serveSessionFile(req, res) {
    try {
      const { sessionId } = req.params;
      const filePath = req.params[0]; // Everything after /files/
      
      console.log(`📁 [FileRoutes] Serving session file: ${sessionId}/${filePath}`);
      
      const sessionManager = req.app.get('sessionManager');
      const sessionValidation = await this.validationService.validateSession(sessionManager, sessionId);
      if (!sessionValidation.valid) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const session = sessionValidation.session;
      const fullPath = path.join(session.workspacePath, filePath);
      
      // Security check
      if (!fullPath.startsWith(session.workspacePath)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      // Set appropriate content type
      const ext = path.extname(filePath).toLowerCase();
      const contentTypes = {
        '.js': 'application/javascript',
        '.jsx': 'application/javascript',
        '.ts': 'application/javascript',
        '.tsx': 'application/javascript',
        '.json': 'application/json',
        '.css': 'text/css',
      };
      
      const contentType = contentTypes[ext] || 'text/plain';
      res.set('Content-Type', contentType);
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET');
      res.set('Access-Control-Allow-Headers', 'Content-Type');
      
      // Serve the file
      const fileContent = fs.readFileSync(fullPath, 'utf8');
      res.send(fileContent);
      
    } catch (error) {
      console.error('❌ [FileRoutes] Error serving session file:', error);
      res.status(500).json({ error: 'Failed to serve file' });
    }
  }

  /**
   * Get raw session file content
   */
  async getSessionFile(req, res) {
    const startTime = Date.now();
    const requestId = Date.now().toString();
    
    try {
      const { sessionId } = req.params;
      const filePath = req.params[0];
      
      if (!sessionId || !filePath) {
        return res.status(400).json(
          this.validationService.createErrorResponse('Session ID and file path are required', { requestId })
        );
      }

      const sessionManager = req.app.get('sessionManager');
      const sessionValidation = await this.validationService.validateSession(sessionManager, sessionId);
      if (!sessionValidation.valid) {
        return res.status(404).json(
          this.validationService.createErrorResponse(sessionValidation.error, { requestId })
        );
      }

      const session = sessionValidation.session;
      const fullFilePath = path.join(session.sessionPath, 'workspace', filePath);
      
      // Check if file exists
      if (!(await fs.pathExists(fullFilePath))) {
        return res.status(404).json(
          this.validationService.createErrorResponse(`File not found: ${filePath}`, { requestId })
        );
      }

      // Read and return the raw file content
      const fileContent = await fs.readFile(fullFilePath, 'utf8');
      
      console.log(`📄 [FileRoutes] Served ${filePath} for session ${sessionId}`);
      res.json(this.validationService.createSuccessResponse({
        content: fileContent
      }, {
        message: 'File content retrieved successfully',
        requestId,
        meta: { responseTime: `${Date.now() - startTime}ms` }
      }));
      
    } catch (error) {
      console.error(`❌ [FileRoutes] Error serving file:`, error);
      res.status(500).json(
        this.validationService.createErrorResponse(error.message, { requestId })
      );
    }
  }

  /**
   * Update session file content
   */
  async updateSessionFile(req, res) {
    const startTime = Date.now();
    const requestId = Date.now().toString();
    
    try {
      const { sessionId } = req.params;
      const filePath = req.params[0];
      const { content } = req.body;
      
      console.log(`💾 [FileRoutes] Saving ${filePath} for session ${sessionId}`);
      
      if (!sessionId || !filePath) {
        return res.status(400).json(
          this.validationService.createErrorResponse('Session ID and file path are required', { requestId })
        );
      }

      if (content === undefined || content === null) {
        return res.status(400).json(
          this.validationService.createErrorResponse('File content is required', { requestId })
        );
      }

      const sessionManager = req.app.get('sessionManager');
      const sessionValidation = await this.validationService.validateSession(sessionManager, sessionId);
      if (!sessionValidation.valid) {
        return res.status(404).json(
          this.validationService.createErrorResponse(sessionValidation.error, { requestId })
        );
      }

      const session = sessionValidation.session;
      const fullFilePath = path.join(session.sessionPath, 'workspace', filePath);
      
      // Ensure directory exists
      await fs.ensureDir(path.dirname(fullFilePath));
      
      // Write file content
      await fs.writeFile(fullFilePath, content, 'utf8');
      
      console.log(`✅ [FileRoutes] Successfully saved ${filePath} for session ${sessionId}`);
      
      // Trigger file change event if global watcher exists
      if (global.io) {
        const relativePath = path.relative(session.workspacePath, fullFilePath);
        global.io.emit('file-changed', {
          filePath: relativePath,
          sessionId: sessionId,
          timestamp: Date.now()
        });
        
        // Trigger auto-rebuild
        if (global.autoRebuildManager) {
          global.autoRebuildManager.onFileChange({
            sessionId,
            filePath: relativePath,
            fullPath: fullFilePath,
            timestamp: Date.now()
          });
        }
        
        // Trigger Direct Mobile App hot-reload
        if (global.handleDirectMobileAppFileChange) {
          global.handleDirectMobileAppFileChange({
            sessionId,
            filePath: relativePath,
            fullPath: fullFilePath,
            eventType: 'change',
            timestamp: Date.now()
          });
        }
      }
      
      res.json(this.validationService.createSuccessResponse({
        filePath,
        sessionId
      }, {
        message: `File saved successfully: ${filePath}`,
        requestId,
        meta: { responseTime: `${Date.now() - startTime}ms` }
      }));
      
    } catch (error) {
      console.error(`❌ [FileRoutes] Error saving file:`, error);
      res.status(500).json(
        this.validationService.createErrorResponse(error.message, { requestId })
      );
    }
  }

  /**
   * Serve session module with TypeScript transformation
   */
  async serveSessionModule(req, res) {
    const startTime = Date.now();
    const requestId = Date.now().toString();
    
    try {
      const { sessionId } = req.params;
      const modulePath = req.params[0];
      
      if (!sessionId || !modulePath) {
        return res.status(400).json(
          this.validationService.createErrorResponse('Session ID and module path are required', { requestId })
        );
      }

      const sessionManager = req.app.get('sessionManager');
      const sessionValidation = await this.validationService.validateSession(sessionManager, sessionId);
      if (!sessionValidation.valid) {
        return res.status(404).json(
          this.validationService.createErrorResponse(sessionValidation.error, { requestId })
        );
      }

      const session = sessionValidation.session;
      let filePath = path.join(session.sessionPath, 'workspace', modulePath);
      
      // Handle different file extensions
      if (!path.extname(filePath)) {
        const extensions = ['.ts', '.tsx', '.js', '.jsx'];
        let found = false;
        
        for (const ext of extensions) {
          const testPath = filePath + ext;
          if (await fs.pathExists(testPath)) {
            filePath = testPath;
            found = true;
            break;
          }
        }
        
        if (!found) {
          return res.status(404).json(
            this.validationService.createErrorResponse(`Module file not found: ${modulePath}`, { requestId })
          );
        }
      }

      // Check if file exists
      if (!(await fs.pathExists(filePath))) {
        return res.status(404).json(
          this.validationService.createErrorResponse(`Module file not found: ${modulePath}`, { requestId })
        );
      }

      // Read the file content
      const fileContent = await fs.readFile(filePath, 'utf8');
      
      // Transform TypeScript to JavaScript if needed
      let jsContent = fileContent;
      
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        jsContent = this.transformTypeScriptToJavaScript(fileContent);
      }

      // Set appropriate content type
      res.setHeader('Content-Type', 'application/javascript');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      console.log(`📡 [FileRoutes] Served module ${modulePath} for session ${sessionId}`);
      res.send(jsContent);
      
    } catch (error) {
      console.error(`❌ [FileRoutes] Error serving module:`, error);
      res.status(500).json(
        this.validationService.createErrorResponse(error.message, { requestId })
      );
    }
  }

  /**
   * Build file tree recursively
   * @private
   */
  async buildFileTree(dirPath, relativePath = '') {
    const items = [];
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      // Skip hidden files and common ignore patterns
      if (entry.name.startsWith('.') || 
          entry.name === 'node_modules' ||
          entry.name === '__tests__' ||
          entry.name.endsWith('.test.ts') ||
          entry.name.endsWith('.test.tsx') ||
          entry.name.endsWith('.spec.ts') ||
          entry.name.endsWith('.spec.tsx')) {
        continue;
      }
      
      const fullPath = path.join(dirPath, entry.name);
      const itemRelativePath = path.join(relativePath, entry.name);
      
      if (entry.isDirectory()) {
        const children = await this.buildFileTree(fullPath, itemRelativePath);
        items.push({
          name: entry.name,
          path: itemRelativePath,
          type: 'directory',
          children
        });
      } else {
        items.push({
          name: entry.name,
          path: itemRelativePath,
          type: 'file',
          extension: path.extname(entry.name)
        });
      }
    }
    
    return items.sort((a, b) => {
      // Directories first, then files
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Count items in file tree
   * @private
   */
  countTreeItems(tree) {
    let count = 0;
    for (const item of tree) {
      count++;
      if (item.children) {
        count += this.countTreeItems(item.children);
      }
    }
    return count;
  }

  /**
   * Transform TypeScript to JavaScript using TypeScript compiler API
   * @private
   */
  transformTypeScriptToJavaScript(content) {
    try {
      // Try to use TypeScript compiler if available
      const ts = require('typescript');
      
      const compilerOptions = {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ES2020,
        jsx: ts.JsxEmit.React,
        strict: false,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: false,
        removeComments: false,
        sourceMap: false,
        declaration: false,
      };

      // Compile TypeScript to JavaScript
      const result = ts.transpile(content, compilerOptions);
      console.log('✅ [FileRoutes] TypeScript compilation successful');
      return result;
      
    } catch (tsError) {
      console.warn('⚠️ [FileRoutes] TypeScript compiler not available, falling back to regex transformation:', tsError.message);
      
      // Fallback to improved regex-based transformation
      return this.fallbackTransformTypeScript(content);
    }
  }

  /**
   * Fallback TypeScript to JavaScript transformation using regex
   * @private
   */
  fallbackTransformTypeScript(content) {
    console.log('🔄 [FileRoutes] Using fallback regex-based TypeScript transformation');
    
    return content
      // Remove import type statements
      .replace(/import\s+type\s+.*?from\s+.*?;/g, '')
      
      // Remove export type and interface declarations
      .replace(/^export\s+type\s+.*$/gm, '')
      .replace(/^export\s+interface\s+\w+[^{]*\{[\s\S]*?\}/gm, '')
      .replace(/^interface\s+\w+[^{]*\{[\s\S]*?\}/gm, '')
      .replace(/^type\s+.*$/gm, '')
      
      // Remove type annotations from variable declarations
      .replace(/:\s*[A-Z]\w*(<[^>]*>)?(\[\])?(?=\s*[=;,\)])/g, '')
      .replace(/:\s*\w+(\[\])?(?=\s*[=;,\)])/g, '')
      .replace(/:\s*\w+\s*\|\s*\w+(?=\s*[=;,\)])/g, '')
      
      // Remove function parameter type annotations
      .replace(/(\w+)\s*:\s*[A-Z]\w*(<[^>]*>)?(\[\])?(?=\s*[,\)])/g, '$1')
      .replace(/(\w+)\s*:\s*\w+(\[\])?(?=\s*[,\)])/g, '$1')
      .replace(/(\w+)\s*:\s*\w+\s*\|\s*\w+(?=\s*[,\)])/g, '$1')
      
      // Remove function return type annotations
      .replace(/\)\s*:\s*[A-Z]\w*(<[^>]*>)?(\[\])?(?=\s*[{=])/g, ')')
      .replace(/\)\s*:\s*\w+(\[\])?(?=\s*[{=])/g, ')')
      .replace(/\)\s*:\s*\w+\s*\|\s*\w+(?=\s*[{=])/g, ')')
      
      // Remove complex generic types
      .replace(/:\s*Record<[^>]*>(?=\s*[=;,\)])/g, '')
      .replace(/:\s*Array<[^>]*>(?=\s*[=;,\)])/g, '')
      .replace(/:\s*Promise<[^>]*>(?=\s*[=;,\)])/g, '')
      .replace(/:\s*React\.ComponentType<[^>]*>(?=\s*[=;,\)])/g, '')
      .replace(/:\s*ComponentType<[^>]*>(?=\s*[=;,\)])/g, '')
      
      // Clean up imports with type keywords
      .replace(/import\s*\{\s*([^}]*?),?\s*type\s+(\w+),?\s*([^}]*?)\}\s*from/g, 'import { $1 $3 } from')
      .replace(/import\s*\{\s*type\s+(\w+),?\s*([^}]*?)\}\s*from/g, 'import { $2 } from')
      
      // Clean up empty imports and extra commas
      .replace(/import\s*\{\s*,\s*([^}]+)\}/g, 'import { $1 }')
      .replace(/import\s*\{\s*([^}]+?),\s*\}/g, 'import { $1 }')
      .replace(/import\s*\{\s*\}/g, '')
      .replace(/,\s*,/g, ',')
      .replace(/\{\s*,/g, '{')
      .replace(/,\s*\}/g, '}')
      
      // Remove empty import lines
      .replace(/^import\s*\{\s*\}\s*from.*$/gm, '')
      .replace(/^import\s*from.*$/gm, '')
      
      // Clean up extra whitespace
      .replace(/\n\s*\n\s*\n/g, '\n\n');
  }

  /**
   * Serve session bundle - complete JavaScript bundle for session workspace
   */
  async serveSessionBundle(req, res) {
    const startTime = Date.now();
    const requestId = Date.now().toString();
    
    try {
      const { sessionId } = req.params;
      
      if (!sessionId) {
        return res.status(400).json(
          this.validationService.createErrorResponse('Session ID is required', { requestId })
        );
      }

      console.log(`📦 [FileRoutes] Serving bundle for session: ${sessionId}`);

      const sessionManager = req.app.get('sessionManager');
      const sessionValidation = await this.validationService.validateSession(sessionManager, sessionId);
      if (!sessionValidation.valid) {
        return res.status(404).json(
          this.validationService.createErrorResponse(sessionValidation.error, { requestId })
        );
      }

      const session = sessionValidation.session;

      // Check if bundle is cached
      let bundleCode = this.sessionBundleService.getCachedBundle(sessionId);
      
      if (!bundleCode) {
        console.log(`🔨 [FileRoutes] No cached bundle found, building new bundle...`);
        try {
          bundleCode = await this.sessionBundleService.buildSessionBundle(sessionId, session);
        } catch (buildError) {
          console.error(`❌ [FileRoutes] Bundle build failed:`, buildError);
          return res.status(500).json(
            this.validationService.createErrorResponse(
              `Bundle build failed: ${buildError.message}`, 
              { requestId, sessionId }
            )
          );
        }
      } else {
        console.log(`📦 [FileRoutes] Serving cached bundle for session: ${sessionId}`);
      }

      // Set appropriate headers for JavaScript content
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Add custom headers for debugging
      const stats = this.sessionBundleService.getBundleStats(sessionId);
      if (stats) {
        res.setHeader('X-Bundle-Size', stats.size.toString());
        res.setHeader('X-Bundle-Build-Time', stats.buildTime.toString());
        res.setHeader('X-Bundle-Age', stats.age.toString());
      }
      
      const endTime = Date.now();
      console.log(`✅ [FileRoutes] Bundle served successfully for ${sessionId} (${endTime - startTime}ms)`);
      
      res.send(bundleCode);
      
    } catch (error) {
      console.error(`❌ [FileRoutes] Error serving bundle:`, error);
      res.status(500).json(
        this.validationService.createErrorResponse(error.message, { requestId })
      );
    }
  }

  /**
   * Get the router instance
   */
  getRouter() {
    return this.router;
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      validationStats: this.validationService.getStats()
    };
  }

  /**
   * Test bundle execution to debug loading issues
   */
  async testBundleExecution(req, res) {
    const startTime = Date.now();
    const requestId = Date.now().toString();
    
    try {
      const { sessionId } = req.params;
      
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Session ID is required',
          requestId
        });
      }

      console.log(`🧪 [FileRoutes] Testing bundle execution for session: ${sessionId}`);

      // Get session info
      const sessionManager = req.app.get('sessionManager');
      const sessionValidation = await this.validationService.validateSession(sessionManager, sessionId);
      if (!sessionValidation.valid) {
        return res.status(404).json({
          success: false,
          error: sessionValidation.error,
          requestId
        });
      }

      const session = sessionValidation.session;

      // Get bundle code
      let bundleCode = this.sessionBundleService.getCachedBundle(sessionId);
      
      if (!bundleCode) {
        console.log(`🔨 [FileRoutes] Building bundle for test...`);
        try {
          bundleCode = await this.sessionBundleService.buildSessionBundle(sessionId, session);
        } catch (buildError) {
          return res.status(500).json({
            success: false,
            error: `Bundle build failed: ${buildError.message}`,
            requestId,
            sessionId
          });
        }
      }

      // Create mock environment (similar to SessionBundleLoader.ts)
      const mockReactNative = {
        StyleSheet: {
          create: (styles) => {
            console.log(`✅ [TEST] StyleSheet.create called with:`, Object.keys(styles || {}));
            return styles;
          },
          flatten: (styles) => styles,
          hairlineWidth: 1,
          absoluteFill: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
          },
        },
        Platform: { OS: 'web', Version: '1.0' },
        Dimensions: { get: () => ({ width: 375, height: 812 }) },
        Text: () => null,
        View: () => null,
        ScrollView: () => null,
        TouchableOpacity: () => null,
        Image: () => null,
        PanResponder: {
          create: () => ({ panHandlers: {} })
        }
      };

      // Mock global context
      const mockGlobal = {
        React: { 
          createElement: () => null, 
          Fragment: null,
          createContext: (defaultValue) => ({
            Provider: () => null,
            Consumer: () => null,
            _currentValue: defaultValue,
            _defaultValue: defaultValue
          }),
          useState: () => [null, () => {}],
          useEffect: () => {},
          useMemo: (fn) => fn(),
          useCallback: (fn) => fn,
          useRef: () => ({ current: null })
        },
        'react': { 
          default: {
            createElement: () => null,
            Fragment: null,
            createContext: (defaultValue) => ({
              Provider: () => null,
              Consumer: () => null,
              _currentValue: defaultValue,
              _defaultValue: defaultValue
            }),
            useState: () => [null, () => {}],
            useEffect: () => {},
            useMemo: (fn) => fn(),
            useCallback: (fn) => fn,
            useRef: () => ({ current: null }),
            memo: (fn) => fn,
            forwardRef: (fn) => fn,
            useContext: () => ({}),
            useReducer: () => [{}, () => {}],
            useMemo: (fn) => fn(),
            useCallback: (fn) => fn
          },
          createElement: () => null, 
          Fragment: null,
          createContext: (defaultValue) => ({
            Provider: () => null,
            Consumer: () => null,
            _currentValue: defaultValue,
            _defaultValue: defaultValue
          }),
          useState: () => [null, () => {}],
          useEffect: () => {},
          useMemo: (fn) => fn(),
          useCallback: (fn) => fn,
          useRef: () => ({ current: null }),
          memo: (fn) => fn,
          forwardRef: (fn) => fn,
          useContext: () => ({}),
          useReducer: () => [{}, () => {}]
        },
        'react/jsx-runtime': (() => {
          // Simple jsx mock for server-side testing
          const jsx = (type, props, key) => {
            if (typeof type === 'string') {
              return `<${type}${props ? ' props' : ''}>`;
            }
            return `Component(${type?.name || 'Unknown'})`;
          };
          
          const jsxs = jsx;
          const Fragment = 'Fragment';
          
          const module = {
            jsx,
            jsxs,
            Fragment,
          };
          
          module.default = module;
          return module;
        })(),
        'react-native': mockReactNative,
        'react-native-web': mockReactNative,
        'react-native-safe-area-context': {
          useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
          useSafeAreaFrame: () => ({ width: 375, height: 812, x: 0, y: 0 }),
          SafeAreaProvider: () => null,
          SafeAreaView: () => null,
          initialWindowMetrics: { insets: { top: 44, bottom: 34, left: 0, right: 0 } }
        },
        'react-native-reanimated': {
          default: {},
          Easing: { linear: () => {}, ease: () => {} },
          timing: () => ({ start: () => {} }),
          Value: class { constructor(value) { this.value = value; } },
          interpolate: () => 0,
          createAnimatedComponent: (component) => component,
          useSharedValue: (initial) => ({ value: initial }),
          useAnimatedStyle: (styleFactory) => styleFactory(),
          withSpring: (value) => value,
          withTiming: (value) => value,
        },
        '@react-native-cookies/cookies': {
          get: () => Promise.resolve({}),
          set: () => Promise.resolve(),
          clearAll: () => Promise.resolve(),
          getAll: () => Promise.resolve({})
        },
        '@react-native-async-storage/async-storage': {
          getItem: () => Promise.resolve(null),
          setItem: () => Promise.resolve(),
          removeItem: () => Promise.resolve(),
          clear: () => Promise.resolve(),
          getAllKeys: () => Promise.resolve([])
        },
        window: {},
        global: {},
        process: {
          env: { NODE_ENV: 'development', __DEV__: true }
        }
      };

      // Test execution
      const testResults = {
        bundleSize: bundleCode.length,
        executionStart: Date.now(),
        errors: [],
        warnings: [],
        success: false,
        sessionApp: null
      };

      try {
        console.log(`🧪 [TEST] Executing bundle (${bundleCode.length} chars)...`);
        
        // Create execution context
        const moduleContext = {
          ...mockGlobal,
          console: {
            log: (...args) => console.log(`📝 [BUNDLE LOG]`, ...args),
            warn: (...args) => {
              const warning = args.join(' ');
              console.warn(`⚠️ [BUNDLE WARN]`, warning);
              testResults.warnings.push(warning);
            },
            error: (...args) => {
              const error = args.join(' ');
              console.error(`❌ [BUNDLE ERROR]`, error);
              testResults.errors.push(error);
            }
          }
        };

        // Execute bundle in controlled environment using eval
        let sessionApp = null;
        const originalGlobal = global;
        let originalRequire;
        
        try {
          // Capture original console functions and require BEFORE creating mocks
          const originalLog = console.log;
          const originalWarn = console.warn;
          const originalError = console.error;
          
          // Override the global require function BEFORE bundle execution
          originalRequire = global.require;
          global.require = (moduleName) => {
            originalLog(`🔍 [TEST] require('${moduleName}') called`);
            if (moduleContext[moduleName]) {
              originalLog(`✅ [TEST] Providing mock for: ${moduleName}`);
              return moduleContext[moduleName];
            }
            // Fall back to original require for internal modules
            originalLog(`⚠️ [TEST] Using real require for: ${moduleName}`);
            return originalRequire(moduleName);
          };
          
          // Create isolated context
          const context = {
            ...moduleContext,
            SessionApp: undefined,
            console: {
              log: (...args) => {
                originalLog(`📱 [BUNDLE]`, ...args);
              },
              warn: (...args) => {
                const warning = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
                originalWarn(`⚠️ [BUNDLE WARN]`, warning);
                testResults.warnings.push(warning);
              },
              error: (...args) => {
                const error = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
                originalError(`❌ [BUNDLE ERROR]`, error);
                testResults.errors.push({ message: error });
              }
            }
          };
          
          // Set up context as globals
          Object.assign(global, context);
          
          // Inject custom require function into bundle code by name
          const customRequireCode = `
            var require = function(moduleName) {
              console.log('🔍 [INJECTED] require(' + moduleName + ') called');
              
              // Check for external modules
              var externalMocks = ${JSON.stringify(moduleContext)};
              if (externalMocks[moduleName]) {
                console.log('✅ [INJECTED] Providing mock for: ' + moduleName);
                var mockModule = externalMocks[moduleName];
                
                if (moduleName === 'react') {
                  console.log('🔍 [INJECTED] React structure:', Object.keys(mockModule || {}));
                  console.log('🔍 [INJECTED] React.createContext exists:', typeof (mockModule && mockModule.createContext));
                  console.log('🔍 [INJECTED] React.default exists:', typeof (mockModule && mockModule.default));
                  if (mockModule && mockModule.default) {
                    console.log('🔍 [INJECTED] React.default.createContext exists:', typeof mockModule.default.createContext);
                  }
                }
                
                return mockModule;
              }
              
              console.log('⚠️ [INJECTED] No mock for: ' + moduleName);
              throw new Error('Module not available: ' + moduleName);
            };
          `;
          
          const modifiedBundleCode = customRequireCode + bundleCode;
          originalLog(`🔍 [TEST] Modified bundle with injected require (${modifiedBundleCode.length} chars)`);
          originalLog(`🔍 [TEST] First 500 chars: ${modifiedBundleCode.substring(0, 500)}`);
          originalLog(`🔍 [TEST] Original bundle first 500 chars: ${bundleCode.substring(0, 500)}`);
          
          // Execute bundle with error capture
          try {
            eval(modifiedBundleCode);
            sessionApp = global.SessionApp;
          } catch (bundleError) {
            console.error(`💥 [TEST] Bundle execution error:`, bundleError.message);
            testResults.errors.push({
              message: bundleError.message,
              stack: bundleError.stack,
              name: bundleError.name
            });
            testResults.success = false;
            sessionApp = null;
          }
          
        } finally {
          // Restore original require function
          global.require = originalRequire;
          
          // Cleanup globals
          Object.keys(moduleContext).forEach(key => {
            delete global[key];
          });
          delete global.SessionApp;
        }
        
        // Set success if no errors occurred
        if (testResults.success !== false) {
          testResults.success = true;
        }
        testResults.sessionApp = sessionApp ? 'Available' : 'Not Available';
        testResults.executionTime = Date.now() - testResults.executionStart;
        
        console.log(`✅ [TEST] Bundle executed successfully`);

      } catch (executionError) {
        testResults.success = false;
        testResults.errors.push({
          message: executionError.message,
          stack: executionError.stack
        });
        testResults.executionTime = Date.now() - testResults.executionStart;
        
        console.log(`❌ [TEST] Bundle execution failed:`, executionError.message);
      }

      const duration = Date.now() - startTime;
      
      res.json({
        success: true,
        sessionId,
        testResults,
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          duration
        }
      });

    } catch (error) {
      console.error(`❌ [FileRoutes] Bundle test failed:`, error);
      
      const duration = Date.now() - startTime;
      res.status(500).json({
        success: false,
        error: error.message,
        meta: {
          requestId,
          timestamp: new Date().toISOString(),
          duration
        }
      });
    }
  }
}

module.exports = FileRoutes;
