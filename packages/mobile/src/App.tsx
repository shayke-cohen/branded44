console.log('📱 [DEBUG] Starting App.tsx imports...');

import React, {useState, useEffect} from 'react';
console.log('📱 [DEBUG] React imported successfully');

import {StyleSheet, View, Text} from 'react-native';
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
import {globalRegistry} from './config/registry';
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
  const [renderKey, setRenderKey] = useState(0); // Force re-render key
  
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

  // Simple hot-reload listener (much simpler approach!)
  React.useEffect(() => {
    if (typeof globalThis !== 'undefined' && 'window' in globalThis) {
      const windowObj = (globalThis as any).window;
      
      // Additional check to ensure windowObj exists and has addEventListener
      if (!windowObj || typeof windowObj.addEventListener !== 'function') {
        console.log('🌐 [App] Window object or addEventListener not available in current environment');
        return;
      }

      const handleHotReload = (event: any) => {
        const { screenId, component } = event.detail;
        console.log(`🔥 [App] Hot-reloading screen: ${screenId}`);
        console.log(`📦 [App] Component received:`, typeof component);
        
        // Log BEFORE/AFTER comparison
        const beforeComponent = globalRegistry.getComponent(screenId);
        console.log(`🔍 [App] BEFORE - Component:`, !!beforeComponent, beforeComponent?.name);
        console.log(`🔍 [App] BEFORE - Component toString:`, beforeComponent?.toString?.().substring(0, 200) + '...');
        
        // Simply replace the component in registry and force re-render
        console.log(`📝 [App] Updating registry for screen: ${screenId}`);
        globalRegistry.registerComponent(screenId, component);
        
        // Log AFTER comparison  
        const afterComponent = globalRegistry.getComponent(screenId);
        console.log(`🔍 [App] AFTER - Component:`, !!afterComponent, afterComponent?.name);
        console.log(`🔍 [App] AFTER - Component toString:`, afterComponent?.toString?.().substring(0, 200) + '...');
        
        // Look for text differences in the component code
        const beforeCode = beforeComponent?.toString?.() || '';
        const afterCode = afterComponent?.toString?.() || '';
        
        // Extract text content (look for common patterns)
        const beforeTextMatches = beforeCode.match(/"[^"]*"/g) || [];
        const afterTextMatches = afterCode.match(/"[^"]*"/g) || [];
        
        console.log(`🔍 [App] BEFORE text content:`, beforeTextMatches.slice(0, 5));
        console.log(`🔍 [App] AFTER text content:`, afterTextMatches.slice(0, 5));
        console.log(`🔍 [App] Text content changed:`, JSON.stringify(beforeTextMatches) !== JSON.stringify(afterTextMatches));
        console.log(`🔍 [App] Components are same reference:`, beforeComponent === afterComponent);
        
        console.log(`🔄 [App] Forcing re-render...`);
        setRenderKey(prev => {
          console.log(`🔄 [App] Incrementing render key: ${prev} -> ${prev + 1}`);
          return prev + 1;
        }); // Force re-render with new key
        
        console.log(`✅ [App] Hot-reload complete for: ${screenId}`);
        
        // Debug: Check if the component is actually in the registry now
        const registeredComponent = globalRegistry.getComponent(screenId);
        console.log(`🔍 [App] Registry check - component for ${screenId}:`, !!registeredComponent);
        
        const entityComponent = globalRegistry.getEntityComponent(screenId);  
        console.log(`🔍 [App] Entity check - component for ${screenId}:`, !!entityComponent);
        
        // Debug: Check what componentKey the entity uses
        const entity = globalRegistry.getEntity(screenId);
        console.log(`🔍 [App] Entity componentKey for ${screenId}:`, entity?.componentKey);
        console.log(`🔍 [App] Direct component lookup with entityKey:`, !!globalRegistry.getComponent(entity?.componentKey || ''));
      };

      windowObj.addEventListener('screen-hot-reload', handleHotReload);
      return () => {
        if (windowObj && typeof windowObj.removeEventListener === 'function') {
          windowObj.removeEventListener('screen-hot-reload', handleHotReload);
        }
      };
    }
  }, []);

  const renderScreen = () => {
    console.log('📱 [DEBUG] Rendering screen for tab:', activeTab);
    // Simple: just get component from registry (hot-reload updates registry directly)
    const screenId = getScreenIdForTab(activeTab);
    console.log('📱 [DEBUG] screenId for tab:', screenId);
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

    // Simple: just get the component from registry
    const ScreenComponent = getScreenComponent(screenId);
    console.log(`🔍 [App] getScreenComponent(${screenId}) returned:`, !!ScreenComponent, ScreenComponent?.name);
    console.log(`🔍 [App] Current renderKey: ${renderKey}`);
    console.log(`🔍 [App] Component key will be: ${screenId}-${renderKey}`);
    
    // Additional debugging - check what's actually in the registry
    const directComponent = globalRegistry.getComponent(screenId);
    const entityComponent = globalRegistry.getEntityComponent(screenId);
    console.log(`🔍 [App] Direct registry lookup:`, !!directComponent, directComponent?.name);
    console.log(`🔍 [App] Entity registry lookup:`, !!entityComponent, entityComponent?.name);
    console.log(`🔍 [App] getScreenComponent === direct:`, ScreenComponent === directComponent);
    console.log(`🔍 [App] getScreenComponent === entity:`, ScreenComponent === entityComponent);
    
    if (ScreenComponent) {
      console.log(`🔍 [App] About to render component:`, ScreenComponent.name);
      console.log(`🔍 [App] Component toString preview:`, ScreenComponent.toString().substring(0, 80) + '...');
      
      // Wrap the component to detect if it's actually rendering
      const WrappedComponent = (props: any) => {
        console.log(`🎨 [App] *** COMPONENT ACTUALLY RENDERING ***:`, ScreenComponent.name);
        console.log(`🎨 [App] Component props:`, props);
        try {
          const result = <ScreenComponent {...props} />;
          console.log(`🎨 [App] Component rendered successfully:`, !!result);
          return result;
        } catch (error) {
          console.error(`🎨 [App] Component render error:`, error);
          return null;
        }
      };
      
      return <WrappedComponent key={`${screenId}-${renderKey}`} />;
    }
    
    return null;
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