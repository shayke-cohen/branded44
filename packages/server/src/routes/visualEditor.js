const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const { getIO } = require('../services/socketService');

// Middleware to attach io to request
const attachIO = (req, res, next) => {
  try {
    req.io = getIO();
    next();
  } catch (error) {
    req.io = null;
    next();
  }
};

const router = express.Router();

// Apply middleware to all routes
router.use(attachIO);

// Session workspace file serving endpoint
router.get('/session/:sessionId/files/*', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const filePath = req.params[0]; // Everything after /files/
    
    console.log(`📁 [Server] Serving session file: ${sessionId}/${filePath}`);
    
    const sessionManager = req.app.get('sessionManager');
    let session = sessionManager.getSession(sessionId);
    
    // If session not found in memory, try to load it from filesystem
    if (!session) {
      console.log(`📁 [Server] Session ${sessionId} not in memory, attempting to load from filesystem...`);
      try {
        session = await sessionManager.loadSessionFromFilesystem(sessionId);
        if (session) {
          console.log(`✅ [Server] Successfully loaded session ${sessionId} from filesystem`);
        }
      } catch (error) {
        console.error(`❌ [Server] Failed to load session ${sessionId} from filesystem:`, error);
      }
    }
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const fullPath = path.join(session.workspacePath, filePath);
    
    // Security check: ensure the file is within the workspace
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
      '.ts': 'application/javascript', // Serve as JS for webpack processing
      '.tsx': 'application/javascript',
      '.json': 'application/json',
      '.css': 'text/css',
    };
    
    const contentType = contentTypes[ext] || 'text/plain';
    res.set('Content-Type', contentType);
    
    // Add CORS headers for cross-origin requests
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    
    // Serve the file
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    res.send(fileContent);
    
  } catch (error) {
    console.error('❌ [Server] Error serving session file:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

// File watcher for workspace directory
let workspaceWatcher = null;

// Mutex to prevent concurrent workspace operations
let workspaceOperationInProgress = false;
const workspaceOperationQueue = [];

// Helper function to acquire mutex using a proper queue with timeout
const acquireMutex = () => {
  return new Promise((resolve, reject) => {
    if (!workspaceOperationInProgress) {
      workspaceOperationInProgress = true;
      resolve();
    } else {
      // Add timeout to prevent hanging indefinitely
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ [Server] Mutex acquisition timed out, forcing release');
        workspaceOperationInProgress = false;
        resolve();
      }, 30000); // 30 second timeout
      
      const wrappedResolve = () => {
        clearTimeout(timeoutId);
        resolve();
      };
      
      workspaceOperationQueue.push(wrappedResolve);
    }
  });
};

// Helper function to release mutex
const releaseMutex = () => {
  if (workspaceOperationQueue.length > 0) {
    const nextResolve = workspaceOperationQueue.shift();
    nextResolve();
  } else {
    workspaceOperationInProgress = false;
  }
};

// Sessions persist until manually cleaned up via /api/editor/cleanup
// This allows users to resume work across browser sessions

