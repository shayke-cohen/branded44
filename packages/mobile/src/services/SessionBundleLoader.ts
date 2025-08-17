import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface BundleInfo {
  sessionId: string;
  platform: string;
  bundleUrl: string;
  bundleSize?: number;
  timestamp: number;
  // Enhanced metadata
  downloadedAt?: number;
  fileSize?: number;
  bundleHash?: string;
  version?: string;
  workspacePath?: string;
}

interface SessionBundleConfig {
  serverUrl: string;
  sessionId: string | null;
  enableAutoReload: boolean;
  platform: string;
}

/**
 * Service for loading and managing session bundles from the visual editor
 * This allows the mobile app to receive hot updates from visual editor sessions
 */
export class SessionBundleLoader {
  private config: SessionBundleConfig;
  private currentBundle: BundleInfo | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private pollingInterval: NodeJS.Timeout | null = null;
  private pollingEnabled: boolean = false;

  constructor(config: Partial<SessionBundleConfig> = {}) {
    this.config = {
      serverUrl: 'http://localhost:3001',
      sessionId: null,
      enableAutoReload: true,
      platform: Platform.OS,
      ...config
    };
  }

  /**
   * Initialize the bundle loader with HTTP polling
   */
  async initialize(): Promise<void> {
    console.log('📱 [SessionBundleLoader] Initializing session bundle loader (HTTP-only)...');
    
    try {
      // Load saved session info
      await this.loadSessionInfo();
      
      // Start polling if auto-reload is enabled
      if (this.config.enableAutoReload && this.config.sessionId) {
        this.startPolling();
      }
      
      console.log('✅ [SessionBundleLoader] Session bundle loader initialized');
      
    } catch (error) {
      console.error('❌ [SessionBundleLoader] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Set the active session ID to receive bundles from
   */
  async setSessionId(sessionId: string): Promise<void> {
    console.log(`📱 [SessionBundleLoader] Setting session ID: ${sessionId}`);
    
    this.config.sessionId = sessionId;
    await AsyncStorage.setItem('session_bundle_session_id', sessionId);
    
    // Restart polling with new session
    this.stopPolling();
    if (this.config.enableAutoReload) {
      this.startPolling();
    }
    
    // Check for bundles immediately
    await this.checkForBundles();
  }

  /**
   * Connect to server WebSocket for real-time bundle updates
   */
  private async connectToServer(): Promise<void> {
    if (!this.config.sessionId) {
      console.log('📱 [SessionBundleLoader] No session ID set, skipping server connection');
      return;
    }

    if (this.connectionState === 'connecting' || this.connectionState === 'connected') {
      console.log('📱 [SessionBundleLoader] Connection already in progress or established');
      return;
    }

    try {
      this.connectionState = 'connecting';
      // Use dedicated mobile WebSocket port (3002) instead of Socket.IO
      const wsUrl = this.config.serverUrl.replace('http', 'ws').replace('3001', '3002');
      console.log(`📱 [SessionBundleLoader] Connecting to mobile WebSocket server: ${wsUrl} (attempt ${this.reconnectAttempts + 1})`);
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('✅ [SessionBundleLoader] Connected to server');
        this.connectionState = 'connected';
        this.reconnectAttempts = 0; // Reset on successful connection
        this.emit('connected');
        
        // Request current bundle after a small delay to ensure connection is stable
        setTimeout(() => {
          this.requestSessionBundle();
        }, 100);
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleServerMessage(data);
        } catch (error) {
          console.error('❌ [SessionBundleLoader] Failed to parse server message:', error);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('❌ [SessionBundleLoader] WebSocket error:', error);
        this.connectionState = 'error';
        this.emit('error', error);
      };
      
      this.ws.onclose = (event) => {
        console.log(`📱 [SessionBundleLoader] Disconnected from server (code: ${event.code}, reason: ${event.reason})`);
        this.connectionState = 'disconnected';
        this.ws = null;
        this.emit('disconnected');
        
        // Attempt to reconnect with exponential backoff
        if (this.config.enableAutoReload && this.reconnectAttempts < this.maxReconnectAttempts) {
          const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
          this.reconnectAttempts++;
          
          console.log(`📱 [SessionBundleLoader] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          
          setTimeout(() => {
            this.connectToServer();
          }, delay);
        } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('❌ [SessionBundleLoader] Max reconnection attempts reached');
          this.emit('max-reconnect-attempts');
        }
      };
      
    } catch (error) {
      console.error('❌ [SessionBundleLoader] Failed to connect to server:', error);
      this.connectionState = 'error';
      throw error;
    }
  }

  /**
   * Handle messages from the server
   */
  private handleServerMessage(data: any): void {
    switch (data.type) {
      case 'mobile-bundle-ready':
        this.handleBundleReady(data);
        break;
        
      case 'mobile-bundle-building':
        this.handleBundleBuilding(data);
        break;
        
      case 'mobile-bundle-available':
        this.handleBundleAvailable(data);
        break;
        
      case 'mobile-bundle-error':
        this.handleBundleError(data);
        break;
        
      default:
        console.log(`📱 [SessionBundleLoader] Unknown message type: ${data.type}`);
    }
  }

  /**
   * Handle bundle ready event
   */
  private async handleBundleReady(data: BundleInfo): Promise<void> {
    if (data.sessionId !== this.config.sessionId || data.platform !== this.config.platform) {
      return; // Not for this session/platform
    }
    
    console.log(`📦 [SessionBundleLoader] Bundle ready for session: ${data.sessionId}`);
    
    this.currentBundle = data;
    await this.saveBundleInfo(data);
    
    this.emit('bundle-ready', data);
    
    // Auto-load bundle if enabled
    if (this.config.enableAutoReload) {
      await this.loadBundle(data);
    }
  }

  /**
   * Handle bundle building event
   */
  private handleBundleBuilding(data: any): void {
    console.log(`🔨 [SessionBundleLoader] Bundle building for session: ${data.sessionId}`);
    this.emit('bundle-building', data);
  }

  /**
   * Handle bundle available event
   */
  private async handleBundleAvailable(data: BundleInfo): Promise<void> {
    console.log(`📦 [SessionBundleLoader] Bundle available for session: ${data.sessionId}`);
    
    this.currentBundle = data;
    await this.saveBundleInfo(data);
    
    this.emit('bundle-available', data);
  }

  /**
   * Handle bundle error event
   */
  private handleBundleError(data: any): void {
    console.error(`❌ [SessionBundleLoader] Bundle error:`, data.error);
    this.emit('bundle-error', data);
  }

  /**
   * Request session bundle from server
   */
  private requestSessionBundle(): void {
    if (!this.ws || !this.config.sessionId) {
      console.log('📱 [SessionBundleLoader] Cannot request bundle: no WebSocket or session ID');
      return;
    }

    if (this.connectionState !== 'connected' || this.ws.readyState !== WebSocket.OPEN) {
      console.log(`📱 [SessionBundleLoader] Cannot request bundle: WebSocket not ready (state: ${this.connectionState}, readyState: ${this.ws.readyState})`);
      return;
    }
    
    try {
      console.log(`📱 [SessionBundleLoader] Requesting bundle for session: ${this.config.sessionId}`);
      
      this.ws.send(JSON.stringify({
        type: 'request-mobile-bundle',
        sessionId: this.config.sessionId,
        platform: this.config.platform
      }));
    } catch (error) {
      console.error('❌ [SessionBundleLoader] Failed to send bundle request:', error);
      this.emit('error', { error: `Failed to request bundle: ${error.message}` });
    }
  }

  /**
   * Load bundle from server
   */
  async loadBundle(bundleInfo: BundleInfo): Promise<void> {
    try {
      console.log(`📱 [SessionBundleLoader] Loading ${bundleInfo.platform} bundle from: ${bundleInfo.bundleUrl}`);
      console.log(`📱 [SessionBundleLoader] Platform filter: ${this.config.platform} (device: ${Platform.OS})`);
      
      // Verify platform matches before downloading
      if (bundleInfo.platform !== this.config.platform) {
        console.log(`⚠️ [SessionBundleLoader] Skipping bundle for platform ${bundleInfo.platform}, current platform is ${this.config.platform}`);
        return;
      }
      
      this.emit('bundle-loading', bundleInfo);
      
      // Download bundle
      const fullUrl = `${this.config.serverUrl}${bundleInfo.bundleUrl}`;
      const startTime = Date.now();
      
      console.log(`🔄 [SessionBundleLoader] Downloading bundle for ${bundleInfo.platform}...`);
      const response = await fetch(fullUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to download bundle: ${response.status} ${response.statusText}`);
      }
      
      const bundleCode = await response.text();
      const downloadTime = Date.now() - startTime;
      const fileSize = new Blob([bundleCode]).size;
      
      // Enhanced bundle info with download metadata
      const enhancedBundleInfo: BundleInfo = {
        ...bundleInfo,
        downloadedAt: Date.now(),
        fileSize,
        bundleHash: this.generateSimpleHash(bundleCode),
        version: this.extractVersionFromBundle(bundleCode),
      };
      
      // Update current bundle with enhanced info
      this.currentBundle = enhancedBundleInfo;
      await this.saveBundleInfo(enhancedBundleInfo);
      await this.addToHistory(enhancedBundleInfo);
      
      console.log(`📦 [SessionBundleLoader] Downloaded ${bundleInfo.platform} bundle:`);
      console.log(`   📏 Size: ${fileSize} bytes (${Math.round(fileSize / 1024)}KB)`);
      console.log(`   ⏱️ Download time: ${downloadTime}ms`);
      console.log(`   🔢 Hash: ${enhancedBundleInfo.bundleHash}`);
      console.log(`   🏷️ Version: ${enhancedBundleInfo.version || 'unknown'}`);
      
      // For React Native, we would typically save the bundle and reload
      // In a production app, you'd use tools like CodePush or implement custom bundle loading
      
      // For now, we'll emit the bundle loaded event with enhanced info
      this.emit('bundle-loaded', { 
        bundleInfo: enhancedBundleInfo, 
        bundleCode,
        downloadStats: {
          fileSize,
          downloadTime,
          platform: bundleInfo.platform
        }
      });
      
      console.log(`✅ [SessionBundleLoader] ${bundleInfo.platform} bundle loaded successfully`);
      
    } catch (error) {
      console.error(`❌ [SessionBundleLoader] Failed to load ${bundleInfo.platform} bundle:`, error);
      this.emit('bundle-load-error', { bundleInfo, error: error.message });
      throw error;
    }
  }

  /**
   * Manually trigger bundle reload
   */
  async reloadBundle(): Promise<void> {
    if (!this.currentBundle) {
      console.log('📱 [SessionBundleLoader] No bundle to reload');
      return;
    }
    
    await this.loadBundle(this.currentBundle);
  }

  /**
   * Get current bundle info
   */
  getCurrentBundle(): BundleInfo | null {
    return this.currentBundle;
  }

  /**
   * Enable or disable auto reload
   */
  setAutoReload(enabled: boolean): void {
    this.config.enableAutoReload = enabled;
    console.log(`📱 [SessionBundleLoader] Auto reload ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Event listener management
   */
  on(event: string, listener: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off(event: string, listener: Function): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  /**
   * Load session info from storage
   */
  private async loadSessionInfo(): Promise<void> {
    try {
      const sessionId = await AsyncStorage.getItem('session_bundle_session_id');
      if (sessionId) {
        this.config.sessionId = sessionId;
        console.log(`📱 [SessionBundleLoader] Loaded session ID from storage: ${sessionId}`);
      }
      
      const bundleInfo = await AsyncStorage.getItem('session_bundle_info');
      if (bundleInfo) {
        this.currentBundle = JSON.parse(bundleInfo);
        console.log(`📱 [SessionBundleLoader] Loaded bundle info from storage`);
      }
      
    } catch (error) {
      console.error('❌ [SessionBundleLoader] Failed to load session info:', error);
    }
  }

  /**
   * Save bundle info to storage
   */
  private async saveBundleInfo(bundleInfo: BundleInfo): Promise<void> {
    try {
      await AsyncStorage.setItem('session_bundle_info', JSON.stringify(bundleInfo));
    } catch (error) {
      console.error('❌ [SessionBundleLoader] Failed to save bundle info:', error);
    }
  }

  /**
   * Disconnect from server
   */
  private async disconnectFromServer(): Promise<void> {
    if (this.ws) {
      console.log('📱 [SessionBundleLoader] Manually disconnecting from server');
      this.connectionState = 'disconnected';
      this.ws.close(1000, 'Manual disconnect'); // Normal closure
      this.ws = null;
    }
  }

  /**
   * Generate a simple hash for bundle content
   */
  private generateSimpleHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 8);
  }

  /**
   * Extract version information from bundle code
   */
  private extractVersionFromBundle(bundleCode: string): string | undefined {
    try {
      // Look for common version patterns in bundle
      const versionPatterns = [
        /version["']?\s*[:=]\s*["']([^"']+)["']/i,
        /@version\s+([^\s\n]+)/i,
        /v(\d+\.\d+\.\d+)/i
      ];
      
      for (const pattern of versionPatterns) {
        const match = bundleCode.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
      
      // If no version found, generate one based on timestamp
      return `session-${Date.now()}`;
    } catch {
      return undefined;
    }
  }

  /**
   * Get bundle download history
   */
  async getBundleHistory(): Promise<BundleInfo[]> {
    try {
      const historyData = await AsyncStorage.getItem('session_bundle_history');
      return historyData ? JSON.parse(historyData) : [];
    } catch (error) {
      console.error('❌ [SessionBundleLoader] Failed to load bundle history:', error);
      return [];
    }
  }

  /**
   * Add bundle to download history
   */
  private async addToHistory(bundleInfo: BundleInfo): Promise<void> {
    try {
      const history = await this.getBundleHistory();
      
      // Add new bundle to history (limit to 10 recent bundles)
      history.unshift(bundleInfo);
      const limitedHistory = history.slice(0, 10);
      
      await AsyncStorage.setItem('session_bundle_history', JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('❌ [SessionBundleLoader] Failed to save bundle history:', error);
    }
  }

  /**
   * Clean up resources
   */
  async destroy(): Promise<void> {
    await this.disconnectFromServer();
    this.listeners.clear();
    console.log('📱 [SessionBundleLoader] Session bundle loader destroyed');
  }
}

// Singleton instance for app-wide use
export const sessionBundleLoader = new SessionBundleLoader();
