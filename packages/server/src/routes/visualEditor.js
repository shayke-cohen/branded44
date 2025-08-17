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

// Session template config endpoint - loads navigation and screen data from session workspace
// TEMPORARILY DISABLED FOR DEBUGGING
/*
router.post('/session/template-config', async (req, res) => {
  const startTime = Date.now();
  const requestId = Date.now().toString();
  
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
        requestId
      });
    }
    
    // Get session
    const sessionManager = req.app.get('sessionManager');
    let session = sessionManager.getSession(sessionId);
    
    // If session not found in memory, try to load from filesystem
    if (!session) {
      try {
        session = await sessionManager.loadSessionFromFilesystem(sessionId);
      } catch (error) {
        console.error(`❌ [Template Config] Failed to load session ${sessionId}:`, error);
      }
    }
    
    if (!session || !session.workspacePath) {
      return res.status(404).json({
        success: false,
        error: `Session not found: ${sessionId}`,
        requestId
      });
    }
    
    console.log(`📁 [Template Config] Loading template config for session: ${sessionId}`);
    console.log(`📁 [Template Config] Session workspace: ${session.workspacePath}`);
    
    // For now, load from the original mobile package since direct TypeScript execution is complex
    // Later this can be enhanced to compile and execute session workspace files
    try {
      // Require the mobile package's templateConfig
      const mobilePath = path.resolve(__dirname, '../../../mobile');
      const templateConfigPath = path.join(mobilePath, 'src/screen-templates/templateConfig.ts');
      
      console.log(`📁 [Template Config] Attempting to load from: ${templateConfigPath}`);
      
      // Since we can't directly require .ts files, let's try to read and parse the built version
      // First, check if the mobile package has a built version we can use
      let templateData;
      
      try {
        // Try to require the built mobile package components (if available)
        const mobileDistPath = path.join(mobilePath, 'dist');
        console.log(`📁 [Template Config] Checking for built files in: ${mobileDistPath}`);
        
        // For now, return a simplified version based on common React Native app structure
        // This will be enhanced later to parse the actual session files
        templateData = {
          navTabs: [
            { id: 'home-tab', name: 'Home', screenId: 'home-screen' },
            { id: 'store-tab', name: 'Store', screenId: 'wix-store-screen' },
            { id: 'food-tab', name: 'Food', screenId: 'wix-food-screen' },
            { id: 'services-tab', name: 'Services', screenId: 'wix-services-screen' },
            { id: 'cart-tab', name: 'Cart', screenId: 'wix-cart-screen' },
            { id: 'auth-tab', name: 'Auth', screenId: 'wix-auth-screen' },
            { id: 'settings-tab', name: 'Settings', screenId: 'settings-screen' },
            { id: 'components-tab', name: 'Components', screenId: 'component-library-screen' }
          ],
          screens: [
            { id: 'home-screen', name: 'Home', componentKey: 'HomeScreen' },
            { id: 'wix-store-screen', name: 'Wix Store', componentKey: 'WixStoreScreen' },
            { id: 'wix-food-screen', name: 'Wix Food', componentKey: 'WixFoodScreen' },
            { id: 'wix-services-screen', name: 'Wix Services', componentKey: 'WixServicesScreen' },
            { id: 'wix-cart-screen', name: 'Wix Cart', componentKey: 'WixCartScreen' },
            { id: 'wix-auth-screen', name: 'Wix Auth', componentKey: 'WixAuthScreen' },
            { id: 'settings-screen', name: 'Settings', componentKey: 'SettingsScreen' },
            { id: 'component-library-screen', name: 'Component Library', componentKey: 'ComponentsShowcaseScreen' }
          ],
          screenMappings: {
            'home-tab': 'home-screen',
            'store-tab': 'wix-store-screen',
            'food-tab': 'wix-food-screen',
            'services-tab': 'wix-services-screen',
            'cart-tab': 'wix-cart-screen',
            'auth-tab': 'wix-auth-screen',
            'settings-tab': 'settings-screen',
            'components-tab': 'component-library-screen'
          }
        };
        
        console.log(`✅ [Template Config] Generated template data with ${templateData.navTabs.length} nav tabs and ${templateData.screens.length} screens`);
        
      } catch (requireError) {
        console.error(`❌ [Template Config] Failed to load template config:`, requireError);
        
        // Return minimal fallback data
        templateData = {
          navTabs: [
            { id: 'home-tab', name: 'Home', screenId: 'home-screen' }
          ],
          screens: [
            { id: 'home-screen', name: 'Home', componentKey: 'HomeScreen' }
          ],
          screenMappings: {
            'home-tab': 'home-screen'
          }
        };
      }
      
      const responseTime = Date.now() - startTime;
      
      res.json({
        success: true,
        message: 'Template config loaded successfully',
        sessionId,
        data: templateData,
        meta: {
          requestId,
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString(),
          source: 'session-workspace' // Will be enhanced to actually load from session
        }
      });
      
    } catch (error) {
      console.error(`❌ [Template Config] Error loading template config:`, error);
      
      const responseTime = Date.now() - startTime;
      
      res.status(500).json({
        success: false,
        error: 'Failed to load template config',
        details: error.message,
        sessionId,
        meta: {
          requestId,
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString()
        }
      });
    }
    
  } catch (error) {
    console.error(`❌ [Template Config] Unexpected error:`, error);
    
    const responseTime = Date.now() - startTime;
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
      meta: {
        requestId,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      }
    });
  }
});
*/