// Visual Editor initialization endpoint
router.post('/init', async (req, res) => {
  const startTime = Date.now();
  const requestId = Date.now().toString();

  console.log('🔧 [Server] Init endpoint called, requestId:', requestId);

  try {
    console.log('🔒 [Server] Acquiring mutex...');
    await acquireMutex();
    console.log('✅ [Server] Mutex acquired');
    req.log('info', 'Initializing visual editor environment', { requestId });

    // Use SessionManager to create the session
    const sessionManager = req.app.get('sessionManager');
    const srcPath = path.resolve(__dirname, '../../../mobile/src');

    req.log('info', 'Creating session using SessionManager...', { requestId });
    
    // Create session using SessionManager (this will copy both src and ~ directories)
    const sessionInfo = await sessionManager.createSession(srcPath);
    
    const { sessionId, sessionPath, workspacePath } = sessionInfo;

    // Start session-specific file watcher
    if (workspaceWatcher) {
      workspaceWatcher.close();
    }

    workspaceWatcher = chokidar.watch(workspacePath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });

    workspaceWatcher
      .on('change', (filePath) => {
        req.log('info', 'File changed in workspace', { filePath, sessionId });
        req.io.emit('file-changed', {
          filePath: path.relative(workspacePath, filePath),
          sessionId: sessionId,
          timestamp: Date.now()
        });
      });

    // Store session info for cleanup
    global.currentEditorSession = {
      sessionId,
      sessionPath,
      workspacePath,
      startTime: Date.now()
    };

    const endTime = Date.now();
    req.updateConnectionStats(true, endTime - startTime);

    req.log('success', 'Visual editor environment initialized', {
      requestId,
      sessionId,
      workspacePath,
      duration: endTime - startTime
    });

    res.json({
      success: true,
      message: 'Visual editor environment initialized successfully',
      sessionId: sessionId,
      data: {
        workspacePath,
        srcPath,
        sessionPath
      },
      meta: {
        requestId,
        sessionId,
        duration: endTime - startTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    const endTime = Date.now();
    req.updateConnectionStats(false, endTime - startTime);

    req.log('error', 'Failed to initialize visual editor environment', {
      requestId,
      error: error.message,
      duration: endTime - startTime
    });
    res.status(500).json({
      success: false,
      error: error.message,
      requestId
    });
  } finally {
    // Always release the mutex
    releaseMutex();
  }
});

// Visual Editor component scanning endpoint
router.get('/scan-components', async (req, res) => {
  const startTime = Date.now();
  const requestId = Date.now().toString();

  try {
    req.log('info', 'Scanning components in workspace directory', { requestId });

    // Get current session workspace path
    const currentSession = global.currentEditorSession;
    if (!currentSession || !currentSession.workspacePath) {
      return res.status(404).json({
        success: false,
        error: 'No active editing session. Please initialize first.',
        requestId
      });
    }

    const workspacePath = currentSession.workspacePath;

    // Check if workspace exists
    if (!(await fs.pathExists(workspacePath))) {
      return res.status(404).json({
        success: false,
        error: 'Workspace directory not found. Please initialize first.',
        requestId
      });
    }

    const components = [];

    // Scan different component directories
    const componentDirs = [
      { dir: 'components/blocks', type: 'block' },
      { dir: 'components/templates', type: 'template' },
      { dir: 'screens', type: 'screen' }
    ];

    for (const { dir, type } of componentDirs) {
      const dirPath = path.join(workspacePath, dir);
      if (await fs.pathExists(dirPath)) {
        await scanDirectory(dirPath, dir, type, components);
      }
    }

    req.log('info', `Found ${components.length} components`, { requestId, duration: Date.now() - startTime });

    res.json({
      success: true,
      components,
      count: components.length,
      requestId
    });

  } catch (error) {
    req.log('error', 'Failed to scan components', { requestId, error: error.message });
    res.status(500).json({
      success: false,
      error: error.message,
      requestId
    });
  }
});

// Helper function to scan directory for components
async function scanDirectory(dirPath, relativePath, type, components) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subDirPath = path.join(dirPath, entry.name);
      const subRelativePath = path.join(relativePath, entry.name);
      await scanDirectory(subDirPath, subRelativePath, type, components);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      // Skip test files
      if (entry.name.includes('.test.') || entry.name.includes('.spec.')) {
        continue;
      }
      
      const componentName = entry.name.replace(/\.(tsx?|jsx?)$/, '');
      const componentPath = path.join(relativePath, entry.name);
      
      components.push({
        id: `${type}-${componentName.toLowerCase().replace(/\s+/g, '-')}`,
        name: componentName,
        path: componentPath,
        category: type,
        type: 'component'
      });
    }
  }
}

// Visual Editor events endpoint for Server-Sent Events
router.get('/events', (req, res) => {
  // Set headers for Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection message
  res.write('data: {"type":"connected","message":"File watcher connected"}\n\n');

  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write('data: {"type":"ping"}\n\n');
  }, 30000);

  // Handle client disconnect
  req.on('close', () => {
    clearInterval(keepAlive);
    console.log('📡 [Events] Client disconnected from events stream');
  });

  // Listen for file changes from active session
  const currentSession = global.currentEditorSession;
  if (currentSession && workspaceWatcher) {
    const handleFileChange = (path) => {
      const eventData = {
        type: 'file:changed',
        path: path,
        timestamp: new Date().toISOString()
      };
      res.write(`data: ${JSON.stringify(eventData)}\n\n`);
    };

    workspaceWatcher.on('change', handleFileChange);
    workspaceWatcher.on('add', handleFileChange);
    workspaceWatcher.on('unlink', handleFileChange);

    // Clean up listeners when client disconnects
    req.on('close', () => {
      if (workspaceWatcher) {
        workspaceWatcher.off('change', handleFileChange);
        workspaceWatcher.off('add', handleFileChange);
        workspaceWatcher.off('unlink', handleFileChange);
      }
    });
  } else {
    // Send message that no active session exists
    res.write('data: {"type":"info","message":"No active editing session. File watching will start after initialization."}\n\n');
  }

  console.log('📡 [Events] Client connected to events stream');
});

