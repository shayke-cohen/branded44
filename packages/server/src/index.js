const express = require('express');
const cors = require('cors');
const path = require('path');
const { query } = require('@anthropic-ai/claude-code');

const app = express();
const port = process.env.PORT || 3001;

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

// Execute Claude Code command using SDK
app.post('/execute-claude-code', async (req, res) => {
  const { 
    prompt, 
    workingDirectory, 
    maxTurns = 3,
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

  // Convert permissionMode to dangerouslySkipPermissions if needed
  const shouldSkipPermissions = dangerouslySkipPermissions || permissionMode === 'bypass-permissions';

  if (!prompt) {
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

      // Add permission mode and dangerous skip
      if (permissionMode) {
        options.permissionMode = permissionMode;
      }
      if (shouldSkipPermissions) {
        options.dangerouslySkipPermissions = true;
        console.log(`⚠️  DANGER: Skipping all permissions! (Mode: ${permissionMode || 'explicit'})`);
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
  console.log('🎯 ==========================================');
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