// List available sessions endpoint
router.get('/sessions', async (req, res) => {
  const startTime = Date.now();
  const requestId = Date.now().toString();
  
  try {
    const sessionManager = req.app.get('sessionManager');
    if (!sessionManager) {
      return res.status(500).json({
        success: false,
        error: 'SessionManager not available',
        requestId
      });
    }

    // Get all sessions from SessionManager (returns array)
    const allSessions = sessionManager.getAllSessions();
    
    // Validate sessions against filesystem and filter out stale ones
    const fs = require('fs-extra');
    const validatedSessions = [];
    
    for (const session of allSessions) {
      try {
        // Check if session directory still exists
        if (await fs.pathExists(session.sessionPath)) {
          validatedSessions.push(session);
        } else {
          console.log(`📁 [Sessions API] Removing stale session from memory: ${session.sessionId}`);
          // Remove from SessionManager memory
          sessionManager.activeSessions.delete(session.sessionId);
        }
      } catch (error) {
        console.error(`📁 [Sessions API] Error validating session ${session.sessionId}:`, error);
        // Remove invalid sessions from memory too
        sessionManager.activeSessions.delete(session.sessionId);
      }
    }
    
    console.log(`📁 [Sessions API] Validated ${validatedSessions.length}/${allSessions.length} sessions (removed ${allSessions.length - validatedSessions.length} stale sessions)`);
    
    // Format sessions for frontend
    const sessions = validatedSessions.map(session => {
      // Handle sessions that might not have startTime (loaded from filesystem)
      const startTime = session.startTime || Date.now();
      const sessionTimestamp = parseInt(session.sessionId.split('-')[1]) || startTime;
      
      return {
        sessionId: session.sessionId,
        workspacePath: session.workspacePath,
        sessionPath: session.sessionPath,
        startTime: startTime,
        age: Date.now() - startTime,
        created: new Date(sessionTimestamp).toISOString(),
        lastModified: session.lastModified || new Date(sessionTimestamp).toISOString()
      };
    }).sort((a, b) => b.startTime - a.startTime); // Sort by newest first
    
    const responseTime = Date.now() - startTime;
    
    console.log(`📁 [Sessions API] Listed ${sessions.length} sessions`);
    
    res.json({
      success: true,
      message: `Found ${sessions.length} sessions`,
      sessions,
      meta: {
        requestId,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
        totalSessions: sessions.length
      }
    });
    
  } catch (error) {
    console.error(`❌ [Sessions API] Error listing sessions:`, error);
    
    const responseTime = Date.now() - startTime;
    
    res.status(500).json({
      success: false,
      error: 'Failed to list sessions',
      details: error.message,
      meta: {
        requestId,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Serve session modules dynamically for real-time editing
router.get('/session-module/:sessionId/*', async (req, res) => {
  const startTime = Date.now();
  const requestId = Date.now().toString();
  
  try {
    const { sessionId } = req.params;
    const modulePath = req.params[0]; // Get the wildcard path
    
    if (!sessionId || !modulePath) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and module path are required',
        requestId,
        responseTime: `${Date.now() - startTime}ms`
      });
    }

    const sessionManager = req.app.get('sessionManager');
    if (!sessionManager) {
      return res.status(500).json({
        success: false,
        error: 'SessionManager not available',
        requestId,
        responseTime: `${Date.now() - startTime}ms`
      });
    }

    // Get session info
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: `Session not found: ${sessionId}`,
        requestId,
        responseTime: `${Date.now() - startTime}ms`
      });
    }

    // Construct the full file path in session workspace
    const path = require('path');
    const fs = require('fs-extra');
    
    let filePath = path.join(session.sessionPath, 'workspace', modulePath);
    
    // Handle different file extensions
    if (!path.extname(filePath)) {
      // Try different extensions
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
        return res.status(404).json({
          success: false,
          error: `Module file not found: ${modulePath}`,
          requestId,
          responseTime: `${Date.now() - startTime}ms`
        });
      }
    }

    // Check if file exists
    if (!(await fs.pathExists(filePath))) {
      return res.status(404).json({
        success: false,
        error: `Module file not found: ${modulePath}`,
        requestId,
        responseTime: `${Date.now() - startTime}ms`
      });
    }

    // Read the file content
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    // Transform TypeScript to JavaScript if needed
    let jsContent = fileContent;
    
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      // Enhanced TypeScript to JavaScript transformation
      // Handle multiline constructs and complex patterns properly
      jsContent = fileContent
        // Remove import type statements (including from destructured imports)
        .replace(/import\s+type\s+.*?from\s+.*?;/g, '')
        .replace(/import\s*\{\s*([^}]*?),?\s*type\s+([^,}]+)([^}]*?)\}\s*from\s+([^;]+);/g, 'import { $1 $3 } from $4;')
        .replace(/import\s*\{\s*type\s+([^,}]+),?\s*([^}]*?)\}\s*from\s+([^;]+);/g, 'import { $2 } from $3;')
        
        // Remove export type statements (including multiline ones with better pattern)
        .replace(/export\s+type\s+[^=]+\s*=\s*[^;]*;/gs, '')
        .replace(/export\s+type\s+\w+\s*\{[\s\S]*?\}\s*;?/g, '')
        
        // Remove export interface declarations (including multiline ones)
        .replace(/export\s+interface\s+\w+[\s\S]*?\}/g, '')
        
        // Remove standalone type statements (including multiline ones)
        .replace(/type\s+\w+\s*=\s*[^;]*;/gs, '')
        
        // Remove interface declarations (including multiline ones)
        .replace(/interface\s+\w+[\s\S]*?\}/g, '')
        
        // Remove 'type' keywords from import statements more carefully
        .replace(/(\{\s*[^}]*?),?\s*type\s+(\w+),?([^}]*?\})/g, '$1, $2$3')
        .replace(/(\{\s*)type\s+(\w+),?\s*([^}]*?\})/g, '$1$2, $3')
        .replace(/,\s*,/g, ',') // Clean up double commas
        .replace(/\{\s*,/g, '{') // Clean up leading commas
        .replace(/,\s*\}/g, '}') // Clean up trailing commas
        
        // Remove type annotations from function parameters (improved)
        .replace(/(\w+)\s*:\s*[^,)=]+(?=[\s,)=])/g, '$1')
        
        // Remove return type annotations (including complex ones)
        .replace(/\)\s*:\s*[^{=>]+(\s*[{=>])/g, ')$1')
        
        // Remove type assertions (as keyword)
        .replace(/\s+as\s+[^,;)}\]]+/g, '')
        
        // Remove generic type parameters (improved to handle nested generics)
        .replace(/<[^<>]*(?:<[^<>]*(?:<[^<>]*>[^<>]*)*>[^<>]*)*>/g, '')
        
        // Remove React.FC and similar type annotations
        .replace(/:\s*React\.FC[^=,;)}\]]*(?=[=,;)}\]])/g, '')
        .replace(/:\s*ComponentType[^=,;)}\]]*(?=[=,;)}\]])/g, '')
        
        // Clean up function signatures in object properties (like defaultProps)
        .replace(/(async\s+)?\(([^)]*)\)\s*:\s*[^{=>\s][^{=>]*\s*=>/g, '($2) =>')
        
        // Clean up any remaining orphaned commas or spaces
        .replace(/\s*,\s*,/g, ',')
        .replace(/\(\s*,/g, '(')
        .replace(/,\s*\)/g, ')')
        .replace(/\{\s*,/g, '{')
        .replace(/,\s*\}/g, '}');
    }

    // Set appropriate content type
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    console.log(`📡 [Session Module] Served ${modulePath} for session ${sessionId}`);
    res.send(jsContent);
    
  } catch (error) {
    console.error(`❌ [Session Module] Error serving module:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      requestId,
      responseTime: `${Date.now() - startTime}ms`
    });
  }
});

// Session synchronization endpoint for file watching
router.post('/session/sync', async (req, res) => {
  const startTime = Date.now();
  const requestId = Date.now().toString();

  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'sessionId is required',
        requestId
      });
    }

    console.log(`🔄 [Session Sync] Syncing to session: ${sessionId}`);

    // Get SessionManager
    const sessionManager = req.app.get('sessionManager');
    if (!sessionManager) {
      return res.status(500).json({
        success: false,
        error: 'SessionManager not found',
        requestId
      });
    }

    // Get session details
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: `Session not found: ${sessionId}`,
        requestId
      });
    }

    // Stop current file watcher if it exists
    if (global.workspaceWatcher) {
      console.log('🔄 [Session Sync] Stopping current file watcher');
      global.workspaceWatcher.close();
      global.workspaceWatcher = null;
    }

    // Create new file watcher for this session
    console.log(`🔄 [Session Sync] Starting file watcher for: ${session.workspacePath}`);
    global.workspaceWatcher = chokidar.watch(session.workspacePath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true
    });

    global.workspaceWatcher
      .on('change', (filePath) => {
        console.log(`👁️ [FileWatcher] File changed in ${sessionId}: ${path.relative(session.workspacePath, filePath)}`);
        
        // Emit Socket.IO event for file change
        if (global.io) {
          global.io.emit('file-changed', {
            filePath: path.relative(session.workspacePath, filePath),
            sessionId: sessionId,
            timestamp: Date.now()
          });
        }
      });

    // Update global session info
    global.currentEditorSession = {
      sessionId: session.sessionId,
      sessionPath: session.sessionPath,
      workspacePath: session.workspacePath,
      startTime: Date.now()
    };

    console.log(`✅ [Session Sync] Successfully synced to session: ${sessionId}`);

    res.json({
      success: true,
      message: `File watcher synced to session: ${sessionId}`,
      sessionId: sessionId,
      workspacePath: session.workspacePath,
      requestId,
      responseTime: `${Date.now() - startTime}ms`
    });

  } catch (error) {
    console.error(`❌ [Session Sync] Error syncing session:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      requestId,
      responseTime: `${Date.now() - startTime}ms`
    });
  }
});

