/**
 * Session WebSocket Manager
 * 
 * Handles real-time communication between visual editor and server for:
 * - Screen hot-reload events
 * - New screen injection events  
 * - Navigation update events
 * - File change notifications
 */

import { MobileAppSessionLoader, ScreenDefinition, NavigationConfig } from './MobileAppSessionLoader';

export interface WebSocketMessage {
  type: 'screen_update' | 'screen_injection' | 'navigation_update' | 'file_change';
  payload: any;
  sessionId: string;
  timestamp: number;
}

export interface ScreenUpdatePayload {
  screenId: string;
  changeType: 'modified' | 'created' | 'deleted';
  screenData?: any;
}

export interface NavigationUpdatePayload {
  changeType: 'route_added' | 'route_modified' | 'route_deleted' | 'config_updated';
  navigationConfig?: Partial<NavigationConfig>;
  affectedRoutes?: string[];
}

export interface FileChangePayload {
  filePath: string;
  changeType: 'modified' | 'created' | 'deleted';
  affectedScreens?: string[];
}

/**
 * Manages real-time WebSocket communication for mobile app session updates
 */
export class SessionWebSocketManager {
  private socket: WebSocket | null = null;
  private sessionLoader: MobileAppSessionLoader;
  private sessionId: string;
  private serverUrl: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;

  constructor(sessionLoader: MobileAppSessionLoader, sessionId: string, serverUrl = 'ws://localhost:3001') {
    this.sessionLoader = sessionLoader;
    this.sessionId = sessionId;
    this.serverUrl = serverUrl;
  }

  /**
   * Connect to WebSocket server for real-time updates
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${this.serverUrl}/session/${this.sessionId}/ws`;
        console.log('🔌 [SessionWebSocketManager] Connecting to:', wsUrl);
        
        this.socket = new WebSocket(wsUrl);
        
        this.socket.onopen = () => {
          console.log('✅ [SessionWebSocketManager] Connected to session WebSocket');
          this.reconnectAttempts = 0;
          resolve();
        };
        
        this.socket.onmessage = (event) => {
          this.handleMessage(event);
        };
        
        this.socket.onclose = (event) => {
          console.log('🔌 [SessionWebSocketManager] WebSocket closed:', event.reason);
          this.handleReconnect();
        };
        
        this.socket.onerror = (error) => {
          console.error('❌ [SessionWebSocketManager] WebSocket error:', error);
          if (this.reconnectAttempts === 0) {
            reject(error);
          }
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 [SessionWebSocketManager] Disconnecting...');
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      console.log(`📨 [SessionWebSocketManager] Received ${message.type}:`, message.payload);
      
      switch (message.type) {
        case 'screen_update':
          this.handleScreenUpdate(message.payload as ScreenUpdatePayload);
          break;
          
        case 'screen_injection':
          this.handleScreenInjection(message.payload as ScreenDefinition);
          break;
          
        case 'navigation_update':
          this.handleNavigationUpdate(message.payload as NavigationUpdatePayload);
          break;
          
        case 'file_change':
          this.handleFileChange(message.payload as FileChangePayload);
          break;
          
        default:
          console.warn('⚠️ [SessionWebSocketManager] Unknown message type:', message.type);
      }
      
    } catch (error) {
      console.error('❌ [SessionWebSocketManager] Error handling message:', error);
    }
  }

  /**
   * Handle screen update events (hot-reload)
   */
  private async handleScreenUpdate(payload: ScreenUpdatePayload): Promise<void> {
    const { screenId, changeType } = payload;
    
    console.log(`🔥 [SessionWebSocketManager] Screen ${changeType}: ${screenId}`);
    
    try {
      switch (changeType) {
        case 'modified':
          await this.sessionLoader.hotReloadScreen(screenId);
          break;
          
        case 'created':
          // This will be handled by screen_injection message
          break;
          
        case 'deleted':
          // TODO: Handle screen deletion
          console.log(`🗑️ [SessionWebSocketManager] Screen deleted: ${screenId}`);
          break;
      }
    } catch (error) {
      console.error(`❌ [SessionWebSocketManager] Failed to handle screen update for ${screenId}:`, error);
    }
  }

  /**
   * Handle new screen injection events
   */
  private async handleScreenInjection(screenDefinition: ScreenDefinition): Promise<void> {
    console.log(`➕ [SessionWebSocketManager] Injecting new screen: ${screenDefinition.id}`);
    
    try {
      await this.sessionLoader.injectNewScreen(screenDefinition);
    } catch (error) {
      console.error(`❌ [SessionWebSocketManager] Failed to inject screen ${screenDefinition.id}:`, error);
    }
  }

  /**
   * Handle navigation update events (App.tsx changes)
   */
  private async handleNavigationUpdate(payload: NavigationUpdatePayload): Promise<void> {
    const { changeType, navigationConfig } = payload;
    
    console.log(`🧭 [SessionWebSocketManager] Navigation ${changeType}`);
    
    try {
      if (navigationConfig) {
        await this.sessionLoader.updateNavigation(navigationConfig);
      }
    } catch (error) {
      console.error('❌ [SessionWebSocketManager] Failed to handle navigation update:', error);
    }
  }

  /**
   * Handle general file change events
   */
  private async handleFileChange(payload: FileChangePayload): Promise<void> {
    const { filePath, changeType, affectedScreens } = payload;
    
    console.log(`📁 [SessionWebSocketManager] File ${changeType}: ${filePath}`);
    
    // If the file change affects specific screens, hot-reload them
    if (affectedScreens && affectedScreens.length > 0) {
      for (const screenId of affectedScreens) {
        try {
          await this.sessionLoader.hotReloadScreen(screenId);
        } catch (error) {
          console.error(`❌ [SessionWebSocketManager] Failed to hot-reload affected screen ${screenId}:`, error);
        }
      }
    }
  }

  /**
   * Handle WebSocket reconnection
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ [SessionWebSocketManager] Max reconnection attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    console.log(`🔄 [SessionWebSocketManager] Reconnecting (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('❌ [SessionWebSocketManager] Reconnection failed:', error);
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  /**
   * Send message to server (for future use)
   */
  private sendMessage(message: WebSocketMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ [SessionWebSocketManager] Cannot send message - WebSocket not connected');
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}
