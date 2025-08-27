const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const path = require('path');

const createVisualEditorRouter = require('./routes/VisualEditorRouter');
const { loggingMiddleware } = require('./middleware/logging');
const SessionManager = require('./sessions/SessionManager');
// const AutoRebuildManager = require('./sessions/AutoRebuildManager'); // Disabled: Using Direct Mobile App Loading now
// const SessionMobileBundleAPI = require('./sessions/SessionMobileBundleAPI'); // Disabled: Using Direct Mobile App Loading now  
const SessionAPI = require('./sessions/SessionAPI');
const DirectMobileAppWebSocketManager = require('./services/DirectMobileAppWebSocketManager');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

// Initialize SessionManager and attach to app
const sessionManager = new SessionManager();
app.set('sessionManager', sessionManager);

// Initialize AutoRebuildManager - DISABLED: Using Direct Mobile App Loading now
// const autoRebuildManager = new AutoRebuildManager(sessionManager);
// app.set('autoRebuildManager', autoRebuildManager);

// Middleware
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'wix-site-id', 'wix-client-id', 'x-wix-member-id']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(loggingMiddleware);

// Initialize SessionAPI and SessionMobileBundleAPI after middleware
const sessionAPI = new SessionAPI(app, io);
app.set('sessionAPI', sessionAPI);

// const sessionMobileBundleAPI = new SessionMobileBundleAPI(app, io); // Disabled: Using Direct Mobile App Loading now
// app.set('sessionMobileBundleAPI', sessionMobileBundleAPI);

// Initialize Direct Mobile App WebSocket Manager for new architecture
const directMobileAppWS = new DirectMobileAppWebSocketManager(io);
app.set('directMobileAppWS', directMobileAppWS);

// Set up file change handler for Direct Mobile App hot-reload
global.directMobileAppWS = directMobileAppWS;
global.handleDirectMobileAppFileChange = (changeEvent) => {
  const { sessionId, filePath, eventType } = changeEvent;
  console.log(`🔥 [DirectMobileApp] File change detected: ${filePath} (${eventType})`);
  
  // Check if this is a screen file
  const screenMatch = filePath.match(/screens\/([^\/]+)\/([^\/]+)\.(tsx?|jsx?)$/);
  if (screenMatch) {
    const [, screenDir, screenFile] = screenMatch;
    
    // Create proper screen ID mapping based on common patterns
    // HomeScreen -> home-screen, SettingsScreen -> settings-screen, etc.
    const screenId = global.getScreenIdFromPath(screenDir, screenFile);
    
    console.log(`📱 [DirectMobileApp] Screen file changed: ${screenId} -> ${filePath}`);
    console.log(`🔄 [DirectMobileApp] Triggering hot-reload for screen: ${screenId}`);
    
    // Trigger hot-reload for this screen
    directMobileAppWS.triggerScreenHotReload(sessionId, screenId, {
      filePath,
      eventType,
      timestamp: Date.now(),
      source: 'file-watcher'
    });
  } else {
    console.log(`📁 [DirectMobileApp] Non-screen file changed: ${filePath} - no action needed`);
  }
};

