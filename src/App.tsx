import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {ThemeProvider, CartProvider} from './context';
import {HomeScreen, SettingsScreen, TemplateIndexScreen} from './screens';
import {BottomNavigation} from './components';

type AppScreen = 'home' | 'templates' | 'settings';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState<AppScreen>('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'templates':
        return <TemplateIndexScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabPress={(tab: string) => setActiveTab(tab as AppScreen)}
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