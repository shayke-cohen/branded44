import React from 'react';

export interface AppLoadResult {
  success: boolean;
  component?: React.ComponentType;
  error?: string;
  dependencies?: string[];
}

export class AppLoader {
  private serverUrl: string;
  private loadedApp: React.ComponentType | null = null;
  private appSource: string | null = null;

  constructor(serverUrl = 'http://localhost:3001') {
    this.serverUrl = serverUrl;
  }

  /**
   * Load the main App.tsx from src2 directory
   */
  async loadApp(): Promise<AppLoadResult> {
    try {
      console.log('📱 [AppLoader] Loading App.tsx from src2...');

      // First, ensure src2 is initialized
      await this.initializeSrc2();

      // Get the App.tsx source code
      const appSource = await this.getAppSource();
      if (!appSource) {
        throw new Error('Failed to load App.tsx source code');
      }

      // For now, create a simple wrapper that shows the app structure
      // In a full implementation, this would compile and execute the actual React Native code
      const AppComponent = this.createAppWrapper(appSource);
      
      this.loadedApp = AppComponent;
      this.appSource = appSource;

      console.log('✅ [AppLoader] Successfully loaded App.tsx');
      return {
        success: true,
        component: AppComponent
      };

    } catch (error) {
      console.error('❌ [AppLoader] Failed to load App.tsx:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get the currently loaded app component
   */
  getLoadedApp(): React.ComponentType | null {
    return this.loadedApp;
  }

  /**
   * Get the app source code
   */
  getAppSource(): Promise<string | null> {
    return this.fetchAppSource();
  }

  /**
   * Reload the app (useful for hot reloading)
   */
  async reloadApp(): Promise<AppLoadResult> {
    console.log('🔄 [AppLoader] Reloading App.tsx...');
    this.loadedApp = null;
    this.appSource = null;
    return this.loadApp();
  }

  /**
   * Initialize src2 directory
   */
  private async initializeSrc2(): Promise<void> {
    try {
      const response = await fetch(`${this.serverUrl}/api/editor/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to initialize src2: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to initialize src2');
      }

      console.log('✅ [AppLoader] src2 directory initialized');
    } catch (error) {
      console.error('❌ [AppLoader] Failed to initialize src2:', error);
      throw error;
    }
  }

  /**
   * Fetch App.tsx source code from server
   */
  private async fetchAppSource(): Promise<string | null> {
    try {
      const response = await fetch(`${this.serverUrl}/api/editor/files/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filePath: 'App.tsx'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to read App.tsx: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to read App.tsx');
      }

      return data.content;
    } catch (error) {
      console.error('❌ [AppLoader] Failed to fetch App.tsx source:', error);
      return null;
    }
  }

  /**
   * Create a wrapper component that loads the actual mobile app (like web package does)
   */
  private createAppWrapper(appSource: string): React.ComponentType {
    return () => {
      const [MobileApp, setMobileApp] = React.useState<React.ComponentType | null>(null);
      const [loading, setLoading] = React.useState(true);
      const [error, setError] = React.useState<string | null>(null);

      React.useEffect(() => {
        const loadMobileApp = async () => {
          try {
            console.log('📱 [AppLoader] Loading mobile app from session workspace...');
            
            // First try to load from session workspace
            // SessionModuleLoader removed - using new SessionAppLoader approach
            // This functionality is now handled by SessionAppLoader in the new architecture
            throw new Error('SessionModuleLoader deprecated - use SessionAppLoader instead');
          } catch (sessionError) {
            console.warn('⚠️ [AppLoader] Failed to load from session workspace, trying original mobile package:', sessionError);
            
            try {
              // Fallback to original mobile package
              const { default: MobileAppComponent } = await import('@mobile/App');
              
              if (MobileAppComponent) {
                console.log('✅ [AppLoader] Mobile app loaded successfully from original package');
                setMobileApp(() => MobileAppComponent);
              } else {
                throw new Error('No default export found in mobile App');
              }
            } catch (originalError) {
              console.error('❌ [AppLoader] Failed to load mobile app from both sources:', { sessionError, originalError });
              setError(`Failed to load mobile app: ${originalError instanceof Error ? originalError.message : String(originalError)}`);
              
              // Final fallback to React Native Web version
              const appInfo = this.parseAppStructure(appSource);
              setMobileApp(() => () => this.createReactNativeWebApp(appInfo, appSource));
            }
          } finally {
            setLoading(false);
          }
        };

        loadMobileApp();

        // Listen for app reload events (when App.tsx changes)
        const handleAppReload = () => {
          console.log('🔄 [AppLoader] Received app reload event, reloading...');
          loadMobileApp();
        };

        window.addEventListener('fileWatcher:appReload', handleAppReload);

        return () => {
          window.removeEventListener('fileWatcher:appReload', handleAppReload);
        };
      }, [appSource]);

      if (loading) {
        return React.createElement('div', {
          style: {
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: 12,
            margin: 10,
            minHeight: 600
          }
        }, [
          React.createElement('div', { key: 'loading' }, '📱 Loading Mobile App...')
        ]);
      }

      if (error || !MobileApp) {
        console.warn('⚠️ [AppLoader] Using fallback React Native Web app due to error:', error);
        const appInfo = this.parseAppStructure(appSource);
        return this.createReactNativeWebApp(appInfo, appSource);
      }

      // Render the actual mobile app (same as web package)
      return React.createElement(MobileApp);
    };
  }

  /**
   * Create a React Native Web-compatible version of the mobile app
   */
  private createReactNativeWebApp(appInfo: any, appSource: string): React.ReactElement {
    // Import React Native Web components
    const { View, Text, StyleSheet, TouchableOpacity, ScrollView } = require('react-native');
    
    // Create a simplified version of the mobile app structure
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#ffffff',
      },
      header: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
      },
      headerText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
      },
      content: {
        flex: 1,
        padding: 20,
      },
      screenInfo: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
      },
      screenTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
      },
      screenDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
      },
      navigationContainer: {
        backgroundColor: '#f8f9fa',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
      },
      navTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        color: '#333',
      },
      tabButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 6,
        marginBottom: 8,
      },
      tabButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '500',
      },
      bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingVertical: 8,
      },
      bottomNavItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
      },
      bottomNavText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
      },
      activeNavText: {
        color: '#007AFF',
      },
    });

    // Create a proper React component to avoid hooks issues
    const ReactNativeWebApp: React.FC = () => {
      const [activeTab, setActiveTab] = React.useState('home');

      // Extract navigation tabs from app info
      const navTabs = appInfo.screens || [
        { id: 'home', name: 'Home', icon: '🏠' },
        { id: 'products', name: 'Products', icon: '🛍️' },
        { id: 'bookings', name: 'Bookings', icon: '📅' },
        { id: 'profile', name: 'Profile', icon: '👤' },
      ];

              const currentScreen = navTabs.find((tab: any) => tab.id === activeTab) || navTabs[0] || { id: 'home', name: 'Home', icon: '🏠' };

        return React.createElement(View, { style: styles.container }, [
          // Header
          React.createElement(View, { key: 'header', style: styles.header }, [
            React.createElement(Text, { key: 'header-text', style: styles.headerText }, 'Branded44 Mobile App')
          ]),

          // Main Content
          React.createElement(ScrollView, { key: 'content', style: styles.content }, [
            // Current Screen Info
            React.createElement(View, { key: 'screen-info', style: styles.screenInfo }, [
              React.createElement(Text, { key: 'screen-title', style: styles.screenTitle },
                `${currentScreen.icon || '📱'} ${currentScreen.name || 'Home'} Screen`
              ),
              React.createElement(Text, { key: 'screen-desc', style: styles.screenDescription },
                `This is the ${(currentScreen.name || 'home').toLowerCase()} screen of your React Native mobile app. The actual implementation includes navigation, state management, and real components.`
              )
            ]),

                    // Navigation Structure
            React.createElement(View, { key: 'nav-structure', style: styles.navigationContainer }, [
              React.createElement(Text, { key: 'nav-title', style: styles.navTitle }, '📱 Available Screens'),
              ...navTabs.map((tab: any, index: number) =>
                React.createElement(TouchableOpacity, {
                  key: `tab-${tab.id || index}`,
                  style: [styles.tabButton, activeTab === tab.id && { backgroundColor: '#0056b3' }],
                  onPress: () => setActiveTab(tab.id)
                }, [
                  React.createElement(Text, { key: `tab-text-${tab.id || index}`, style: styles.tabButtonText },
                    `${tab.icon} ${tab.name}`
                  )
                ])
              )
            ]),

        // App Structure Info
        React.createElement(View, { key: 'app-structure', style: styles.screenInfo }, [
          React.createElement(Text, { key: 'structure-title', style: styles.screenTitle }, 
            '🏗️ App Architecture'
          ),
          React.createElement(Text, { key: 'structure-desc', style: styles.screenDescription }, 
            `• ${appInfo.providers?.length || 0} Context Providers\n• ${appInfo.screens?.length || 0} Screen Components\n• ${appInfo.imports?.length || 0} Dependencies\n• React Native Navigation\n• State Management with Context`
          )
        ])
      ]),

                // Bottom Navigation
          React.createElement(View, { key: 'bottom-nav', style: styles.bottomNav },
            navTabs.slice(0, 4).map((tab: any, index: number) =>
              React.createElement(TouchableOpacity, {
                key: `bottom-${tab.id || index}`,
                style: styles.bottomNavItem,
                onPress: () => setActiveTab(tab.id)
              }, [
                React.createElement(Text, { key: `icon-${tab.id || index}`, style: { fontSize: 20 } }, tab.icon),
                React.createElement(Text, {
                  key: `text-${tab.id || index}`,
                  style: [styles.bottomNavText, activeTab === tab.id && styles.activeNavText]
                }, tab.name)
              ])
            )
          )
    ]);
    };

    return React.createElement(ReactNativeWebApp);
  }

  /**
   * Create a mock app structure as fallback
   */
  private createMockApp(appSource: string): React.ComponentType {
    return () => {
      // Parse the app source to understand its structure
      const appInfo = this.parseAppStructure(appSource);

      return React.createElement('div', {
        style: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f8f9fa',
          borderRadius: 12,
          margin: 10,
          overflow: 'hidden',
          minHeight: 600
        }
      }, [
        // App Header
        React.createElement('div', {
          key: 'app-header',
          style: {
            padding: '16px 20px',
            backgroundColor: '#2d3748',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }
        }, [
          React.createElement('div', {
            key: 'app-info',
            style: { display: 'flex', alignItems: 'center', gap: 12 }
          }, [
            React.createElement('div', {
              key: 'app-icon',
              style: {
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: '#4299e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16
              }
            }, '📱'),
            React.createElement('div', { key: 'app-details' }, [
              React.createElement('div', {
                key: 'app-name',
                style: { fontSize: 16, fontWeight: 600 }
              }, appInfo.name || 'React Native App'),
              React.createElement('div', {
                key: 'app-status',
                style: { fontSize: 12, opacity: 0.8 }
              }, 'Running from src2')
            ])
          ]),
          React.createElement('div', {
            key: 'status-indicator',
            style: {
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#48bb78'
            }
          })
        ]),

        // App Content Area
        React.createElement('div', {
          key: 'app-content',
          style: {
            flex: 1,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }
        }, [
          // Navigation Info
          appInfo.hasNavigation && React.createElement('div', {
            key: 'navigation-info',
            style: {
              padding: 16,
              backgroundColor: 'white',
              borderRadius: 8,
              border: '1px solid #e2e8f0'
            }
          }, [
            React.createElement('div', {
              key: 'nav-title',
              style: { fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#4a5568' }
            }, '🧭 Navigation Structure'),
            React.createElement('div', {
              key: 'nav-screens',
              style: { fontSize: 12, color: '#718096' }
            }, `Detected ${appInfo.screens.length} screens: ${appInfo.screens.join(', ')}`)
          ]),

          // Components Info
          React.createElement('div', {
            key: 'components-info',
            style: {
              padding: 16,
              backgroundColor: 'white',
              borderRadius: 8,
              border: '1px solid #e2e8f0'
            }
          }, [
            React.createElement('div', {
              key: 'comp-title',
              style: { fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#4a5568' }
            }, '🧩 Components'),
            React.createElement('div', {
              key: 'comp-count',
              style: { fontSize: 12, color: '#718096' }
            }, `Using ${appInfo.imports.length} imports and dependencies`)
          ]),

          // Live Preview Area
          React.createElement('div', {
            key: 'preview-area',
            style: {
              flex: 1,
              padding: 20,
              backgroundColor: 'white',
              borderRadius: 8,
              border: '2px dashed #cbd5e0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 12,
              minHeight: 200
            }
          }, [
            React.createElement('div', {
              key: 'preview-icon',
              style: { fontSize: 48 }
            }, '📱'),
            React.createElement('div', {
              key: 'preview-title',
              style: { fontSize: 18, fontWeight: 600, color: '#4a5568' }
            }, 'Live App Preview'),
            React.createElement('div', {
              key: 'preview-desc',
              style: { fontSize: 14, color: '#718096', textAlign: 'center' }
            }, 'Your React Native app is running here.\nComponents and screens will render in this area.'),
            React.createElement('div', {
              key: 'preview-note',
              style: {
                marginTop: 12,
                padding: '8px 16px',
                backgroundColor: '#edf2f7',
                borderRadius: 16,
                fontSize: 12,
                color: '#4a5568'
              }
            }, '💡 Select components from the palette to see them rendered')
          ])
        ])
      ]);
    };
  }

  /**
   * Parse App.tsx source to understand its structure
   */
  private parseAppStructure(source: string): {
    name: string;
    hasNavigation: boolean;
    screens: string[];
    imports: string[];
  } {
    const imports = this.extractImports(source);
    const screens = this.extractScreens(source);
    const hasNavigation = source.includes('Navigation') || source.includes('Stack') || source.includes('Tab');

    return {
      name: 'Branded44 App',
      hasNavigation,
      screens,
      imports
    };
  }

  /**
   * Extract import statements from source
   */
  private extractImports(source: string): string[] {
    const importRegex = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
    const imports: string[] = [];
    let match;

    while ((match = importRegex.exec(source)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  /**
   * Extract screen names from source
   */
  private extractScreens(source: string): string[] {
    const screenRegex = /(\w+Screen)/g;
    const screens: string[] = [];
    let match;

    while ((match = screenRegex.exec(source)) !== null) {
      if (!screens.includes(match[1])) {
        screens.push(match[1]);
      }
    }

    return screens;
  }
}

// Export singleton instance
export const appLoader = new AppLoader();
