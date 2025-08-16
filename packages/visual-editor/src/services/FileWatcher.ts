import { io, Socket } from 'socket.io-client';

export interface FileChangeEvent {
  type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';
  path: string;
  stats?: {
    size: number;
    mtime: Date;
    isDirectory: boolean;
  };
  content?: string;
}

export interface FileWatcherOptions {
  serverUrl?: string;
  watchPaths?: string[];
  ignored?: string[];
  enableHotReload?: boolean;
}

export class FileWatcher {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private isWatching: boolean = false;
  private options: FileWatcherOptions;
  private changeHandlers: Map<string, (event: FileChangeEvent) => void> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(options: FileWatcherOptions = {}) {
    this.options = {
      serverUrl: 'http://localhost:3001',
      watchPaths: [], // Server-side session handles file watching
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**'],
      enableHotReload: true,
      ...options
    };

    console.log('👁️ [FileWatcher] Initializing file watcher...', this.options);
  }

  /**
   * Connect to the server and start watching files
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('👁️ [FileWatcher] Already connected');
      return;
    }

    try {
      console.log(`👁️ [FileWatcher] Connecting to ${this.options.serverUrl}...`);
      
      this.socket = io(this.options.serverUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
      });

      // Setup socket event listeners
      this.setupSocketListeners();

      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.socket!.on('connect', () => {
          clearTimeout(timeout);
          resolve();
        });

        this.socket!.on('connect_error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      this.isConnected = true;
      console.log('✅ [FileWatcher] Connected to server');

      // Start watching files
      await this.startWatching();

    } catch (error) {
      console.error('❌ [FileWatcher] Failed to connect:', error);
      throw error;
    }
  }

  /**
   * Disconnect from the server
   */
  disconnect(): void {
    if (this.socket) {
      console.log('👁️ [FileWatcher] Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.isConnected = false;
    this.isWatching = false;
    console.log('👁️ [FileWatcher] Disconnected');
  }

  /**
   * Start watching files on the server
   */
  private async startWatching(): Promise<void> {
    if (!this.socket || this.isWatching) return;

    try {
      console.log('👁️ [FileWatcher] Starting file watching...', {
        paths: this.options.watchPaths,
        ignored: this.options.ignored
      });

      // Server-side session automatically handles file watching
      // No need to send watch request since workspace watcher is already active
      this.isWatching = true;
      console.log('✅ [FileWatcher] File watching started');

    } catch (error) {
      console.error('❌ [FileWatcher] Failed to start watching:', error);
      throw error;
    }
  }

  /**
   * Stop watching files
   */
  async stopWatching(): Promise<void> {
    if (!this.socket || !this.isWatching) return;

    try {
      console.log('👁️ [FileWatcher] Stopping file watching...');

      const response = await this.emitWithResponse('file:watch:stop', {});
      
      if (response.success) {
        this.isWatching = false;
        console.log('✅ [FileWatcher] File watching stopped');
      } else {
        console.warn('⚠️ [FileWatcher] Failed to stop watching:', response.error);
      }

    } catch (error) {
      console.error('❌ [FileWatcher] Error stopping watching:', error);
    }
  }

  /**
   * Setup socket event listeners
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔌 [FileWatcher] Socket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 [FileWatcher] Socket disconnected:', reason);
      this.isConnected = false;
      this.isWatching = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 [FileWatcher] Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('❌ [FileWatcher] Max reconnection attempts reached');
      }
    });

    // File change events
    this.socket.on('file:changed', (event: FileChangeEvent) => {
      this.handleFileChange(event);
    });

    // Bulk file changes (for initial sync)
    this.socket.on('file:bulk:changed', (events: FileChangeEvent[]) => {
      console.log(`👁️ [FileWatcher] Received ${events.length} file changes`);
      events.forEach(event => this.handleFileChange(event));
    });

    // Error events
    this.socket.on('file:error', (error: any) => {
      console.error('❌ [FileWatcher] File watching error:', error);
    });
  }

  /**
   * Handle file change events
   */
  private handleFileChange(event: FileChangeEvent): void {
    console.log(`👁️ [FileWatcher] File ${event.type}: ${event.path}`);

    // Call registered handlers
    this.changeHandlers.forEach((handler, id) => {
      try {
        handler(event);
      } catch (error) {
        console.error(`❌ [FileWatcher] Error in handler ${id}:`, error);
      }
    });

    // Handle hot reload if enabled
    if (this.options.enableHotReload) {
      this.handleHotReload(event);
    }
  }

  /**
   * Handle hot reload for component changes
   */
  private handleHotReload(event: FileChangeEvent): void {
    const { path, type } = event;

    // Only handle component files
    if (!this.isComponentFile(path)) return;

    console.log(`🔥 [FileWatcher] Hot reloading component: ${path}`);

    // Emit hot reload event for other parts of the app to handle
    this.emit('hotReload', {
      path,
      type,
      componentId: this.extractComponentId(path),
      timestamp: Date.now()
    });
  }

  /**
   * Check if file is a component file
   */
  private isComponentFile(path: string): boolean {
    return /\.(tsx?|jsx?)$/.test(path) && 
           (path.includes('/components/') || 
            path.includes('/templates/') || 
            path.includes('/blocks/'));
  }

  /**
   * Extract component ID from file path
   */
  private extractComponentId(path: string): string {
    const match = path.match(/\/([^\/]+)\.(tsx?|jsx?)$/);
    return match ? match[1] : path;
  }

  /**
   * Register a file change handler
   */
  onFileChange(id: string, handler: (event: FileChangeEvent) => void): void {
    this.changeHandlers.set(id, handler);
    console.log(`👁️ [FileWatcher] Registered handler: ${id}`);
  }

  /**
   * Unregister a file change handler
   */
  offFileChange(id: string): void {
    this.changeHandlers.delete(id);
    console.log(`👁️ [FileWatcher] Unregistered handler: ${id}`);
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: string, data: any): void {
    // Use custom event system or integrate with existing event system
    const customEvent = new CustomEvent(`fileWatcher:${event}`, { detail: data });
    window.dispatchEvent(customEvent);
  }

  /**
   * Request file content from server
   */
  async getFileContent(filePath: string): Promise<string | null> {
    if (!this.socket) {
      throw new Error('Not connected to server');
    }

    try {
      const response = await this.emitWithResponse('file:read', { path: filePath });
      
      if (response.success) {
        return response.content;
      } else {
        console.error('❌ [FileWatcher] Failed to read file:', response.error);
        return null;
      }
    } catch (error) {
      console.error('❌ [FileWatcher] Error reading file:', error);
      return null;
    }
  }

  /**
   * Write file content to server
   */
  async writeFileContent(filePath: string, content: string): Promise<boolean> {
    if (!this.socket) {
      throw new Error('Not connected to server');
    }

    try {
      const response = await this.emitWithResponse('file:write', { 
        path: filePath, 
        content 
      });
      
      if (response.success) {
        console.log(`✅ [FileWatcher] File written: ${filePath}`);
        return true;
      } else {
        console.error('❌ [FileWatcher] Failed to write file:', response.error);
        return false;
      }
    } catch (error) {
      console.error('❌ [FileWatcher] Error writing file:', error);
      return false;
    }
  }

  /**
   * Get file tree from server
   */
  async getFileTree(rootPath: string = 'src2'): Promise<any[]> {
    if (!this.socket) {
      throw new Error('Not connected to server');
    }

    try {
      const response = await this.emitWithResponse('file:tree', { path: rootPath });
      
      if (response.success) {
        return response.tree || [];
      } else {
        console.error('❌ [FileWatcher] Failed to get file tree:', response.error);
        return [];
      }
    } catch (error) {
      console.error('❌ [FileWatcher] Error getting file tree:', error);
      return [];
    }
  }

  /**
   * Emit with response promise
   */
  private emitWithResponse(event: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error(`Timeout waiting for response to ${event}`));
      }, 10000);

      this.socket.emit(event, data, (response: any) => {
        clearTimeout(timeout);
        resolve(response);
      });
    });
  }

  /**
   * Get connection status
   */
  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  /**
   * Get watching status
   */
  isWatchingFiles(): boolean {
    return this.isWatching;
  }

  /**
   * Get current options
   */
  getOptions(): FileWatcherOptions {
    return { ...this.options };
  }

  /**
   * Update watch paths
   */
  async updateWatchPaths(paths: string[]): Promise<void> {
    this.options.watchPaths = paths;
    
    if (this.isWatching) {
      await this.stopWatching();
      await this.startWatching();
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopWatching();
    this.disconnect();
    this.changeHandlers.clear();
    console.log('👁️ [FileWatcher] Destroyed');
  }
}

// Export singleton instance
export const fileWatcher = new FileWatcher();
