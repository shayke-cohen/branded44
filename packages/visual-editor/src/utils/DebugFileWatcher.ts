/**
 * Debug utility to monitor file watching events
 */

export class DebugFileWatcher {
  private static instance: DebugFileWatcher;
  
  static getInstance(): DebugFileWatcher {
    if (!DebugFileWatcher.instance) {
      DebugFileWatcher.instance = new DebugFileWatcher();
    }
    return DebugFileWatcher.instance;
  }

  constructor() {
    this.setupDebugListeners();
  }

  private setupDebugListeners(): void {
    if (typeof window === 'undefined') return;

    // Listen for all file change events
    window.addEventListener('file-change', (event: CustomEvent) => {
      console.log('🐛 [DEBUG] file-change event:', event.detail);
    });

    // Listen for app reload events
    window.addEventListener('fileWatcher:appReload', (event: CustomEvent) => {
      console.log('🐛 [DEBUG] fileWatcher:appReload event:', event.detail);
    });

    // Listen for session ready events
    window.addEventListener('visual-editor-session-ready', (event: CustomEvent) => {
      console.log('🐛 [DEBUG] visual-editor-session-ready event:', event.detail);
    });

    // Listen for cache clear events
    window.addEventListener('session:clear-cache', (event: CustomEvent) => {
      console.log('🐛 [DEBUG] session:clear-cache event:', event.detail);
    });

    console.log('🐛 [DEBUG] File watcher debug listeners setup');
  }

  // Test function to manually trigger events
  testFileChange(filePath = 'test/file.tsx'): void {
    console.log('🐛 [DEBUG] Manually triggering file change for:', filePath);
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('file-change', {
        detail: {
          filePath,
          type: 'change',
          timestamp: Date.now()
        }
      }));
    }
  }

  testAppReload(): void {
    console.log('🐛 [DEBUG] Manually triggering app reload');
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fileWatcher:appReload', {
        detail: {
          filePath: 'test/manual-reload.tsx',
          timestamp: Date.now(),
          triggeredBy: 'debug-test'
        }
      }));
    }
  }
}

// Create instance and expose globally for debugging
export const debugFileWatcher = DebugFileWatcher.getInstance();

if (typeof window !== 'undefined') {
  (window as any).__DEBUG_FILE_WATCHER__ = debugFileWatcher;
}