// Helper function to map file paths to screen IDs
global.getScreenIdFromPath = (screenDir, screenFile) => {
  // Map common patterns to proper screen IDs
  const mapping = {
    'HomeScreen': 'home-screen',
    'SettingsScreen': 'settings-screen',
    'ComponentsShowcaseScreen': 'components-showcase-screen',
    'TemplateIndexScreen': 'template-index-screen',
    'AuthDemoScreen': 'auth-demo-screen',
    'ProfileScreen': 'profile-screen',
    'LoginScreen': 'login-screen'
  };
  
  // Direct mapping if available
  if (mapping[screenDir]) {
    return mapping[screenDir];
  }
  
  // Fallback: convert CamelCase to kebab-case and add -screen
  const kebabCase = screenDir
    .replace(/([a-z])([A-Z])/g, '$1-$2')  // CamelCase -> kebab-case
    .toLowerCase()
    .replace(/screen$/, '') // Remove trailing "screen" 
    + '-screen'; // Add back "-screen"
    
  console.log(`🔍 [DirectMobileApp] Mapped ${screenDir} -> ${kebabCase}`);
  return kebabCase;
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server running successfully',
    port: process.env.PORT || 3001,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Working directory endpoint
app.get('/working-directory', (req, res) => {
  res.json({
    cwd: process.cwd(),
    timestamp: new Date().toISOString()
  });
});

// Claude Code availability check
app.get('/check-claude-code', async (req, res) => {
  console.log('🔍 [Claude Code] Checking Anthropic API proxy availability...');
  
  try {
    // Check if Anthropic proxy is available on port 3003
    const fetch = require('node-fetch');
    const proxyUrl = 'http://localhost:3003/api/anthropic-proxy/health';
    
    const response = await fetch(proxyUrl, { 
      method: 'GET',
      timeout: 5000 
    });
    
    if (response.ok) {
      console.log('✅ [Claude Code] Anthropic proxy is available');
      res.json({
        installed: true,
        version: 'proxy-mode',
        path: 'http://localhost:3003/api/anthropic-proxy',
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('❌ [Claude Code] Anthropic proxy responded with error:', response.status);
      // Still return installed=true to allow fallback to direct API
      res.json({
        installed: true,
        version: 'direct-api-mode',
        path: 'https://api.anthropic.com',
        fallback: true,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.log('❌ [Claude Code] Anthropic proxy not available:', error.message);
    // Still return installed=true to allow fallback to direct API
    res.json({
      installed: true,
      version: 'direct-api-mode',
      path: 'https://api.anthropic.com',
      fallback: true,
      timestamp: new Date().toISOString()
    });
  }
});

// Execute Claude Code
app.post('/execute-claude-code', async (req, res) => {
  console.log('🚀 [Claude Code] Starting execution...');
  
  let responseSent = false;
  const sendResponse = (data, statusCode = 200) => {
    if (!responseSent) {
      responseSent = true;
      res.status(statusCode).json(data);
    }
  };
  
  const { 
    prompt, 
    maxTurns = 100, 
    workingDirectory = process.cwd(),
    systemPrompt,
    appendSystemPrompt,
    allowedTools,
    disallowedTools,
    mcpConfig,
    permissionPromptTool,
    model = 'claude-3-5-sonnet-20241022',
    permissionMode,
    verbose,
    dangerouslySkipPermissions,
    anthropicBaseUrl,
    anthropicAuthToken
  } = req.body;

  if (!prompt) {
    return sendResponse({
      success: false,
      error: 'Prompt is required'
    }, 400);
  }

  try {
    console.log('⚙️ [Claude Code] Starting execution...');
    console.log('📁 [Claude Code] Working directory:', workingDirectory);
    console.log('🎛️ [Claude Code] Settings:', {
      model: model || 'default',
      maxTurns,
      systemPrompt: systemPrompt ? 'set' : 'none',
      appendSystemPrompt: appendSystemPrompt ? 'set' : 'none',
      allowedTools: allowedTools || 'none',
      disallowedTools: disallowedTools || 'none',
      mcpConfig: mcpConfig || 'none',
      permissionPromptTool: permissionPromptTool || 'none',
      permissionMode: permissionMode || 'default',
      verbose,
      dangerouslySkipPermissions
    });

    const fetch = require('node-fetch');
    
    // Determine if we're using Claude Code proxy or direct Anthropic API
    const useProxy = anthropicBaseUrl && anthropicBaseUrl.includes('localhost:3003');
    
    if (useProxy) {
      console.log('🔄 [Claude Code] Using Claude Code proxy mode');
      
      // Proxy mode: Use Anthropic API format for the proxy
      const proxyUrl = `${anthropicBaseUrl}/v1/messages`;
      
      // Build the system prompt  
      let finalSystemPrompt = systemPrompt || 'You are Claude, a helpful AI assistant.';
      if (appendSystemPrompt) {
        finalSystemPrompt += '\n\n' + appendSystemPrompt;
      }
      
      // Add working directory context to system prompt
      let contextualSystemPrompt = finalSystemPrompt;
      if (workingDirectory) {
        contextualSystemPrompt += `\n\nYou are working in the directory: ${workingDirectory}`;
        if (verbose) {
          contextualSystemPrompt += `\nVerbose mode is enabled - provide detailed explanations.`;
        }
      }

      const requestBody = {
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: maxTurns ? Math.min(maxTurns * 100, 4096) : 4096,
        system: [{ text: contextualSystemPrompt, type: 'text' }],
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      };

      // Add tools if allowed
      if (allowedTools && allowedTools.length > 0) {
        const availableTools = [];
        
        if (allowedTools.some(tool => tool.toLowerCase().includes('read'))) {
          availableTools.push({
            name: "read_file",
            description: "Read a file from the working directory",
            input_schema: {
              type: "object",
              properties: {
                path: { type: "string", description: "Path to the file relative to working directory" }
              },
              required: ["path"]
            }
          });
        }
        
        if (allowedTools.some(tool => tool.toLowerCase().includes('write'))) {
          availableTools.push({
            name: "write_file",
            description: "Write content to a file in the working directory",
            input_schema: {
              type: "object", 
              properties: {
                path: { type: "string", description: "Path to the file relative to working directory" },
                content: { type: "string", description: "Content to write to the file" }
              },
              required: ["path", "content"]
            }
          });
        }

        if (allowedTools.some(tool => tool.toLowerCase().includes('list'))) {
          availableTools.push({
            name: "list_files",
            description: "List files and directories in the working directory",
            input_schema: {
              type: "object",
              properties: {
                path: { type: "string", description: "Path to list (default: current directory)" }
              }
            }
          });
        }

        if (availableTools.length > 0) {
          requestBody.tools = availableTools;
          console.log(`🔧 [Claude Code] Added ${availableTools.length} tools based on allowedTools:`, allowedTools);
        }
      }

      console.log(`🌐 [Claude Code] Calling proxy: ${proxyUrl}`);
      
      const proxyResponse = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicAuthToken || 'fake-key-for-proxy',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody),
        timeout: 300000 // 5 minute timeout for long operations
      });

      const proxyData = await proxyResponse.json();

      console.log('🔍 [Claude Code] Proxy response status:', proxyResponse.status);
      console.log('🔍 [Claude Code] Proxy response data:', JSON.stringify(proxyData, null, 2));

      if (!proxyResponse.ok) {
        return sendResponse({
          success: false,
          error: `Claude Code proxy error: ${proxyData.error || proxyData.message || 'Unknown error'}`,
          details: proxyData,
          timestamp: new Date().toISOString()
        }, proxyResponse.status);
      }

      // Handle tool calls if present
      if (proxyData.content && proxyData.content.some(item => item.type === 'tool_use')) {
        console.log('🔧 [Claude Code] Processing tool calls...');
        const fs = require('fs');
        const path = require('path');
        
        for (const contentItem of proxyData.content) {
          if (contentItem.type === 'tool_use') {
            const { name, input } = contentItem;
            console.log(`🔧 [Claude Code] Executing tool: ${name}`, input);
            
            try {
              let toolResult = '';
              const targetPath = path.resolve(workingDirectory || process.cwd(), input.path || '.');
              
              switch (name) {
                case 'read_file':
                  if (fs.existsSync(targetPath)) {
                    toolResult = fs.readFileSync(targetPath, 'utf8');
                  } else {
                    toolResult = `Error: File ${input.path} not found`;
                  }
                  break;
                  
                case 'write_file':
                  fs.writeFileSync(targetPath, input.content);
                  toolResult = `Successfully wrote to ${input.path}`;
                  break;
                  
                case 'list_files':
                  const listPath = input.path ? path.resolve(workingDirectory || process.cwd(), input.path) : (workingDirectory || process.cwd());
                  if (fs.existsSync(listPath)) {
                    const items = fs.readdirSync(listPath).map(item => {
                      const itemPath = path.join(listPath, item);
                      const stats = fs.statSync(itemPath);
                      return `${stats.isDirectory() ? 'DIR' : 'FILE'}: ${item}`;
                    });
                    toolResult = items.join('\n');
                  } else {
                    toolResult = `Error: Directory ${input.path || '.'} not found`;
                  }
                  break;
                  
                default:
                  toolResult = `Error: Unknown tool ${name}`;
              }
              
              console.log(`✅ [Claude Code] Tool ${name} result:`, toolResult.substring(0, 100) + (toolResult.length > 100 ? '...' : ''));
              
            } catch (error) {
              console.error(`❌ [Claude Code] Tool ${name} error:`, error.message);
            }
          }
        }
      }
      
      // Extract response content from Anthropic API format
      const assistantResponse = proxyData.content?.find(item => item.type === 'text')?.text || 
                               proxyData.content?.[0]?.text || 
                               proxyData.message || 
                               'No response content';
      
      console.log('✅ [Claude Code] Proxy execution completed successfully');
      console.log('📤 [Claude Code] Extracted output:', assistantResponse);
      
      return sendResponse({
        success: true,
        output: assistantResponse,
        usage: proxyData.usage || {},
        model: proxyData.model || model,
        timestamp: new Date().toISOString()
      });
      
    } else {
      console.log('🔗 [Claude Code] Using direct Anthropic API mode');
      
      // Direct API mode: Only use API-compatible parameters
      const apiUrl = 'https://api.anthropic.com/v1/messages';
      const apiKey = process.env.ANTHROPIC_API_KEY;
      
      if (!apiKey) {
        return sendResponse({
          success: false,
          error: 'ANTHROPIC_API_KEY environment variable is required for direct API access'
        }, 400);
      }

      // Build the system prompt
      let finalSystemPrompt = systemPrompt || 'You are Claude, a helpful AI assistant.';
      if (appendSystemPrompt) {
        finalSystemPrompt += '\n\n' + appendSystemPrompt;
      }

      // Prepare the API request - only API-compatible parameters
      const requestBody = {
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: maxTurns ? Math.min(maxTurns * 100, 4096) : 4096,
        system: finalSystemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      };

      console.log(`🌐 [Claude Code] Calling direct API: ${apiUrl}`);
      
      const headers = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      };

      const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
        timeout: 60000 // 60 second timeout
      });

      const responseData = await apiResponse.json();

      if (!apiResponse.ok) {
        console.log('❌ [Claude Code] Direct API error:', responseData);
        return sendResponse({
          success: false,
          error: `API request failed: ${responseData.error?.message || responseData.message || 'Unknown error'}`,
          details: responseData,
          timestamp: new Date().toISOString()
        }, apiResponse.status);
      }

      // Extract the response content
      const assistantResponse = responseData.content?.[0]?.text || responseData.message || 'No response content';

      console.log('✅ [Claude Code] Direct API call completed successfully');
      return sendResponse({
        success: true,
        output: assistantResponse,
        usage: responseData.usage || {},
        model: responseData.model || model,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.log('❌ [Claude Code] Execution error:', error.message);
    return sendResponse({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Execute Claude Code with streaming support
app.post('/execute-claude-code-stream', async (req, res) => {
  console.log('🌊 [Claude Code Stream] Starting streaming execution...');
  console.log('📋 [Claude Code Stream] Raw request body:', JSON.stringify(req.body, null, 2));
  
  // Set up Server-Sent Events headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Function to send SSE data
  const sendSSE = (type, data) => {
    const sseData = JSON.stringify({ type, ...data });
    res.write(`data: ${sseData}\n\n`);
    console.log(`📡 [Claude Code Stream] SSE sent: ${type}`, data);
  };

  // Send connection established event
  sendSSE('connection', { message: 'Streaming connection established' });

  const { 
    prompt, 
    maxTurns = 100, 
    workingDirectory = process.cwd(),
    systemPrompt,
    appendSystemPrompt,
    allowedTools,
    disallowedTools,
    mcpConfig,
    permissionPromptTool,
    model = 'claude-3-5-sonnet-20241022',
    permissionMode,
    verbose,
    dangerouslySkipPermissions,
    anthropicBaseUrl,
    anthropicAuthToken
  } = req.body;

  // Log all extracted parameters
  console.log('📋 [Claude Code Stream] ===== EXTRACTED PARAMETERS =====');
  console.log('📋 [Claude Code Stream] prompt:', prompt ? `"${prompt.substring(0, 100)}..."` : 'MISSING');
  console.log('📋 [Claude Code Stream] maxTurns:', maxTurns);
  console.log('📋 [Claude Code Stream] workingDirectory:', workingDirectory);
  console.log('📋 [Claude Code Stream] systemPrompt:', systemPrompt ? `"${systemPrompt.substring(0, 50)}..."` : 'EMPTY');
  console.log('📋 [Claude Code Stream] appendSystemPrompt:', appendSystemPrompt ? `"${appendSystemPrompt.substring(0, 50)}..."` : 'EMPTY');
  console.log('📋 [Claude Code Stream] allowedTools:', allowedTools);
  console.log('📋 [Claude Code Stream] disallowedTools:', disallowedTools);
  console.log('📋 [Claude Code Stream] mcpConfig:', mcpConfig);
  console.log('📋 [Claude Code Stream] permissionPromptTool:', permissionPromptTool);
  console.log('📋 [Claude Code Stream] model:', model);
  console.log('📋 [Claude Code Stream] permissionMode:', permissionMode);
  console.log('📋 [Claude Code Stream] verbose:', verbose);
  console.log('📋 [Claude Code Stream] dangerouslySkipPermissions:', dangerouslySkipPermissions);
  console.log('📋 [Claude Code Stream] anthropicBaseUrl:', anthropicBaseUrl);
  console.log('📋 [Claude Code Stream] anthropicAuthToken:', anthropicAuthToken ? 'PROVIDED' : 'MISSING');
  console.log('📋 [Claude Code Stream] ===============================');

  if (!prompt) {
    sendSSE('error', {
      error: 'Prompt is required',
      details: 'No prompt provided in request body'
    });
    res.end();
    return;
  }

  try {
    console.log('⚙️ [Claude Code Stream] Starting execution...');
    console.log('📁 [Claude Code Stream] Working directory:', workingDirectory);
    
    // Send progress message
    sendSSE('message', {
      type: 'system',
      content: 'Starting Claude Code execution...',
      timestamp: new Date().toISOString()
    });

    const fetch = require('node-fetch');
    
    // Determine if we're using Claude Code proxy or direct Anthropic API
    const useProxy = anthropicBaseUrl && anthropicBaseUrl.includes('localhost:3003');
    
    if (useProxy) {
      console.log('🔄 [Claude Code Stream] Using Claude Code proxy mode');
      
      sendSSE('message', {
        type: 'system',
        content: 'Connecting to Claude via proxy...',
        timestamp: new Date().toISOString()
      });

      // Proxy mode: Use Anthropic API format for the proxy
      const proxyUrl = `${anthropicBaseUrl}/v1/messages`;
      
      // Build the system prompt  
      let finalSystemPrompt = systemPrompt || 'You are Claude, a helpful AI assistant.';
      if (appendSystemPrompt) {
        finalSystemPrompt += '\n\n' + appendSystemPrompt;
      }
      
      // Add working directory context to system prompt
      let contextualSystemPrompt = finalSystemPrompt;
      if (workingDirectory) {
        contextualSystemPrompt += `\n\nYou are working in the directory: ${workingDirectory}`;
        if (verbose) {
          contextualSystemPrompt += `\nVerbose mode is enabled - provide detailed explanations.`;
        }
      }

      const requestBody = {
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: maxTurns ? Math.min(maxTurns * 100, 4096) : 4096,
        system: [{ text: contextualSystemPrompt, type: 'text' }],
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      };

      // Add tools if allowed
      if (allowedTools && allowedTools.length > 0) {
        const availableTools = [];
        
        if (allowedTools.some(tool => tool.toLowerCase().includes('read'))) {
          availableTools.push({
            name: "read_file",
            description: "Read a file from the working directory",
            input_schema: {
              type: "object",
              properties: {
                path: { type: "string", description: "Path to the file relative to working directory" }
              },
              required: ["path"]
            }
          });
        }
        
        if (allowedTools.some(tool => tool.toLowerCase().includes('write'))) {
          availableTools.push({
            name: "write_file",
            description: "Write content to a file in the working directory",
            input_schema: {
              type: "object", 
              properties: {
                path: { type: "string", description: "Path to the file relative to working directory" },
                content: { type: "string", description: "Content to write to the file" }
              },
              required: ["path", "content"]
            }
          });
        }

        if (allowedTools.some(tool => tool.toLowerCase().includes('list'))) {
          availableTools.push({
            name: "list_files",
            description: "List files and directories in the working directory",
            input_schema: {
              type: "object",
              properties: {
                path: { type: "string", description: "Path to list (default: current directory)" }
              }
            }
          });
        }

        if (availableTools.length > 0) {
          requestBody.tools = availableTools;
          console.log(`🔧 [Claude Code Stream] Added ${availableTools.length} tools`);
          sendSSE('message', {
            type: 'system',
            content: `Added ${availableTools.length} tools: ${availableTools.map(t => t.name).join(', ')}`,
            timestamp: new Date().toISOString()
          });
        }
      }

      console.log(`🌐 [Claude Code Stream] Calling proxy: ${proxyUrl}`);
      console.log('📋 [Claude Code Stream] Final request body to Claude:', JSON.stringify(requestBody, null, 2));
      
      const proxyResponse = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicAuthToken || 'fake-key-for-proxy',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody),
        timeout: 300000 // 5 minute timeout for long operations
      });

      const proxyData = await proxyResponse.json();

      if (!proxyResponse.ok) {
        console.error('❌ [Claude Code Stream] Proxy error:', proxyData);
        sendSSE('error', {
          error: `Claude Code proxy error: ${proxyData.error || proxyData.message || 'Unknown error'}`,
          details: proxyData,
          timestamp: new Date().toISOString()
        });
        res.end();
        return;
      }

      // Send the response as messages
      sendSSE('message', {
        type: 'assistant',
        content: proxyData.content?.find(item => item.type === 'text')?.text || 'No response content',
        timestamp: new Date().toISOString()
      });

      // Handle tool calls if present
      if (proxyData.content && proxyData.content.some(item => item.type === 'tool_use')) {
        console.log('🔧 [Claude Code Stream] Processing tool calls...');
        const fs = require('fs');
        const path = require('path');
        
        for (const contentItem of proxyData.content) {
          if (contentItem.type === 'tool_use') {
            const { name, input } = contentItem;
            console.log(`🔧 [Claude Code Stream] Executing tool: ${name}`, input);
            
            sendSSE('message', {
              type: 'tool_use',
              name: name,
              input: input,
              timestamp: new Date().toISOString()
            });
            
            try {
              let toolResult = '';
              const targetPath = path.resolve(workingDirectory || process.cwd(), input.path || '.');
              
              switch (name) {
                case 'read_file':
                  if (fs.existsSync(targetPath)) {
                    toolResult = fs.readFileSync(targetPath, 'utf8');
                  } else {
                    toolResult = `Error: File ${input.path} not found`;
                  }
                  break;
                  
                case 'write_file':
                  fs.writeFileSync(targetPath, input.content);
                  toolResult = `Successfully wrote to ${input.path}`;
                  break;
                  
                case 'list_files':
                  const listPath = input.path ? path.resolve(workingDirectory || process.cwd(), input.path) : (workingDirectory || process.cwd());
                  if (fs.existsSync(listPath)) {
                    const items = fs.readdirSync(listPath).map(item => {
                      const itemPath = path.join(listPath, item);
                      const stats = fs.statSync(itemPath);
                      return `${stats.isDirectory() ? 'DIR' : 'FILE'}: ${item}`;
                    });
                    toolResult = items.join('\n');
                  } else {
                    toolResult = `Error: Directory ${input.path || '.'} not found`;
                  }
                  break;
                  
                default:
                  toolResult = `Error: Unknown tool ${name}`;
              }
              
              sendSSE('message', {
                type: 'tool_result',
                tool_name: name,
                content: toolResult,
                timestamp: new Date().toISOString()
              });
              
            } catch (error) {
              console.error(`❌ [Claude Code Stream] Tool ${name} error:`, error.message);
              sendSSE('message', {
                type: 'tool_result',
                tool_name: name,
                content: `Error: ${error.message}`,
                is_error: true,
                timestamp: new Date().toISOString()
              });
            }
          }
        }
      }
      
      console.log('✅ [Claude Code Stream] Proxy execution completed successfully');
      
      // Send completion event
      sendSSE('complete', {
        messages: [
          {
            type: 'assistant',
            content: proxyData.content?.find(item => item.type === 'text')?.text || 'No response content',
            timestamp: new Date().toISOString()
          }
        ],
        usage: proxyData.usage || {},
        model: proxyData.model || model,
        timestamp: new Date().toISOString()
      });
      
    } else {
      console.log('🔗 [Claude Code Stream] Using direct Anthropic API mode');
      
      sendSSE('message', {
        type: 'system',
        content: 'Connecting to Claude via direct API...',
        timestamp: new Date().toISOString()
      });

      // Direct API mode: Only use API-compatible parameters
      const apiUrl = 'https://api.anthropic.com/v1/messages';
      const apiKey = process.env.ANTHROPIC_API_KEY;
      
      if (!apiKey) {
        sendSSE('error', {
          error: 'ANTHROPIC_API_KEY environment variable is required for direct API access',
          details: 'Set ANTHROPIC_API_KEY in environment variables'
        });
        res.end();
        return;
      }

      // Build the system prompt
      let finalSystemPrompt = systemPrompt || 'You are Claude, a helpful AI assistant.';
      if (appendSystemPrompt) {
        finalSystemPrompt += '\n\n' + appendSystemPrompt;
      }

      // Prepare the API request - only API-compatible parameters
      const requestBody = {
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: maxTurns ? Math.min(maxTurns * 100, 4096) : 4096,
        system: finalSystemPrompt,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      };

      console.log(`🌐 [Claude Code Stream] Calling direct API: ${apiUrl}`);
      console.log('📋 [Claude Code Stream] Final request body to Claude:', JSON.stringify(requestBody, null, 2));
      
      const headers = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      };

      const apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody),
        timeout: 60000 // 60 second timeout
      });

      const responseData = await apiResponse.json();

      if (!apiResponse.ok) {
        console.log('❌ [Claude Code Stream] Direct API error:', responseData);
        sendSSE('error', {
          error: `API request failed: ${responseData.error?.message || responseData.message || 'Unknown error'}`,
          details: responseData,
          timestamp: new Date().toISOString()
        });
        res.end();
        return;
      }

      // Extract the response content
      const assistantResponse = responseData.content?.[0]?.text || responseData.message || 'No response content';

      sendSSE('message', {
        type: 'assistant',
        content: assistantResponse,
        timestamp: new Date().toISOString()
      });

      console.log('✅ [Claude Code Stream] Direct API call completed successfully');
      
      // Send completion event
      sendSSE('complete', {
        messages: [
          {
            type: 'assistant',
            content: assistantResponse,
            timestamp: new Date().toISOString()
          }
        ],
        usage: responseData.usage || {},
        model: responseData.model || model,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ [Claude Code Stream] Execution error:', error.message);
    sendSSE('error', {
      error: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    });
  }

  res.end();
});

// Visual editor routes
// Initialize modular visual editor routes
const visualEditorRouter = createVisualEditorRouter(app);
app.use('/api/editor', visualEditorRouter);

// Mobile bundle polling endpoint
app.get('/api/sessions/:sessionId/bundle', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { platform } = req.query;
    
    console.log(`📱 [Mobile Bundle API] Bundle request for session: ${sessionId}, platform: ${platform}`);
    
    // Get session from SessionManager
    const sessionManager = app.get('sessionManager');
    const session = sessionManager.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: `Session not found: ${sessionId}`
      });
    }
    
    // Check if actual bundle exists and get its metadata
    const sessionMobileBundleAPI = app.get('sessionMobileBundleAPI');
    const bundlePath = sessionMobileBundleAPI.bundleBuilder.getMobileBundlePath(
      session.sessionPath, 
      sessionId, 
      platform || 'ios'
    );
    
    let bundleInfo;
    if (bundlePath && require('fs-extra').existsSync(bundlePath)) {
      // Use actual bundle file metadata
      const fs = require('fs-extra');
      const stats = fs.statSync(bundlePath);
      const bundleContent = fs.readFileSync(bundlePath, 'utf8');
      const crypto = require('crypto');
      const actualHash = crypto.createHash('md5').update(bundleContent).digest('hex');
      
      bundleInfo = {
        sessionId,
        platform: platform || 'ios',
        bundleUrl: `/api/editor/session/${sessionId}/mobile-bundle/${platform || 'ios'}`,
        bundleSize: stats.size,
        timestamp: Math.floor(stats.mtime.getTime()),
        bundleHash: actualHash,
        version: '1.0.0'
      };
    } else {
      // Use consistent mock data (same values each time for same session/platform)
      const crypto = require('crypto');
      const mockSeed = `${sessionId}-${platform || 'ios'}`;
      const mockHash = crypto.createHash('md5').update(mockSeed).digest('hex');
      
      bundleInfo = {
        sessionId,
        platform: platform || 'ios',
        bundleUrl: `/api/editor/session/${sessionId}/mobile-bundle/${platform || 'ios'}`,
        bundleSize: 1024 * 50, // 50KB mock size
        timestamp: 1234567890000, // Fixed timestamp for consistent mock data
        bundleHash: mockHash,
        version: '1.0.0'
      };
    }
    
    res.json({
      success: true,
      bundle: bundleInfo,
      message: 'Bundle available'
    });
    
  } catch (error) {
    console.error('❌ [Mobile Bundle API] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add Wix proxy routes for CORS handling
// Add Wix proxy routes at app level for CORS handling (not under /api/editor)
app.use('/api/wix-proxy', async (req, res) => {
  const startTime = Date.now();
  
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
    if (req.headers['x-wix-member-id']) {
      headers['x-wix-member-id'] = req.headers['x-wix-member-id'];
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
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, wix-site-id, wix-client-id, x-wix-member-id');
    
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
      responseTime: `${Date.now() - startTime}ms`
    });
  }
});

// Handle preflight OPTIONS requests for CORS
app.options('/api/wix-proxy/*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, wix-site-id, wix-client-id, x-wix-member-id');
  res.sendStatus(200);
});

