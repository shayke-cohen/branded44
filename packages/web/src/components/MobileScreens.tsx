import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {usePreview} from '../context/PreviewContext';

// Import registry to get screens dynamically
import {getScreens, getScreenComponent} from '@mobile/screen-templates/templateConfig';

const MobileScreens: React.FC = () => {
  const {selectedScreen} = usePreview();

  const renderScreen = () => {
    // Get all screens from registry - completely generic!
    const screens = getScreens();
    
    // Find the screen by ID or name
    const screenConfig = screens.find(screen => 
      screen.id === selectedScreen || 
      screen.name.toLowerCase() === selectedScreen ||
      screen.componentKey === selectedScreen
    );
    
    if (screenConfig) {
      // Get component dynamically from registry
      const ScreenComponent = getScreenComponent(screenConfig.id);
      if (ScreenComponent) {
        return <ScreenComponent />;
      }
    }
    
    // Fallback to first available screen
    const firstScreen = screens[0];
    if (firstScreen) {
      const FallbackComponent = getScreenComponent(firstScreen.id);
      if (FallbackComponent) {
        return <FallbackComponent />;
      }
    }
    
    // Ultimate fallback
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>No screens available</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fallbackText: {
    fontSize: 16,
    color: '#666',
  },
});

export default MobileScreens; 