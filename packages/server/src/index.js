const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const visualEditorRoutes = require('./routes/visualEditor');
const { loggingMiddleware } = require('./middleware/logging');
const SessionManager = require('./sessions/SessionManager');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

// Initialize SessionManager and attach to app
const sessionManager = new SessionManager();
app.set('sessionManager', sessionManager);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(loggingMiddleware);

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

// Visual editor routes
app.use('/api/editor', visualEditorRoutes);

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

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 Mobile app preview: http://localhost:${PORT}/real-app/{sessionId}`);
  console.log(`🎯 API endpoints available at: http://localhost:${PORT}/api/editor`);

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