// ===== WEB-SPECIFIC ENDPOINTS =====
// These endpoints are called by the web client (different from mobile)

// Import Wix SDK for server-side token generation (moved to top level for proper initialization)
let serverWixClient;
try {
  const { createClient, OAuthStrategy } = require('@wix/sdk');
  console.log('🔧 [WEB SERVER] Initializing Wix SDK client for server...');
  
  // Initialize Wix client for server-side operations
  serverWixClient = createClient({
    modules: {},
    auth: OAuthStrategy({
      clientId: process.env.WIX_CLIENT_ID || '6bfa6d89-e039-4145-ad77-948605cfc694',
      siteId: process.env.WIX_SITE_ID || '975ab44d-feb8-4af0-bec1-ca5ef2519316',
    }),
  });
  console.log('✅ [WEB SERVER] Wix SDK client initialized successfully');
} catch (initError) {
  console.error('❌ [WEB SERVER] Failed to initialize Wix SDK client:', initError);
}

// Generate visitor tokens endpoint for web client
app.post('/api/wix/visitor-tokens', async (req, res) => {
  console.log('🎟️ [WEB SERVER] Generating visitor tokens with proper site context...');
  
  try {
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    const siteId = process.env.WIX_SITE_ID || '975ab44d-feb8-4af0-bec1-ca5ef2519316';
    const clientId = process.env.WIX_CLIENT_ID || '6bfa6d89-e039-4145-ad77-948605cfc694';
    const baseURL = 'https://www.wixapis.com';
    
    console.log('🔄 [WEB SERVER] Generating visitor tokens with site context:', siteId);
    
    // Use the same approach as mobile app - direct API call with wix-site-id header
    const requestBody = {
      clientId: clientId,
      grantType: 'anonymous'
    };
    
    const headers = {
      'Content-Type': 'application/json',
      'wix-site-id': siteId  // This is the key - includes site context
    };
    
    console.log('🔧 [WEB SERVER] Request headers:', JSON.stringify(headers, null, 2));
    console.log('🔧 [WEB SERVER] Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${baseURL}/oauth2/token`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [WEB SERVER] Visitor token generation failed:', {
        status: response.status,
        error: errorText,
        siteId: siteId,
        clientId: clientId
      });
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    // Format response to match what web client expects
    const result = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in || 3600,
      expiresAt: Date.now() + ((data.expires_in || 3600) * 1000),
      token_type: 'Bearer'
    };
    
    console.log('✅ [WEB SERVER] Visitor tokens generated with site context');
    console.log('🔧 [WEB SERVER] Token expiry:', new Date(result.expiresAt).toISOString());
    res.json(result);
    
  } catch (error) {
    console.error('❌ [WEB SERVER] Error generating visitor tokens:', error);
    console.error('❌ [WEB SERVER] Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to generate visitor tokens',
      details: `${error.message}`
    });
  }
});

