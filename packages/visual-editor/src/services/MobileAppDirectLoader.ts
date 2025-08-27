/**
 * Mobile App Direct Loader
 * 
 * NEW APPROACH: Load the real mobile app as baseline (like packages/web)
 * and hot-swap individual screen files from session when they change.
 * 
 * This avoids complex bundling and provides:
 * - Real mobile app with all providers
 * - Real context and navigation
 * - Hot-swap individual screens only
 * - Much simpler and more efficient
 */

import React from 'react';

export interface SessionInfo {
  sessionId: string;
  workspacePath: string;
  sessionPath: string;
}

export interface ScreenOverride {
  screenId: string;
  component: React.ComponentType<any>;
  path: string;
  lastModified: number;
}

export interface MobileAppDirectSession {
  // Real mobile app (imported directly)
  MobileApp: React.ComponentType<any>;
  
  // Screen overrides from session
  screenOverrides: Map<string, ScreenOverride>;
  
  // Session metadata
  sessionId: string;
  version: string;
  lastUpdate: number;
}

/**
 * Direct mobile app loader that:
 * 1. Imports the real mobile app (like packages/web)
 * 2. Hot-swaps individual screens from session files
 * 3. No bundling, no complex evaluation
 */
export class MobileAppDirectLoader {
  private sessionInfo: SessionInfo | null = null;
  private currentSession: MobileAppDirectSession | null = null;
  private serverUrl = 'http://localhost:3001';
  private webSocketUrl = 'http://localhost:3001';
  
  // Hot-swap listeners
  private screenSwapListeners = new Map<string, (screen: ScreenOverride) => void>();
  private appUpdateListeners: Array<(session: MobileAppDirectSession) => void> = [];
  
  constructor(sessionInfo?: SessionInfo) {
    this.sessionInfo = sessionInfo || null;
  }

  /**
   * Load the real mobile app with session screen overrides
   */
  async loadMobileAppWithOverrides(): Promise<MobileAppDirectSession> {
    if (!this.sessionInfo) {
      throw new Error('Session info required for mobile app loading');
    }

    console.log('📱 [MobileAppDirectLoader] Loading real mobile app with session overrides...');
    
    try {
      // 1. Import the REAL mobile app (like packages/web does)
      const realMobileApp = await this.importRealMobileApp();
      
      // 2. Load session screen overrides
      const screenOverrides = await this.loadSessionScreenOverrides();
      
      // 3. Create the direct session
      this.currentSession = {
        MobileApp: realMobileApp,
        screenOverrides,
        sessionId: this.sessionInfo.sessionId,
        version: this.generateVersion(),
        lastUpdate: Date.now()
      };
      
      console.log('✅ [MobileAppDirectLoader] Real mobile app loaded successfully!');
      console.log(`📊 [MobileAppDirectLoader] ${screenOverrides.size} screen overrides loaded`);
      
      return this.currentSession;
      
    } catch (error) {
      console.error('❌ [MobileAppDirectLoader] Failed to load mobile app:', error);
      throw error;
    }
  }

