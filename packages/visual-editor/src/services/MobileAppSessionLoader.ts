/**
 * Mobile App Session Loader
 * 
 * This is the NEW architecture that replaces DynamicScreenLoader.
 * It loads the full mobile app session (like packages/web does) and enables:
 * 1. Full mobile app loading with providers
 * 2. Screen hot-reload capability
 * 3. Dynamic screen injection
 * 4. Live navigation updates
 */

import React from 'react';
import { BundleExecutor } from './bundleExecutor';

export interface SessionInfo {
  sessionId: string;
  workspacePath: string;
  sessionPath: string;
}

export interface ScreenDefinition {
  id: string;
  name: string;
  path: string;
  component: React.ComponentType<any>;
  route?: string;
  navigationOptions?: any;
}

export interface NavigationConfig {
  screens: Record<string, ScreenDefinition>;
  initialRoute?: string;
  tabBar?: any;
}

export interface MobileAppSession {
  app: React.ComponentType<any>;
  navigation: NavigationConfig;
  screens: Map<string, ScreenDefinition>;
  version: string;
}

/**
 * Session-based mobile app loader that provides:
 * - Full mobile app loading (like web package)
 * - Screen hot-reload
 * - Dynamic screen injection
 * - Live navigation updates
 */
export class MobileAppSessionLoader {
  private sessionInfo: SessionInfo | null = null;
  private currentSession: MobileAppSession | null = null;
  private serverUrl = 'http://localhost:3001';
  private bundleExecutor = new BundleExecutor();
  
  // Hot-reload listeners
  private screenUpdateListeners = new Map<string, (screen: ScreenDefinition) => void>();
  private navigationUpdateListeners: Array<(nav: NavigationConfig) => void> = [];
  private screenInjectionListeners: Array<(screen: ScreenDefinition) => void> = [];
  
  constructor(sessionInfo?: SessionInfo) {
    this.sessionInfo = sessionInfo || null;
  }

  /**
   * PHASE 1: Load Full Mobile App Session
   * Similar to how packages/web loads the mobile app
   */
  async loadMobileAppSession(): Promise<MobileAppSession> {
    if (!this.sessionInfo) {
      throw new Error('Session info required for mobile app loading');
    }

    console.log('📱 [MobileAppSessionLoader] Loading full mobile app session...');
    
    try {
      // 1. Load the main App component bundle
      const app = await this.loadAppBundle();
      
      // 2. Load navigation configuration 
      const navigation = await this.loadNavigationConfig();
      
      // 3. Load all available screens
      const screens = await this.loadAvailableScreens();
      
      // 4. Create the mobile app session
      this.currentSession = {
        app,
        navigation,
        screens,
        version: this.generateVersion()
      };
      
      console.log('✅ [MobileAppSessionLoader] Mobile app session loaded successfully');
      console.log(`📊 [MobileAppSessionLoader] Session contains ${screens.size} screens`);
      
      return this.currentSession;
      
    } catch (error) {
      console.error('❌ [MobileAppSessionLoader] Failed to load mobile app session:', error);
      throw error;
    }
  }

