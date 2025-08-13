const express = require('express');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');
const { query } = require('@anthropic-ai/claude-code');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3001;

// Enhanced logging function with verbosity control
const VERBOSE_LOGGING = process.env.VERBOSE_LOGGING === 'true' || false;

// Connection tracking
const connectionStats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  averageResponseTime: 0,
  responseTimes: [],
  activeConnections: 0,
  startTime: Date.now()
};

function updateConnectionStats(success, responseTime) {
  connectionStats.totalRequests++;
  if (success) {
    connectionStats.successfulRequests++;
  } else {
    connectionStats.failedRequests++;
  }
  
  connectionStats.responseTimes.push(responseTime);
  if (connectionStats.responseTimes.length > 100) {
    connectionStats.responseTimes = connectionStats.responseTimes.slice(-100);
  }
  
  connectionStats.averageResponseTime = 
    connectionStats.responseTimes.reduce((a, b) => a + b, 0) / connectionStats.responseTimes.length;
}

function getConnectionHealth() {
  if (connectionStats.totalRequests === 0) return 'healthy';
  
  const successRate = connectionStats.successfulRequests / connectionStats.totalRequests;
  const avgResponseTime = connectionStats.averageResponseTime;
  
  if (successRate >= 0.9 && avgResponseTime < 5000) return 'healthy';
  if (successRate >= 0.7 && avgResponseTime < 10000) return 'degraded';
  return 'failed';
}

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const emoji = {
    'info': '📋',
    'success': '✅',
    'error': '❌',
    'warn': '⚠️',
    'debug': '🔍',
    'stream': '📨',
    'connection': '🔗',
    'performance': '⚡'
  }[level] || '📋';
  
  console.log(`${emoji} [${timestamp}] ${message}`);
  
  if (data) {
    if (VERBOSE_LOGGING || level === 'error') {
      // Full detailed logging for verbose mode or errors
      console.log('   Data:', JSON.stringify(data, null, 2));
    } else if (level === 'stream') {
      // For stream messages, show condensed version unless verbose
      const { type, messageIndex, timestamp: msgTime, toolName, contentLength } = data;
      console.log(`   ${type} #${messageIndex} (${msgTime}ms)${toolName ? ` tool:${toolName}` : ''}${contentLength ? ` chars:${contentLength}` : ''}`);
    } else if (level === 'performance') {
      // Performance metrics condensed
      const { duration, success, endpoint, method } = data;
      console.log(`   ${method} ${endpoint} - ${duration}ms ${success ? '✅' : '❌'}`);
    } else {
      // For other levels, show summary
      const keys = Object.keys(data);
      console.log(`   Summary: ${keys.length} fields - ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}`);
    }
  }
}

// Enable CORS for web app
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for large prompts

// Request tracking middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  req.requestId = requestId;
  req.startTime = startTime;
  
  log('info', `Incoming request`, {
    requestId,
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent'),
    origin: req.get('Origin'),
    contentLength: req.get('Content-Length')
  });
  
  connectionStats.activeConnections++;
  
  // Override res.end to track response
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    const success = res.statusCode < 400;
    
    updateConnectionStats(success, duration);
    connectionStats.activeConnections--;
    
    log('performance', 'Request completed', {
      requestId,
      method: req.method,
      endpoint: req.path,
      duration,
      status: res.statusCode,
      success,
      activeConnections: connectionStats.activeConnections
    });
    
    originalEnd.apply(this, args);
  };
  
  next();
});

// Wix API Configuration
const WIX_CONFIG = {
  siteId: process.env.WIX_SITE_ID || '975ab44d-feb8-4af0-bec1-ca5ef2519316',
  clientId: process.env.WIX_CLIENT_ID || '6bfa6d89-e039-4145-ad77-948605cfc694',
  apiBaseUrl: 'https://www.wixapis.com'
};

// Wix API Proxy Endpoints