  /**
   * Hot-swap a single screen from session
   */
  async hotSwapScreen(screenId: string): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active mobile app session for hot-swap');
    }
    
    console.log(`🔥 [MobileAppDirectLoader] Hot-swapping screen: ${screenId}`);
    
    try {
      // Fetch and evaluate the updated screen from session
      const updatedScreen = await this.loadSessionScreen(screenId);
      
      // Update the screen override
      this.currentSession.screenOverrides.set(screenId, updatedScreen);
      this.currentSession.lastUpdate = Date.now();
      
      // Notify listeners for live update
      const listener = this.screenSwapListeners.get(screenId);
      if (listener) {
        listener(updatedScreen);
      }
      
      // Notify app update listeners
      this.appUpdateListeners.forEach(listener => {
        listener(this.currentSession!);
      });
      
      console.log(`✅ [MobileAppDirectLoader] Hot-swapped screen: ${screenId}`);
      
    } catch (error) {
      console.error(`❌ [MobileAppDirectLoader] Failed to hot-swap screen ${screenId}:`, error);
      throw error;
    }
  }

  /**
   * Add new screen override from session
   */
  async addScreenOverride(screenId: string): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active mobile app session for screen override');
    }
    
    console.log(`➕ [MobileAppDirectLoader] Adding screen override: ${screenId}`);
    
    try {
      const newScreen = await this.loadSessionScreen(screenId);
      
      // Add to session overrides
      this.currentSession.screenOverrides.set(screenId, newScreen);
      this.currentSession.lastUpdate = Date.now();
      
      // Notify app update listeners
      this.appUpdateListeners.forEach(listener => {
        listener(this.currentSession!);
      });
      
      console.log(`✅ [MobileAppDirectLoader] Added screen override: ${screenId}`);
      
    } catch (error) {
      console.error(`❌ [MobileAppDirectLoader] Failed to add screen override ${screenId}:`, error);
      throw error;
    }
  }

  /**
   * Remove screen override (fallback to original)
   */
  removeScreenOverride(screenId: string): void {
    if (!this.currentSession) {
      return;
    }
    
    console.log(`🗑️ [MobileAppDirectLoader] Removing screen override: ${screenId}`);
    
    this.currentSession.screenOverrides.delete(screenId);
    this.currentSession.lastUpdate = Date.now();
    
    // Notify app update listeners
    this.appUpdateListeners.forEach(listener => {
      listener(this.currentSession!);
    });
  }

  // ========== PRIVATE METHODS ==========

  /**
   * Import the REAL mobile app (like packages/web does)
   */
  private async importRealMobileApp(): Promise<React.ComponentType<any>> {
    console.log('📱 [MobileAppDirectLoader] Importing real mobile app...');
    
    try {
      // Import the actual mobile app component
      // This is similar to how packages/web imports from packages/mobile
      const MobileAppModule = await import('../../../mobile/src/App');
      
      // Return the default export (the App component)
      return MobileAppModule.default || MobileAppModule.App;
      
    } catch (error) {
      console.error('❌ [MobileAppDirectLoader] Failed to import real mobile app:', error);
      
      // Fallback: create a simple app component
      return this.createFallbackApp();
    }
  }

  /**
   * Load all session screen overrides
   */
  private async loadSessionScreenOverrides(): Promise<Map<string, ScreenOverride>> {
    const screenOverrides = new Map<string, ScreenOverride>();
    
    try {
      // Get list of session screens from server
      const response = await fetch(`${this.serverUrl}/api/editor/session/${this.sessionInfo!.sessionId}/direct-screens`);
      
      if (!response.ok) {
        console.warn('⚠️ [MobileAppDirectLoader] No session screens found, using baseline app');
        return screenOverrides;
      }
      
      const screensData = await response.json();
      
      // Load each session screen
      for (const screenMeta of screensData.screens) {
        try {
          const screenOverride = await this.loadSessionScreen(screenMeta.id);
          screenOverrides.set(screenMeta.id, screenOverride);
          console.log(`✅ [MobileAppDirectLoader] Loaded session screen: ${screenMeta.id}`);
        } catch (error) {
          console.warn(`⚠️ [MobileAppDirectLoader] Failed to load session screen ${screenMeta.id}:`, error);
        }
      }
      
    } catch (error) {
      console.warn('⚠️ [MobileAppDirectLoader] Failed to load session screens, using baseline app only:', error);
    }
    
    return screenOverrides;
  }

  /**
   * Load and evaluate a single session screen
   */
  private async loadSessionScreen(screenId: string): Promise<ScreenOverride> {
    const response = await fetch(`${this.serverUrl}/api/editor/session/${this.sessionInfo!.sessionId}/direct-screen/${screenId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch session screen ${screenId}: ${response.status}`);
    }
    
    const screenData = await response.json();
    
    // Evaluate the screen component code
    const component = await this.evaluateScreenComponent(screenData.code.component, screenId);
    
    return {
      screenId,
      component,
      path: screenData.path || `/${screenId}`,
      lastModified: Date.now()
    };
  }

  /**
   * Evaluate screen component code (much simpler than bundle evaluation)
   */
  private async evaluateScreenComponent(componentCode: string, screenId: string): Promise<React.ComponentType<any>> {
    console.log(`🔧 [MobileAppDirectLoader] Evaluating session screen: ${screenId}`);
    
    try {
      // Create evaluation context with React and React Native Web
      const React = require('react');
      const RNWeb = require('react-native-web');
      
      // Simple evaluation context (no complex bundling needed)
      const evaluationContext = {
        React,
        // React hooks
        useState: React.useState,
        useEffect: React.useEffect,
        useCallback: React.useCallback,
        useMemo: React.useMemo,
        useRef: React.useRef,
        useContext: React.useContext,
        
        // React Native Web components
        View: RNWeb.View,
        Text: RNWeb.Text,
        ScrollView: RNWeb.ScrollView,
        TouchableOpacity: RNWeb.TouchableOpacity,
        StyleSheet: RNWeb.StyleSheet,
        Dimensions: RNWeb.Dimensions,
        
        // Common utilities
        console: {
          log: (...args: any[]) => console.log(`[${screenId}]`, ...args),
          warn: (...args: any[]) => console.warn(`[${screenId}]`, ...args),
          error: (...args: any[]) => console.error(`[${screenId}]`, ...args),
        },
      };
      
      // Simple function evaluation (no complex module systems)
      const evaluator = new Function(
        ...Object.keys(evaluationContext),
        `
        "use strict";
        
        ${componentCode}
        
        // Return the component (assumes export default or const ComponentName)
        return typeof __exportedComponent !== 'undefined' ? __exportedComponent : 
               typeof ${screenId} !== 'undefined' ? ${screenId} : 
               null;
        `
      );
      
      const component = evaluator(...Object.values(evaluationContext));
      
      if (!component) {
        throw new Error(`No component exported from ${screenId}`);
      }
      
      console.log(`✅ [MobileAppDirectLoader] Screen component evaluated: ${screenId}`);
      return component;
      
    } catch (error) {
      console.error(`❌ [MobileAppDirectLoader] Failed to evaluate screen ${screenId}:`, error);
      
      // Return fallback component
      return this.createFallbackScreen(screenId, error instanceof Error ? error.message : 'Evaluation failed');
    }
  }

  /**
   * Create fallback app component
   */
  private createFallbackApp(): React.ComponentType<any> {
    const React = require('react');
    const RNWeb = require('react-native-web');
    
    return () => React.createElement(
      RNWeb.View,
      { style: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 } },
      React.createElement(RNWeb.Text, { style: { fontSize: 18, marginBottom: 10 } }, '📱 Mobile App'),
      React.createElement(RNWeb.Text, { style: { fontSize: 14, color: '#666', textAlign: 'center' } }, 
        'Real mobile app not available. Using fallback component.')
    );
  }

  /**
   * Create fallback screen component
   */
  private createFallbackScreen(screenId: string, errorMessage: string): React.ComponentType<any> {
    const React = require('react');
    const RNWeb = require('react-native-web');
    
    return () => React.createElement(
      RNWeb.View,
      { style: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 } },
      React.createElement(RNWeb.Text, { style: { fontSize: 18, marginBottom: 10 } }, `❌ ${screenId}`),
      React.createElement(RNWeb.Text, { style: { fontSize: 12, color: '#666', textAlign: 'center' } }, errorMessage)
    );
  }

  private generateVersion(): string {
    return `direct-${this.sessionInfo!.sessionId}-${Date.now()}`;
  }

  // ========== EVENT LISTENERS ==========

  onScreenSwap(screenId: string, listener: (screen: ScreenOverride) => void): void {
    this.screenSwapListeners.set(screenId, listener);
  }

  onAppUpdate(listener: (session: MobileAppDirectSession) => void): void {
    this.appUpdateListeners.push(listener);
  }

  // ========== GETTERS ==========

  getCurrentSession(): MobileAppDirectSession | null {
    return this.currentSession;
  }

  isSessionLoaded(): boolean {
    return this.currentSession !== null;
  }

  getScreenOverride(screenId: string): ScreenOverride | undefined {
    return this.currentSession?.screenOverrides.get(screenId);
  }

  getAllScreenOverrides(): ScreenOverride[] {
    return this.currentSession ? Array.from(this.currentSession.screenOverrides.values()) : [];
  }
}