// File tree endpoint
router.get('/files/tree', async (req, res) => {
  const startTime = Date.now();
  const requestId = Date.now().toString();

  try {
    console.log('📁 [Files API] Getting file tree...');

    // Get current session
    const currentSession = global.currentEditorSession;
    if (!currentSession) {
      return res.status(404).json({
        success: false,
        error: 'No active session found',
        requestId,
        responseTime: `${Date.now() - startTime}ms`
      });
    }

    const fs = require('fs-extra');
    const path = require('path');

    // Build file tree from session workspace
    const buildFileTree = async (dirPath, relativePath = '') => {
      const items = await fs.readdir(dirPath);
      const tree = [];

      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = await fs.stat(itemPath);
        const relativeItemPath = path.join(relativePath, item).replace(/\\/g, '/');

        if (stats.isDirectory()) {
          // Skip node_modules and other common ignored directories
          if (['node_modules', '.git', 'dist', 'build', '.DS_Store'].includes(item)) {
            continue;
          }

          const children = await buildFileTree(itemPath, relativeItemPath);
          
          // Auto-expand commonly accessed directories
          const autoExpandDirs = ['screens', 'contexts', 'components', 'services', 'types', 'utils'];
          const shouldAutoExpand = autoExpandDirs.includes(item) || 
                                  relativeItemPath.includes('screens/') ||
                                  relativeItemPath.includes('wix/');
          
          tree.push({
            id: relativeItemPath,
            name: item,
            path: relativeItemPath,
            type: 'directory',
            children: children,
            isOpen: shouldAutoExpand
          });
        } else {
          // Only include common source files
          const ext = path.extname(item).toLowerCase();
          if (['.ts', '.tsx', '.js', '.jsx', '.json', '.md'].includes(ext)) {
            tree.push({
              id: relativeItemPath,
              name: item,
              path: relativeItemPath,
              type: 'file'
            });
          }
        }
      }

      return tree.sort((a, b) => {
        // Directories first, then files, both alphabetically
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    };

    const tree = await buildFileTree(currentSession.workspacePath);

    console.log(`📁 [Files API] Built file tree with ${tree.length} top-level items`);
    
    res.json({
      success: true,
      fileTree: tree, // Changed from 'tree' to 'fileTree' to match frontend expectations
      sessionId: currentSession.sessionId,
      requestId,
      responseTime: `${Date.now() - startTime}ms`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('📁 [Files API] Error getting file tree:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      requestId,
      responseTime: `${Date.now() - startTime}ms`
    });
  }
});

// Serve raw session files for component inspection
router.get('/session-file/:sessionId/*', async (req, res) => {
  const startTime = Date.now();
  const requestId = Date.now().toString();
  
  try {
    const { sessionId } = req.params;
    const filePath = req.params[0]; // Get the wildcard path
    
    if (!sessionId || !filePath) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and file path are required',
        requestId,
        responseTime: `${Date.now() - startTime}ms`
      });
    }

    const sessionManager = req.app.get('sessionManager');
    if (!sessionManager) {
      return res.status(500).json({
        success: false,
        error: 'SessionManager not available',
        requestId,
        responseTime: `${Date.now() - startTime}ms`
      });
    }

    // Get session info
    const session = sessionManager.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: `Session not found: ${sessionId}`,
        requestId,
        responseTime: `${Date.now() - startTime}ms`
      });
    }

    // Construct the full file path in session workspace
    const path = require('path');
    const fs = require('fs-extra');
    
    const fullFilePath = path.join(session.sessionPath, 'workspace', filePath);
    
    // Check if file exists
    if (!(await fs.pathExists(fullFilePath))) {
      return res.status(404).json({
        success: false,
        error: `File not found: ${filePath}`,
        requestId,
        responseTime: `${Date.now() - startTime}ms`
      });
    }

    // Read and return the raw file content
    const fileContent = await fs.readFile(fullFilePath, 'utf8');
    
    // Set appropriate content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'text/plain';
    if (ext === '.ts' || ext === '.tsx') {
      contentType = 'text/typescript';
    } else if (ext === '.js' || ext === '.jsx') {
      contentType = 'text/javascript';
    } else if (ext === '.json') {
      contentType = 'application/json';
    }
    
    console.log(`📄 [Session File] Served ${filePath} for session ${sessionId}`);
    res.status(200).json({
      success: true,
      content: fileContent,
      requestId,
      responseTime: `${Date.now() - startTime}ms`
    });
    
  } catch (error) {
    console.error(`❌ [Session File] Error serving file:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      requestId,
      responseTime: `${Date.now() - startTime}ms`
    });
  }
});

// Save/Update file content in session workspace
router.put('/session-file/:sessionId/*', async (req, res) => {
  const startTime = Date.now();
  const requestId = Date.now().toString();
  
  try {
    const { sessionId } = req.params;
    const filePath = req.params[0]; // Get the wildcard path
    const { content } = req.body;
    
    console.log(`💾 [Session File Save] Saving ${filePath} for session ${sessionId}`);
    
    if (!sessionId || !filePath) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and file path are required',
        requestId,
        responseTime: `${Date.now() - startTime}ms`
      });
    }

    if (content === undefined || content === null) {
      return res.status(400).json({
        success: false,
        error: 'File content is required',
        requestId,
        responseTime: `${Date.now() - startTime}ms`
      });
    }

    // Get session manager
    const sessionManager = req.app.get('sessionManager');
    if (!sessionManager) {
      return res.status(500).json({
        success: false,
        error: 'Session manager not available',
        requestId,
        responseTime: `${Date.now() - startTime}ms`
      });
    }

    // Get session details
    let session = sessionManager.getSession(sessionId);
    if (!session) {
      session = await sessionManager.loadSessionFromFilesystem(sessionId);
    }

    if (!session) {
      return res.status(404).json({
        success: false,
        error: `Session not found: ${sessionId}`,
        requestId,
        responseTime: `${Date.now() - startTime}ms`
      });
    }

    // Construct the full file path in session workspace
    const path = require('path');
    const fs = require('fs-extra');
    
    const fullFilePath = path.join(session.sessionPath, 'workspace', filePath);
    
    // Ensure directory exists
    await fs.ensureDir(path.dirname(fullFilePath));
    
    // Write file content
    await fs.writeFile(fullFilePath, content, 'utf8');
    
    console.log(`✅ [Session File Save] Successfully saved ${filePath} for session ${sessionId}`);
    
    // Trigger file change event if global watcher exists
    if (global.io) {
      const relativePath = path.relative(session.workspacePath, fullFilePath);
      global.io.emit('file-changed', {
        filePath: relativePath,
        sessionId: sessionId,
        timestamp: Date.now()
      });
      console.log(`📡 [Session File Save] Emitted file-changed event for: ${relativePath}`);
      
      // Trigger auto-rebuild
      if (global.autoRebuildManager) {
        global.autoRebuildManager.onFileChange({
          sessionId,
          filePath: relativePath,
          fullPath: fullFilePath,
          timestamp: Date.now()
        });
      }
    }
    
    res.json({
      success: true,
      message: `File saved successfully: ${filePath}`,
      filePath,
      sessionId,
      requestId,
      responseTime: `${Date.now() - startTime}ms`
    });
    
  } catch (error) {
    console.error(`❌ [Session File Save] Error saving file:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
      requestId,
      responseTime: `${Date.now() - startTime}ms`
    });
  }
});

