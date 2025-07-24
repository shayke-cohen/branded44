import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import MobilePreview from './components/MobilePreview';
import PreviewNavigation from './components/PreviewNavigation';
import PromptGenerator from './components/PromptGenerator';
import {PreviewProvider} from './context/PreviewContext';
import {MemberProvider} from './context/WebMemberContext';

// Initialize self-registering screens for web preview
import './utils/initializeScreens';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'preview' | 'generate'>('preview');

  return (
    <PreviewProvider>
      <MemberProvider>
        <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Branded44 Mobile Development</Text>
          <Text style={styles.subtitle}>
            Preview React Native screens and generate Claude Code prompts
          </Text>
          
          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'preview' ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab('preview')}>
              📱 Preview Screens
            </button>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'generate' ? styles.activeTab : {})
              }}
              onClick={() => setActiveTab('generate')}>
              🤖 Generate Prompts
            </button>
          </View>
        </View>
        
        <View style={styles.content}>
          {activeTab === 'preview' ? (
            <>
              <PreviewNavigation />
              <MobilePreview />
            </>
          ) : (
            <View style={styles.promptSection}>
              <PromptGenerator />
            </View>
          )}
        </View>
      </View>
      </MemberProvider>
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
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTab: {
    backgroundColor: '#007AFF',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    padding: 24,
    gap: 24,
  },
  promptSection: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflow: 'auto',
  },
});

export default App; 