import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import MobilePreview from './components/MobilePreview';
import PreviewNavigation from './components/PreviewNavigation';
import PromptGenerator from './components/PromptGenerator';
import {PreviewProvider} from './context/PreviewContext';
import {MemberProvider, useMember} from './context/WebMemberContext';

// Initialize self-registering screens for web preview
import './utils/initializeScreens';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'preview' | 'generate'>('preview');
  const { visitorMode, toggleVisitorMode, isLoggedIn, member } = useMember();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Branded44 Mobile Development</Text>
        <Text style={styles.subtitle}>
          Preview React Native screens and generate Claude Code prompts
        </Text>
        
        {/* Member/Visitor Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {visitorMode ? '👤 Visitor Mode' : isLoggedIn ? `👤 Logged in as ${member?.email?.address}` : '👤 Guest'}
          </Text>
          <button
            style={styles.toggleButton}
            onClick={toggleVisitorMode}>
            {visitorMode ? 'Switch to Member Mode' : 'Switch to Visitor Mode'}
          </button>
          <button
            style={{...styles.toggleButton, backgroundColor: '#dc3545'}}
            onClick={() => {
              console.log('🔍 [WEB] Running booking diagnostics...');
              console.log('🔍 [WEB] Check browser console for detailed diagnostic information');
            }}>
            🔍 Diagnose 403 Error
          </button>
        </View>
        
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
  );
};

const App: React.FC = () => {
  return (
    <PreviewProvider>
      <MemberProvider>
        <AppContent />
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  statusText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#6c757d',
    border: 'none',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
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