// Generate visitor tokens
app.post('/api/wix/visitor-tokens', async (req, res) => {
  try {
    log('info', 'Generating Wix visitor tokens', {
      siteId: WIX_CONFIG.siteId,
      clientId: WIX_CONFIG.clientId
    });

    const response = await fetch(`${WIX_CONFIG.apiBaseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'wix-site-id': WIX_CONFIG.siteId
      },
      body: JSON.stringify({
        clientId: WIX_CONFIG.clientId,
        grantType: 'anonymous'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'Failed to generate visitor tokens', {
        status: response.status,
        error: errorText
      });
      return res.status(response.status).json({
        error: 'Failed to generate visitor tokens',
        details: errorText
      });
    }

    const data = await response.json();
    log('success', 'Visitor tokens generated successfully');
    
    res.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in
    });
  } catch (error) {
    log('error', 'Visitor token generation error', { error: error.message });
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Refresh visitor tokens
app.post('/api/wix/refresh-tokens', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    log('info', 'Refreshing Wix visitor tokens');

    const response = await fetch(`${WIX_CONFIG.apiBaseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refresh_token: refresh_token,
        grantType: 'refresh_token'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'Failed to refresh tokens', {
        status: response.status,
        error: errorText
      });
      return res.status(response.status).json({
        error: 'Failed to refresh tokens',
        details: errorText
      });
    }

    const data = await response.json();
    log('success', 'Visitor tokens refreshed successfully');
    
    res.json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in
    });
  } catch (error) {
    log('error', 'Token refresh error', { error: error.message });
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Member login
app.post('/api/wix/member/login', async (req, res) => {
  try {
    const { email, password, visitorToken } = req.body;
    
    if (!email || !password || !visitorToken) {
      return res.status(400).json({ 
        error: 'Email, password, and visitor token are required' 
      });
    }

    log('info', 'Processing member login', { email });

    const response = await fetch(`${WIX_CONFIG.apiBaseUrl}/_api/iam/authentication/v2/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'wix-site-id': WIX_CONFIG.siteId,
        'Authorization': `Bearer ${visitorToken}`
      },
      body: JSON.stringify({
        loginId: { email },
        password
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'Member login failed', {
        status: response.status,
        error: errorText,
        email
      });
      return res.status(response.status).json({
        error: 'Login failed',
        details: errorText
      });
    }

    const data = await response.json();
    log('success', 'Member login successful', { email });
    
    res.json(data);
  } catch (error) {
    log('error', 'Member login error', { error: error.message });
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Member registration
app.post('/api/wix/member/register', async (req, res) => {
  try {
    const { email, password, profile, visitorToken } = req.body;
    
    if (!email || !password || !visitorToken) {
      return res.status(400).json({ 
        error: 'Email, password, and visitor token are required' 
      });
    }

    log('info', 'Processing member registration', { email });

    const requestBody = {
      loginId: { email },
      password,
      ...(profile && { profile })
    };

    const response = await fetch(`${WIX_CONFIG.apiBaseUrl}/_api/iam/authentication/v2/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'wix-site-id': WIX_CONFIG.siteId,
        'Authorization': `Bearer ${visitorToken}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      log('error', 'Member registration failed', {
        status: response.status,
        error: errorText,
        email
      });
      return res.status(response.status).json({
        error: 'Registration failed',
        details: errorText
      });
    }

    const data = await response.json();
    log('success', 'Member registration successful', { email });
    
    res.json(data);
  } catch (error) {
    log('error', 'Member registration error', { error: error.message });
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Generic Wix API proxy
app.post('/api/wix/proxy', async (req, res) => {
  try {
    const { url, method = 'GET', headers = {}, body, visitorToken } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    log('info', 'Proxying Wix API request', { 
      url: url.replace(WIX_CONFIG.apiBaseUrl, ''),
      method 
    });

    const requestHeaders = {
      'Content-Type': 'application/json',
      'wix-site-id': WIX_CONFIG.siteId,
      ...headers
    };

    if (visitorToken) {
      requestHeaders['Authorization'] = `Bearer ${visitorToken}`;
    }

    const fetchOptions = {
      method,
      headers: requestHeaders
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    const responseText = await response.text();
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    if (!response.ok) {
      log('error', 'Wix API proxy request failed', {
        status: response.status,
        url: url.replace(WIX_CONFIG.apiBaseUrl, ''),
        error: responseData
      });
      return res.status(response.status).json({
        error: 'API request failed',
        details: responseData
      });
    }

    log('success', 'Wix API proxy request successful', {
      url: url.replace(WIX_CONFIG.apiBaseUrl, ''),
      method
    });
    
    res.json(responseData);
  } catch (error) {
    log('error', 'Wix API proxy error', { error: error.message });
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
});

// Health check endpoint with enhanced statistics
app.get('/health', (req, res) => {
  const uptime = Date.now() - connectionStats.startTime;
  const health = getConnectionHealth();
  
  const healthData = {
    status: 'OK',
    message: 'Claude Code server is running',
    timestamp: new Date().toISOString(),
    port: port,
    sdk: 'enabled',
    health: {
      status: health,
      uptime: uptime,
      uptimeFormatted: `${Math.floor(uptime / 60000)}m ${Math.floor((uptime % 60000) / 1000)}s`
    },
    connections: {
      total: connectionStats.totalRequests,
      successful: connectionStats.successfulRequests,
      failed: connectionStats.failedRequests,
      active: connectionStats.activeConnections,
      successRate: connectionStats.totalRequests > 0 ? 
        Math.round((connectionStats.successfulRequests / connectionStats.totalRequests) * 100) : 100
    },
    performance: {
      averageResponseTime: Math.round(connectionStats.averageResponseTime),
      recentResponseTimes: connectionStats.responseTimes.slice(-5)
    }
  };
  
  log('debug', 'Health check requested', {
    requestId: req.requestId,
    health: health,
    totalRequests: connectionStats.totalRequests,
    activeConnections: connectionStats.activeConnections
  });
  
  res.json(healthData);
});

// Check if Claude Code SDK is available
app.get('/check-claude-code', (req, res) => {
  try {
    // Try to access the query function to verify SDK is available
    if (typeof query === 'function') {
      res.json({ 
        installed: true, 
        method: 'SDK',
        message: 'Claude Code SDK is ready',
        features: ['streaming', 'better-error-handling', 'no-shell-escaping']
      });
    } else {
      res.json({ 
        installed: false, 
        error: 'Claude Code SDK not available',
        installCommand: 'npm install @anthropic-ai/claude-code'
      });
    }
  } catch (error) {
    res.json({ 
      installed: false, 
      error: 'Claude Code SDK error',
      details: error.message
    });
  }
});

// Server statistics endpoint
app.get('/stats', (req, res) => {
  const uptime = Date.now() - connectionStats.startTime;
  const health = getConnectionHealth();
  
  const stats = {
    server: {
      uptime: uptime,
      uptimeFormatted: `${Math.floor(uptime / 60000)}m ${Math.floor((uptime % 60000) / 1000)}s`,
      startTime: new Date(connectionStats.startTime).toISOString(),
      health: health,
      verboseLogging: VERBOSE_LOGGING
    },
    connections: {
      total: connectionStats.totalRequests,
      successful: connectionStats.successfulRequests,
      failed: connectionStats.failedRequests,
      active: connectionStats.activeConnections,
      successRate: connectionStats.totalRequests > 0 ? 
        (connectionStats.successfulRequests / connectionStats.totalRequests * 100).toFixed(1) : '100.0'
    },
    performance: {
      averageResponseTime: Math.round(connectionStats.averageResponseTime),
      minResponseTime: connectionStats.responseTimes.length > 0 ? Math.min(...connectionStats.responseTimes) : 0,
      maxResponseTime: connectionStats.responseTimes.length > 0 ? Math.max(...connectionStats.responseTimes) : 0,
      recentResponseTimes: connectionStats.responseTimes.slice(-10),
      responseTimeDistribution: {
        fast: connectionStats.responseTimes.filter(t => t < 1000).length,
        medium: connectionStats.responseTimes.filter(t => t >= 1000 && t < 5000).length,
        slow: connectionStats.responseTimes.filter(t => t >= 5000).length
      }
    },
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  };
  
  log('debug', 'Server statistics requested', {
    requestId: req.requestId,
    health: health,
    memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
  });
  
  res.json(stats);
});

// Execute Claude Code command using SDK with streaming
app.post('/execute-claude-code-stream', async (req, res) => {
  const { 
    prompt, 
    workingDirectory, 
    maxTurns = 20,
    systemPrompt,
    appendSystemPrompt,
    allowedTools,
    disallowedTools,
    mcpConfig,
    permissionPromptTool,
    model,
    permissionMode,
    verbose = false,
    addDir,
    dangerouslySkipPermissions = false,
    anthropicBaseUrl,
    anthropicAuthToken
  } = req.body;

  // Use explicit dangerouslySkipPermissions parameter
  const shouldSkipPermissions = dangerouslySkipPermissions;

  // Log request details
  log('info', 'Claude Code streaming request received', {
    promptLength: prompt ? prompt.length : 0,
    workingDirectory,
    maxTurns,
    model,
    shouldSkipPermissions,
    hasSystemPrompt: !!systemPrompt,
    allowedTools: allowedTools ? (Array.isArray(allowedTools) ? allowedTools : allowedTools.split(',')) : null,
    anthropicBaseUrl: anthropicBaseUrl ? 'custom' : 'default'
  });

  if (!prompt) {
    log('error', 'No prompt provided in request');
    return res.status(400).json({ 
      error: 'Prompt is required',
      example: { prompt: "Your Claude Code prompt here" }
    });
  }

  // Set up Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection message
  res.write('data: {"type":"connection","status":"connected"}\n\n');

  // Change to working directory if specified
  const originalCwd = process.cwd();
  const targetCwd = workingDirectory || originalCwd;
  
  try {
    process.chdir(targetCwd);
    log('info', `Executing Claude Code SDK (STREAMING)`, {
      workingDirectory: targetCwd,
      promptSnippet: prompt.substring(0, 200) + (prompt.length > 200 ? '...' : '')
    });
    
    const startTime = Date.now();
    const messages = [];
    const abortController = new AbortController();
    
    // Set up timeout
    const timeout = setTimeout(() => {
      abortController.abort();
    }, 600000); // 10 minute timeout for streaming

    try {
      // Set environment variables if provided
      if (anthropicBaseUrl) {
        process.env.ANTHROPIC_BASE_URL = anthropicBaseUrl;
        log('debug', 'Using custom Anthropic base URL', { url: anthropicBaseUrl });
      }
      if (anthropicAuthToken) {
        process.env.ANTHROPIC_AUTH_TOKEN = anthropicAuthToken;
        log('debug', 'Using custom auth token', { tokenLength: anthropicAuthToken.length });
      }
      


      // Build comprehensive options object
      const options = {
        maxTurns: maxTurns
      };

      // Add system prompt options
      if (systemPrompt) {
        options.systemPrompt = systemPrompt;
      }
      if (appendSystemPrompt) {
        options.appendSystemPrompt = appendSystemPrompt;
      }

      // Add tool permissions
      if (allowedTools) {
        options.allowedTools = Array.isArray(allowedTools) ? allowedTools : allowedTools.split(',').map(t => t.trim());
      }
      if (disallowedTools) {
        options.disallowedTools = Array.isArray(disallowedTools) ? disallowedTools : disallowedTools.split(',').map(t => t.trim());
      }

      // Add MCP configuration
      if (mcpConfig) {
        options.mcpConfig = mcpConfig;
      }
      if (permissionPromptTool) {
        options.permissionPromptTool = permissionPromptTool;
      }

      // Grant specific permissions to working directory instead of bypassing all permissions
      if (shouldSkipPermissions && workingDirectory) {
        // Allow all Write, Edit, MultiEdit, Read, and Bash tools - testing broader permissions
        const workingDirTools = [
          'Write',
          'Edit', 
          'MultiEdit',
          'Read',
          'Bash'  // Enable shell commands like ls, cat, grep, etc.
        ];
        
        if (allowedTools) {
          // Merge with existing allowed tools
          const existingTools = Array.isArray(allowedTools) ? allowedTools : allowedTools.split(',').map(t => t.trim());
          options.allowedTools = [...existingTools, ...workingDirTools];
        } else {
          options.allowedTools = workingDirTools;
        }
        
        log('debug', 'Granted permissions for working directory', {
          workingDirectory,
          allowedTools: options.allowedTools
        });
      } else if (shouldSkipPermissions) {
        options.dangerouslySkipPermissions = true;
        log('warn', 'DANGER: Skipping all permissions!', {
          method: 'dangerouslySkipPermissions',
          streaming: true
        });
      } else {
        // Add permission mode only if it's a valid value and we're not skipping permissions
        if (permissionMode && permissionMode !== 'default') {
          console.log(`📋 Permission mode: ${permissionMode} (may not be supported by SDK)`);
          // Only add supported permission modes if any
          // options.permissionMode = permissionMode;
        }
      }

      // Add model selection
      if (model) {
        options.model = model;
      }

      // Add verbose logging
      if (verbose) {
        options.verbose = true;
      }

      // Add additional directories
      if (addDir) {
        options.addDir = Array.isArray(addDir) ? addDir : addDir.split(',').map(d => d.trim());
      }
      if (workingDirectory) {
        options.addDir = Array.isArray(workingDirectory) ? workingDirectory : workingDirectory.split(',').map(d => d.trim());
      }

      // Log SDK options before execution
      log('debug', 'SDK options configured', {
        maxTurns: options.maxTurns,
        hasSystemPrompt: !!options.systemPrompt,
        allowedToolsCount: options.allowedTools?.length || 0,
        dangerouslySkipPermissions: options.dangerouslySkipPermissions,
        model: options.model || 'default'
      });

      // Stream Claude Code messages in real-time
      for await (const message of query({
        prompt: prompt,
        abortController: abortController,
        options: options,
      })) {
        messages.push(message);
        
        // Send message immediately via SSE
        res.write(`data: ${JSON.stringify({
          type: 'message',
          message: message,
          timestamp: Date.now() - startTime
        })}\n\n`);
        
        // Enhanced message logging with full content
        const messageData = {
          type: message.type,
          messageIndex: messages.length,
          timestamp: Date.now() - startTime,
          fullMessage: message // Include the complete message for debugging
        };

        if (message.type === 'text') {
          messageData.contentLength = message.content?.length || 0;
          messageData.contentPreview = message.content?.substring(0, 200) + (message.content?.length > 200 ? '...' : '');
          messageData.fullContent = message.content; // Full text content
        } else if (message.type === 'tool_use') {
          messageData.toolName = message.name;
          messageData.inputKeys = message.input ? Object.keys(message.input) : [];
          messageData.toolInput = message.input; // Full tool input
          messageData.toolUseId = message.id;
        } else if (message.type === 'tool_result') {
          messageData.toolUseId = message.tool_use_id;
          messageData.isError = message.is_error;
          messageData.resultContent = message.content; // Full tool result content
          if (message.is_error) {
            messageData.errorDetails = message.error;
          }
        } else {
          // Log any other message types we might not be handling
          messageData.unknownType = true;
          messageData.rawMessage = message;
        }

        log('stream', `Claude message received`, messageData);
        
        // Also log a condensed version for easier reading
        const condensed = {
          type: message.type,
          index: messages.length,
          time: `${Date.now() - startTime}ms`
        };
        if (message.type === 'text') {
          condensed.contentLength = message.content?.length;
        } else if (message.type === 'tool_use') {
          condensed.tool = message.name;
        } else if (message.type === 'tool_result') {
          condensed.success = !message.is_error;
        }
        console.log(`📨 ${JSON.stringify(condensed)}`);
      }

      clearTimeout(timeout);
      const duration = Date.now() - startTime;
      
      log('success', 'Claude Code SDK streaming completed', {
        duration: `${duration}ms`,
        totalMessages: messages.length,
        messageTypes: messages.reduce((acc, msg) => {
          acc[msg.type] = (acc[msg.type] || 0) + 1;
          return acc;
        }, {}),
        workingDirectory: targetCwd
      });
      
      // Send completion message
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        success: true,
        messages: messages,
        messageCount: messages.length,
        duration: duration,
        method: 'SDK-STREAM',
        workingDirectory: targetCwd,
        maxTurns: maxTurns
      })}\n\n`);

      res.end();

    } catch (error) {
      clearTimeout(timeout);
      const duration = Date.now() - startTime;
      
      log('error', 'Claude Code SDK streaming failed', {
        duration: `${duration}ms`,
        errorMessage: error.message,
        errorType: error.constructor.name,
        stack: error.stack?.split('\n').slice(0, 5), // First 5 lines of stack
        messagesReceived: messages.length,
        workingDirectory: targetCwd
      });
      
      // Send error message
      res.write(`data: ${JSON.stringify({
        type: 'error',
        success: false,
        error: 'Failed to execute Claude Code SDK',
        details: error.message || 'Unknown error',
        duration: duration,
        method: 'SDK-STREAM'
      })}\n\n`);
      
      res.end();
    }

  } finally {
    // Restore original working directory
    process.chdir(originalCwd);
  }
});