  /**
   * PHASE 2: Screen Hot-Reload
   * Replace individual screen without full app reload
   */
  async hotReloadScreen(screenId: string): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active mobile app session for hot reload');
    }
    
    console.log(`🔥 [MobileAppSessionLoader] Hot-reloading screen: ${screenId}`);
    
    try {
      // Fetch updated screen definition from server
      const updatedScreen = await this.fetchScreenDefinition(screenId);
      
      // Update the session's screen map
      this.currentSession.screens.set(screenId, updatedScreen);
      
      // Notify listeners for live update
      const listener = this.screenUpdateListeners.get(screenId);
      if (listener) {
        listener(updatedScreen);
      }
      
      console.log(`✅ [MobileAppSessionLoader] Hot-reloaded screen: ${screenId}`);
      
    } catch (error) {
      console.error(`❌ [MobileAppSessionLoader] Failed to hot-reload screen ${screenId}:`, error);
      throw error;
    }
  }

  /**
   * PHASE 3: Dynamic Screen Injection
   * Add new screen to running app
   */
  async injectNewScreen(screenDefinition: ScreenDefinition): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active mobile app session for screen injection');
    }
    
    console.log(`➕ [MobileAppSessionLoader] Injecting new screen: ${screenDefinition.id}`);
    
    try {
      // Add to session screens
      this.currentSession.screens.set(screenDefinition.id, screenDefinition);
      
      // Update navigation configuration
      this.currentSession.navigation.screens[screenDefinition.id] = screenDefinition;
      
      // Notify injection listeners
      this.screenInjectionListeners.forEach(listener => {
        listener(screenDefinition);
      });
      
      console.log(`✅ [MobileAppSessionLoader] Injected new screen: ${screenDefinition.id}`);
      
    } catch (error) {
      console.error(`❌ [MobileAppSessionLoader] Failed to inject screen ${screenDefinition.id}:`, error);
      throw error;
    }
  }

  /**
   * PHASE 4: Live Navigation Updates
   * Update App.tsx navigation structure
   */
  async updateNavigation(navigationConfig: Partial<NavigationConfig>): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active mobile app session for navigation update');
    }
    
    console.log('🧭 [MobileAppSessionLoader] Updating navigation configuration...');
    
    try {
      // Merge with current navigation
      this.currentSession.navigation = {
        ...this.currentSession.navigation,
        ...navigationConfig
      };
      
      // Notify navigation listeners
      this.navigationUpdateListeners.forEach(listener => {
        listener(this.currentSession!.navigation);
      });
      
      console.log('✅ [MobileAppSessionLoader] Navigation configuration updated');
      
    } catch (error) {
      console.error('❌ [MobileAppSessionLoader] Failed to update navigation:', error);
      throw error;
    }
  }

  // ========== PRIVATE METHODS ==========

  private async loadAppBundle(): Promise<React.ComponentType<any>> {
    const bundleUrl = `${this.serverUrl}/api/editor/session/${this.sessionInfo!.sessionId}/app-bundle`;
    
    const response = await fetch(bundleUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch app bundle: ${response.status}`);
    }
    
    const bundleCode = await response.text();
    
    // Execute bundle to get App component (similar to existing BundleExecutor)
    return this.executeBundleCode(bundleCode);
  }

  private async loadNavigationConfig(): Promise<NavigationConfig> {
    const navUrl = `${this.serverUrl}/api/editor/session/${this.sessionInfo!.sessionId}/navigation`;
    
    const response = await fetch(navUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch navigation config: ${response.status}`);
    }
    
    return response.json();
  }

  private async loadAvailableScreens(): Promise<Map<string, ScreenDefinition>> {
    const screensUrl = `${this.serverUrl}/api/editor/session/${this.sessionInfo!.sessionId}/screens`;
    
    const response = await fetch(screensUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch screens: ${response.status}`);
    }
    
    const screensData = await response.json();
    const screens = new Map<string, ScreenDefinition>();
    
    // Load each screen component
    for (const screenMeta of screensData.screens) {
      const screenDef = await this.fetchScreenDefinition(screenMeta.id);
      screens.set(screenMeta.id, screenDef);
    }
    
    return screens;
  }

  private async fetchScreenDefinition(screenId: string): Promise<ScreenDefinition> {
    const screenUrl = `${this.serverUrl}/api/editor/session/${this.sessionInfo!.sessionId}/screen/${screenId}`;
    
    const response = await fetch(screenUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch screen ${screenId}: ${response.status}`);
    }
    
    const screenData = await response.json();
    
    // Transform server screen data to ScreenDefinition with component
    const component = await this.evaluateScreenComponent(screenData.code.component);
    
    return {
      id: screenId,
      name: screenData.name || screenId,
      path: screenData.path || `/${screenId}`,
      component,
      route: screenData.route,
      navigationOptions: screenData.navigationOptions
    };
  }

  private async executeBundleCode(bundleCode: string): Promise<React.ComponentType<any>> {
    // Use the existing BundleExecutor to execute the bundle code
    return await this.bundleExecutor.executeBundleCode(bundleCode, this.sessionInfo!.sessionId);
  }

  private async evaluateScreenComponent(componentCode: string): Promise<React.ComponentType<any>> {
    // For now, use the bundle executor to evaluate screen components
    // In the future, this could be optimized for individual screen evaluation
    // but the bundle executor provides a robust foundation
    return await this.bundleExecutor.executeBundleCode(componentCode, this.sessionInfo!.sessionId);
  }

  private generateVersion(): string {
    return `session-${this.sessionInfo!.sessionId}-${Date.now()}`;
  }

  // ========== EVENT LISTENERS ==========

  onScreenUpdate(screenId: string, listener: (screen: ScreenDefinition) => void): void {
    this.screenUpdateListeners.set(screenId, listener);
  }

  onNavigationUpdate(listener: (nav: NavigationConfig) => void): void {
    this.navigationUpdateListeners.push(listener);
  }

  onScreenInjection(listener: (screen: ScreenDefinition) => void): void {
    this.screenInjectionListeners.push(listener);
  }

  // ========== GETTERS ==========

  getCurrentSession(): MobileAppSession | null {
    return this.currentSession;
  }

  isSessionLoaded(): boolean {
    return this.currentSession !== null;
  }
}