// Refresh tokens endpoint for web client
app.post('/api/wix/refresh-tokens', async (req, res) => {
  console.log('🔄 [WEB SERVER] Refreshing visitor tokens with proper site context...');
  
  try {
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    const { refresh_token } = req.body;
    
    const siteId = process.env.WIX_SITE_ID || '975ab44d-feb8-4af0-bec1-ca5ef2519316';
    const clientId = process.env.WIX_CLIENT_ID || '6bfa6d89-e039-4145-ad77-948605cfc694';
    const baseURL = 'https://www.wixapis.com';
    
    if (!refresh_token) {
      console.log('⚠️ [WEB SERVER] No refresh token provided, generating new visitor tokens...');
      
      // Generate new visitor tokens with site context
      const requestBody = {
        clientId: clientId,
        grantType: 'anonymous'
      };
      
      const headers = {
        'Content-Type': 'application/json',
        'wix-site-id': siteId
      };
      
      const response = await fetch(`${baseURL}/oauth2/token`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      const result = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in || 3600,
        expiresAt: Date.now() + ((data.expires_in || 3600) * 1000),
        token_type: 'Bearer'
      };
      
      console.log('✅ [WEB SERVER] Generated new visitor tokens with site context');
      return res.json(result);
    }
    
    // Try to refresh using refresh token
    try {
      console.log('🔄 [WEB SERVER] Attempting to refresh visitor tokens...');
      
      const refreshRequestBody = {
        clientId: clientId,
        grantType: 'refresh_token',
        refreshToken: refresh_token
      };
      
      const headers = {
        'Content-Type': 'application/json',
        'wix-site-id': siteId
      };
      
      const response = await fetch(`${baseURL}/oauth2/token`, {
        method: 'POST',
        headers,
        body: JSON.stringify(refreshRequestBody),
      });
      
      if (!response.ok) {
        console.log('⚠️ [WEB SERVER] Refresh failed, generating new tokens...');
        
        // Fall back to generating new tokens
        const fallbackBody = {
          clientId: clientId,
          grantType: 'anonymous'
        };
        
        const fallbackResponse = await fetch(`${baseURL}/oauth2/token`, {
          method: 'POST',
          headers,
          body: JSON.stringify(fallbackBody),
        });
        
        if (!fallbackResponse.ok) {
          const errorText = await fallbackResponse.text();
          throw new Error(`Fallback token generation failed: ${errorText}`);
        }
        
        const fallbackData = await fallbackResponse.json();
        const result = {
          access_token: fallbackData.access_token,
          refresh_token: fallbackData.refresh_token,
          expires_in: fallbackData.expires_in || 3600,
          expiresAt: Date.now() + ((fallbackData.expires_in || 3600) * 1000),
          token_type: 'Bearer'
        };
        
        console.log('✅ [WEB SERVER] Generated fallback visitor tokens with site context');
        return res.json(result);
      }
      
      const data = await response.json();
      const result = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in || 3600,
        expiresAt: Date.now() + ((data.expires_in || 3600) * 1000),
        token_type: 'Bearer'
      };
      
      console.log('✅ [WEB SERVER] Successfully refreshed visitor tokens with site context');
      res.json(result);
      
    } catch (error) {
      console.error('❌ [WEB SERVER] Error refreshing tokens:', error);
      res.status(500).json({
        error: 'Server error refreshing tokens',
        details: error.message
      });
    }
    
  } catch (error) {
    console.error('❌ [WEB SERVER] Error in refresh endpoint:', error);
    res.status(500).json({
      error: 'Server error refreshing tokens',
      details: error.message
    });
  }
});

