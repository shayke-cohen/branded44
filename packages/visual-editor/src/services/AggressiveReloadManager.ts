/**
 * Aggressive Reload Manager
 * Provides configurable aggressive reloading where ANY file change triggers full app reload
 */

interface AggressiveReloadConfig {
  enabled: boolean;
  debounceMs: number;
  excludePatterns: string[];
  includePatterns: string[];
  logVerbose: boolean;
}

export class AggressiveReloadManager {
  private config: AggressiveReloadConfig;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingReloads = new Set<string>();

  constructor(config: Partial<AggressiveReloadConfig> = {}) {
    this.config = {
      enabled: true,
      debounceMs: 300, // Wait 300ms for multiple file changes
      excludePatterns: [
        '.git/',
        'node_modules/',
        '.DS_Store',
        '*.log',
        '*.tmp'
      ],
      includePatterns: [
        '*.ts',
        '*.tsx', 
        '*.js',
        '*.jsx',
        '*.json',
        '*.css',
        '*.scss'
      ],
      logVerbose: true,
      ...config
    };

    this.setupEventListeners();
  }

  /**
   * Enable or disable aggressive reload
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    console.log(`🔥 [AggressiveReload] ${enabled ? 'Enabled' : 'Disabled'} aggressive reload`);
  }

  /**
   * Check if aggressive reload is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AggressiveReloadConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔥 [AggressiveReload] Configuration updated:', this.config);
  }

  /**
   * Setup event listeners for file changes
   */
  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('file-change', this.handleFileChange.bind(this) as EventListener);
    console.log('🔥 [AggressiveReload] Event listeners setup complete');
  }

  /**
   * Handle file change events
   */
  private handleFileChange(event: CustomEvent): void {
    if (!this.config.enabled) return;

    const { filePath } = event.detail;
    
    // Check if file should be excluded
    if (this.shouldExcludeFile(filePath)) {
      if (this.config.logVerbose) {
        console.log(`🔥 [AggressiveReload] Excluding file: ${filePath}`);
      }
      return;
    }

    // Check if file should be included
    if (!this.shouldIncludeFile(filePath)) {
      if (this.config.logVerbose) {
        console.log(`🔥 [AggressiveReload] Not including file: ${filePath}`);
      }
      return;
    }

    if (this.config.logVerbose) {
      console.log(`🔥 [AggressiveReload] Processing file change: ${filePath}`);
    }

    // Add to pending reloads
    this.pendingReloads.add(filePath);

    // Debounce the reload to handle multiple rapid changes
    this.debounceReload();
  }

  /**
   * Check if file should be excluded from triggering reload
   */
  private shouldExcludeFile(filePath: string): boolean {
    return this.config.excludePatterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(filePath);
      }
      return filePath.includes(pattern);
    });
  }

  /**
   * Check if file should be included for triggering reload
   */
  private shouldIncludeFile(filePath: string): boolean {
    if (this.config.includePatterns.length === 0) return true;
    
    return this.config.includePatterns.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(filePath);
      }
      return filePath.endsWith(pattern.replace('*', ''));
    });
  }

  /**
   * Debounce reload to handle rapid file changes
   */
  private debounceReload(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.executeAggressiveReload();
    }, this.config.debounceMs);
  }

  /**
   * Execute the aggressive reload
   */
  private executeAggressiveReload(): void {
    const changedFiles = Array.from(this.pendingReloads);
    this.pendingReloads.clear();

    console.log(`🔥 [AggressiveReload] Executing aggressive app reload for ${changedFiles.length} files:`, changedFiles);

    if (typeof window !== 'undefined') {
      // Dispatch the app reload event
      window.dispatchEvent(new CustomEvent('fileWatcher:appReload', {
        detail: {
          filePaths: changedFiles,
          timestamp: Date.now(),
          triggeredBy: 'aggressive-reload-manager',
          changeCount: changedFiles.length
        }
      }));

      // Also clear any existing module caches
      if ((window as any).__VISUAL_EDITOR_SESSION__) {
        window.dispatchEvent(new CustomEvent('session:clear-cache', {
          detail: { timestamp: Date.now() }
        }));
      }
    }
  }

  /**
   * Manually trigger aggressive reload
   */
  triggerReload(reason = 'manual-trigger'): void {
    console.log(`🔥 [AggressiveReload] Manual reload triggered: ${reason}`);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fileWatcher:appReload', {
        detail: {
          timestamp: Date.now(),
          triggeredBy: reason,
          manual: true
        }
      }));
    }
  }

  /**
   * Get current statistics
   */
  getStats(): {
    enabled: boolean;
    pendingReloads: number;
    config: AggressiveReloadConfig;
  } {
    return {
      enabled: this.config.enabled,
      pendingReloads: this.pendingReloads.size,
      config: { ...this.config }
    };
  }
}

// Create singleton instance
export const aggressiveReloadManager = new AggressiveReloadManager();

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).__AGGRESSIVE_RELOAD_MANAGER__ = aggressiveReloadManager;
}

export default aggressiveReloadManager;
