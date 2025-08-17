import React, {useState, useEffect, Suspense, useCallback} from 'react';
import {View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import { useEditor } from '../contexts/EditorContext';

// Type declarations for React Native Web compatibility
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Type assertion helper for React components
const asReactFC = <T extends any>(Component: T) => Component as React.FC<any>;

// Import session workspace loader for real-time editing
import { useSessionWorkspace } from '../services/SessionWorkspaceLoader';

// Fallback imports from original package (used when session workspace fails)
import {
  getScreenComponent as originalGetScreenComponent,
  getNavTabs as originalGetNavTabs,
  getScreenIdForTab as originalGetScreenIdForTab,
  type ScreenConfig,
  type NavTabConfig
} from '@mobile/screen-templates/templateConfig';

// TouchableOpacity imported above with other RN components

// Import real mobile context providers
import {
  ThemeProvider, 
  CartProvider,
  WixCartProvider,
  MemberProvider,
  AlertProvider, 
  ProductCacheProvider
} from '@mobile/context';

// Import bottom navigation
import {BottomNavigation} from '@mobile/components';

interface MobileAppRendererProps {
  selectedScreen?: string;
}

const LoadingSpinner = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={styles.loadingText}>Loading Your Mobile App...</Text>
  </View>
);

/**
 * MobileAppRenderer - Renders the REAL mobile app using the same approach as the web package
 * Now supports real-time editing by loading from session workspace
 */
