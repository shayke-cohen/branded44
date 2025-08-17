import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  TextInput,
  Modal,
  FlatList
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { sessionBundleLoader } from '../services/SessionBundleLoader';

interface SessionInfo {
  sessionId: string;
  startTime: number;
  age: number;
  workspacePath: string;
}

interface BundleInfo {
  sessionId: string;
  platform: string;
  bundleUrl: string;
  bundleSize?: number;
  timestamp: number;
  // Enhanced metadata
  downloadedAt?: number;
  fileSize?: number;
  bundleHash?: string;
  version?: string;
  workspacePath?: string;
}

interface SessionBundleSectionProps {
  // Optional callback when session changes
  onSessionChange?: (sessionId: string | null) => void;
}

/**
 * Settings section for managing session bundle loading
 * Allows users to connect to visual editor sessions and load bundles
 */
export const SessionBundleSection: React.FC<SessionBundleSectionProps> = ({ 
  onSessionChange 
}) => {
  const { theme } = useTheme();
  
  // State
  const [isEnabled, setIsEnabled] = useState(false);
  const [connected, setConnected] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentBundle, setCurrentBundle] = useState<BundleInfo | null>(null);
  const [bundleHistory, setBundleHistory] = useState<BundleInfo[]>([]);
  const [status, setStatus] = useState<string>('Disabled');
  const [autoReload, setAutoReload] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showBundleDetails, setShowBundleDetails] = useState(false);
  const [lastDownloadStats, setLastDownloadStats] = useState<any>(null);
  
  // Modal states
  const [showSessionSelector, setShowSessionSelector] = useState(false);
  const [availableSessions, setAvailableSessions] = useState<SessionInfo[]>([]);
  const [sessionInputModalVisible, setSessionInputModalVisible] = useState(false);
  const [sessionInput, setSessionInput] = useState('');
  
  // Server config
  const [serverUrl, setServerUrl] = useState('http://localhost:3001');
  const [showServerConfig, setShowServerConfig] = useState(false);

  useEffect(() => {
    if (isEnabled) {
      initializeBundleLoader();
    } else {
      cleanupBundleLoader();
    }
    
    return () => {
      cleanupBundleLoader();
    };
  }, [isEnabled]);

  const initializeBundleLoader = async () => {
    try {
      setLoading(true);
      setStatus('Initializing...');

      // Set up event listeners
      sessionBundleLoader.on('connected', handleConnected);
      sessionBundleLoader.on('disconnected', handleDisconnected);
      sessionBundleLoader.on('bundle-ready', handleBundleReady);
      sessionBundleLoader.on('bundle-building', handleBundleBuilding);
      sessionBundleLoader.on('bundle-loading', handleBundleLoading);
      sessionBundleLoader.on('bundle-loaded', handleBundleLoaded);
      sessionBundleLoader.on('bundle-error', handleBundleError);
      sessionBundleLoader.on('bundle-available', handleBundleAvailable);
      sessionBundleLoader.on('max-reconnect-attempts', handleMaxReconnectAttempts);

      // Initialize with current settings
      await sessionBundleLoader.initialize();
      sessionBundleLoader.setAutoReload(autoReload);

      // Get current state
      const bundle = sessionBundleLoader.getCurrentBundle();
      setCurrentBundle(bundle);
      setCurrentSessionId(bundle?.sessionId || null);
      
      // Load bundle history
      const history = await sessionBundleLoader.getBundleHistory();
      setBundleHistory(history);
      
      setStatus(bundle ? 'Bundle available' : 'No session selected');
      
    } catch (error) {
      console.error('Failed to initialize session bundle loader:', error);
      setStatus(`Error: ${error.message}`);
      Alert.alert('Initialization Error', `Failed to initialize: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const cleanupBundleLoader = () => {
    // Remove event listeners
    sessionBundleLoader.off('connected', handleConnected);
    sessionBundleLoader.off('disconnected', handleDisconnected);
    sessionBundleLoader.off('bundle-ready', handleBundleReady);
    sessionBundleLoader.off('bundle-building', handleBundleBuilding);
    sessionBundleLoader.off('bundle-loading', handleBundleLoading);
    sessionBundleLoader.off('bundle-loaded', handleBundleLoaded);
    sessionBundleLoader.off('bundle-error', handleBundleError);
    sessionBundleLoader.off('bundle-available', handleBundleAvailable);
    sessionBundleLoader.off('max-reconnect-attempts', handleMaxReconnectAttempts);
    
    setConnected(false);
    setStatus('Disabled');
  };

  // Event handlers
  const handleConnected = () => {
    setConnected(true);
    setStatus('Connected to server');
  };

  const handleDisconnected = () => {
    setConnected(false);
    setStatus('Disconnected from server');
  };

  const handleBundleReady = (bundleInfo: BundleInfo) => {
    setCurrentBundle(bundleInfo);
    setStatus(`Bundle ready (${bundleInfo.bundleSize ? Math.round(bundleInfo.bundleSize / 1024) + ' KB' : 'unknown size'})`);
  };

  const handleBundleBuilding = () => {
    setStatus('Building bundle...');
  };

  const handleBundleLoading = () => {
    setStatus('Loading bundle...');
  };

  const handleBundleLoaded = async (data: any) => {
    const { bundleInfo, downloadStats } = data;
    setCurrentBundle(bundleInfo);
    setLastDownloadStats(downloadStats);
    
    // Refresh bundle history
    const history = await sessionBundleLoader.getBundleHistory();
    setBundleHistory(history);
    
    const sizeText = downloadStats?.fileSize ? `${Math.round(downloadStats.fileSize / 1024)}KB` : 'unknown size';
    setStatus(`Bundle loaded successfully! (${sizeText})`);
    
    Alert.alert(
      'Bundle Loaded',
      `New ${downloadStats?.platform || 'mobile'} code has been loaded!\n\nSize: ${sizeText}\nPlatform: ${downloadStats?.platform || 'unknown'}`,
      [{ text: 'Great!' }]
    );
  };

  const handleBundleAvailable = (bundleInfo: BundleInfo) => {
    setCurrentBundle(bundleInfo);
    setStatus('Bundle available for loading');
  };

  const handleBundleError = (error: any) => {
    setStatus(`Error: ${error.error}`);
    Alert.alert('Bundle Error', error.error);
  };

  const handleMaxReconnectAttempts = () => {
    setConnected(false);
    setStatus('Connection failed - max retries reached');
    Alert.alert(
      'Connection Failed',
      'Unable to connect to the server after multiple attempts. Please check your server is running and try again.',
      [
        { text: 'OK' },
        { 
          text: 'Retry', 
          onPress: async () => {
            setLoading(true);
            try {
              await sessionBundleLoader.initialize();
            } catch (error) {
              console.error('Retry failed:', error);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Actions
  const handleToggleEnabled = () => {
    setIsEnabled(!isEnabled);
  };

  const handleToggleAutoReload = () => {
    const newAutoReload = !autoReload;
    setAutoReload(newAutoReload);
    if (isEnabled) {
      sessionBundleLoader.setAutoReload(newAutoReload);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    try {
      setLoading(true);
      await sessionBundleLoader.setSessionId(sessionId);
      setCurrentSessionId(sessionId);
      onSessionChange?.(sessionId);
      setShowSessionSelector(false);
      setStatus(`Connected to session: ${sessionId.substring(0, 8)}...`);
    } catch (error) {
      Alert.alert('Error', `Failed to select session: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSessionInput = async () => {
    if (!sessionInput.trim()) {
      Alert.alert('Error', 'Please enter a session ID');
      return;
    }
    
    await handleSelectSession(sessionInput.trim());
    setSessionInput('');
    setSessionInputModalVisible(false);
  };

  const handleLoadAvailableSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${serverUrl}/api/sessions`);
      const data = await response.json();
      
      if (data.success) {
        setAvailableSessions(data.sessions || []);
        setShowSessionSelector(true);
      } else {
        Alert.alert('Error', 'Failed to load sessions');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to connect to server: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReloadBundle = async () => {
    try {
      setLoading(true);
      await sessionBundleLoader.reloadBundle();
    } catch (error) {
      Alert.alert('Error', `Failed to reload bundle: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!isEnabled) return theme.colors.textSecondary;
    if (connected && currentBundle) return '#4CAF50';
    if (connected) return '#FF9800';
    if (status.includes('Error')) return '#F44336';
    return theme.colors.textSecondary;
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 15,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
    },
    optionDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    statusText: {
      fontSize: 14,
      color: getStatusColor(),
      fontWeight: '500',
    },
    switch: {
      width: 50,
      height: 30,
      borderRadius: 15,
      backgroundColor: isEnabled ? theme.colors.primary : theme.colors.border,
      justifyContent: 'center',
      alignItems: isEnabled ? 'flex-end' : 'flex-start',
      paddingHorizontal: 3,
    },
    switchThumb: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#fff',
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      marginVertical: 4,
    },
    buttonSecondary: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    buttonDisabled: {
      backgroundColor: theme.colors.border,
    },
    buttonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    buttonTextSecondary: {
      color: theme.colors.text,
    },
    buttonTextDisabled: {
      color: theme.colors.textSecondary,
    },
    sessionInfo: {
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
    },
    sessionInfoText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      width: '90%',
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    sessionItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    sessionId: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    sessionAge: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      marginBottom: 16,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    modalButton: {
      flex: 1,
      marginHorizontal: 4,
    },
    // Bundle details styles
    bundleDetailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    bundleDetailLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
      flex: 1,
    },
    bundleDetailValue: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      flex: 1,
      textAlign: 'right',
      fontFamily: 'monospace',
    },
    // History styles
    historyItem: {
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    historyPlatform: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.colors.primary,
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
    },
    historyTime: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    historySessionId: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontFamily: 'monospace',
      marginBottom: 2,
    },
    historySize: {
      fontSize: 11,
      color: theme.colors.text,
      fontWeight: '500',
    },
    historyMore: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
      fontStyle: 'italic',
    },
  });

  const formatAge = (age: number) => {
    const minutes = Math.floor(age / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    return `${minutes}m ago`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>🔧 Visual Editor Session</Text>
      
      {/* Main Toggle */}
      <View style={styles.card}>
        <TouchableOpacity style={styles.option} onPress={handleToggleEnabled}>
          <View style={{ flex: 1 }}>
            <Text style={styles.optionLabel}>Enable Session Bundles</Text>
            <Text style={styles.optionDescription}>
              Load code from visual editor sessions
            </Text>
          </View>
          <TouchableOpacity style={styles.switch} onPress={handleToggleEnabled}>
            <View style={styles.switchThumb} />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {isEnabled && (
        <>
          {/* Status Card */}
          <View style={styles.card}>
            <View style={styles.option}>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>Connection Status</Text>
                <Text style={styles.statusText}>
                  {loading ? '⏳ ' : connected ? '🟢 ' : '🔴 '}
                  {loading ? 'Loading...' : status}
                </Text>
              </View>
              {loading && <ActivityIndicator size="small" color={theme.colors.primary} />}
            </View>

            {currentSessionId && (
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionInfoText}>
                  Session: {currentSessionId}
                </Text>
                {currentBundle && (
                  <Text style={styles.sessionInfoText}>
                    Bundle: {currentBundle.platform} • {new Date(currentBundle.timestamp).toLocaleTimeString()}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Session Selection */}
          <View style={styles.card}>
            <Text style={styles.optionLabel}>Session Selection</Text>
            <Text style={styles.optionDescription}>Choose a visual editor session to connect to</Text>
            
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary, { marginTop: 12 }]}
              onPress={handleLoadAvailableSessions}
              disabled={loading}
            >
              <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                📋 Browse Available Sessions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => setSessionInputModalVisible(true)}
              disabled={loading}
            >
              <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                ✏️ Enter Session ID Manually
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bundle Management */}
          <View style={styles.card}>
            <View style={styles.option}>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>Auto Reload</Text>
                <Text style={styles.optionDescription}>
                  Automatically load new bundles when ready
                </Text>
              </View>
              <TouchableOpacity style={styles.switch} onPress={handleToggleAutoReload}>
                <View style={styles.switchThumb} />
              </TouchableOpacity>
            </View>

            {currentBundle && (
              <TouchableOpacity
                style={[styles.button, { marginTop: 12 }]}
                onPress={handleReloadBundle}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  🔄 Reload Current Bundle
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Bundle Information */}
          {currentBundle && (
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.option}
                onPress={() => setShowBundleDetails(!showBundleDetails)}
              >
                <Text style={styles.optionLabel}>📦 Current Bundle Details</Text>
                <Text style={styles.statusText}>
                  {showBundleDetails ? '▼' : '▶'}
                </Text>
              </TouchableOpacity>

              {showBundleDetails && (
                <View style={{ marginTop: 12 }}>
                  <View style={styles.bundleDetailRow}>
                    <Text style={styles.bundleDetailLabel}>Platform:</Text>
                    <Text style={styles.bundleDetailValue}>{currentBundle.platform}</Text>
                  </View>
                  
                  {currentBundle.fileSize && (
                    <View style={styles.bundleDetailRow}>
                      <Text style={styles.bundleDetailLabel}>Size:</Text>
                      <Text style={styles.bundleDetailValue}>
                        {Math.round(currentBundle.fileSize / 1024)}KB
                      </Text>
                    </View>
                  )}
                  
                  {currentBundle.downloadedAt && (
                    <View style={styles.bundleDetailRow}>
                      <Text style={styles.bundleDetailLabel}>Downloaded:</Text>
                      <Text style={styles.bundleDetailValue}>
                        {new Date(currentBundle.downloadedAt).toLocaleString()}
                      </Text>
                    </View>
                  )}
                  
                  {currentBundle.version && (
                    <View style={styles.bundleDetailRow}>
                      <Text style={styles.bundleDetailLabel}>Version:</Text>
                      <Text style={styles.bundleDetailValue}>{currentBundle.version}</Text>
                    </View>
                  )}
                  
                  {currentBundle.bundleHash && (
                    <View style={styles.bundleDetailRow}>
                      <Text style={styles.bundleDetailLabel}>Hash:</Text>
                      <Text style={styles.bundleDetailValue}>{currentBundle.bundleHash}</Text>
                    </View>
                  )}
                  
                  {lastDownloadStats && (
                    <View style={styles.bundleDetailRow}>
                      <Text style={styles.bundleDetailLabel}>Download Time:</Text>
                      <Text style={styles.bundleDetailValue}>{lastDownloadStats.downloadTime}ms</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Bundle History */}
          {bundleHistory.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.optionLabel}>📚 Download History ({bundleHistory.length})</Text>
              <Text style={styles.optionDescription}>Recent bundle downloads for this device</Text>
              
              {bundleHistory.slice(0, 3).map((bundle, index) => (
                <View key={`${bundle.sessionId}-${bundle.timestamp}`} style={styles.historyItem}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyPlatform}>{bundle.platform}</Text>
                    <Text style={styles.historyTime}>
                      {bundle.downloadedAt ? new Date(bundle.downloadedAt).toLocaleDateString() : 'Unknown'}
                    </Text>
                  </View>
                  <Text style={styles.historySessionId}>
                    {bundle.sessionId.substring(0, 16)}...
                  </Text>
                  {bundle.fileSize && (
                    <Text style={styles.historySize}>
                      {Math.round(bundle.fileSize / 1024)}KB
                    </Text>
                  )}
                </View>
              ))}
              
              {bundleHistory.length > 3 && (
                <Text style={styles.historyMore}>
                  +{bundleHistory.length - 3} more bundles in history
                </Text>
              )}
            </View>
          )}

          {/* Server Configuration */}
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => setShowServerConfig(!showServerConfig)}
            >
              <Text style={styles.optionLabel}>⚙️ Server Configuration</Text>
              <Text style={styles.statusText}>
                {showServerConfig ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {showServerConfig && (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.optionDescription}>Server URL:</Text>
                <TextInput
                  style={styles.input}
                  value={serverUrl}
                  onChangeText={setServerUrl}
                  placeholder="http://localhost:3001"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            )}
          </View>
        </>
      )}

      {/* Session Selector Modal */}
      <Modal
        visible={showSessionSelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSessionSelector(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Available Sessions</Text>
            
            {availableSessions.length === 0 ? (
              <Text style={styles.optionDescription}>No active sessions found</Text>
            ) : (
              <FlatList
                data={availableSessions}
                keyExtractor={(item) => item.sessionId}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.sessionItem}
                    onPress={() => handleSelectSession(item.sessionId)}
                  >
                    <Text style={styles.sessionId}>
                      {item.sessionId.substring(0, 24)}...
                    </Text>
                    <Text style={styles.sessionAge}>
                      Created {formatAge(item.age)}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary, styles.modalButton]}
                onPress={() => setShowSessionSelector(false)}
              >
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Manual Session Input Modal */}
      <Modal
        visible={sessionInputModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSessionInputModalVisible(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Session ID</Text>
            
            <TextInput
              style={styles.input}
              value={sessionInput}
              onChangeText={setSessionInput}
              placeholder="session-1234567890-abcdefgh"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary, styles.modalButton]}
                onPress={() => setSessionInputModalVisible(false)}
              >
                <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.modalButton]}
                onPress={handleManualSessionInput}
              >
                <Text style={styles.buttonText}>Connect</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SessionBundleSection;