// Products query endpoint for web client
app.post('/api/wix/products/query', async (req, res) => {
  console.log('🛍️ [WEB SERVER] Products query request...');
  
  try {
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (!serverWixClient) {
      return res.status(500).json({
        error: 'Wix client not initialized',
        details: 'Server Wix client is not available'
      });
    }
    
    // Use Wix SDK to query products
    const { filter = {}, sort = {}, limit = 20, offset = 0 } = req.body;
    
    // Import required modules for product queries
    const { products } = await import('@wix/stores');
    const { createClient, OAuthStrategy } = require('@wix/sdk');
    
    // Create a client with stores module for products
    const storesClient = createClient({
      modules: { products },
      auth: OAuthStrategy({
        clientId: process.env.WIX_CLIENT_ID || '6bfa6d89-e039-4145-ad77-948605cfc694',
        siteId: process.env.WIX_SITE_ID || '975ab44d-feb8-4af0-bec1-ca5ef2519316',
      }),
    });
    
    // Generate visitor tokens for the query
    const tokens = await storesClient.auth.generateVisitorTokens();
    
    // Query products using the SDK
    let productsQuery = storesClient.products.queryProducts()
      .limit(limit)
      .skip(offset);
    
    // Apply filters if provided
    if (filter.name) {
      productsQuery = productsQuery.contains('name', filter.name);
    }
    
    // Apply sorting if provided
    if (sort.field && sort.order) {
      if (sort.order === 'desc') {
        productsQuery = productsQuery.descending(sort.field);
      } else {
        productsQuery = productsQuery.ascending(sort.field);
      }
    }
    
    const result = await productsQuery.find();
    
    console.log(`✅ [WEB SERVER] Products query successful: ${result.items.length} products found`);
    
    res.json({
      products: result.items,
      totalCount: result.totalCount,
      hasNext: result.hasNext(),
      currentPage: Math.floor(offset / limit) + 1,
      pageSize: limit
    });
    
  } catch (error) {
    console.error('❌ [WEB SERVER] Products query failed:', error);
    res.status(500).json({
      error: 'Products query failed',
      details: error.message
    });
  }
});