// Visual Editor file read endpoint
router.post('/files/read', async (req, res) => {
  const startTime = Date.now();
  const requestId = Date.now().toString();
  
  try {
    const { filePath, sessionId } = req.body;
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'File path is required',
        requestId
      });
    }
    
    // Get session workspace path - prioritize sessionId if provided
    let session;
    if (sessionId) {
      // Use SessionManager to get session by ID
      const sessionManager = req.app.get('sessionManager');
      session = sessionManager.getSession(sessionId);
      
      // If session not found in memory, try to load it from filesystem
      if (!session) {
        console.log(`📁 [Server] Session ${sessionId} not in memory, attempting to load from filesystem...`);
        try {
          session = await sessionManager.loadSessionFromFilesystem(sessionId);
          if (session) {
            console.log(`✅ [Server] Successfully loaded session ${sessionId} from filesystem`);
          }
        } catch (error) {
          console.error(`❌ [Server] Failed to load session ${sessionId} from filesystem:`, error);
        }
      }
    } else {
      // Fallback to global session
      session = global.currentEditorSession;
    }
    
    if (!session || !session.workspacePath) {
      return res.status(404).json({
        success: false,
        error: sessionId ? `Session not found: ${sessionId}` : 'No active editing session. Please initialize first.',
        requestId
      });
    }
    
    const fullPath = path.join(session.workspacePath, filePath);
    
    // Security check: ensure the file is within the workspace
    if (!fullPath.startsWith(session.workspacePath)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: File path outside workspace',
        requestId
      });
    }
    
    // Check if file exists
    if (!(await fs.pathExists(fullPath))) {
      return res.status(404).json({
        success: false,
        error: `File not found: ${filePath}`,
        requestId
      });
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
    
    res.json({
      success: true,
      content,
      filePath,
      size: content.length,
      meta: {
        requestId,
        duration: endTime - startTime,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    const endTime = Date.now();
    req.log('error', 'Failed to read file', {
      requestId,
      error: error.message,
      duration: endTime - startTime
    });
    res.status(500).json({
      success: false,
      error: error.message,
      requestId
    });
  }
});

// Visual Editor file write endpoint
router.post('/files/write', async (req, res) => {
  const startTime = Date.now();
  const requestId = Date.now().toString();
  
  try {
    const { filePath, content } = req.body;
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'File path is required',
        requestId
      });
    }
    
    if (content === undefined) {
      return res.status(400).json({
        success: false,
        error: 'File content is required',
        requestId
      });
    }
    
    // Get current session workspace path
    const currentSession = global.currentEditorSession;
    if (!currentSession || !currentSession.workspacePath) {
      return res.status(404).json({
        success: false,
        error: 'No active editing session. Please initialize first.',
        requestId
      });
    }
    
    const fullPath = path.join(currentSession.workspacePath, filePath);
    
    // Security check: ensure the file is within the workspace
    if (!fullPath.startsWith(currentSession.workspacePath)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: File path outside workspace',
        requestId
      });
    }
    
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
    
    res.json({
      success: true,
      filePath,
      size: content.length,
      meta: {
        requestId,
        duration: endTime - startTime,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    const endTime = Date.now();
    req.log('error', 'Failed to write file', {
      requestId,
      error: error.message,
      duration: endTime - startTime
    });
    res.status(500).json({
      success: false,
      error: error.message,
      requestId
    });
  }
});