// Execute Claude Code command using SDK (non-streaming, original endpoint)
app.post('/execute-claude-code', async (req, res) => {
  const { 
    prompt, 
    workingDirectory, 
    maxTurns = 20,
    systemPrompt,
    appendSystemPrompt,
    allowedTools,
    disallowedTools,
    mcpConfig,
    permissionPromptTool,
    model,
    permissionMode,
    verbose = false,
    addDir,
    dangerouslySkipPermissions = false,
    anthropicBaseUrl,
    anthropicAuthToken
  } = req.body;

  // Use explicit dangerouslySkipPermissions parameter
  const shouldSkipPermissions = dangerouslySkipPermissions;

  // Log request details
  log('info', 'Claude Code regular request received', {
    promptLength: prompt ? prompt.length : 0,
    workingDirectory,
    maxTurns,
    model,
    shouldSkipPermissions,
    hasSystemPrompt: !!systemPrompt,
    streaming: false
  });

  if (!prompt) {
    log('error', 'No prompt provided in regular request');
    return res.status(400).json({ 
      error: 'Prompt is required',
      example: { prompt: "Your Claude Code prompt here" }
    });
  }

  // Change to working directory if specified
  const originalCwd = process.cwd();
  const targetCwd = workingDirectory || originalCwd;
  
  try {
    process.chdir(targetCwd);
    console.log(`🚀 Executing Claude Code SDK in: ${targetCwd}`);
    console.log(`📝 Prompt length: ${prompt.length} characters`);
    console.log(`🔄 Max turns: ${maxTurns}`);
    
    const startTime = Date.now();
    const messages = [];
    const abortController = new AbortController();
    
    // Set up timeout
    const timeout = setTimeout(() => {
      abortController.abort();
    }, 300000); // 5 minute timeout

    try {
      // Set environment variables if provided
      if (anthropicBaseUrl) {
        process.env.ANTHROPIC_BASE_URL = anthropicBaseUrl;
        console.log(`🔧 Using custom base URL: ${anthropicBaseUrl}`);
      }
      if (anthropicAuthToken) {
        process.env.ANTHROPIC_AUTH_TOKEN = anthropicAuthToken;
        console.log(`🔑 Using custom auth token`);
      }
      


      // Build comprehensive options object
      const options = {
        maxTurns: maxTurns
      };

      // Add system prompt options
      if (systemPrompt) {
        options.systemPrompt = systemPrompt;
      }
      if (appendSystemPrompt) {
        options.appendSystemPrompt = appendSystemPrompt;
      }

      // Add tool permissions
      if (allowedTools) {
        options.allowedTools = Array.isArray(allowedTools) ? allowedTools : allowedTools.split(',').map(t => t.trim());
      }
      if (disallowedTools) {
        options.disallowedTools = Array.isArray(disallowedTools) ? disallowedTools : disallowedTools.split(',').map(t => t.trim());
      }

      // Add MCP configuration
      if (mcpConfig) {
        options.mcpConfig = mcpConfig;
      }
      if (permissionPromptTool) {
        options.permissionPromptTool = permissionPromptTool;
      }

      // Grant specific permissions to working directory instead of bypassing all permissions
      if (shouldSkipPermissions && workingDirectory) {
        // Allow all Write, Edit, MultiEdit, Read tools - testing broader permissions
        const workingDirTools = [
          'Write',
          'Edit', 
          'MultiEdit',
          'Read'
        ];
        
        if (allowedTools) {
          // Merge with existing allowed tools
          const existingTools = Array.isArray(allowedTools) ? allowedTools : allowedTools.split(',').map(t => t.trim());
          options.allowedTools = [...existingTools, ...workingDirTools];
        } else {
          options.allowedTools = workingDirTools;
        }
        
        console.log(`🔧 REGULAR: Granted permissions for working directory: ${workingDirectory}`);
        console.log(`📝 Allowed tools:`, options.allowedTools);
      } else if (shouldSkipPermissions) {
        options.dangerouslySkipPermissions = true;
        console.log(`⚠️  DANGER: Skipping all permissions! (REGULAR - Using dangerouslySkipPermissions)`);
        console.log(`🔧 Permission options set:`, {
          dangerouslySkipPermissions: true
        });
      } else {
        // Add permission mode only if it's a valid value and we're not skipping permissions
        if (permissionMode && permissionMode !== 'default') {
          console.log(`📋 Permission mode: ${permissionMode} (may not be supported by SDK)`);
          // Only add supported permission modes if any
          // options.permissionMode = permissionMode;
        }
      }

      // Add model selection
      if (model) {
        options.model = model;
      }

      // Add verbose logging
      if (verbose) {
        options.verbose = true;
      }

      // Add additional directories
      if (addDir) {
        options.addDir = Array.isArray(addDir) ? addDir : addDir.split(',').map(d => d.trim());
      }
      if (workingDirectory) {
        options.addDir = Array.isArray(workingDirectory) ? workingDirectory : workingDirectory.split(',').map(d => d.trim());
      }

      if (verbose) {
        console.log(`🔧 System prompt: ${systemPrompt ? 'Custom' : 'Default'}`);
        console.log(`🛠️ Allowed tools: ${allowedTools || 'Default'}`);
        console.log(`🚫 Disallowed tools: ${disallowedTools || 'None'}`);
        console.log(`📋 Permission mode: ${permissionMode || 'default'}`);
        console.log(`🤖 Model: ${model || 'Default'}`);
        console.log(`⚠️ Skip permissions: ${shouldSkipPermissions}`);
        console.log(`📊 SDK Options:`, JSON.stringify(options, null, 2));
      }

      // Use the SDK to query Claude Code
      for await (const message of query({
        prompt: prompt,
        abortController: abortController,
        options: options,
      })) {
        messages.push(message);
        
        // Log progress
        console.log(`📨 Received message: ${message.type}`);
        if (message.type === 'text') {
          console.log(`📝 Text content: ${message.content?.substring(0, 100)}...`);
        } else if (message.type === 'tool_use') {
          console.log(`🔧 Tool use: ${message.name}`);
        }
      }

      clearTimeout(timeout);
      const duration = Date.now() - startTime;
      
      console.log(`✅ Claude Code SDK completed successfully in ${duration}ms`);
      console.log(`📊 Total messages: ${messages.length}`);
      
      res.json({
        success: true,
        messages: messages,
        messageCount: messages.length,
        duration: duration,
        method: 'SDK',
        workingDirectory: targetCwd,
        maxTurns: maxTurns
      });

    } catch (error) {
      clearTimeout(timeout);
      const duration = Date.now() - startTime;
      
      if (abortController.signal.aborted) {
        console.error(`⏰ Claude Code SDK timeout after ${duration}ms`);
        return res.status(408).json({
          success: false,
          error: 'Claude Code execution timeout',
          duration: duration,
          timeout: 300000
        });
      }
      
      console.error(`❌ Claude Code SDK failed after ${duration}ms:`, error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to execute Claude Code SDK', 
        details: error.message,
        duration: duration,
        method: 'SDK'
      });
    }

  } catch (error) {
    console.error(`❌ Directory or execution error:`, error);
    return res.status(500).json({
      success: false,
      error: 'Failed to execute Claude Code',
      details: error.message
    });
  } finally {
    // Always restore original working directory
    process.chdir(originalCwd);
  }
});

// Get current working directory
app.get('/working-directory', (req, res) => {
  res.json({
    cwd: process.cwd(),
    resolved: path.resolve(process.cwd())
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /check-claude-code', 
      'POST /execute-claude-code',
      'GET /working-directory'
    ]
  });
});

app.listen(port, () => {
  console.log('🎯 ==========================================');
  console.log(`🚀 Claude Code Server (SDK) running on port ${port}`);
  console.log(`📋 Health check: http://localhost:${port}/health`);
  console.log(`🔧 Using Claude Code SDK instead of CLI`);
  console.log(`✨ Features: System prompts, Tool permissions, MCP support`);
  console.log(`🛠️ Supports: Model selection, Permission modes, Verbose logging`);
  console.log(`📊 Enhanced logging: Messages, timings, errors, tool usage`);
  console.log(`🔍 Verbose logging: ${VERBOSE_LOGGING ? 'ENABLED' : 'DISABLED'} (set VERBOSE_LOGGING=true to enable)`);
  console.log('🎯 ==========================================');
  
  log('success', 'Claude Code Server started', {
    port,
    features: ['SDK', 'streaming', 'enhanced-logging'],
    verboseLogging: VERBOSE_LOGGING,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  process.exit(0);
});
