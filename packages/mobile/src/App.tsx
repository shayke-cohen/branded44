console.log('📱 [DEBUG] Starting App.tsx imports...');

import React, {useState} from 'react';
console.log('📱 [DEBUG] React imported successfully');

import {StyleSheet, View} from 'react-native';
console.log('📱 [DEBUG] React Native components imported successfully');

import {ThemeProvider, CartProvider} from './context';
import {WixCartProvider} from './context/WixCartContext';
console.log('📱 [DEBUG] Context providers imported successfully');

import {BottomNavigation} from './components';
console.log('📱 [DEBUG] BottomNavigation imported successfully');

import {
  getNavTabs,
  getScreenIdForTab,
  getScreenComponent,
} from './screen-templates/templateConfig';
console.log('📱 [DEBUG] Template config imported successfully');

// Import screens to trigger registration
import './config/importScreens';
console.log('📱 [DEBUG] Screen imports completed successfully');

const AppContent = () => {
  console.log('📱 [DEBUG] AppContent component rendering...');
  
  // Get first tab from unified registry as default
  const navTabs = getNavTabs();
  const [activeTab, setActiveTab] = useState<string>(navTabs[0]?.id || 'home-tab');

  const renderScreen = () => {
    console.log('📱 [DEBUG] Rendering screen for tab:', activeTab);
    // Generic screen rendering using registry - no special cases!
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

    // Get and render the screen component from registry
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
  console.log('📱 [DEBUG] App component rendering...');
  return (
    <ThemeProvider>
      <CartProvider>
        <WixCartProvider>
          <AppContent />
        </WixCartProvider>
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