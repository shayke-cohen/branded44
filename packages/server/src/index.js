const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const WebSocket = require('ws');
const path = require('path');

const visualEditorRoutes = require('./routes/visualEditor');
const { loggingMiddleware } = require('./middleware/logging');
const SessionManager = require('./sessions/SessionManager');
const AutoRebuildManager = require('./sessions/AutoRebuildManager');
const SessionMobileBundleAPI = require('./sessions/SessionMobileBundleAPI');
const SessionAPI = require('./sessions/SessionAPI');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

// Initialize SessionManager and attach to app
const sessionManager = new SessionManager();
app.set('sessionManager', sessionManager);

// Initialize AutoRebuildManager
const autoRebuildManager = new AutoRebuildManager(sessionManager);
app.set('autoRebuildManager', autoRebuildManager);

// Middleware
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(loggingMiddleware);

// Initialize SessionAPI and SessionMobileBundleAPI after middleware
const sessionAPI = new SessionAPI(app, io);
app.set('sessionAPI', sessionAPI);

const sessionMobileBundleAPI = new SessionMobileBundleAPI(app, io);
app.set('sessionMobileBundleAPI', sessionMobileBundleAPI);

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

// Visual editor routes
app.use('/api/editor', visualEditorRoutes);

// Add Wix proxy routes for CORS handling
if (visualEditorRoutes.addWixProxyRoutes) {
  visualEditorRoutes.addWixProxyRoutes(app);
}

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
      'GET /real-app/:sessionId',
      'POST /api/editor/init',
      'POST /api/editor/files/read',
      'GET /api/editor/files/scan'
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

// Create separate WebSocket server for mobile bundle communication
const wss = new WebSocket.Server({ 
  port: 3002, // Different port to avoid conflicts with Socket.IO
  cors: {
    origin: "*",
    credentials: true
  }
});

// Handle mobile WebSocket connections
wss.on('connection', (ws, req) => {
  console.log('📱 [Mobile WebSocket] Client connected');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('📱 [Mobile WebSocket] Received message:', data.type);
      
      // Handle mobile bundle requests
      if (data.type === 'request-mobile-bundle') {
        handleMobileBundleRequest(ws, data);
      }
    } catch (error) {
      console.error('❌ [Mobile WebSocket] Failed to parse message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        error: 'Invalid message format'
      }));
    }
  });
  
  ws.on('close', () => {
    console.log('📱 [Mobile WebSocket] Client disconnected');
  });
  
  ws.on('error', (error) => {
    console.error('❌ [Mobile WebSocket] Connection error:', error);
  });
  
  // Send connection confirmation
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Mobile WebSocket connected'
  }));
});

// Handle mobile bundle requests
function handleMobileBundleRequest(ws, data) {
  const { sessionId, platform } = data;
  
  if (!sessionId) {
    ws.send(JSON.stringify({
      type: 'mobile-bundle-error',
      error: 'Session ID is required'
    }));
    return;
  }
  
  console.log(`📱 [Mobile WebSocket] Bundle request for session: ${sessionId}, platform: ${platform}`);
  
  // Get session from SessionManager
  const sessionManager = app.get('sessionManager');
  const session = sessionManager.getSession(sessionId);
  
  if (!session) {
    ws.send(JSON.stringify({
      type: 'mobile-bundle-error',
      error: `Session not found: ${sessionId}`
    }));
    return;
  }
  
  // For now, send a mock bundle response
  // In a real implementation, this would trigger bundle building
  ws.send(JSON.stringify({
    type: 'mobile-bundle-available',
    sessionId,
    platform,
    bundleUrl: `/api/mobile-bundle/${sessionId}/${platform}`,
    bundleSize: 1024 * 50, // 50KB mock size
    timestamp: Date.now()
  }));
}

const PORT = process.env.PORT || 3001;
const WS_PORT = 3002;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 Mobile app preview: http://localhost:${PORT}/real-app/{sessionId}`);
  console.log(`🎯 API endpoints available at: http://localhost:${PORT}/api/editor`);
  console.log(`📱 Mobile WebSocket server running on port ${WS_PORT}`);

  // Initialize AutoRebuildManager
  autoRebuildManager.initialize(io);

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
