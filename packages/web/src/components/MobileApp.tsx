import React, {useState, Suspense, useCallback} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {ThemeProvider, CartProvider} from '@mobile/context';
import {usePreview} from '../context/PreviewContext';
import WebAppContainer from './WebAppContainer';

// Import the new dynamic template system
import {
  getTemplateComponent,
  getTemplateConfig,
} from '@mobile/screen-templates/templateConfig';

// Import unified registry system from mobile (shared)
import {
  getScreenConfig,
  getSampleAppConfig,
  getNavTabConfig,
  getTemplateIdFromKey,
  getScreenIdForTab,
  getScreens,
  getSampleApps,
  getNavTabs,
  getScreenComponent,
  getSampleAppComponent,
  type ScreenConfig,
  type SampleAppConfig,
  type NavTabConfig
} from '@mobile/screen-templates/templateConfig';

// Import bottom navigation
import {BottomNavigation} from '@mobile/components';

interface MobileAppProps {
  previewMode: 'screens';
  selectedScreen?: string;
}

interface AppState {
  id: string;
  name: string;
  icon?: string;
}

const LoadingSpinner = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

const MobileApp: React.FC<MobileAppProps> = ({
  previewMode,
  selectedScreen
}) => {
  const {setSelectedScreen} = usePreview();
  const [activeTab, setActiveTab] = useState<string>(() => {
    const navTabs = getNavTabs();
    return navTabs[0]?.id || 'home-tab';
  });
  const [activeApp, setActiveApp] = useState<AppState | null>(null);

  // Generic tab press handler
  const handleTabPress = useCallback((tab: string) => {
    setActiveTab(tab);
    setActiveApp(null);
    
    // Update selectedScreen to keep Quick Screen Access in sync
    if (previewMode === 'screens') {
      const defaultScreen = getScreenIdForTab(tab);
      if (defaultScreen) {
        setSelectedScreen(defaultScreen as any);
      }
    }
    
  }, [previewMode, setSelectedScreen]);

  // Handle app launch from template gallery
  const handleAppLaunch = useCallback((app: AppState) => {
    setActiveApp(app);
  }, []);

  // Handle app close
  const handleAppClose = useCallback(() => {
    setActiveApp(null);
  }, []);

  // Generic app content renderer using configuration
  const renderAppContent = (appId: string) => {
    const AppComponent = getSampleAppComponent(appId);
    
    if (AppComponent) {
      return <AppComponent />;
    }

    // Fallback for unknown apps
    return (
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderTitle}>🚀 {appId}</Text>
        <Text style={styles.placeholderText}>App launching soon...</Text>
      </View>
    );
  };

  // Generic screen renderer using configuration
  const renderScreenComponent = (screenId: string) => {
    // Get screen component from registry - completely generic!
    const ScreenComponent = getScreenComponent(screenId);
    if (ScreenComponent) {
      // Pass onAppLaunch to all screens (they can use it if needed)
      return <ScreenComponent onAppLaunch={handleAppLaunch} />;
    }
    
    // Fallback to first available screen if not found
    const screens = getScreens();
    const fallbackScreen = screens.find(screen => screen.componentKey && getScreenComponent(screen.id));
    if (fallbackScreen) {
      const FallbackComponent = getScreenComponent(fallbackScreen.id);
      if (FallbackComponent) {
        return <FallbackComponent onAppLaunch={handleAppLaunch} />;
      }
    }
    
    return (
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderTitle}>Screen not found</Text>
        <Text style={styles.placeholderText}>{screenId}</Text>
      </View>
    );
  };

  // Generic sample app renderer using configuration
  const renderSampleApp = (sampleAppKey: string) => {
    // Create dynamic mapping from UI keys to registry IDs
    const sampleApps = getSampleApps();
    const appConfig = sampleApps.find(app => {
      // Convert registry name to UI key format (e.g., 'Todo App' -> 'TodoApp')
      const uiKey = app.name.replace(/\s+/g, '') + 'App';
      return uiKey === sampleAppKey;
    });
    
    if (appConfig) {
      const AppComponent = getSampleAppComponent(appConfig.id);
      if (AppComponent) {
        return <AppComponent />;
      }
    }
    
    // Debug logging to help troubleshoot
    console.log('Sample app not found:', {
      sampleAppKey,
      availableApps: sampleApps.map(app => ({
        name: app.name,
        id: app.id,
        uiKey: app.name.replace(/\s+/g, '') + 'App'
      }))
    });
    
    // Fallback
    return renderScreenComponent('HomeScreen');
  };

  // Generic template renderer
  const renderTemplate = (templateKey: string) => {
    const templateId = getTemplateIdFromKey(templateKey);
    
    if (templateId) {
      const templateConfig = getTemplateConfig(templateId);
      const TemplateComponent = getTemplateComponent(templateId);
      
      if (TemplateComponent && templateConfig) {
        return (
          <View style={styles.templateContainer}>
            <View style={styles.templateHeader}>
              <Text style={styles.templateTitle}>
                {templateConfig.icon} {templateConfig.name}
              </Text>
              <Text style={styles.templateDescription}>
                {templateConfig.description}
              </Text>
            </View>
            <View style={styles.templateContent}>
              <TemplateComponent {...(templateConfig.defaultProps || {})} />
            </View>
          </View>
        );
      }
    }
    
    // Fallback to templates screen from registry if template not found
    const templatesScreenComponent = getScreenComponent('templates-screen');
    if (templatesScreenComponent) {
      const TemplatesComponent = templatesScreenComponent;
      return <TemplatesComponent onAppLaunch={handleAppLaunch} />;
    }
    
    // Ultimate fallback
    return (
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderTitle}>Templates not available</Text>
      </View>
    );
  };

  // Main content renderer with generic logic
  const renderMainContent = () => {
    // If an app is active, show it in the web container
    if (activeApp) {
      return (
        <WebAppContainer
          isVisible={true}
          onClose={handleAppClose}
          appName={activeApp.name}
          appIcon={activeApp.icon}>
          {renderAppContent(activeApp.id)}
        </WebAppContainer>
      );
    }

    // Screens mode rendering
    if (selectedScreen) {
      return renderScreenComponent(selectedScreen);
    }

    // Default tab-based rendering
    const defaultScreen = getScreenIdForTab(activeTab);
    if (defaultScreen) {
      return renderScreenComponent(defaultScreen);
    }

    // Final fallback
    return renderScreenComponent('HomeScreen');
  };



  return (
    <ThemeProvider>
      <CartProvider>
        <View style={styles.container}>
          <Suspense fallback={<LoadingSpinner />}>
            <View style={styles.content}>
              {renderMainContent()}
            </View>
            
            {/* Show bottom navigation for screens mode, but hide when app is active */}
            {!activeApp && (
              <BottomNavigation 
                activeTab={activeTab} 
                onTabPress={handleTabPress}
              />
            )}
          </Suspense>
        </View>
      </CartProvider>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
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
    padding: 40,
  },
  placeholderTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  templateContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  templateHeader: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  templateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  templateContent: {
    flex: 1,
  },
});

export default MobileApp; 