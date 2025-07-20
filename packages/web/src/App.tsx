import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import MobilePreview from './components/MobilePreview';
import PreviewNavigation from './components/PreviewNavigation';
import {PreviewProvider} from './context/PreviewContext';

const App: React.FC = () => {
  return (
    <PreviewProvider>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Branded44 Mobile Preview</Text>
          <Text style={styles.subtitle}>
            Preview your React Native mobile screens in the browser
          </Text>
        </View>
        
        <View style={styles.content}>
          <PreviewNavigation />
          <MobilePreview />
        </View>
      </View>
    </PreviewProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    padding: 24,
    gap: 24,
  },
});

export default App; 