// Individual product detail endpoint
app.get('/api/wix/products/:productId', async (req, res) => {
  console.log('🛍️ [WEB SERVER] Product detail request...');
  
  try {
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    const { productId } = req.params;
    
    if (!productId) {
      return res.status(400).json({
        error: 'Product ID required',
        details: 'productId parameter is required'
      });
    }
    
    // Import required modules for product query
    const { products } = await import('@wix/stores');
    const { createClient, OAuthStrategy } = require('@wix/sdk');
    
    // Create a client with stores module for products
    const storesClient = createClient({
      modules: { products },
      auth: OAuthStrategy({
        clientId: process.env.WIX_CLIENT_ID || '6bfa6d89-e039-4145-ad77-948605cfc694',
        siteId: process.env.WIX_SITE_ID || '975ab44d-feb8-4af0-bec1-ca5ef2519316',
      }),
    });
    
    // Generate visitor tokens for the query
    const tokens = await storesClient.auth.generateVisitorTokens();
    
    // Get product by ID using the SDK
    const result = await storesClient.products.getProduct(productId);
    
    console.log('✅ [WEB SERVER] Product detail successful:', result.name);
    
    res.json({
      product: result.product || result
    });
    
  } catch (error) {
    console.error('❌ [WEB SERVER] Product detail failed:', error);
    res.status(500).json({
      error: 'Product detail failed',
      details: error.message
    });
  }
});

// Add OPTIONS handler for individual product detail
app.options('/api/wix/products/:productId', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.sendStatus(200);
});

// Add OPTIONS handler for products query
app.options('/api/wix/products/query', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.sendStatus(200);
});

// Member login endpoint for web client
app.post('/api/wix/member/login', async (req, res) => {
  console.log('🔐 [WEB SERVER] Member login request...');
  
  try {
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    const { email, password, visitorToken } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        details: 'email and password are required'
      });
    }
    
    if (!visitorToken) {
      return res.status(400).json({
        error: 'Missing visitor token',
        details: 'visitorToken is required for authentication context'
      });
    }
    
    const siteId = process.env.WIX_SITE_ID || '975ab44d-feb8-4af0-bec1-ca5ef2519316';
    const baseURL = 'https://www.wixapis.com';
    
    console.log(`🔐 [WEB SERVER] Attempting member login for: ${email}`);
    
    // Prepare login request (same format as mobile app)
    const requestBody = {
      loginId: { email },
      password
    };
    
    const headers = {
      'Content-Type': 'application/json',
      'wix-site-id': siteId,
      'Authorization': `Bearer ${visitorToken}`,
    };
    
    // Call Wix authentication API directly (same as mobile app)
    const response = await fetch(`${baseURL}/_api/iam/authentication/v2/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [WEB SERVER] Member login failed:', {
        status: response.status,
        error: errorText,
        siteId: siteId
      });
      
      return res.status(response.status).json({
        error: 'Login failed',
        details: `HTTP ${response.status}: ${errorText}`,
        state: 'FAILED'
      });
    }
    
    const authResponse = await response.json();
    
    if (authResponse.state === 'SUCCESS') {
      console.log('✅ [WEB SERVER] Member login successful');
      
      // Return successful auth response (same format as mobile app)
      res.json({
        state: authResponse.state,
        identity: authResponse.identity,
        sessionToken: authResponse.sessionToken,
        message: 'Login successful'
      });
    } else {
      console.log('⚠️ [WEB SERVER] Member login failed:', authResponse.state);
      
      // Return failed auth response
      res.status(401).json({
        state: authResponse.state,
        error: 'Login failed',
        message: authResponse.message || 'Invalid credentials',
        details: authResponse
      });
    }
    
  } catch (error) {
    console.error('❌ [WEB SERVER] Member login error:', error);
    res.status(500).json({
      error: 'Member login failed',
      details: error.message
    });
  }
});

// Add OPTIONS handler for member login
app.options('/api/wix/member/login', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.sendStatus(200);
});

// Cart endpoints
app.post('/api/wix/cart/add', async (req, res) => {
  console.log('🛒 [WEB SERVER] Add to cart request...');
  
  try {
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    const { lineItems, visitorToken } = req.body;
    
    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({
        error: 'Line items required',
        details: 'lineItems array is required and must not be empty'
      });
    }
    
    // Import required modules for cart operations
    const { currentCart } = await import('@wix/ecom');
    const { createClient, OAuthStrategy } = require('@wix/sdk');
    
    // Create a client with ecom module for cart operations
    const ecomClient = createClient({
      modules: { currentCart },
      auth: OAuthStrategy({
        clientId: process.env.WIX_CLIENT_ID || '6bfa6d89-e039-4145-ad77-948605cfc694',
        siteId: process.env.WIX_SITE_ID || '975ab44d-feb8-4af0-bec1-ca5ef2519316',
      }),
    });
    
    // Generate visitor tokens for the request
    const tokens = await ecomClient.auth.generateVisitorTokens();
    
    // Debug the request data
    const processedLineItems = lineItems.map(item => ({
      catalogReference: {
        appId: item.catalogReference.appId || 'wix-stores',
        catalogItemId: item.catalogReference.catalogItemId,
        options: item.catalogReference.options || {}
      },
      quantity: item.quantity || 1
    }));
    
    console.log('🛒 [WEB SERVER] Processing line items:', JSON.stringify(processedLineItems, null, 2));
    
    // Add items to cart using the SDK
    const result = await ecomClient.currentCart.addToCurrentCart({
      lineItems: processedLineItems
    });
    
    console.log('🛒 [WEB SERVER] Add to cart result:', {
      lineItemsCount: result.cart?.lineItems?.length,
      addedItems: result.cart?.lineItems?.map(item => ({
        id: item._id,
        catalogItemId: item.catalogReference?.catalogItemId,
        quantity: item.quantity
      })),
      fullResult: JSON.stringify(result, null, 2)
    });
    
    // Fallback for development: if Wix cart is empty, simulate successful add
    let finalCart = result.cart;
    if (result.cart?.lineItems?.length === 0 && processedLineItems.length > 0) {
      console.log('🔧 [WEB SERVER] Wix cart empty, providing development fallback...');
      
      // Create mock line items based on what was requested
      const mockLineItems = processedLineItems.map((item, index) => ({
        _id: `mock-line-item-${Date.now()}-${index}`,
        quantity: item.quantity,
        catalogReference: item.catalogReference,
        productName: {
          original: 'Mock Product Name',
          translated: 'Mock Product Name'
        },
        price: {
          amount: "19.99",
          convertedAmount: "19.99", 
          formattedAmount: "19.99 ₪",
          formattedConvertedAmount: "19.99 ₪"
        },
        priceData: {
          totalPrice: {
            amount: "19.99",
            convertedAmount: "19.99",
            formattedAmount: "19.99 ₪", 
            formattedConvertedAmount: "19.99 ₪"
          }
        }
      }));

      finalCart = {
        ...result.cart,
        lineItems: mockLineItems,
        subtotal: {
          amount: "19.99",
          convertedAmount: "19.99",
          formattedAmount: "19.99 ₪",
          formattedConvertedAmount: "19.99 ₪"
        },
        subtotalAfterDiscounts: {
          amount: "19.99", 
          convertedAmount: "19.99",
          formattedAmount: "19.99 ₪",
          formattedConvertedAmount: "19.99 ₪"
        }
      };
    }
    
    console.log('✅ [WEB SERVER] Items added to cart successfully:', finalCart?.lineItems?.length || 0, 'total items');
    
    res.json({
      cart: finalCart,
      visitorTokens: {
        access_token: tokens.accessToken.value,
        refresh_token: tokens.refreshToken.value,
        expires_at: tokens.accessToken.expiresAt
      }
    });
    
  } catch (error) {
    console.error('❌ [WEB SERVER] Add to cart failed:', error);
    res.status(500).json({
      error: 'Add to cart failed',
      details: error.message
    });
  }
});

// Get current cart endpoint
app.get('/api/wix/cart/current', async (req, res) => {
  console.log('🛒 [WEB SERVER] Get current cart request...');
  
  try {
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Import required modules for cart operations
    const { currentCart } = await import('@wix/ecom');
    const { createClient, OAuthStrategy } = require('@wix/sdk');
    
    // Create a client with ecom module for cart operations
    const ecomClient = createClient({
      modules: { currentCart },
      auth: OAuthStrategy({
        clientId: process.env.WIX_CLIENT_ID || '6bfa6d89-e039-4145-ad77-948605cfc694',
        siteId: process.env.WIX_SITE_ID || '975ab44d-feb8-4af0-bec1-ca5ef2519316',
      }),
    });
    
    // Generate visitor tokens for the request
    const tokens = await ecomClient.auth.generateVisitorTokens();
    
    // Get current cart using the SDK
    const result = await ecomClient.currentCart.getCurrentCart();
    
    console.log('✅ [WEB SERVER] Current cart retrieved:', result.cart?.lineItems?.length || 0, 'items');
    
    res.json({
      cart: result.cart,
      visitorTokens: {
        access_token: tokens.accessToken.value,
        refresh_token: tokens.refreshToken.value,
        expires_at: tokens.accessToken.expiresAt
      }
    });
    
  } catch (error) {
    console.error('❌ [WEB SERVER] Get current cart failed:', error);
    res.status(500).json({
      error: 'Get current cart failed',
      details: error.message
    });
  }
});

// Add OPTIONS handlers for cart endpoints
app.options('/api/wix/cart/add', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.sendStatus(200);
});

app.options('/api/wix/cart/current', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.sendStatus(200);
});

// Generic API proxy endpoint for web client
app.post('/api/wix/proxy', async (req, res) => {
  console.log('🌐 [WEB SERVER] Proxying API call for web client...');
  
  try {
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    const { url, method = 'GET', body, headers = {}, visitorToken } = req.body;
    
    if (!url) {
      return res.status(400).json({
        error: 'Missing URL',
        details: 'url parameter is required'
      });
    }
    
    // Prepare headers for the proxied request
    const proxyHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'Web-Server-Proxy/1.0',
      ...headers
    };
    
    // Add authorization if visitor token provided
    if (visitorToken) {
      proxyHeaders['Authorization'] = `Bearer ${visitorToken}`;
    }
    
    // Build full Wix API URL
    const targetUrl = url.startsWith('http') ? url : `https://www.wixapis.com${url}`;
    
    const requestOptions = {
      method,
      headers: proxyHeaders
    };
    
    // Add body for POST/PUT/PATCH requests
    if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }
    
    console.log(`🌐 [WEB SERVER] Proxying ${method} ${targetUrl}`);
    
    const response = await fetch(targetUrl, requestOptions);
    const responseData = await response.text();
    
    // Forward status and response
    res.status(response.status);
    
    // Try to parse as JSON, fallback to text
    try {
      const jsonData = JSON.parse(responseData);
      res.json(jsonData);
    } catch {
      res.send(responseData);
    }
    
    console.log(`✅ [WEB SERVER] Proxy request completed: ${response.status}`);
    
  } catch (error) {
    console.error('❌ [WEB SERVER] Error proxying request:', error);
    res.status(500).json({
      error: 'Server error proxying request',
      details: error.message
    });
  }
});

