import React from 'react';
import {View, StyleSheet} from 'react-native';
import {usePreview} from '../context/PreviewContext';

// Import mobile screens
import {HomeScreen, SettingsScreen, TemplateIndexScreen} from '@mobile/screens';

const MobileScreens: React.FC = () => {
  const {selectedScreen} = usePreview();

  const renderScreen = () => {
    switch (selectedScreen) {
      case 'home':
        return <HomeScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'templates':
        return <TemplateIndexScreen />;
      default:
        return <HomeScreen />;
    }
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
});

export default MobileScreens; 