// Test route to verify routes are being loaded
router.get('/test', (req, res) => {
  res.json({ message: 'Route file is being loaded correctly', timestamp: new Date().toISOString() });
});

// Auto-rebuild status endpoint
router.get('/auto-rebuild/status', (req, res) => {
  const startTime = Date.now();
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  req.log('info', 'Auto-rebuild status requested', { requestId });

  const autoRebuildManager = req.app.get('autoRebuildManager');
  if (!autoRebuildManager) {
    return res.status(500).json({
      error: 'Auto-rebuild manager not available',
      requestId,
      responseTime: `${Date.now() - startTime}ms`
    });
  }

  const status = autoRebuildManager.getStatus();
  
  res.json({
    status,
    requestId,
    responseTime: `${Date.now() - startTime}ms`
  });
});

// Manual rebuild trigger endpoint
router.post('/auto-rebuild/trigger/:sessionId', async (req, res) => {
  const startTime = Date.now();
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const { sessionId } = req.params;

  req.log('info', 'Manual rebuild triggered', { sessionId, requestId });

  try {
    const autoRebuildManager = req.app.get('autoRebuildManager');
    if (!autoRebuildManager) {
      return res.status(500).json({
        error: 'Auto-rebuild manager not available',
        sessionId,
        requestId,
        responseTime: `${Date.now() - startTime}ms`
      });
    }

    const buildResult = await autoRebuildManager.manualRebuild(sessionId);
    
    req.log('info', 'Manual rebuild completed', {
      sessionId,
      buildResult: buildResult.compiledAppPath,
      requestId,
      duration: `${Date.now() - startTime}ms`
    });

    res.json({
      success: true,
      message: `Manual rebuild completed for session ${sessionId}`,
      sessionId,
      buildResult,
      requestId,
      responseTime: `${Date.now() - startTime}ms`
    });

  } catch (error) {
    req.log('error', 'Manual rebuild failed', {
      sessionId,
      error: error.message,
      requestId,
      responseTime: `${Date.now() - startTime}ms`
    });

    res.status(500).json({
      error: error.message,
      sessionId,
      requestId,
      responseTime: `${Date.now() - startTime}ms`
    });
  }
});