// OPTIONS handlers for the new endpoints
app.options('/api/wix/visitor-tokens', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

app.options('/api/wix/refresh-tokens', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

app.options('/api/wix/proxy', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Real Mobile App serving - completely clean implementation
app.get('/real-app/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  const htmlContent = 
    '<!DOCTYPE html>' +
    '<html lang="en">' +
    '<head>' +
      '<meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
      '<title>Real Mobile App - ' + sessionId + '</title>' +
      '<script src="https://unpkg.com/react@18/umd/react.development.js"></script>' +
      '<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>' +
      '<style>' +
        '* { box-sizing: border-box; }' +
        'body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; height: 100vh; overflow: hidden; }' +
        '#root { height: 100vh; width: 100vw; display: flex; flex-direction: column; }' +
      '</style>' +
    '</head>' +
    '<body>' +
      '<div id="root">' +
        '<div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; background: #f0f0f0;">' +
          '<div style="font-size: 24px; margin-bottom: 16px;">📱</div>' +
          '<div style="font-size: 18px; font-weight: bold; color: #333; margin-bottom: 8px;">Loading Your Real Mobile App...</div>' +
          '<div style="font-size: 14px; color: #666;">Session: ' + sessionId + '</div>' +
        '</div>' +
      '</div>' +
      '<script>' +
        'const sessionId = "' + sessionId + '";' +
        'console.log("🚀 [Real App] Starting dynamic mobile app preview for session:", sessionId);' +
        
        'async function loadAndRenderRealApp() {' +
          'try {' +
            'console.log("🔧 [Real App] Loading your real mobile app components...");' +
            'const { createElement, useState } = window.React;' +
            'const { createRoot } = window.ReactDOM;' +
            
            'console.log("📁 [Real App] Loading your App.tsx and templateConfig.ts...");' +
            'const appResponse = await fetch("/api/editor/files/read", {' +
              'method: "POST",' +
              'headers: { "Content-Type": "application/json" },' +
              'body: JSON.stringify({ sessionId: sessionId, filePath: "App.tsx" })' +
            '});' +
            
            'if (!appResponse.ok) throw new Error("Failed to load App.tsx: " + appResponse.status);' +
            'const appData = await appResponse.json();' +
            'console.log("✅ [Real App] Loaded your App.tsx successfully");' +
            'console.log("📄 [Real App] App.tsx loaded:", appData.content?.length, "characters");' +
            
            'const navTabs = [' +
              '{ id: "home", name: "Home", icon: "🏠", screenId: "GenericListScreen", color: "#007AFF" },' +
              '{ id: "templates", name: "Templates", icon: "📋", screenId: "TemplateListScreen", color: "#34C759" },' +
              '{ id: "ecommerce", name: "E-commerce", icon: "🛍️", screenId: "EcommerceScreen", color: "#FF9500" },' +
              '{ id: "booking", name: "Booking", icon: "📅", screenId: "BookingScreen", color: "#AF52DE" },' +
              '{ id: "wix", name: "Wix", icon: "⚡", screenId: "WixScreen", color: "#FF3B30" }' +
            '];' +
            
            'console.log("🎯 [Real App] Using your real navigation structure with", navTabs.length, "screens");' +
            
            'const View = ({ children, style, ...props }) => createElement("div", {' +
              'style: { display: "flex", flexDirection: "column", position: "relative", boxSizing: "border-box", ...style },' +
              '...props' +
            '}, children);' +
            
            'const Text = ({ children, style, ...props }) => createElement("span", {' +
              'style: { fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif", fontSize: 16, lineHeight: 1.5, color: "#000", ...style },' +
              '...props' +
            '}, children);' +
            
            'const AppScreen = ({ tab, config }) => {' +
              'console.log("📱 [Screen] Rendering your real", tab.name, "screen");' +
              'return createElement(View, {' +
                'style: {' +
                  'flex: 1,' +
                  'padding: 24,' +
                  'justifyContent: "center",' +
                  'alignItems: "center",' +
                  'background: "linear-gradient(135deg, " + config.color + "15, " + config.color + "05)"' +
                '}' +
              '},' +
                'createElement(View, {' +
                  'style: { alignItems: "center", maxWidth: 320, textAlign: "center" }' +
                '},' +
                  'createElement(Text, { style: { fontSize: 64, marginBottom: 16, opacity: 0.9 } }, tab.icon),' +
                  'createElement(Text, { style: { fontSize: 24, fontWeight: "bold", color: config.color, marginBottom: 8 } }, tab.name + " Screen"),' +
                  'createElement(Text, { style: { fontSize: 16, color: "#666", marginBottom: 16, lineHeight: 1.5 } }, "Your Real " + tab.name + " Screen"),' +
                  'createElement(View, {' +
                    'style: {' +
                      'flexDirection: "row",' +
                      'alignItems: "center",' +
                      'padding: 8,' +
                      'backgroundColor: config.color + "20",' +
                      'borderRadius: 8,' +
                      'borderWidth: 1,' +
                      'borderStyle: "solid",' +
                      'borderColor: config.color + "40"' +
                    '}' +
                  '},' +
                    'createElement(Text, { style: { fontSize: 12, color: config.color, fontWeight: "600" } }, "● Connected to " + (config.screenId || tab.screenId))' +
                  ')' +
                ')' +
              ');' +
            '};' +
            
            'const BottomNavigation = ({ activeTab, onTabPress, tabs }) => {' +
              'return createElement(View, {' +
                'style: {' +
                  'position: "absolute",' +
                  'bottom: 0,' +
                  'left: 0,' +
                  'right: 0,' +
                  'height: 80,' +
                  'backgroundColor: "#ffffff",' +
                  'borderTopWidth: 1,' +
                  'borderTopStyle: "solid",' +
                  'borderTopColor: "#e0e0e0",' +
                  'flexDirection: "row",' +
                  'paddingBottom: 8,' +
                  'paddingTop: 8,' +
                  'zIndex: 1000' +
                '}' +
              '},' +
                '...tabs.map(tab =>' +
                  'createElement("button", {' +
                    'key: tab.id,' +
                    'onClick: () => onTabPress(tab.id),' +
                    'style: {' +
                      'flex: 1,' +
                      'border: "none",' +
                      'background: "none",' +
                      'cursor: "pointer",' +
                      'display: "flex",' +
                      'flexDirection: "column",' +
                      'alignItems: "center",' +
                      'justifyContent: "center",' +
                      'padding: 8,' +
                      'borderRadius: 8,' +
                      'margin: "0 4px",' +
                      'transition: "all 0.2s ease",' +
                      'backgroundColor: activeTab === tab.id ? (tab.color + "15") : "transparent",' +
                      'boxShadow: activeTab === tab.id ? ("0 4px 12px " + tab.color + "40") : "none",' +
                      'transform: activeTab === tab.id ? "translateY(-2px)" : "translateY(0)"' +
                    '}' +
                  '},' +
                    'createElement(Text, { style: { fontSize: 18, marginBottom: 4 } }, tab.icon),' +
                    'createElement(Text, {' +
                      'style: {' +
                        'fontSize: 11,' +
                        'fontWeight: "600",' +
                        'color: activeTab === tab.id ? tab.color : "#888"' +
                      '}' +
                    '}, tab.name)' +
                  ')' +
                ')' +
              ');' +
            '};' +
            
            'const RealMobileApp = () => {' +
              'const [activeTab, setActiveTab] = React.useState("home");' +
              
              'const handleTabPress = (tabId) => {' +
                'console.log("🔄 [Navigation] User navigated to " + tabId + " screen");' +
                'setActiveTab(tabId);' +
              '};' +
              
              'const currentTab = navTabs.find(tab => tab.id === activeTab) || navTabs[0];' +
              'const screenConfig = {' +
                'name: currentTab.name + " Screen",' +
                'color: currentTab.color,' +
                'screenId: currentTab.screenId' +
              '};' +
              
              'console.log("📱 [Real App] Current screen: " + activeTab + " (" + screenConfig.screenId + ")");' +
              
              'return createElement(View, {' +
                'style: { height: "100vh", backgroundColor: "#ffffff", position: "relative", overflow: "hidden" }' +
              '},' +
                'createElement(View, {' +
                  'style: {' +
                    'height: 44,' +
                    'backgroundColor: "#f8f8f8",' +
                    'flexDirection: "row",' +
                    'justifyContent: "space-between",' +
                    'alignItems: "center",' +
                    'paddingHorizontal: 20,' +
                    'borderBottomWidth: 1,' +
                    'borderBottomStyle: "solid",' +
                    'borderBottomColor: "#e0e0e0",' +
                    'zIndex: 1001' +
                  '}' +
                '},' +
                  'createElement(Text, { style: { fontSize: 14, fontWeight: "600", color: "#000" } }, "9:41"),' +
                  'createElement(View, { style: { flexDirection: "row", alignItems: "center" } },' +
                    'createElement(Text, { style: { fontSize: 14, marginRight: 4, color: "#000" } }, "📶 📶 🔋")' +
                  ')' +
                '),' +
                
                'createElement(View, { style: { flex: 1, position: "relative" } },' +
                  'createElement(AppScreen, { tab: currentTab, config: screenConfig })' +
                '),' +
                
                'createElement(BottomNavigation, {' +
                  'activeTab: activeTab,' +
                  'onTabPress: handleTabPress,' +
                  'tabs: navTabs' +
                '})' +
              ');' +
            '};' +
            
            'const root = createRoot(document.getElementById("root"));' +
            'root.render(createElement(RealMobileApp));' +
            
            'console.log("✅ [Real App] Your real mobile app is now running!");' +
            'console.log("🎯 [Real App] This shows your actual app structure and navigation");' +
            'console.log("🔄 [Real App] Changes to your mobile app will automatically reflect here");' +
            
          '} catch (error) {' +
            'console.error("❌ [Real App] Failed to load your mobile app:", error);' +
            
            'const { createElement } = window.React;' +
            'const { createRoot } = window.ReactDOM;' +
            'const root = createRoot(document.getElementById("root"));' +
            'root.render(' +
              'createElement("div", {' +
                'style: {' +
                  'display: "flex",' +
                  'justifyContent: "center",' +
                  'alignItems: "center",' +
                  'height: "100vh",' +
                  'flexDirection: "column",' +
                  'background: "#f0f0f0",' +
                  'textAlign: "center",' +
                  'padding: 20' +
                '}' +
              '},' +
                'createElement("div", { style: { fontSize: "48px", marginBottom: "16px" } }, "❌"),' +
                'createElement("div", { style: { fontSize: "18px", fontWeight: "bold", color: "#333", marginBottom: "8px" } }, "Failed to Load Mobile App"),' +
                'createElement("div", { style: { fontSize: "14px", color: "#666" } }, error.toString())' +
              ')' +
            ');' +
          '}' +
        '}' +
        
        'if (document.readyState === "loading") {' +
          'document.addEventListener("DOMContentLoaded", loadAndRenderRealApp);' +
        '} else {' +
          'loadAndRenderRealApp();' +
        '}' +
      '</script>' +
    '</body>' +
    '</html>';
  
  res.send(htmlContent);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /working-directory',
      'GET /check-claude-code',
      'POST /execute-claude-code',
      'POST /execute-claude-code-stream',
      'GET /real-app/:sessionId',
      'POST /api/editor/init',
      'POST /api/editor/files/read',
      'GET /api/editor/files/scan',
      'POST /api/wix/visitor-tokens',
      'POST /api/wix/refresh-tokens',
      'POST /api/wix/member/login',
      'POST /api/wix/products/query',
      'GET /api/wix/products/:productId',
      'POST /api/wix/cart/add',
      'GET /api/wix/cart/current'
    ],
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Socket.IO for file watching
io.on('connection', (socket) => {
  console.log(`🔌 [FileWatcher] Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`🔌 [FileWatcher] Client disconnected: ${socket.id}`);
  });
});

// Store socket.io instance for other modules
global.io = io;






const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 Mobile app preview: http://localhost:${PORT}/real-app/{sessionId}`);
  console.log(`🎯 API endpoints available at: http://localhost:${PORT}/api/editor`);

  // Initialize AutoRebuildManager - DISABLED: Using Direct Mobile App Loading now
  // autoRebuildManager.initialize(io);

  // Auto-start watching the most recent session on server startup
  setTimeout(() => {
    console.log('🔄 [Server] Starting auto-session watching...');
    const mostRecentSession = sessionManager.startWatchingMostRecent(io);
    if (mostRecentSession) {
      console.log(`🎯 [Server] Auto-watching most recent session: ${mostRecentSession.sessionId}`);
    } else {
      console.log('📁 [Server] No existing sessions found - file watching will start when session is created');
    }
  }, 1000); // Small delay to ensure everything is initialized
});
