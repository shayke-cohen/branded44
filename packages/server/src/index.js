const express = require('express');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');
const { query } = require('@anthropic-ai/claude-code');

const app = express();
const port = process.env.PORT || 3001;

// Enhanced logging function with verbosity control
const VERBOSE_LOGGING = process.env.VERBOSE_LOGGING === 'true' || false;

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const emoji = {
    'info': '📋',
    'success': '✅',
    'error': '❌',
    'warn': '⚠️',
    'debug': '🔍',
    'stream': '📨'
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Claude Code server is running',
    timestamp: new Date().toISOString(),
    port: port,
    sdk: 'enabled'
  });
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
