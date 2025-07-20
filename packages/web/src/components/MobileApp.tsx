import React, {useState, Suspense, useCallback} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {ThemeProvider, CartProvider} from '@mobile/context';
import WebAppContainer from './WebAppContainer';
import WebTemplateIndexScreen from './WebTemplateIndexScreen';

// Import mobile screens
import {HomeScreen, SettingsScreen} from '@mobile/screens';
import {BottomNavigation} from '@mobile/components';

// Import sample apps for modal display  
import {TodoApp} from '@mobile/sample-apps/TodoApp';
import {CalculatorApp} from '@mobile/sample-apps/CalculatorApp';
import {WeatherApp} from '@mobile/sample-apps/WeatherApp';
import {NotesApp} from '@mobile/sample-apps/NotesApp';

type AppScreen = 'home' | 'templates' | 'settings';

interface MobileAppProps {
  previewMode: 'screens' | 'sample-apps' | 'templates';
  selectedScreen?: string;
  selectedSampleApp?: string;
  selectedTemplate?: string;
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
  selectedScreen,
  selectedSampleApp,
  selectedTemplate
}) => {
  const [activeTab, setActiveTab] = useState<AppScreen>('home');
  const [activeApp, setActiveApp] = useState<AppState | null>(null);

  // Handle tab press to switch between main screens
  const handleTabPress = useCallback((tab: string) => {
    setActiveTab(tab as AppScreen);
    // Close any open apps when switching tabs
    setActiveApp(null);
  }, []);

  // Handle app launch from template gallery
  const handleAppLaunch = useCallback((app: AppState) => {
    setActiveApp(app);
  }, []);

  // Handle app close
  const handleAppClose = useCallback(() => {
    setActiveApp(null);
  }, []);

  // Render app content based on app ID
  const renderAppContent = (appId: string) => {
    switch (appId) {
      case 'todo-app':
        return <TodoApp />;
      case 'calculator-app':
        return <CalculatorApp />;
      case 'weather-app':
        return <WeatherApp />;
      case 'notes-app':
        return <NotesApp />;
      default:
        return (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderTitle}>🚀 {appId}</Text>
            <Text style={styles.placeholderText}>App launching soon...</Text>
          </View>
        );
    }
  };

  // Render the appropriate screen based on preview mode and active tab
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

    // If we're in sample-apps mode, show the selected app directly
    if (previewMode === 'sample-apps' && selectedSampleApp) {
      switch (selectedSampleApp) {
        case 'TodoApp':
          return <TodoApp />;
        case 'CalculatorApp':
          return <CalculatorApp />;
        case 'WeatherApp':
          return <WeatherApp />;
        case 'NotesApp':
          return <NotesApp />;
        default:
          return <HomeScreen />;
      }
    }

    // For other modes, use the tab navigation
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'templates':
        return <WebTemplateIndexScreen onAppLaunch={handleAppLaunch} />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <ThemeProvider>
      <CartProvider>
        <View style={styles.container}>
          <Suspense fallback={<LoadingSpinner />}>
            <View style={styles.content}>
              {renderMainContent()}
            </View>
            
            {/* Show bottom navigation for screens and templates modes, but hide when app is active */}
            {!activeApp && (previewMode === 'screens' || previewMode === 'templates') && (
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
});

export default MobileApp; 