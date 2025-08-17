import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { sessionBundleLoader } from '../services/SessionBundleLoader';

interface BundleStatus {
  connected: boolean;
  sessionId: string | null;
  currentBundle: any | null;
  status: 'idle' | 'building' | 'loading' | 'ready' | 'error';
  message: string;
  autoReload: boolean;
}

/**
 * Development component for managing session bundle loading
 * Shows connection status, bundle info, and manual controls
 */
export const SessionBundleManager: React.FC = () => {
  const [status, setStatus] = useState<BundleStatus>({
    connected: false,
    sessionId: null,
    currentBundle: null,
    status: 'idle',
    message: 'Not initialized',
    autoReload: true
  });

  useEffect(() => {
    initializeBundleLoader();
    
    return () => {
      // Cleanup listeners when component unmounts
      sessionBundleLoader.off('connected', handleConnected);
      sessionBundleLoader.off('disconnected', handleDisconnected);
      sessionBundleLoader.off('bundle-ready', handleBundleReady);
      sessionBundleLoader.off('bundle-building', handleBundleBuilding);
      sessionBundleLoader.off('bundle-loading', handleBundleLoading);
      sessionBundleLoader.off('bundle-loaded', handleBundleLoaded);
      sessionBundleLoader.off('bundle-error', handleBundleError);
    };
  }, []);

  const initializeBundleLoader = async () => {
    try {
      // Set up event listeners
      sessionBundleLoader.on('connected', handleConnected);
      sessionBundleLoader.on('disconnected', handleDisconnected);
      sessionBundleLoader.on('bundle-ready', handleBundleReady);
      sessionBundleLoader.on('bundle-building', handleBundleBuilding);
      sessionBundleLoader.on('bundle-loading', handleBundleLoading);
      sessionBundleLoader.on('bundle-loaded', handleBundleLoaded);
      sessionBundleLoader.on('bundle-error', handleBundleError);
      sessionBundleLoader.on('bundle-available', handleBundleAvailable);
      
      // Initialize the loader
      await sessionBundleLoader.initialize();
      
      // Update status
      const currentBundle = sessionBundleLoader.getCurrentBundle();
      setStatus(prev => ({
        ...prev,
        currentBundle,
        status: currentBundle ? 'ready' : 'idle',
        message: currentBundle ? 'Bundle available' : 'No bundle loaded'
      }));
      
    } catch (error) {
      console.error('Failed to initialize bundle loader:', error);
      setStatus(prev => ({
        ...prev,
        status: 'error',
        message: `Initialization failed: ${error.message}`
      }));
    }
  };

  // Event handlers
  const handleConnected = () => {
    setStatus(prev => ({
      ...prev,
      connected: true,
      message: 'Connected to server'
    }));
  };

  const handleDisconnected = () => {
    setStatus(prev => ({
      ...prev,
      connected: false,
      message: 'Disconnected from server'
    }));
  };

  const handleBundleReady = (bundleInfo: any) => {
    setStatus(prev => ({
      ...prev,
      status: 'ready',
      currentBundle: bundleInfo,
      message: `Bundle ready (${bundleInfo.bundleSize} bytes)`
    }));
  };

  const handleBundleBuilding = () => {
    setStatus(prev => ({
      ...prev,
      status: 'building',
      message: 'Building bundle...'
    }));
  };

  const handleBundleLoading = () => {
    setStatus(prev => ({
      ...prev,
      status: 'loading',
      message: 'Loading bundle...'
    }));
  };

  const handleBundleLoaded = (data: any) => {
    setStatus(prev => ({
      ...prev,
      status: 'ready',
      message: `Bundle loaded successfully (${data.bundleCode.length} chars)`
    }));
    
    Alert.alert(
      'Bundle Loaded',
      'New bundle has been loaded successfully!',
      [{ text: 'OK' }]
    );
  };

  const handleBundleAvailable = (bundleInfo: any) => {
    setStatus(prev => ({
      ...prev,
      currentBundle: bundleInfo,
      status: 'ready',
      message: 'Bundle available for loading'
    }));
  };

  const handleBundleError = (error: any) => {
    setStatus(prev => ({
      ...prev,
      status: 'error',
      message: `Error: ${error.error}`
    }));
  };

  // Manual actions
  const handleSetSessionId = () => {
    Alert.prompt(
      'Set Session ID',
      'Enter the session ID from the visual editor:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set',
          onPress: async (sessionId) => {
            if (sessionId) {
              try {
                await sessionBundleLoader.setSessionId(sessionId);
                setStatus(prev => ({
                  ...prev,
                  sessionId,
                  message: `Session ID set: ${sessionId}`
                }));
              } catch (error) {
                Alert.alert('Error', `Failed to set session ID: ${error.message}`);
              }
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleReloadBundle = async () => {
    try {
      await sessionBundleLoader.reloadBundle();
    } catch (error) {
      Alert.alert('Error', `Failed to reload bundle: ${error.message}`);
    }
  };

  const handleToggleAutoReload = () => {
    const newAutoReload = !status.autoReload;
    sessionBundleLoader.setAutoReload(newAutoReload);
    setStatus(prev => ({
      ...prev,
      autoReload: newAutoReload
    }));
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'ready': return '#4CAF50';
      case 'building':
      case 'loading': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'ready': return '✅';
      case 'building': return '🔨';
      case 'loading': return '📥';
      case 'error': return '❌';
      default: return '⚪';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Session Bundle Manager</Text>
      
      <ScrollView style={styles.content}>
        {/* Connection Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Server:</Text>
            <Text style={[styles.statusValue, { color: status.connected ? '#4CAF50' : '#F44336' }]}>
              {status.connected ? '🟢 Connected' : '🔴 Disconnected'}
            </Text>
          </View>
        </View>

        {/* Bundle Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bundle Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={[styles.statusValue, { color: getStatusColor() }]}>
              {getStatusIcon()} {status.status.toUpperCase()}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Message:</Text>
            <Text style={styles.statusValue}>{status.message}</Text>
          </View>
        </View>

        {/* Session Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Info</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Session ID:</Text>
            <Text style={styles.statusValue}>
              {status.sessionId || 'Not set'}
            </Text>
          </View>
          {status.currentBundle && (
            <>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Platform:</Text>
                <Text style={styles.statusValue}>{status.currentBundle.platform}</Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Bundle Size:</Text>
                <Text style={styles.statusValue}>
                  {status.currentBundle.bundleSize ? 
                    `${Math.round(status.currentBundle.bundleSize / 1024)} KB` : 
                    'Unknown'
                  }
                </Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Timestamp:</Text>
                <Text style={styles.statusValue}>
                  {new Date(status.currentBundle.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Auto Reload:</Text>
            <TouchableOpacity onPress={handleToggleAutoReload}>
              <Text style={[styles.statusValue, { color: status.autoReload ? '#4CAF50' : '#F44336' }]}>
                {status.autoReload ? '🟢 Enabled' : '🔴 Disabled'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={handleSetSessionId}
        >
          <Text style={styles.buttonText}>Set Session ID</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton, 
                  !status.currentBundle && styles.buttonDisabled]} 
          onPress={handleReloadBundle}
          disabled={!status.currentBundle}
        >
          <Text style={[styles.buttonText, !status.currentBundle && styles.buttonTextDisabled]}>
            Reload Bundle
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  statusValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  secondaryButton: {
    backgroundColor: '#4CAF50',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonTextDisabled: {
    color: '#999',
  },
});

export default SessionBundleManager;
