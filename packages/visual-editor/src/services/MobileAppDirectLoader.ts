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
  component: React.ComponentType<any> | null; // Nullable for direct refresh approach
  path: string;
  lastModified: number;
  isDirectRefresh?: boolean; // Flag for direct refresh markers
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
   * Hot-swap a single screen from session (Direct Mobile App approach)
   * Load the updated session screen code and override the original component
   */
  async hotSwapScreen(screenId: string): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active mobile app session for hot-swap');
    }
    
    console.log(`🔥 [MobileAppDirectLoader] SIMPLE Hot-reload: ${screenId}`);
    
    try {
      // SIMPLE: Just fetch, eval, and dispatch event
      const response = await fetch(`${this.serverUrl}/api/editor/session/${this.sessionInfo!.sessionId}/direct-screen/${screenId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch screen: ${response.status}`);
      }
      const screenData = await response.json();
      
      // Debug: Log the actual content being fetched
      console.log(`🔍 [MobileAppDirectLoader] Server returned content for ${screenId}:`);
      console.log(`🔍 [MobileAppDirectLoader] Content preview:`, screenData.code.component.substring(0, 200) + '...');
      
      // Look for user's text changes in the server content
      const serverTextMatches = screenData.code.component.match(/"[^"]*"/g) || [];
      console.log(`🔍 [MobileAppDirectLoader] Server text content:`, serverTextMatches.slice(0, 5));
      
      const component = await this.evaluateScreenComponent(screenData.code.component, screenId);
      
      // SIMPLE: Just dispatch event to mobile app (runs in same window, not iframe)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('screen-hot-reload', {
          detail: { screenId, component }
        }));
        console.log(`✅ [MobileAppDirectLoader] SIMPLE: Dispatched hot-reload event for ${screenId}`);
      } else {
        throw new Error('Window not available');
      }
      
    } catch (error) {
      console.error(`❌ [MobileAppDirectLoader] SIMPLE: Failed to hot-reload ${screenId}:`, error);
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
      // Load the screen from session files
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
   * Map session screen IDs to mobile app registry screen IDs
   * 
   * CRITICAL: This handles the mapping where:
   * - Session files use direct names (e.g., "HomeScreen")
   * - Mobile app registry uses navigation wrappers (e.g., "HomeNavigation")
   */
  private mapSessionScreenToRegistryScreen(sessionScreenId: string): string {
    const screenMapping: Record<string, string> = {
      // HomeScreen.tsx → HomeNavigation (which renders HomeScreen)
      'HomeScreen': 'home-screen', // Registry uses kebab-case for screen IDs
      'SettingsScreen': 'settings-screen',
      'ComponentsShowcaseScreen': 'component-library-screen',
      'DynamicTestScreen': 'dynamic-test-screen',
      'TemplateIndexScreen': 'template-index-screen',
      // Add more mappings as needed
    };
    
    const mappedId = screenMapping[sessionScreenId] || sessionScreenId.toLowerCase().replace(/screen$/, '-screen');
    console.log(`🗺️ [MobileAppDirectLoader] Screen mapping: ${sessionScreenId} → ${mappedId}`);
    return mappedId;
  }

  /**
   * Load session screen overrides using Session Change Detection API (ENHANCED APPROACH)
   */
  private async loadSessionScreenOverrides(): Promise<Map<string, ScreenOverride>> {
    const screenOverrides = new Map<string, ScreenOverride>();
    
    try {
      // NEW: Ask server what files have been changed in this session
      console.log('📋 [MobileAppDirectLoader] Asking server for changed files in session...');
      const changedResponse = await fetch(`${this.serverUrl}/api/editor/session/${this.sessionInfo!.sessionId}/changed-files`);
      
      if (!changedResponse.ok) {
        console.warn('⚠️ [MobileAppDirectLoader] Could not get changed files, falling back to all screens');
        return this.loadAllSessionScreens(); // Fallback to old approach
      }
      
      const changedData = await changedResponse.json();
      console.log(`📊 [MobileAppDirectLoader] Server reports ${changedData.changedFiles.length} changed files:`, 
                  changedData.changedFiles.map((f: any) => f.screenId));
      
      // Load ONLY the changed session screens (consistent with editor reload!)
      for (const changedFile of changedData.changedFiles) {
        try {
          const screenOverride = await this.loadSessionScreen(changedFile.screenId);
          
          // ENHANCED: Screen ID mapping for correct component registry override
          const registryScreenId = this.mapSessionScreenToRegistryScreen(changedFile.screenId);
          screenOverrides.set(registryScreenId, screenOverride);
          
          // 🎯 CRITICAL FIX: Register the screen override in mobile app's global registry!
          if (screenOverride.component && typeof window !== 'undefined' && (window as any).globalRegistry) {
            (window as any).globalRegistry.registerComponent(registryScreenId, screenOverride.component);
            console.log(`🔄 [MobileAppDirectLoader] Registered screen override in mobile registry: ${changedFile.screenId} → ${registryScreenId}`);
          } else {
            console.warn(`⚠️ [MobileAppDirectLoader] Cannot register screen override - mobile registry not available`);
          }
          
          console.log(`✅ [MobileAppDirectLoader] Loaded changed session screen: ${changedFile.screenId} → ${registryScreenId}`);
        } catch (error) {
          console.warn(`⚠️ [MobileAppDirectLoader] Failed to load changed screen ${changedFile.screenId}:`, error);
        }
      }
      
      console.log(`🎯 [MobileAppDirectLoader] Session Change Detection: Loaded ${screenOverrides.size} changed screens (editor reload consistency guaranteed!)`);
      
    } catch (error) {
      console.warn('⚠️ [MobileAppDirectLoader] Session change detection failed, using fallback:', error);
      return this.loadAllSessionScreens(); // Fallback to old approach
    }
    
    return screenOverrides;
  }

  /**
   * Fallback: Load all session screens (old approach)
   */
  private async loadAllSessionScreens(): Promise<Map<string, ScreenOverride>> {
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
   * Load and evaluate a single session screen from the server
   */
  private async loadSessionScreen(screenId: string): Promise<ScreenOverride> {
    console.log(`📥 [MobileAppDirectLoader] Loading session screen: ${screenId}`);
    
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
      lastModified: Date.now(),
      isDirectRefresh: false // This is the old approach
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
      
      // Dynamically import context hooks from mobile package at runtime
      let useTheme = null;
      let useMember = null; 
      let useCart = null;
      let HamburgerMenu = null;
      
      try {
        const ThemeContext = require('../../../mobile/src/context/ThemeContext');
        useTheme = ThemeContext.useTheme;
      } catch (e) {
        console.warn(`[${screenId}] Could not import useTheme:`, e.message);
        useTheme = () => ({ theme: {} }); // Fallback
      }
      
      try {
        const MemberContext = require('../../../mobile/src/context/MemberContext');
        useMember = MemberContext.useMember;
      } catch (e) {
        console.warn(`[${screenId}] Could not import useMember:`, e.message);
        useMember = () => ({ member: null }); // Fallback
      }
      
      try {
        const WixCartContext = require('../../../mobile/src/context/WixCartContext');
        useCart = WixCartContext.useCart;
      } catch (e) {
        console.warn(`[${screenId}] Could not import useCart:`, e.message);
        useCart = () => ({ cart: {} }); // Fallback
      }
      
      try {
        HamburgerMenu = require('../../../mobile/src/screens/HomeScreen/HamburgerMenu').default;
      } catch (e) {
        console.warn(`[${screenId}] Could not import HamburgerMenu:`, e.message);
        HamburgerMenu = () => null; // Fallback
      }
      
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
        
        // Context hooks from mobile package
        useTheme,
        useMember,
        useCart,
        
        // Screen components
        HamburgerMenu: HamburgerMenu, // Already has fallback assigned above
        
        // React Native Web components
        View: RNWeb.View,
        Text: RNWeb.Text,
        ScrollView: RNWeb.ScrollView,
        TouchableOpacity: RNWeb.TouchableOpacity,
        StyleSheet: RNWeb.StyleSheet,
        Dimensions: RNWeb.Dimensions,
        SafeAreaView: RNWeb.SafeAreaView,
        Animated: RNWeb.Animated,
        Platform: RNWeb.Platform,
        
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