module.exports = router;

// Export helper function for adding Wix proxy routes to main app
router.addWixProxyRoutes = (app) => {
  // Wix API Proxy routes to avoid CORS issues in browser
  app.use('/api/wix-proxy', async (req, res) => {
    const startTime = Date.now();
    const requestId = Date.now().toString();
    
    try {
      const targetUrl = `https://www.wixapis.com${req.originalUrl.replace('/api/wix-proxy', '')}`;
      
      console.log(`🌐 [Wix Proxy] ${req.method} ${targetUrl}`);
      
      // Prepare headers for the proxied request
      const headers = {
        'Content-Type': req.headers['content-type'] || 'application/json',
        'User-Agent': 'Visual-Editor-Proxy/1.0',
      };
      
      // Forward specific Wix-related headers if present
      if (req.headers['authorization']) {
        headers['Authorization'] = req.headers['authorization'];
      }
      if (req.headers['wix-site-id']) {
        headers['wix-site-id'] = req.headers['wix-site-id'];
      }
      if (req.headers['wix-client-id']) {
        headers['wix-client-id'] = req.headers['wix-client-id'];
      }
      
      // Prepare request options
      const requestOptions = {
        method: req.method,
        headers,
      };
      
      // Add body for POST/PUT requests
      if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
        requestOptions.body = JSON.stringify(req.body);
      }
      
      // Make the proxied request
      const response = await fetch(targetUrl, requestOptions);
      
      // Get response data
      const responseData = await response.text();
      
      // Set CORS headers for the browser
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, wix-site-id, wix-client-id');
      
      // Forward response status and headers
      res.status(response.status);
      
      // Forward important response headers
      if (response.headers.get('content-type')) {
        res.header('Content-Type', response.headers.get('content-type'));
      }
      
      console.log(`✅ [Wix Proxy] ${req.method} ${targetUrl} - ${response.status} (${Date.now() - startTime}ms)`);
      
      // Send the response
      res.send(responseData);
      
    } catch (error) {
      console.error(`❌ [Wix Proxy] Error proxying request:`, error);
      res.status(500).json({
        success: false,
        error: error.message,
        requestId,
        responseTime: `${Date.now() - startTime}ms`
      });
    }
  });
  
  // Handle preflight OPTIONS requests for CORS
  app.options('/api/wix-proxy/*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, wix-site-id, wix-client-id');
    res.sendStatus(200);
  });
};

