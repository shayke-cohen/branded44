import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { componentRegistry, ComponentRegistry } from './ComponentRegistry';

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
  // Server comparison data (to prevent bundle reload loops)
  serverTimestamp?: number;
  serverBundleHash?: string;
}

interface SessionBundleConfig {
  serverUrl: string;
  sessionId: string | null;
  enableAutoReload: boolean;
  enabled: boolean;
  platform: string;
  executeBundle?: boolean; // Whether to execute downloaded bundles
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
      enabled: false,
      platform: Platform.OS,
      executeBundle: true, // Default to executing bundles
      ...config
    };
    
    // Set up component registry event listeners
    this.setupComponentRegistryListeners();
  }

  /**
   * Set up component registry event listeners
   */
  private setupComponentRegistryListeners(): void {
    componentRegistry.on('bundle-executed', (data) => {
      console.log(`✅ [SessionBundleLoader] Bundle executed successfully: ${data.sessionId}`);
      this.emit('bundle-executed', data);
    });

    componentRegistry.on('bundle-execution-error', (data) => {
      console.error(`❌ [SessionBundleLoader] Bundle execution failed: ${data.error}`);
      this.emit('bundle-execution-error', data);
    });

    componentRegistry.on('components-updated', (data) => {
      console.log(`🔄 [SessionBundleLoader] Components updated: ${data.componentsCount} components`);
      this.emit('components-updated', data);
    });

    componentRegistry.on('session-cleared', () => {
      console.log(`🧹 [SessionBundleLoader] Session components cleared`);
      this.emit('session-cleared');
    });
  }

  /**
   * Initialize the bundle loader with HTTP polling
   */
  async initialize(): Promise<void> {
    console.log('📱 [SessionBundleLoader] Initializing session bundle loader (HTTP-only)...');
    console.log(`📱 [SessionBundleLoader] Server: ${this.config.serverUrl}`);
    console.log(`📱 [SessionBundleLoader] Platform: ${this.config.platform}`);
    console.log(`📱 [SessionBundleLoader] Execute bundles: ${this.config.executeBundle}`);
    
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
    await this.saveSessionId(sessionId);
    
    // Restart polling with new session
    this.stopPolling();
    if (this.config.enableAutoReload) {
      this.startPolling();
    }
    
    // Check for bundles immediately
    await this.checkForBundles();
  }

  /**
   * Set auto-reload enabled state and save to storage
   */
  async setAutoReload(enabled: boolean): Promise<void> {
    console.log(`📱 [SessionBundleLoader] Setting auto-reload: ${enabled}`);
    
    this.config.enableAutoReload = enabled;
    await this.saveAutoReloadSetting(enabled);
    
    // Start or stop polling based on enabled state
    if (enabled && this.config.sessionId && this.config.enabled) {
      this.startPolling();
    } else if (!enabled) {
      this.stopPolling();
    }
  }

  /**
   * Set main enabled state and save to storage
   */
  async setEnabled(enabled: boolean): Promise<void> {
    console.log(`📱 [SessionBundleLoader] Setting enabled: ${enabled}`);
    
    this.config.enabled = enabled;
    await this.saveEnabledSetting(enabled);
    
    // Start or stop polling based on enabled state
    if (enabled && this.config.enableAutoReload && this.config.sessionId) {
      this.startPolling();
    } else if (!enabled) {
      this.stopPolling();
    }
  }

  /**
   * Start HTTP polling for bundle updates
   */
  private startPolling(): void {
    if (!this.config.sessionId) {
      console.log('📱 [SessionBundleLoader] No session ID set, skipping polling');
      return;
    }

    if (this.pollingInterval) {
      console.log('📱 [SessionBundleLoader] Polling already started');
      return;
    }

    console.log('📱 [SessionBundleLoader] Starting HTTP polling for bundle updates...');
    this.pollingEnabled = true;
    this.emit('connected'); // Simulate connection for UI
    
    // Poll every 5 seconds
    this.pollingInterval = setInterval(() => {
      if (this.pollingEnabled) {
        this.checkForBundles();
      }
    }, 5000);
    
    // Check immediately
    this.checkForBundles();
  }

  /**
   * Stop HTTP polling
   */
  private stopPolling(): void {
    if (this.pollingInterval) {
      console.log('📱 [SessionBundleLoader] Stopping HTTP polling');
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.pollingEnabled = false;
    this.emit('disconnected');
  }

  /**
   * Check for new bundles via HTTP
   */
  private async checkForBundles(): Promise<void> {
    if (!this.config.sessionId) {
      return;
    }

    try {
      const response = await fetch(
        `${this.config.serverUrl}/api/sessions/${this.config.sessionId}/bundle?platform=${this.config.platform}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // Session not found, stop polling
          console.log('📱 [SessionBundleLoader] Session not found, stopping polling');
          this.stopPolling();
          this.emit('bundle-error', { error: 'Session not found' });
        }
        return;
      }

      const data = await response.json();
      
      if (data.success && data.bundle) {
        const bundleInfo = data.bundle;
        
        // Check if this is a new bundle (compare with server data, not local enhanced data)
        const shouldLoadBundle = !this.currentBundle || 
            bundleInfo.timestamp > (this.currentBundle.serverTimestamp || this.currentBundle.timestamp) ||
            bundleInfo.bundleHash !== (this.currentBundle.serverBundleHash || this.currentBundle.bundleHash);
            
        if (shouldLoadBundle) {
          console.log('📦 [SessionBundleLoader] New bundle detected:', bundleInfo);
          this.handleBundleAvailable(bundleInfo);
          
          // Auto-load if enabled
          if (this.config.enableAutoReload) {
            await this.loadBundle(bundleInfo);
          }
        } else {
          // Bundle is the same, no need to reload
          console.log('📦 [SessionBundleLoader] Bundle is up to date, no reload needed');
        }
      }
    } catch (error) {
      console.error('❌ [SessionBundleLoader] Error checking for bundles:', error);
      // Don't emit error for network issues - mobile apps lose connection frequently
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
   * Manually check for bundle updates
   */
  async checkForUpdates(): Promise<void> {
    console.log(`📱 [SessionBundleLoader] Manually checking for updates...`);
    await this.checkForBundles();
  }

  /**
   * Load bundle from server
   */
  async loadBundle(bundleInfo: BundleInfo): Promise<void> {
    const startTime = Date.now();
    console.log(`📥 [SessionBundleLoader] Starting bundle download for session: ${bundleInfo.sessionId}`);
    console.log(`📱 [SessionBundleLoader] Platform: ${bundleInfo.platform}, Size: ${bundleInfo.bundleSize || 'unknown'} bytes`);
    console.log(`📱 [SessionBundleLoader] Bundle URL: ${bundleInfo.bundleUrl}`);
    
    try {
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
      
      console.log(`⬇️ [SessionBundleLoader] Downloading bundle for ${bundleInfo.platform} from: ${fullUrl}`);
      const response = await fetch(fullUrl);
      
      if (!response.ok) {
        console.error(`❌ [SessionBundleLoader] Download failed: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to download bundle: ${response.status} ${response.statusText}`);
      }
      
      console.log(`📦 [SessionBundleLoader] Bundle downloaded successfully, parsing content...`);
      const bundleCode = await response.text();
      const downloadTime = Date.now() - startTime;
      const fileSize = new Blob([bundleCode]).size;
      
      console.log(`📄 [SessionBundleLoader] Bundle stats: ${fileSize} bytes in ${downloadTime}ms`);
      
      // Enhanced bundle info with download metadata (preserve server data for comparison)
      const enhancedBundleInfo: BundleInfo = {
        ...bundleInfo,
        downloadedAt: Date.now(),
        fileSize,
        serverTimestamp: bundleInfo.timestamp, // Preserve server timestamp for comparison
        serverBundleHash: bundleInfo.bundleHash, // Preserve server hash for comparison
        bundleHash: this.generateSimpleHash(bundleCode), // Local hash for verification
        version: this.extractVersionFromBundle(bundleCode),
      };
      
      // Update current bundle with enhanced info
      this.currentBundle = enhancedBundleInfo;
      console.log(`💾 [SessionBundleLoader] Saving bundle info to local storage...`);
      await this.saveBundleInfo(enhancedBundleInfo);
      console.log(`📚 [SessionBundleLoader] Adding bundle to history...`);
      await this.addToHistory(enhancedBundleInfo);
      
      console.log(`📦 [SessionBundleLoader] Downloaded ${bundleInfo.platform} bundle:`);
      console.log(`   📏 Size: ${fileSize} bytes (${Math.round(fileSize / 1024)}KB)`);
      console.log(`   ⏱️ Download time: ${downloadTime}ms`);
      console.log(`   🔢 Hash: ${enhancedBundleInfo.bundleHash}`);
      console.log(`   🏷️ Version: ${enhancedBundleInfo.version || 'unknown'}`);
      
      // Execute bundle if enabled
      if (this.config.executeBundle) {
        try {
          console.log(`🚀 [SessionBundleLoader] Starting bundle execution for session: ${bundleInfo.sessionId}`);
          console.log(`🔧 [SessionBundleLoader] Bundle platform: ${bundleInfo.platform}, Device: ${Platform.OS}`);
          const execStartTime = Date.now();
          await componentRegistry.loadSessionBundle(bundleCode, bundleInfo.sessionId);
          const execTime = Date.now() - execStartTime;
          console.log(`✅ [SessionBundleLoader] Bundle executed successfully in ${execTime}ms`);
          console.log(`🎯 [SessionBundleLoader] Components now available for rendering`);
        } catch (executionError) {
          console.error(`❌ [SessionBundleLoader] Bundle execution failed:`, executionError);
          console.error(`📍 [SessionBundleLoader] Error details: ${executionError instanceof Error ? executionError.message : String(executionError)}`);
          // Don't throw here - we still want to emit the bundle-loaded event
          const errorMessage = executionError instanceof Error ? executionError.message : 'Bundle execution failed';
          this.emit('bundle-execution-error', { 
            bundleInfo: enhancedBundleInfo, 
            error: errorMessage 
          });
        }
      } else {
        console.log(`⏸️ [SessionBundleLoader] Bundle execution disabled - only downloading`);
      }
      
      // Emit the bundle loaded event with enhanced info
      const totalTime = Date.now() - startTime;
      this.emit('bundle-loaded', { 
        bundleInfo: enhancedBundleInfo, 
        bundleCode,
        downloadStats: {
          fileSize,
          downloadTime,
          platform: bundleInfo.platform,
          totalTime
        }
      });
      
      console.log(`🎉 [SessionBundleLoader] Bundle load completed in ${totalTime}ms total`);
      console.log(`📊 [SessionBundleLoader] Summary: Download(${downloadTime}ms) + Processing + Execution`);
      console.log(`✅ [SessionBundleLoader] ${bundleInfo.platform} bundle loaded successfully`);
      
    } catch (error) {
      const errorTime = Date.now() - startTime;
      console.error(`❌ [SessionBundleLoader] Bundle load failed after ${errorTime}ms:`, error);
      console.error(`📍 [SessionBundleLoader] Session: ${bundleInfo.sessionId}, Platform: ${bundleInfo.platform}`);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load bundle';
      this.emit('bundle-load-error', { bundleInfo, error: errorMessage });
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
   * Get current auto-reload setting
   */
  getAutoReload(): boolean {
    return this.config.enableAutoReload;
  }

  /**
   * Get current enabled setting
   */
  getEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Get all current settings
   */
  getSettings(): {
    sessionId: string | null;
    serverUrl: string;
    platform: string;
    enableAutoReload: boolean;
    enabled: boolean;
  } {
    return {
      sessionId: this.config.sessionId,
      serverUrl: this.config.serverUrl,
      platform: this.config.platform,
      enableAutoReload: this.config.enableAutoReload,
      enabled: this.config.enabled
    };
  }

  /**
   * Set server URL and save to storage
   */
  async setServerUrl(serverUrl: string): Promise<void> {
    console.log(`📱 [SessionBundleLoader] Setting server URL: ${serverUrl}`);
    this.config.serverUrl = serverUrl;
    await this.saveServerUrl(serverUrl);
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
   * Load session info and settings from storage
   */
  async loadSessionInfo(): Promise<void> {
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

      // Load settings
      const autoReloadSetting = await AsyncStorage.getItem('session_bundle_auto_reload');
      if (autoReloadSetting !== null) {
        this.config.enableAutoReload = JSON.parse(autoReloadSetting);
        console.log(`📱 [SessionBundleLoader] Loaded auto-reload setting: ${this.config.enableAutoReload}`);
      }

      const enabledSetting = await AsyncStorage.getItem('session_bundle_enabled');
      if (enabledSetting !== null) {
        this.config.enabled = JSON.parse(enabledSetting);
        console.log(`📱 [SessionBundleLoader] Loaded enabled setting: ${this.config.enabled}`);
      }

      const serverUrl = await AsyncStorage.getItem('session_bundle_server_url');
      if (serverUrl) {
        this.config.serverUrl = serverUrl;
        console.log(`📱 [SessionBundleLoader] Loaded server URL: ${serverUrl}`);
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
   * Save auto-reload setting to storage
   */
  private async saveAutoReloadSetting(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem('session_bundle_auto_reload', JSON.stringify(enabled));
      console.log(`💾 [SessionBundleLoader] Saved auto-reload setting: ${enabled}`);
    } catch (error) {
      console.error('❌ [SessionBundleLoader] Failed to save auto-reload setting:', error);
    }
  }

  /**
   * Save enabled setting to storage
   */
  private async saveEnabledSetting(enabled: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem('session_bundle_enabled', JSON.stringify(enabled));
      console.log(`💾 [SessionBundleLoader] Saved enabled setting: ${enabled}`);
    } catch (error) {
      console.error('❌ [SessionBundleLoader] Failed to save enabled setting:', error);
    }
  }

  /**
   * Save session ID to storage
   */
  private async saveSessionId(sessionId: string): Promise<void> {
    try {
      await AsyncStorage.setItem('session_bundle_session_id', sessionId);
      console.log(`💾 [SessionBundleLoader] Saved session ID: ${sessionId}`);
    } catch (error) {
      console.error('❌ [SessionBundleLoader] Failed to save session ID:', error);
    }
  }

  /**
   * Save server URL to storage
   */
  private async saveServerUrl(serverUrl: string): Promise<void> {
    try {
      await AsyncStorage.setItem('session_bundle_server_url', serverUrl);
      console.log(`💾 [SessionBundleLoader] Saved server URL: ${serverUrl}`);
    } catch (error) {
      console.error('❌ [SessionBundleLoader] Failed to save server URL:', error);
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
   * Add bundle to download history (prevents duplicates)
   */
  private async addToHistory(bundleInfo: BundleInfo): Promise<void> {
    try {
      const history = await this.getBundleHistory();
      
      // Check if this bundle already exists in history (compare server hash and timestamp)
      const serverHash = bundleInfo.serverBundleHash || bundleInfo.bundleHash;
      const serverTimestamp = bundleInfo.serverTimestamp || bundleInfo.timestamp;
      
      const exists = history.some(item => {
        const itemServerHash = item.serverBundleHash || item.bundleHash;
        const itemServerTimestamp = item.serverTimestamp || item.timestamp;
        return itemServerHash === serverHash && 
               itemServerTimestamp === serverTimestamp &&
               item.sessionId === bundleInfo.sessionId &&
               item.platform === bundleInfo.platform;
      });
      
      if (!exists) {
        // Add new bundle to history (limit to 10 recent bundles)
        history.unshift(bundleInfo);
        const limitedHistory = history.slice(0, 10);
        
        await AsyncStorage.setItem('session_bundle_history', JSON.stringify(limitedHistory));
        console.log(`💾 [SessionBundleLoader] Added bundle to history (${limitedHistory.length} total)`);
      } else {
        console.log(`📦 [SessionBundleLoader] Bundle already in history, skipping duplicate`);
      }
    } catch (error) {
      console.error('❌ [SessionBundleLoader] Failed to save bundle history:', error);
    }
  }

  /**
   * Enable or disable bundle execution
   */
  setExecuteBundle(execute: boolean): void {
    console.log(`📱 [SessionBundleLoader] Setting execute bundle: ${execute}`);
    this.config.executeBundle = execute;
  }

  /**
   * Get current bundle execution setting
   */
  getExecuteBundle(): boolean {
    return this.config.executeBundle || false;
  }

  /**
   * Get the component registry instance
   */
  getComponentRegistry(): ComponentRegistry {
    return componentRegistry;
  }

  /**
   * Clear all session components from the registry
   */
  clearSessionComponents(): void {
    console.log(`📱 [SessionBundleLoader] Clearing session components`);
    componentRegistry.clearSessionComponents();
  }

  /**
   * Get registry statistics
   */
  getRegistryStats() {
    return componentRegistry.getStats();
  }

  /**
   * List all available components
   */
  listComponents() {
    return componentRegistry.listComponents();
  }

  /**
   * Force reload and execute current bundle
   */
  async forceReloadAndExecute(): Promise<void> {
    if (!this.currentBundle) {
      throw new Error('No current bundle to reload');
    }

    console.log(`🔄 [SessionBundleLoader] Force reloading and executing bundle: ${this.currentBundle.sessionId}`);
    
    // Clear existing session components first
    this.clearSessionComponents();
    
    // Reload the bundle
    await this.loadBundle(this.currentBundle);
  }

  /**
   * Clean up resources
   */
  async destroy(): Promise<void> {
    this.stopPolling();
    this.listeners.clear();
    
    // Clear session components
    this.clearSessionComponents();
    
    // Remove component registry listeners
    componentRegistry.removeAllListeners();
    
    console.log('📱 [SessionBundleLoader] Session bundle loader destroyed');
  }
}

// Singleton instance for app-wide use
export const sessionBundleLoader = new SessionBundleLoader();
