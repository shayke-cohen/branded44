/**
 * Direct Mobile App WebSocket Manager
 * 
 * Handles real-time communication for the new Direct Mobile App Loading system:
 * - Screen hot-reload events
 * - New screen injection
 * - Navigation updates
 * - Session management
 * 
 * This is much simpler than complex bundling - just real-time screen updates!
 */
class DirectMobileAppWebSocketManager {
  constructor(io) {
    this.io = io;
    this.connectedClients = new Map(); // Track connected clients by session
    this.screenListeners = new Map(); // Track screen-specific listeners
    this.setupWebSocketHandlers();
    
    console.log('📡 [DirectMobileAppWS] WebSocket manager initialized for direct mobile app loading');
  }

  setupWebSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 [DirectMobileAppWS] Client connected: ${socket.id}`);
      
      // Handle session joining
      socket.on('join-direct-mobile-app-session', (data) => {
        this.handleSessionJoin(socket, data);
      });
      
      // Handle screen watching
      socket.on('watch-screen', (data) => {
        this.handleScreenWatch(socket, data);
      });
      
      // Handle screen hot-reload requests
      socket.on('request-screen-reload', (data) => {
        this.handleScreenReloadRequest(socket, data);
      });
      
      // Handle disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  /**
   * Handle client joining a direct mobile app session
   */
  handleSessionJoin(socket, { sessionId, clientType }) {
    try {
      console.log(`🔗 [DirectMobileAppWS] Client ${socket.id} joining session: ${sessionId} (${clientType || 'unknown'})`);
      
      // Add client to session room
      socket.join(`direct-mobile-app-${sessionId}`);
      
      // Track the connection
      this.connectedClients.set(socket.id, {
        sessionId,
        clientType: clientType || 'mobile-app',
        joinedAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      });
      
      // Send welcome message
      socket.emit('direct-mobile-app-session-joined', {
        sessionId,
        message: 'Connected to direct mobile app session',
        features: [
          'screen-hot-reload',
          'screen-injection',
          'navigation-updates',
          'real-time-sync'
        ],
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ [DirectMobileAppWS] Client ${socket.id} joined session ${sessionId}`);
      
    } catch (error) {
      console.error(`❌ [DirectMobileAppWS] Error handling session join:`, error);
      socket.emit('error', {
        type: 'session-join-error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Handle client requesting to watch specific screen
   */
  handleScreenWatch(socket, { sessionId, screenId }) {
    try {
      console.log(`👀 [DirectMobileAppWS] Client ${socket.id} watching screen: ${screenId} (session: ${sessionId})`);
      
      // Add to screen-specific room
      socket.join(`screen-${sessionId}-${screenId}`);
      
      // Track screen listener
      const listenerKey = `${socket.id}-${screenId}`;
      this.screenListeners.set(listenerKey, {
        socketId: socket.id,
        sessionId,
        screenId,
        startedAt: new Date().toISOString()
      });
      
      socket.emit('screen-watch-started', {
        sessionId,
        screenId,
        message: `Now watching ${screenId} for updates`,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error(`❌ [DirectMobileAppWS] Error handling screen watch:`, error);
      socket.emit('error', {
        type: 'screen-watch-error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Handle screen reload request from client
   */
  handleScreenReloadRequest(socket, { sessionId, screenId }) {
    try {
      console.log(`🔄 [DirectMobileAppWS] Client ${socket.id} requesting screen reload: ${screenId}`);
      
      // Broadcast to all clients in the session (except sender)
      socket.to(`direct-mobile-app-${sessionId}`).emit('screen-reload-requested', {
        sessionId,
        screenId,
        requestedBy: socket.id,
        timestamp: new Date().toISOString()
      });
      
      // Acknowledge to sender
      socket.emit('screen-reload-request-sent', {
        sessionId,
        screenId,
        message: 'Reload request broadcast to session',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error(`❌ [DirectMobileAppWS] Error handling screen reload request:`, error);
    }
  }

  /**
   * Handle client disconnect
   */
  handleDisconnect(socket) {
    try {
      console.log(`🔌 [DirectMobileAppWS] Client disconnected: ${socket.id}`);
      
      // Remove from tracking
      const clientInfo = this.connectedClients.get(socket.id);
      if (clientInfo) {
        console.log(`👋 [DirectMobileAppWS] Client was in session: ${clientInfo.sessionId} (${clientInfo.clientType})`);
      }
      
      this.connectedClients.delete(socket.id);
      
      // Remove screen listeners
      for (const [key, listener] of this.screenListeners.entries()) {
        if (listener.socketId === socket.id) {
          this.screenListeners.delete(key);
        }
      }
      
    } catch (error) {
      console.error(`❌ [DirectMobileAppWS] Error handling disconnect:`, error);
    }
  }

  // ========== PUBLIC API METHODS ==========

  /**
   * Trigger screen hot-reload for all clients in session
   */
  triggerScreenHotReload(sessionId, screenId, screenData = {}) {
    try {
      console.log(`🔥 [DirectMobileAppWS] Broadcasting screen hot-reload: ${screenId} (session: ${sessionId})`);
      
      const hotReloadEvent = {
        type: 'screen-hot-reload',
        sessionId,
        screenId,
        screenData,
        timestamp: new Date().toISOString(),
        source: 'server'
      };
      
      // Broadcast to all clients in session
      this.io.to(`direct-mobile-app-${sessionId}`).emit('screen-hot-reload', hotReloadEvent);
      
      // Also broadcast to screen-specific watchers
      this.io.to(`screen-${sessionId}-${screenId}`).emit('screen-updated', {
        ...hotReloadEvent,
        type: 'screen-updated'
      });
      
      console.log(`📡 [DirectMobileAppWS] Screen hot-reload event broadcast: ${screenId}`);
      
    } catch (error) {
      console.error(`❌ [DirectMobileAppWS] Error triggering screen hot-reload:`, error);
    }
  }

  /**
   * Inject new screen to all clients in session
   */
  injectNewScreen(sessionId, screenDefinition) {
    try {
      console.log(`➕ [DirectMobileAppWS] Broadcasting screen injection: ${screenDefinition.id} (session: ${sessionId})`);
      
      const injectionEvent = {
        type: 'screen-injection',
        sessionId,
        screenDefinition,
        timestamp: new Date().toISOString(),
        source: 'server'
      };
      
      this.io.to(`direct-mobile-app-${sessionId}`).emit('screen-injection', injectionEvent);
      
      console.log(`📡 [DirectMobileAppWS] Screen injection event broadcast: ${screenDefinition.id}`);
      
    } catch (error) {
      console.error(`❌ [DirectMobileAppWS] Error injecting new screen:`, error);
    }
  }

  /**
   * Update navigation for all clients in session
   */
  updateNavigation(sessionId, navigationConfig) {
    try {
      console.log(`🧭 [DirectMobileAppWS] Broadcasting navigation update (session: ${sessionId})`);
      
      const navigationEvent = {
        type: 'navigation-update',
        sessionId,
        navigationConfig,
        timestamp: new Date().toISOString(),
        source: 'server'
      };
      
      this.io.to(`direct-mobile-app-${sessionId}`).emit('navigation-update', navigationEvent);
      
      console.log(`📡 [DirectMobileAppWS] Navigation update event broadcast`);
      
    } catch (error) {
      console.error(`❌ [DirectMobileAppWS] Error updating navigation:`, error);
    }
  }

  /**
   * Broadcast session message to all clients
   */
  broadcastSessionMessage(sessionId, message, type = 'info') {
    try {
      const messageEvent = {
        type: 'session-message',
        messageType: type,
        message,
        sessionId,
        timestamp: new Date().toISOString(),
        source: 'server'
      };
      
      this.io.to(`direct-mobile-app-${sessionId}`).emit('session-message', messageEvent);
      
      console.log(`📢 [DirectMobileAppWS] Session message broadcast: ${message}`);
      
    } catch (error) {
      console.error(`❌ [DirectMobileAppWS] Error broadcasting session message:`, error);
    }
  }

  // ========== MONITORING & STATS ==========

  /**
   * Get connection stats
   */
  getStats() {
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    
    const activeConnections = Array.from(this.connectedClients.values())
      .filter(client => new Date(client.lastActivity).getTime() > fiveMinutesAgo);
    
    const sessionGroups = {};
    for (const client of this.connectedClients.values()) {
      if (!sessionGroups[client.sessionId]) {
        sessionGroups[client.sessionId] = 0;
      }
      sessionGroups[client.sessionId]++;
    }
    
    return {
      totalConnections: this.connectedClients.size,
      activeConnections: activeConnections.length,
      screenListeners: this.screenListeners.size,
      sessionGroups,
      features: [
        'direct-mobile-app-loading',
        'screen-hot-reload',
        'screen-injection',
        'navigation-updates',
        'real-time-sync'
      ]
    };
  }

  /**
   * List connected clients for session
   */
  getSessionClients(sessionId) {
    return Array.from(this.connectedClients.values())
      .filter(client => client.sessionId === sessionId);
  }

  /**
   * Clean up resources
   */
  cleanup() {
    console.log('🧹 [DirectMobileAppWS] Cleaning up WebSocket manager...');
    this.connectedClients.clear();
    this.screenListeners.clear();
  }
}

module.exports = DirectMobileAppWebSocketManager;