// Content tracing endpoint  
router.post('/trace-content', async (req, res) => {
  try {
    const { sessionId, contentInfo } = req.body;
    
    if (!sessionId || !contentInfo) {
      return res.status(400).json({ error: 'sessionId and contentInfo are required' });
    }
    
    console.log(`🔍 [Content Tracing] Searching for content in session: ${sessionId}`);
    console.log(`📝 [Content Tracing] Content info:`, contentInfo);
    
    const SessionManager = require('../sessions/SessionManager');
    const sessionManager = new SessionManager();
    const sessionPath = path.join(sessionManager.tempDir, sessionId, 'workspace');
    
    if (!fs.existsSync(sessionPath)) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const traceResults = await traceContentInFiles(sessionPath, contentInfo);
    
    console.log(`📍 [Content Tracing] Found ${traceResults.length} matches`);
    
    res.json({
      sessionId,
      contentInfo,
      matches: traceResults
    });
  } catch (error) {
    console.error('❌ [Content Tracing] Error:', error);
    res.status(500).json({ error: 'Failed to trace content' });
  }
});

// Helper function to trace content in files
async function traceContentInFiles(workspacePath, contentInfo) {
  const matches = [];
  const { text, textContent, className, attributes } = contentInfo;
  
  // Get all relevant files (TSX, JSX, TS, JS)
  const files = await getFilesRecursively(workspacePath, ['.tsx', '.jsx', '.ts', '.js']);
  
  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(workspacePath, filePath);
      const fileMatches = [];
      
      // Search for text content (most important)
      if (text && text.length > 2) {
        const textMatches = findTextInFile(content, text, relativePath);
        fileMatches.push(...textMatches.map(m => ({ ...m, type: 'text' })));
      }
      
      if (textContent && textContent !== text && textContent.length > 2) {
        const textContentMatches = findTextInFile(content, textContent, relativePath);
        fileMatches.push(...textContentMatches.map(m => ({ ...m, type: 'textContent' })));
      }
      
      // Search for meaningful class names
      if (className) {
        const classNames = className.split(' ').filter(cls => cls.length > 3);
        for (const cls of classNames) {
          const classMatches = findClassInFile(content, cls, relativePath);
          fileMatches.push(...classMatches.map(m => ({ ...m, type: 'className' })));
        }
      }
      
      // Search for attributes
      for (const [attr, value] of Object.entries(attributes)) {
        if (value && value.length > 2) {
          const attrMatches = findAttributeInFile(content, attr, value, relativePath);
          fileMatches.push(...attrMatches.map(m => ({ ...m, type: 'attribute', attr })));
        }
      }
      
      if (fileMatches.length > 0) {
        matches.push({
          file: relativePath,
          fullPath: filePath,
          matches: fileMatches
        });
      }
    } catch (error) {
      console.warn(`⚠️ [Content Tracing] Error reading ${filePath}:`, error.message);
    }
  }
  
  // Sort matches by relevance (text matches first, then by match count)
  matches.sort((a, b) => {
    const aTextMatches = a.matches.filter(m => m.type === 'text').length;
    const bTextMatches = b.matches.filter(m => m.type === 'text').length;
    
    if (aTextMatches !== bTextMatches) {
      return bTextMatches - aTextMatches;
    }
    
    return b.matches.length - a.matches.length;
  });
  
  return matches;
}