const MobileAppRenderer: React.FC<MobileAppRendererProps> = ({
  selectedScreen
}) => {
  // ALL HOOKS MUST BE CALLED FIRST (Rules of Hooks)
  
  // Load session workspace for real-time editing
  const { isLoaded, templateConfig, error, isLoading } = useSessionWorkspace();
  
  // Get editor state for navigation control
  const { state } = useEditor();
  
  // Determine which template config to use (session or original)
  const getScreenComponent = templateConfig?.getScreenComponent || originalGetScreenComponent;
  const getNavTabs = templateConfig?.getNavTabs || originalGetNavTabs;
  const getScreenIdForTab = templateConfig?.getScreenIdForTab || originalGetScreenIdForTab;
  
  // Get navigation tabs (session or original)
  const navTabs = getNavTabs();
  
  // Initialize with real navigation tabs from your mobile app
  const [activeTab, setActiveTab] = useState<string>(() => {
    return navTabs[0]?.id || 'home';
  });

  // Real tab press handler using your actual navigation system
  const handleTabPress = useCallback((tab: string) => {
    console.log('📱 [MobileAppRenderer] Tab pressed:', tab);
    setActiveTab(tab);
  }, []);

  // CONDITIONAL LOGIC AND RETURNS AFTER ALL HOOKS
  
  console.log('📱 [MobileAppRenderer] Rendering real mobile app');
  console.log('📱 [MobileAppRenderer] Session workspace status:', { isLoaded, isLoading, hasError: !!error });
  console.log('📱 [MobileAppRenderer] Using config from:', templateConfig ? 'session workspace' : 'original package');
  console.log('📱 [MobileAppRenderer] Active tab:', activeTab);
  console.log('📱 [MobileAppRenderer] Selected screen:', selectedScreen);
  console.log('📱 [MobileAppRenderer] Navigation tabs count:', navTabs.length);
  console.log('📱 [MobileAppRenderer] Bottom navigation will render with tabs:', navTabs.slice(0, 4).map((t: any) => t.name));

  // Show loading while session workspace is initializing
  if (isLoading && !isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Session Workspace...</Text>
        <Text style={[styles.loadingText, { fontSize: 12, opacity: 0.7 }]}>
          Preparing real-time editing
        </Text>
      </View>
    );
  }

  // Show error if session workspace failed to load (but continue with fallback)
  if (error && !templateConfig) {
    console.warn('⚠️ [MobileAppRenderer] Session workspace error, using original package:', error);
  }

  // Real screen renderer using your actual mobile template system
  const renderScreenComponent = (screenId: string) => {
    console.log('📱 [MobileAppRenderer] Rendering screen:', screenId);
    
    // Get the ACTUAL screen component from your mobile app
    const ScreenComponent = getScreenComponent(screenId);
    
    if (ScreenComponent) {
      console.log('✅ [MobileAppRenderer] Found real screen component for:', screenId);
      const SafeScreenComponent = asReactFC(ScreenComponent);
      return <SafeScreenComponent />;
    }
    
    console.warn('❌ [MobileAppRenderer] Screen component not found:', screenId);
    
    // Fallback to first available screen if not found
    const navTabs = getNavTabs();
    for (const tab of navTabs) {
      const fallbackScreenId = getScreenIdForTab(tab.id);
      if (fallbackScreenId) {
        const FallbackComponent = getScreenComponent(fallbackScreenId);
        if (FallbackComponent) {
          console.log('📱 [MobileAppRenderer] Using fallback screen:', fallbackScreenId);
          const SafeFallbackComponent = asReactFC(FallbackComponent);
          return <SafeFallbackComponent />;
        }
      }
    }
    
    // Final fallback if nothing works
    return (
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderTitle}>Screen not found</Text>
        <Text style={styles.placeholderText}>{screenId}</Text>
        <Text style={styles.placeholderSubtext}>Check your screen registration in templateConfig.ts</Text>
      </View>
    );
  };

  // Main content renderer with real mobile app logic
  const renderMainContent = () => {
    // If a specific screen is selected, show it
    if (selectedScreen) {
      console.log('📱 [MobileAppRenderer] Rendering selected screen:', selectedScreen);
      return renderScreenComponent(selectedScreen);
    }

    // Otherwise, show the screen for the active tab
    const defaultScreen = getScreenIdForTab(activeTab);
    if (defaultScreen) {
      console.log('📱 [MobileAppRenderer] Rendering default screen for tab:', activeTab, '->', defaultScreen);
      return renderScreenComponent(defaultScreen);
    }

    // Final fallback
    console.log('📱 [MobileAppRenderer] Using final fallback to first nav tab');
    const navTabs = getNavTabs();
    const firstTab = navTabs[0];
    if (firstTab) {
      const firstScreen = getScreenIdForTab(firstTab.id);
      if (firstScreen) {
        return renderScreenComponent(firstScreen);
      }
    }

    return (
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderTitle}>No screens available</Text>
        <Text style={styles.placeholderText}>Check your mobile app configuration</Text>
      </View>
    );
  };

  // navTabs already declared at component top
  console.log('📱 [MobileAppRenderer] Available navigation tabs:', navTabs.map((tab: any) => tab.name));

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AlertProvider>
          <CartProvider>
            <MemberProvider>
              <WixCartProvider>
                <ProductCacheProvider maxCacheSize={30} maxCacheAge={15 * 60 * 1000}>
                  <View style={styles.container}>
                    <Suspense fallback={<LoadingSpinner />}>
                      {/* Scrollable Content Area with fixed height */}
                      <View style={styles.contentWrapper}>
                        <ScrollView 
                          style={styles.content}
                          contentContainerStyle={styles.scrollContent}
                          showsVerticalScrollIndicator={true}
                          nestedScrollEnabled={true}
                        >
                          {renderMainContent()}
                        </ScrollView>
                      </View>
                      
                      {/* Bottom Navigation - Fixed at bottom with absolute positioning */}
                      <View style={styles.bottomNavContainer}>
                        <Text style={styles.debugLabel}>🧭 Navigation Debug:</Text>
                        
                        {/* Try real BottomNavigation first */}
                        <View style={styles.realNavWrapper}>
                          <BottomNavigation 
                            activeTab={activeTab} 
                            onTabPress={handleTabPress}
                          />
                        </View>
                        
                        {/* Debug/Fallback navigation - always show for debugging */}
                        <View style={styles.debugNavigation}>
                          <Text style={styles.debugTitle}>📱 Navigation Tabs ({navTabs.length}):</Text>
                          <View style={styles.tabsContainer}>
                            {navTabs.slice(0, 4).map((tab: any, index: number) => (
                              <TouchableOpacity 
                                key={tab.id} 
                                onPress={() => handleTabPress(tab.id)}
                                style={[
                                  styles.tabButton,
                                  activeTab === tab.id && styles.tabButtonActive
                                ]}
                              >
                                <Text 
                                  style={[
                                    styles.tabText,
                                    activeTab === tab.id && styles.tabTextActive
                                  ]}
                                  numberOfLines={1}
                                  ellipsizeMode="tail"
                                >
                                  {tab.name || 'Tab'}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                          <Text style={styles.activeTabText}>Active: {activeTab}</Text>
                        </View>
                      </View>
                    </Suspense>
                  </View>
                </ProductCacheProvider>
              </WixCartProvider>
            </MemberProvider>
          </CartProvider>
        </AlertProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    height: '100%',
    position: 'relative',
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingBottom: 160, // Reserve space for bottom navigation
  },
  content: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
    paddingBottom: 10,
    paddingTop: 8,
    minHeight: 150,
    maxHeight: 160,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  debugLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  realNavWrapper: {
    minHeight: 40,
    backgroundColor: '#e8f4fd',
    marginHorizontal: 8,
    marginBottom: 4,
    borderRadius: 6,
    padding: 4,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  debugNavigation: {
    padding: 10,
    backgroundColor: '#fff',
    marginHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  debugTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 6,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tabButton: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    minWidth: 55,
    maxWidth: 70,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: 1,
    marginHorizontal: 2,
  },
  tabButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#0056d3',
    transform: [{scale: 1.05}],
  },
  tabText: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  activeTabText: {
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
    marginTop: 2,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default MobileAppRenderer;
