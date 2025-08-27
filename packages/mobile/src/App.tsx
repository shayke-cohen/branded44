console.log('📱 [DEBUG] Starting App.tsx imports...');

import React, {useState, useEffect} from 'react';
console.log('📱 [DEBUG] React imported successfully');

import {StyleSheet, View} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
console.log('📱 [DEBUG] React Native components imported successfully');

import {ThemeProvider, CartProvider, MemberProvider, AlertProvider, ProductCacheProvider} from './context';
import {WixCartProvider} from './context/WixCartContext';
console.log('📱 [DEBUG] Context providers imported successfully');

import {BottomNavigation} from './components';
console.log('📱 [DEBUG] BottomNavigation imported successfully');

import {
  getNavTabs,
  getScreenIdForTab,
  getScreenComponent,
} from './screen-templates/templateConfig';
console.log('📱 [DEBUG] Screen navigation config imported successfully');

// Import screens to trigger registration
import './config/importScreens';
console.log('📱 [DEBUG] Screen imports completed successfully');

// Hook to access external navigation control (if provided)
// This will be provided by the visual editor's MobileAppWithOverrides component
const useNavigationControl = (): { externalActiveTabId: string | null } | null => {
  // Use state to trigger re-renders when the global control changes
  const [control, setControl] = useState<{ externalActiveTabId: string | null } | null>(null);
  
  useEffect(() => {
    const checkControl = () => {
      // Check if we're in a web environment (React Native Web in visual editor)
      if (typeof globalThis !== 'undefined' && 'window' in globalThis) {
        const windowObj = (globalThis as any).window;
        if (windowObj && windowObj.__VISUAL_EDITOR_NAVIGATION_CONTROL__) {
          const globalControl = windowObj.__VISUAL_EDITOR_NAVIGATION_CONTROL__;
          
          // Only update if the value has actually changed
          setControl(prevControl => {
            if (!prevControl && !globalControl.externalActiveTabId) {
              // Both are null/undefined - no change needed
              return prevControl;
            }
            if (prevControl?.externalActiveTabId !== globalControl.externalActiveTabId) {
              console.log('🌐 [useNavigationControl] Navigation control changed:', globalControl);
              return globalControl;
            }
            // No change - return previous value
            return prevControl;
          });
          return;
        }
      }
      
      // Only set to null if it's not already null
      setControl(prevControl => {
        if (prevControl !== null) {
          console.log('🌐 [useNavigationControl] Navigation control cleared');
          return null;
        }
        return prevControl;
      });
    };
    
    // Check initially
    checkControl();
    
    // Check periodically in case it gets set later (reduced frequency)
    const interval = setInterval(checkControl, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return control;
};

const AppContent = () => {
  console.log('📱 [DEBUG] AppContent component rendering...');
  
  // Get first tab from unified registry as default
  const navTabs = getNavTabs();
  const [activeTab, setActiveTab] = useState<string>(navTabs[0]?.id || 'home-tab');
  
  // Check for external navigation control from visual editor
  const navigationControl = useNavigationControl();
  
  // Update active tab when external control changes
  useEffect(() => {
    console.log('🔍 [APP] Navigation control check:', navigationControl);
    if (navigationControl?.externalActiveTabId) {
      console.log('🎯 [APP] External navigation control detected:', navigationControl.externalActiveTabId);
      console.log('🎯 [APP] Changing activeTab from', activeTab, 'to', navigationControl.externalActiveTabId);
      setActiveTab(navigationControl.externalActiveTabId);
    }
  }, [navigationControl, navigationControl?.externalActiveTabId, activeTab]);

  const renderScreen = () => {
    console.log('📱 [DEBUG] Rendering screen for tab:', activeTab);
    // Render actual app screens (NOT templates) - screens self-register via importScreens.ts
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

    // Get and render the actual screen component (e.g., HomeNavigation, ProductsNavigation, etc.)
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
    <SafeAreaProvider>
      <ThemeProvider>
        <AlertProvider>
          <CartProvider>
            <ProductCacheProvider maxCacheSize={50} maxCacheAge={20 * 60 * 1000}>
              <MemberProvider>
                <WixCartProvider>
                  <AppContent />
                </WixCartProvider>
              </MemberProvider>
            </ProductCacheProvider>
          </CartProvider>
        </AlertProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;