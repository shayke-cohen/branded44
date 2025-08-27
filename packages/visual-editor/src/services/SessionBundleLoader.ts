import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { BundleCacheEntry } from './types';
import { BundleExecutor } from './bundleExecutor';

/**
 * SessionBundleLoader - Loads and executes complete JavaScript bundles from session workspace
 * Replaces the SessionWorkspaceLoader with a bundling-based approach
 */
export class SessionBundleLoader {
  private bundleCache = new Map<string, BundleCacheEntry>();
  private bundleExecutor = new BundleExecutor();

  /**
   * Load bundled React app from session workspace
   */
  async loadBundledApp(sessionId: string): Promise<React.ComponentType> {
    console.log(`📦 [SessionBundleLoader] Loading bundled app for session: ${sessionId}`);
    
    // Check cache first
    const cached = this.bundleCache.get(sessionId);
    if (cached) {
      console.log(`💾 [SessionBundleLoader] Using cached bundle for: ${sessionId}`);
      return cached.component;
    }

    try {
      // Fetch the bundle with cache busting
      const bundleUrl = `/api/editor/session/${sessionId}/bundle.js?v=${Date.now()}`;
      console.log(`📡 [SessionBundleLoader] Fetching bundle from: ${bundleUrl}`);
      
      const response = await fetch(bundleUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch bundle: ${response.status} ${response.statusText}`);
      }

      const bundleCode = await response.text();
      
      // Extract bundle stats from headers and log once
      const bundleSize = response.headers.get('X-Bundle-Size');
      const buildTime = response.headers.get('X-Bundle-Build-Time');
      const bundleAge = response.headers.get('X-Bundle-Age');
      
      const sizeKB = (bundleCode.length / 1024).toFixed(1);
      const stats = bundleSize ? `${bundleSize}B, ${buildTime}ms build, ${bundleAge}ms old` : `${sizeKB}KB`;
      console.log(`📦 [SessionBundleLoader] Bundle loaded (${stats})`);

      // Execute the bundle to get the App component
      const AppComponent = await this.bundleExecutor.executeBundleCode(bundleCode, sessionId);
      
      // Cache the result
      this.bundleCache.set(sessionId, {
        component: AppComponent,
        timestamp: Date.now()
      });

      console.log(`✅ [SessionBundleLoader] Bundle ready`);
      return AppComponent;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ [SessionBundleLoader] Failed to load bundle for ${sessionId}:`, error);
      throw new Error(errorMessage);
    }
  }

  /**
   * Clear cache for specific session
   */
  clearCache(sessionId: string): void {
    this.bundleCache.delete(sessionId);
    console.log(`🧹 [SessionBundleLoader] Cleared cache for session: ${sessionId}`);
  }

  /**
   * Clear all cached bundles
   */
  clearAllCache(): void {
    this.bundleCache.clear();
    console.log(`🧹 [SessionBundleLoader] Cleared all bundle cache`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { cachedSessions: number; totalMemory: number } {
    return {
      cachedSessions: this.bundleCache.size,
      totalMemory: 0, // Could estimate memory usage if needed
    };
  }
}

export default SessionBundleLoader;