// Helper functions for finding content
function findTextInFile(content, searchText, filePath) {
  const matches = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const index = line.toLowerCase().indexOf(searchText.toLowerCase());
    
    if (index !== -1) {
      matches.push({
        line: i + 1,
        column: index + 1,
        content: line.trim(),
        context: getLineContext(lines, i, 2),
        confidence: calculateTextConfidence(line, searchText)
      });
    }
  }
  
  return matches;
}

function findClassInFile(content, className, filePath) {
  const matches = [];
  const lines = content.split('\n');
  
  // Look for className="..." or class="..."
  const classRegex = new RegExp(`(class|className)=['""][^'"]*${className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^'"]*['"]`, 'gi');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = classRegex.exec(line);
    
    if (match) {
      matches.push({
        line: i + 1,
        column: match.index + 1,
        content: line.trim(),
        context: getLineContext(lines, i, 2),
        confidence: 0.8
      });
    }
  }
  
  return matches;
}

function findAttributeInFile(content, attr, value, filePath) {
  const matches = [];
  const lines = content.split('\n');
  
  const attrRegex = new RegExp(`${attr}=['""]${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'gi');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = attrRegex.exec(line);
    
    if (match) {
      matches.push({
        line: i + 1,
        column: match.index + 1,
        content: line.trim(),
        context: getLineContext(lines, i, 2),
        confidence: 0.9
      });
    }
  }
  
  return matches;
}

function calculateTextConfidence(line, searchText) {
  // Higher confidence for exact matches, JSX content, etc.
  const exactMatch = line.includes(searchText);
  const inJSX = line.includes('<') && line.includes('>');
  const inString = /['"`]/.test(line);
  
  let confidence = 0.5;
  if (exactMatch) confidence += 0.3;
  if (inJSX) confidence += 0.2;
  if (inString) confidence += 0.1;
  
  return Math.min(confidence, 1.0);
}

function getLineContext(lines, lineIndex, contextSize) {
  const start = Math.max(0, lineIndex - contextSize);
  const end = Math.min(lines.length, lineIndex + contextSize + 1);
  
  return {
    before: lines.slice(start, lineIndex),
    after: lines.slice(lineIndex + 1, end)
  };
}

async function getFilesRecursively(dir, extensions) {
  const files = [];
  
  async function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        await scan(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  await scan(dir);
  return files;
}