// Visual Editor file tree endpoint
router.get('/files/tree', async (req, res) => {
  const startTime = Date.now();
  const requestId = Date.now().toString();
  
  try {
    // Get current session workspace path
    const currentSession = global.currentEditorSession;
    if (!currentSession || !currentSession.workspacePath) {
      return res.status(404).json({
        success: false,
        error: 'No active editing session. Please initialize first.',
        requestId
      });
    }
    
    const workspacePath = currentSession.workspacePath;
    
    // Recursive function to build file tree
    const buildTree = async (dirPath, relativePath = '') => {
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
          const children = await buildTree(fullPath, itemRelativePath);
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
    };
    
    const tree = await buildTree(workspacePath);
    
    const endTime = Date.now();
    req.log('info', 'File tree generated successfully', {
      requestId,
      itemCount: JSON.stringify(tree).match(/{"name":/g)?.length || 0,
      duration: endTime - startTime
    });
    
    res.json({
      success: true,
      tree,
      workspacePath,
      meta: {
        requestId,
        duration: endTime - startTime,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    const endTime = Date.now();
    req.log('error', 'Failed to generate file tree', {
      requestId,
      error: error.message,
      duration: endTime - startTime
    });
    res.status(500).json({
      success: false,
      error: error.message,
      requestId
    });
  }
});

// Visual Editor cleanup endpoint
router.post('/cleanup', async (req, res) => {
  const startTime = Date.now();
  const requestId = Date.now().toString();

  try {
    // Acquire mutex to prevent concurrent operations
    await acquireMutex();
    req.log('info', 'Cleaning up visual editor environment', { requestId });

    // Get current session info
    const currentSession = global.currentEditorSession;

    // Stop file watcher
    if (workspaceWatcher) {
      workspaceWatcher.close();
      workspaceWatcher = null;
    }

    // Remove session directory if it exists
    if (currentSession && currentSession.sessionPath) {
      if (await fs.pathExists(currentSession.sessionPath)) {
        await fs.remove(currentSession.sessionPath);
        req.log('info', 'Session directory removed', {
          requestId,
          sessionId: currentSession.sessionId,
          sessionPath: currentSession.sessionPath
        });
      }
    }

    // Clear session info
    global.currentEditorSession = null;

    const endTime = Date.now();
    req.updateConnectionStats(true, endTime - startTime);

    req.log('success', 'Visual editor environment cleaned up', {
      requestId,
      duration: endTime - startTime
    });

    res.json({
      success: true,
      message: 'Visual editor environment cleaned up successfully',
      meta: {
        requestId,
        duration: endTime - startTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    const endTime = Date.now();
    req.updateConnectionStats(false, endTime - startTime);

    req.log('error', 'Failed to cleanup visual editor environment', {
      requestId,
      error: error.message,
      duration: endTime - startTime
    });
    res.status(500).json({
      success: false,
      error: error.message,
      requestId
    });
  } finally {
    releaseMutex();
  }
});

// Build session endpoint
router.post('/session/:sessionId/build', async (req, res) => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || `build-${Date.now()}`;
  
  try {
    const { sessionId } = req.params;
    const sessionManager = req.app.get('sessionManager');
    const SessionBuilder = require('../sessions/SessionBuilder');
    const sessionBuilder = new SessionBuilder();
    
    req.log('info', 'Building session workspace', {
      requestId,
      sessionId
    });

    // Get session info
    let session = sessionManager.getSession(sessionId);
    
    // If session not found in memory, try to load it from filesystem
    if (!session) {
      console.log(`📁 [Server] Session ${sessionId} not in memory, attempting to load from filesystem...`);
      try {
        session = await sessionManager.loadSessionFromFilesystem(sessionId);
        if (session) {
          console.log(`✅ [Server] Successfully loaded session ${sessionId} from filesystem`);
        }
      } catch (error) {
        console.error(`❌ [Server] Failed to load session ${sessionId} from filesystem:`, error);
      }
    }
    
    if (!session) {
      return res.status(404).json({ 
        error: 'Session not found',
        requestId 
      });
    }

    // Build the session
    const buildResult = await sessionBuilder.buildSession(sessionId, session.sessionPath);
    
    const endTime = Date.now();
    req.updateConnectionStats(true, endTime - startTime);

    req.log('success', 'Session built successfully', {
      requestId,
      sessionId,
      duration: endTime - startTime,
      outputPath: buildResult.outputPath
    });

    res.json({
      success: true,
      sessionId,
      buildResult,
      meta: {
        requestId,
        duration: endTime - startTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    const endTime = Date.now();
    req.updateConnectionStats(false, endTime - startTime);

    req.log('error', 'Failed to build session', {
      requestId,
      sessionId: req.params.sessionId,
      error: error.message,
      duration: endTime - startTime
    });

    res.status(500).json({
      error: 'Failed to build session',
      details: error.message,
      requestId,
      meta: {
        duration: endTime - startTime,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Serve built session app
router.get('/session/:sessionId/app.js', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const sessionManager = req.app.get('sessionManager');
    const SessionBuilder = require('../sessions/SessionBuilder');
    const sessionBuilder = new SessionBuilder();
    
    // Get session info
    let session = sessionManager.getSession(sessionId);
    
    if (!session) {
      session = await sessionManager.loadSessionFromFilesystem(sessionId);
    }
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Get compiled app path
    const compiledAppPath = sessionBuilder.getCompiledAppPath(session.sessionPath);
    
    if (!compiledAppPath) {
      return res.status(404).json({ 
        error: 'Session not built. Please build the session first.',
        buildEndpoint: `/api/editor/session/${sessionId}/build`
      });
    }

    // Serve the compiled JavaScript file
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(compiledAppPath);

  } catch (error) {
    console.error('❌ [Server] Error serving session app:', error);
    res.status(500).json({
      error: 'Failed to serve session app',
      details: error.message
    });
  }
});

module.exports = router;
