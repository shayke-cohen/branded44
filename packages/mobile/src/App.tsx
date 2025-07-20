import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {ThemeProvider, CartProvider} from './context';
import {TemplateIndexScreen} from './screens';
import {BottomNavigation} from './components';
import {
  getNavTabs,
  getScreenIdForTab,
  getScreenComponent,
} from './screen-templates';

const AppContent = () => {
  // Get first tab from unified registry as default
  const navTabs = getNavTabs();
  const [activeTab, setActiveTab] = useState<string>(navTabs[0]?.id || 'home-tab');

  const renderScreen = () => {
    // Special handling for TemplateIndexScreen
    if (activeTab === 'templates-tab') {
      return <TemplateIndexScreen />;
    }

    // Get screen ID for the current tab
    const screenId = getScreenIdForTab(activeTab);
    if (!screenId) {
      // Fallback to first available screen
      const firstTab = navTabs[0];
      const fallbackScreenId = firstTab ? getScreenIdForTab(firstTab.id) : null;
      if (fallbackScreenId) {
        const FallbackComponent = getScreenComponent(fallbackScreenId);
        return FallbackComponent ? <FallbackComponent /> : null;
      }
      return null;
    }

    // Get and render the screen component
    const ScreenComponent = getScreenComponent(screenId);
    return ScreenComponent ? <ScreenComponent /> : null;
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabPress={(tab: string) => setActiveTab(tab)}
      />
    </View>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;