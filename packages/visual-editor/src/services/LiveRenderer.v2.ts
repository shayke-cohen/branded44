import React from 'react';
import { AppRegistry } from 'react-native';
import { AppLoaderV2 } from './AppLoader.v2';
import { componentRegistry } from './ComponentRegistry';
import { componentScanner } from './ComponentScanner';

export interface RenderOptions {
  props?: Record<string, any>;
  wrapInProvider?: boolean;
  deviceType?: 'iphone' | 'android';
}

export class LiveRenderer {
  private container: HTMLElement | null = null;
  private reactRoot: any = null;
  private currentMode: 'app' | 'component' = 'app';
  private currentComponent: React.ComponentType | null = null;
  private currentProps: Record<string, any> = {};

  constructor() {
    console.log('🎨 [LiveRenderer] Initializing React Native Web...');
    this.initializeReactNativeWeb();
    this.setupHotReload();
  }

  /**
   * Initialize React Native Web for component rendering
   */
  private initializeReactNativeWeb() {
    if (typeof window !== 'undefined') {
      (window as any).__REACT_NATIVE_WEB__ = true;
      
      AppRegistry.setWrapperComponentProvider(() => {
        return ({ children }: { children: React.ReactNode }) => 
          React.createElement('div', {
            style: { 
              flex: 1, 
              height: '100%',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }
          }, children);
      });
    }
  }

  /**
   * Set up hot reload listeners
   */
  private setupHotReload() {
    if (typeof window !== 'undefined') {
      // Listen for file changes from the server
      const eventSource = new EventSource('http://localhost:3001/api/editor/events');
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'file:changed' && data.path.includes('src2/')) {
          console.log('🔄 [LiveRenderer] File changed, hot reloading...', data.path);
          this.hotReload();
        }
      };

      eventSource.onerror = (error) => {
        console.warn('⚠️ [LiveRenderer] Hot reload connection lost:', error);
      };
    }
  }

  /**
   * Set the container element for rendering
   */
  setContainer(container: HTMLElement) {
    if (this.reactRoot && this.container !== container) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
    
    this.container = container;
    console.log('📱 [LiveRenderer] Container set for rendering');
  }

  /**
   * Render the main app from src2
   */
  async renderApp(options: RenderOptions = {}): Promise<void> {
    if (!this.container) {
      throw new Error('Container not set. Call setContainer() first.');
    }

    try {
      console.log('🎨 [LiveRenderer] Rendering main app...');
      this.currentMode = 'app';

      // Use the new AppLoaderV2 approach
      const appLoader = new AppLoaderV2();
      const sessionInfo = await appLoader.initializeSession();
      
      if (!sessionInfo) {
        throw new Error('Failed to initialize session');
      }
      
      // For now, use the fallback app until we implement full session loading
      const AppComponent = appLoader.createFallbackApp();
      const appResult = { success: true, component: AppComponent };
      if (!appResult.success || !appResult.component) {
        throw new Error('Failed to load app');
      }

      const wrappedElement = this.wrapForPhoneFrame(
        React.createElement(appResult.component),
        options
      );

      await this.renderElement(wrappedElement);
      console.log('✅ [LiveRenderer] Successfully rendered main app');

    } catch (error) {
      console.error('❌ [LiveRenderer] Failed to render app:', error);
      this.renderError(`Failed to render app: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Render a specific component (for palette selection)
   */
  async renderComponent(componentId: string, options: RenderOptions = {}): Promise<void> {
    if (!this.container) {
      throw new Error('Container not set. Call setContainer() first.');
    }

    try {
      console.log(`🎨 [LiveRenderer] Rendering component: ${componentId}`);
      this.currentMode = 'component';

      // Get component metadata
      const metadata = componentRegistry.getComponent(componentId);
      if (!metadata) {
        throw new Error(`Component not found: ${componentId}`);
      }

      // For now, create a placeholder that shows component info
      // In a full implementation, this would load the actual component from src2
      const ComponentPlaceholder = this.createComponentPlaceholder(metadata);
      
      this.currentComponent = ComponentPlaceholder;
      this.currentProps = options.props || {};

      const wrappedElement = this.wrapForPhoneFrame(
        React.createElement(ComponentPlaceholder, this.currentProps),
        options
      );

      await this.renderElement(wrappedElement);
      console.log(`✅ [LiveRenderer] Successfully rendered component: ${componentId}`);

    } catch (error) {
      console.error(`❌ [LiveRenderer] Failed to render component ${componentId}:`, error);
      this.renderError(`Failed to render: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create a placeholder component that can be inspected
   */
  private createComponentPlaceholder(metadata: any): React.ComponentType {
    return (props: any) => React.createElement('div', {
      // Add data attributes for component inspection
      'data-component-id': metadata.id,
      'data-component-name': metadata.name,
      'data-component-category': metadata.category,
      'data-component-path': metadata.path,
      'data-inspectable': 'true',
      style: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f7fafc',
        border: '2px dashed #cbd5e0',
        borderRadius: 12,
        margin: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 300,
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      },
      onMouseEnter: (e: any) => {
        e.target.style.borderColor = '#3182ce';
        e.target.style.backgroundColor = '#ebf8ff';
      },
      onMouseLeave: (e: any) => {
        e.target.style.borderColor = '#cbd5e0';
        e.target.style.backgroundColor = '#f7fafc';
      }
    }, [
      React.createElement('div', {
        key: 'icon',
        style: { fontSize: 48, marginBottom: 16 }
      }, this.getComponentIcon(metadata.category)),
      
      React.createElement('h3', {
        key: 'title',
        style: { 
          margin: 0, 
          marginBottom: 8, 
          color: '#2d3748',
          fontSize: 20,
          fontWeight: 600,
          textAlign: 'center'
        }
      }, metadata.name),
      
      React.createElement('p', {
        key: 'description',
        style: { 
          margin: 0, 
          marginBottom: 16,
          color: '#718096',
          fontSize: 14,
          textAlign: 'center',
          maxWidth: 280,
          lineHeight: 1.4
        }
      }, metadata.description),

      React.createElement('div', {
        key: 'meta-info',
        style: {
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          justifyContent: 'center'
        }
      }, [
        React.createElement('span', {
          key: 'category',
          style: {
            padding: '4px 12px',
            backgroundColor: '#e2e8f0',
            borderRadius: 12,
            fontSize: 12,
            color: '#4a5568',
            fontWeight: 500
          }
        }, metadata.category),
        React.createElement('span', {
          key: 'inspectable',
          style: {
            padding: '4px 12px',
            backgroundColor: '#c6f6d5',
            borderRadius: 12,
            fontSize: 12,
            color: '#22543d',
            fontWeight: 500
          }
        }, '🔍 Inspectable')
      ]),

      React.createElement('div', {
        key: 'path-info',
        style: {
          marginTop: 16,
          padding: '8px 12px',
          backgroundColor: '#edf2f7',
          borderRadius: 8,
          fontSize: 11,
          color: '#4a5568',
          fontFamily: 'monospace'
        }
      }, metadata.path)
    ]);
  }

  /**
   * Get icon for component category
   */
  private getComponentIcon(category: string): string {
    const icons: Record<string, string> = {
      'screens': '📱',
      'auth': '🔐',
      'booking': '📅',
      'ecommerce': '🛍️',
      'restaurant': '🍽️',
      'forms': '📝',
      'lists': '📋',
      'social': '👥',
      'media': '🎬',
      'location': '📍',
      'finance': '💳',
      'health': '🏥',
      'business': '💼',
      'communication': '💬',
      'utility': '🔧',
      'blocks': '🧩',
      'templates': '📄'
    };
    return icons[category] || '📦';
  }

  /**
   * Wrap component for phone frame rendering with inspection support
   */
  private wrapForPhoneFrame(component: React.ReactElement, options: RenderOptions) {
    const { deviceType = 'iphone' } = options;

    return React.createElement('div', {
      // Add inspection attributes to the wrapper
      'data-phone-frame': 'true',
      'data-device-type': deviceType,
      'data-render-mode': this.currentMode,
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: deviceType === 'iphone' ? '#000' : '#212121',
        borderRadius: deviceType === 'iphone' ? 25 : 8,
        padding: deviceType === 'iphone' ? 8 : 4,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }
    }, [
      React.createElement('div', {
        key: 'app-content',
        'data-app-content': 'true',
        style: {
          flex: 1,
          backgroundColor: '#fff',
          borderRadius: deviceType === 'iphone' ? 20 : 4,
          overflow: 'hidden',
          position: 'relative'
        }
      }, component)
    ]);
  }

  /**
   * Render element using React root
   */
  private async renderElement(element: React.ReactElement): Promise<void> {
    if (!this.container) {
      throw new Error('Container not set');
    }

    try {
      // More defensive approach to avoid removeChild errors
      if (this.reactRoot) {
        // Safely unmount existing root with error handling
        try {
          // Use setTimeout to avoid React's internal DOM manipulation conflicts
          await new Promise<void>((resolve) => {
            setTimeout(() => {
              try {
                if (this.reactRoot) {
                  this.reactRoot.unmount();
                }
              } catch (unmountError) {
                console.warn('⚠️ [LiveRenderer] Error unmounting root:', unmountError);
              }
              this.reactRoot = null;
              resolve();
            }, 0);
          });
        } catch (unmountError) {
          console.warn('⚠️ [LiveRenderer] Error in unmount process:', unmountError);
          this.reactRoot = null;
        }
      }

      // Ensure container is clean before creating new root
      if (this.container.firstChild) {
        try {
          this.container.innerHTML = '';
        } catch (clearError) {
          console.warn('⚠️ [LiveRenderer] Error clearing container:', clearError);
        }
      }
      
      // Create a new root for each render to avoid DOM conflicts
      const { createRoot } = await import('react-dom/client');
      this.reactRoot = createRoot(this.container);
      
      // Render the element
      this.reactRoot.render(element);
      
    } catch (error) {
      console.error('❌ [LiveRenderer] Error in renderElement:', error);
      // Fallback: clear everything safely
      this.reactRoot = null;
      try {
        if (this.container) {
          this.container.innerHTML = '';
        }
      } catch (clearError) {
        console.warn('⚠️ [LiveRenderer] Error in fallback clear:', clearError);
      }
      throw error;
    }
  }

  /**
   * Render error state
   */
  private async renderError(message: string): Promise<void> {
    const errorElement = React.createElement('div', {
      style: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff5f5',
        border: '2px dashed #fed7d7',
        borderRadius: 8,
        margin: 10,
        display: 'flex',
        flexDirection: 'column'
      }
    }, [
      React.createElement('div', {
        key: 'icon',
        style: { fontSize: 48, marginBottom: 16 }
      }, '⚠️'),
      React.createElement('h3', {
        key: 'title',
        style: { 
          margin: 0, 
          marginBottom: 8, 
          color: '#c53030',
          fontSize: 16,
          fontWeight: 600
        }
      }, 'Render Error'),
      React.createElement('p', {
        key: 'message',
        style: { 
          margin: 0, 
          color: '#742a2a',
          fontSize: 14,
          textAlign: 'center'
        }
      }, message)
    ]);

    await this.renderElement(errorElement);
  }

  /**
   * Hot reload current content
   */
  private async hotReload(): Promise<void> {
    if (this.currentMode === 'app') {
      await this.renderApp({ deviceType: 'iphone' });
    } else if (this.currentComponent) {
      // Re-render current component
      const wrappedElement = this.wrapForPhoneFrame(
        React.createElement(this.currentComponent, this.currentProps),
        { deviceType: 'iphone' }
      );
      await this.renderElement(wrappedElement);
    }
  }

  /**
   * Clear the rendered content
   */
  clear() {
    try {
      // Immediately set state to prevent new renders
      this.currentComponent = null;
      this.currentProps = {};
      this.currentMode = 'app';
      
      if (this.reactRoot) {
        // Create a promise to handle unmounting properly
        const unmountPromise = new Promise<void>((resolve) => {
          if (this.reactRoot) {
            try {
              this.reactRoot.unmount();
              this.reactRoot = null;
              resolve();
            } catch (error) {
              console.warn('⚠️ [LiveRenderer] Error during unmount:', error);
              this.reactRoot = null;
              resolve();
            }
          } else {
            resolve();
          }
        });
        
        // Don't wait for unmount, but ensure container is cleared after
        unmountPromise.then(() => {
          if (this.container) {
            this.container.innerHTML = '';
          }
        });
      } else if (this.container) {
        // If no React root, just clear the container
        this.container.innerHTML = '';
      }
      
      console.log('🧹 [LiveRenderer] Render cleared');
    } catch (error) {
      console.warn('⚠️ [LiveRenderer] Error during clear:', error);
      // Force clear everything
      if (this.container) {
        this.container.innerHTML = '';
      }
      this.reactRoot = null;
      this.currentComponent = null;
      this.currentProps = {};
      this.currentMode = 'app';
    }
  }

  /**
   * Get current render info
   */
  getCurrentRenderInfo(): { 
    mode: 'app' | 'component'; 
    component: React.ComponentType | null; 
    props: Record<string, any> 
  } {
    return {
      mode: this.currentMode,
      component: this.currentComponent,
      props: this.currentProps
    };
  }
}

// Export singleton instance
export const liveRenderer = new LiveRenderer();
