import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {usePreview, ScreenType} from '../context/PreviewContext';
import {getScreens} from '@mobile/screen-templates/templateConfig';
import { generateCompleteAppPrompt, generateSingleScreenPrompt, generateUpdateExistingPrompt } from '../utils/claudePrompts';
import { httpClient } from '../utils/robustHttpClient';
import { webLogger, log } from '../utils/logger';

// Constants for local storage keys
const STORAGE_KEYS = {
  EXECUTION_LOGS: 'claude_execution_logs',
  LAST_PROMPT: 'claude_last_prompt',
  SCREEN_EXECUTION_LOGS: 'claude_screen_execution_logs',
  LAST_SCREEN_PROMPT: 'claude_last_screen_prompt',
  UPDATE_EXECUTION_LOGS: 'claude_update_execution_logs',
  LAST_UPDATE_PROMPT: 'claude_last_update_prompt',
};

// Web-safe localStorage utilities
const webStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage.getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('localStorage.setItem error:', error);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('localStorage.removeItem error:', error);
    }
  },
};

const PreviewNavigation: React.FC = () => {
  const {
    deviceFrame,
    setDeviceFrame,
    selectedScreen,
    setSelectedScreen,
  } = usePreview();

  // App generation state
  const [appDescription, setAppDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<any[]>([]);
  const [lastPrompt, setLastPrompt] = useState('');

  // Screen creation state
  const [screenName, setScreenName] = useState('');
  const [screenDescription, setScreenDescription] = useState('');
  const [screenCategory, setScreenCategory] = useState('');
  const [screenIcon, setScreenIcon] = useState('');
  const [isCreatingScreen, setIsCreatingScreen] = useState(false);
  const [screenExecutionLogs, setScreenExecutionLogs] = useState<any[]>([]);
  const [lastScreenPrompt, setLastScreenPrompt] = useState('');

  // Update existing state
  const [updateDescription, setUpdateDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateExecutionLogs, setUpdateExecutionLogs] = useState<any[]>([]);
  const [lastUpdatePrompt, setLastUpdatePrompt] = useState('');

  // Tab state
  const [activeTab, setActiveTab] = useState<'screen' | 'update' | 'app'>('screen');

  // Connection health monitoring
  const [connectionHealth, setConnectionHealth] = useState<'healthy' | 'degraded' | 'failed'>('healthy');
  const [connectionMetrics, setConnectionMetrics] = useState<any>({});
  const [showLogs, setShowLogs] = useState(false);

  // Local storage helper functions
  const saveLogsToStorage = async (logs: any[], promptKey: string, logsKey: string, prompt?: string) => {
    try {
      await webStorage.setItem(logsKey, JSON.stringify(logs));
      if (prompt) {
        await webStorage.setItem(promptKey, prompt);
      }
      log.info('claude', 'Claude logs saved to local storage', { 
        logsCount: logs.length, 
        promptKey, 
        logsKey 
      });
    } catch (error) {
      log.error('claude', 'Failed to save logs to local storage', { error });
    }
  };

  const loadLogsFromStorage = async () => {
    try {
      // Load execution logs and prompt
      const executionLogsData = await webStorage.getItem(STORAGE_KEYS.EXECUTION_LOGS);
      const lastPromptData = await webStorage.getItem(STORAGE_KEYS.LAST_PROMPT);
      
      // Load screen execution logs and prompt
      const screenLogsData = await webStorage.getItem(STORAGE_KEYS.SCREEN_EXECUTION_LOGS);
      const lastScreenPromptData = await webStorage.getItem(STORAGE_KEYS.LAST_SCREEN_PROMPT);
      
      // Load update execution logs and prompt
      const updateLogsData = await webStorage.getItem(STORAGE_KEYS.UPDATE_EXECUTION_LOGS);
      const lastUpdatePromptData = await webStorage.getItem(STORAGE_KEYS.LAST_UPDATE_PROMPT);

      if (executionLogsData) {
        const logs = JSON.parse(executionLogsData);
        setExecutionLogs(logs);
      }
      if (lastPromptData) {
        setLastPrompt(lastPromptData);
      }
      
      if (screenLogsData) {
        const logs = JSON.parse(screenLogsData);
        setScreenExecutionLogs(logs);
      }
      if (lastScreenPromptData) {
        setLastScreenPrompt(lastScreenPromptData);
      }
      
      if (updateLogsData) {
        const logs = JSON.parse(updateLogsData);
        setUpdateExecutionLogs(logs);
      }
      if (lastUpdatePromptData) {
        setLastUpdatePrompt(lastUpdatePromptData);
      }

      log.info('claude', 'Claude logs loaded from local storage', {
        executionLogs: executionLogsData ? JSON.parse(executionLogsData).length : 0,
        screenLogs: screenLogsData ? JSON.parse(screenLogsData).length : 0,
        updateLogs: updateLogsData ? JSON.parse(updateLogsData).length : 0,
      });
    } catch (error) {
      log.error('claude', 'Failed to load logs from local storage', { error });
    }
  };

  const clearAllLogsFromStorage = async () => {
    try {
      await Promise.all([
        webStorage.removeItem(STORAGE_KEYS.EXECUTION_LOGS),
        webStorage.removeItem(STORAGE_KEYS.LAST_PROMPT),
        webStorage.removeItem(STORAGE_KEYS.SCREEN_EXECUTION_LOGS),
        webStorage.removeItem(STORAGE_KEYS.LAST_SCREEN_PROMPT),
        webStorage.removeItem(STORAGE_KEYS.UPDATE_EXECUTION_LOGS),
        webStorage.removeItem(STORAGE_KEYS.LAST_UPDATE_PROMPT),
      ]);
      log.info('claude', 'All Claude logs cleared from local storage');
    } catch (error) {
      log.error('claude', 'Failed to clear logs from local storage', { error });
    }
  };

  // Load logs from storage on component mount
  useEffect(() => {
    loadLogsFromStorage();
  }, []);

  // Save logs to storage whenever they change
  useEffect(() => {
    if (executionLogs.length > 0) {
      saveLogsToStorage(executionLogs, STORAGE_KEYS.LAST_PROMPT, STORAGE_KEYS.EXECUTION_LOGS, lastPrompt);
    }
  }, [executionLogs, lastPrompt]);

  useEffect(() => {
    if (screenExecutionLogs.length > 0) {
      saveLogsToStorage(screenExecutionLogs, STORAGE_KEYS.LAST_SCREEN_PROMPT, STORAGE_KEYS.SCREEN_EXECUTION_LOGS, lastScreenPrompt);
    }
  }, [screenExecutionLogs, lastScreenPrompt]);

  useEffect(() => {
    if (updateExecutionLogs.length > 0) {
      saveLogsToStorage(updateExecutionLogs, STORAGE_KEYS.LAST_UPDATE_PROMPT, STORAGE_KEYS.UPDATE_EXECUTION_LOGS, lastUpdatePrompt);
    }
  }, [updateExecutionLogs, lastUpdatePrompt]);

  // Monitor connection health and handle HMR issues
  useEffect(() => {
    log.info('connection', 'PreviewNavigation initialized');
    
    // Set up global flag to prevent webpack interference during Claude operations
    (window as any).claudeCodeActive = false;
    
    // Initial health check
    httpClient.healthCheck().then(result => {
      log.info('connection', 'Initial health check', result);
    });

    // Periodic health monitoring
    const healthInterval = setInterval(async () => {
      const metrics = httpClient.getMetrics();
      setConnectionMetrics(metrics);
      setConnectionHealth(metrics.connectionHealth);
      
      if (metrics.connectionHealth === 'failed') {
        log.warn('connection', 'Connection health degraded', metrics);
      }
    }, 30000); // Check every 30 seconds

    // Handle HMR failures gracefully - but only if Claude isn't active
    const handleHMRError = (event: any) => {
      if ((window as any).claudeCodeActive) {
        log.warn('connection', 'Suppressing HMR during Claude Code operation', {
          activeOperation: 'Claude Code streaming'
        });
        event.preventDefault?.();
        return false;
      }

      log.warn('connection', 'HMR update failed - this is normal when Claude modifies mobile files', {
        error: event.error?.message,
        source: event.filename
      });
      
      // Don't show HMR errors to users - they're expected when Claude modifies files
      if (event.error?.message?.includes('not accepted') || 
          event.error?.message?.includes('Need to do a full reload')) {
        log.info('connection', 'Ignoring expected HMR failure from Claude file modifications');
        event.preventDefault?.();
        return false;
      }
    };

    // Override webpack hot reload when Claude is active
    if (typeof window !== 'undefined' && (window as any).module?.hot) {
      const originalStatusHandler = (window as any).module.hot.addStatusHandler;
      (window as any).module.hot.addStatusHandler = (callback: any) => {
        return originalStatusHandler((status: string) => {
          if ((window as any).claudeCodeActive && (status === 'check' || status === 'prepare')) {
            log.warn('connection', `Blocking webpack ${status} during Claude Code operation`);
            return false;
          }
          return callback(status);
        });
      };
    }

    // Block page reloads during Claude operations
    const preventReloadDuringClaude = (event: BeforeUnloadEvent) => {
      if ((window as any).claudeCodeActive) {
        log.warn('connection', 'Preventing page reload during Claude Code operation');
        event.preventDefault();
        event.returnValue = 'Claude Code is running. Are you sure you want to leave?';
        return 'Claude Code is running. Are you sure you want to leave?';
      }
    };

    // Listen for unhandled errors that might be HMR-related
    const handleError = (event: ErrorEvent) => {
      if ((window as any).claudeCodeActive) {
        log.warn('connection', 'Suppressing error during Claude Code operation');
        event.preventDefault();
        return false;
      }

      if (event.error?.message?.includes('HMR') || 
          event.error?.message?.includes('not accepted') ||
          event.filename?.includes('dev-server')) {
        handleHMRError(event);
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('beforeunload', preventReloadDuringClaude);

    return () => {
      clearInterval(healthInterval);
      window.removeEventListener('error', handleError);
      window.removeEventListener('beforeunload', preventReloadDuringClaude);
      (window as any).claudeCodeActive = false;
      log.info('connection', 'PreviewNavigation unmounted');
    };
  }, []);

  const deviceFrames = [
    {key: 'iphone', label: '📱 iPhone'},
    {key: 'android', label: '🤖 Android'},
  ];

  // Get dynamic data from unified registry
  const screenEntities = getScreens();
  
  const screens = screenEntities.map(screen => ({
    key: screen.id,
    label: `${screen.icon || '📱'} ${screen.name}`
  }));

  // Screen creation function with robust HTTP client
  const createScreen = async () => {
    if (!screenName.trim()) {
      alert('Please enter a screen name.');
      return;
    }

    setIsCreatingScreen(true);
    (window as any).claudeCodeActive = true; // Block webpack interference
    log.info('claude', 'Starting screen creation', { screenName, screenDescription, screenCategory, screenIcon });

    try {
      const singleScreenPrompt = generateSingleScreenPrompt({
        screenName,
        description: screenDescription || screenName,
        category: screenCategory || 'Main',
        icon: screenIcon || '📱'
      });

      const requestBody = {
        prompt: singleScreenPrompt,
        maxTurns: 20,
        workingDirectory: '/Users/shayco/branded44/packages/mobile',
        dangerouslySkipPermissions: true,
        anthropicBaseUrl: 'http://localhost:3002/api/anthropic-proxy',
        anthropicAuthToken: 'fake-key-for-proxy'
      };

      setLastScreenPrompt(singleScreenPrompt);
      setScreenExecutionLogs([]);
      // Clear previous logs from local storage when generating new prompt
      await webStorage.removeItem(STORAGE_KEYS.SCREEN_EXECUTION_LOGS);
      await webStorage.removeItem(STORAGE_KEYS.LAST_SCREEN_PROMPT);

      const messages = await httpClient.streamRequest('/execute-claude-code-stream', {
        body: requestBody,
        onConnection: () => {
          log.success('connection', 'Screen creation streaming connected - webpack interference blocked');
        },
        onMessage: (data) => {
          if (data.type === 'message') {
            setScreenExecutionLogs(prev => [...prev, data.message]);
          }
        },
        onComplete: (finalMessages) => {
          setScreenExecutionLogs(finalMessages);
          log.success('claude', 'Screen creation completed', { 
            messageCount: finalMessages.length,
            screenName 
          });
          
          // Delay reload to let Claude finish completely
          setTimeout(() => {
            log.info('connection', 'Claude Code finished - safe to reload now');
            window.location.reload();
          }, 1000);
        },
        onError: (error) => {
          log.error('claude', 'Screen creation failed', { 
            error: error.message,
            screenName 
          });
        }
      });

      alert('🚀 Screen creation completed! Check the mobile package for the new screen.');
      
      // Clear the inputs
      setScreenName('');
      setScreenDescription('');
      setScreenCategory('');
      setScreenIcon('');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error('claude', 'Screen creation error', { error: errorMessage, screenName });
      alert(`❌ Screen creation failed: ${errorMessage}`);
    } finally {
      (window as any).claudeCodeActive = false; // Re-enable webpack
      setIsCreatingScreen(false);
    }
  };

  // Update existing function with robust HTTP client  
  const updateExisting = async () => {
    if (!updateDescription.trim()) {
      alert('Please describe what you want to update.');
      return;
    }

    setIsUpdating(true);
    (window as any).claudeCodeActive = true; // Block webpack interference
    log.info('claude', 'Starting app update', { updateDescription });

    try {
      const updatePrompt = generateUpdateExistingPrompt({
        updateDescription
      });

      const requestBody = {
        prompt: updatePrompt,
        maxTurns: 20,
        workingDirectory: '/Users/shayco/branded44/packages/mobile',
        dangerouslySkipPermissions: true,
        anthropicBaseUrl: 'http://localhost:3002/api/anthropic-proxy',
        anthropicAuthToken: 'fake-key-for-proxy'
      };

      setLastUpdatePrompt(updatePrompt);
      setUpdateExecutionLogs([]);
      // Clear previous logs from local storage when generating new prompt
      await webStorage.removeItem(STORAGE_KEYS.UPDATE_EXECUTION_LOGS);
      await webStorage.removeItem(STORAGE_KEYS.LAST_UPDATE_PROMPT);

      const messages = await httpClient.streamRequest('/execute-claude-code-stream', {
        body: requestBody,
        onConnection: () => {
          log.success('connection', 'App update streaming connected - blocking webpack reloads');
        },
        onMessage: (data) => {
          if (data.type === 'message') {
            setUpdateExecutionLogs(prev => [...prev, data.message]);
          }
        },
        onComplete: (finalMessages) => {
          setUpdateExecutionLogs(finalMessages);
          log.success('claude', 'App update completed', { 
            messageCount: finalMessages.length,
            updateDescription 
          });
          
          // Delay reload to let Claude finish completely
          setTimeout(() => {
            log.info('connection', 'Claude Code finished - safe to reload now');
            window.location.reload();
          }, 1000);
        },
        onError: (error) => {
          log.error('claude', 'App update failed', { 
            error: error.message,
            updateDescription 
          });
        }
      });

      alert('🚀 App update completed! Check the mobile package for changes.');
      setUpdateDescription('');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error('claude', 'App update error', { error: errorMessage, updateDescription });
      alert(`❌ App update failed: ${errorMessage}`);
    } finally {
      (window as any).claudeCodeActive = false; // Re-enable webpack
      setIsUpdating(false);
    }
  };

  // App generation function using same defaults as PromptGenerator
  const generateApp = async () => {
    if (!appDescription.trim()) {
      alert('Please enter an app description.');
      return;
    }

    setIsGenerating(true);
    (window as any).claudeCodeActive = true; // Block webpack interference
    log.info('claude', 'Starting app generation', { appDescription });

    try {
      // ✅ Using centralized prompt from utils/claudePrompts.ts
      const completeAppPrompt = generateCompleteAppPrompt({
        appDescription
      });

      // Same defaults as PromptGenerator
      const requestBody = {
        prompt: completeAppPrompt,
        maxTurns: 20,
        workingDirectory: '/Users/shayco/branded44/packages/mobile',
        dangerouslySkipPermissions: true,
        anthropicBaseUrl: 'http://localhost:3002/api/anthropic-proxy',
        anthropicAuthToken: 'fake-key-for-proxy'
      };

      // Store the prompt for display
      setLastPrompt(completeAppPrompt);
      setExecutionLogs([]);
      // Clear previous logs from local storage when generating new prompt
      await webStorage.removeItem(STORAGE_KEYS.EXECUTION_LOGS);
      await webStorage.removeItem(STORAGE_KEYS.LAST_PROMPT);

      const messages = await httpClient.streamRequest('/execute-claude-code-stream', {
        body: requestBody,
        onConnection: () => {
          log.success('connection', 'App generation streaming connected - webpack interference blocked');
        },
        onMessage: (data) => {
          if (data.type === 'message') {
            setExecutionLogs(prev => [...prev, data.message]);
          }
        },
        onComplete: (finalMessages) => {
          setExecutionLogs(finalMessages);
          log.success('claude', 'App generation completed', { 
            messageCount: finalMessages.length,
            appDescription 
          });
          
          // Delay reload to let Claude finish completely
          setTimeout(() => {
            log.info('connection', 'Claude Code finished - safe to reload now');
            window.location.reload();
          }, 1000);
        },
        onError: (error) => {
          log.error('claude', 'App generation failed', { 
            error: error.message,
            appDescription 
          });
        }
      });

      alert('🚀 App generation completed! Check the mobile package for new screens.');
      setAppDescription('');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error('claude', 'App generation error', { error: errorMessage, appDescription });
      alert(`❌ App generation failed: ${errorMessage}`);
    } finally {
      (window as any).claudeCodeActive = false; // Re-enable webpack
      setIsGenerating(false);
    }
  };

  return (
    <View style={[styles.container, { maxHeight: '90vh', overflow: 'auto' } as any]}>
      <Text style={styles.title}>Mobile Preview</Text>
      
      {/* Connection Health Indicator */}
      <View style={styles.healthSection}>
        <View style={styles.healthIndicator}>
          <Text style={[styles.healthStatus, { color: connectionHealth === 'healthy' ? '#28a745' : connectionHealth === 'degraded' ? '#ffc107' : '#dc3545' }]}>
            {connectionHealth === 'healthy' ? '🟢' : connectionHealth === 'degraded' ? '🟡' : '🔴'} {connectionHealth.toUpperCase()}
          </Text>
          <TouchableOpacity
            style={styles.logsButton}
            onPress={() => setShowLogs(!showLogs)}>
            <Text style={styles.logsButtonText}>
              {showLogs ? '📋 Hide Logs' : '📋 Show Logs'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {connectionMetrics.requestCount > 0 && (
          <Text style={styles.metricsText}>
            {connectionMetrics.successCount}/{connectionMetrics.requestCount} requests • 
            avg {Math.round(connectionMetrics.averageResponseTime)}ms
          </Text>
        )}
        
        {/* Storage status indicator */}
        {(executionLogs.length > 0 || screenExecutionLogs.length > 0 || updateExecutionLogs.length > 0) && (
          <Text style={[styles.metricsText, {color: '#28a745'}]}>
            💾 Logs restored from storage • 
            App: {executionLogs.length} • Screen: {screenExecutionLogs.length} • Update: {updateExecutionLogs.length}
          </Text>
        )}
        
        {showLogs && (
          <View style={styles.logsContainer}>
            <View style={{flexDirection: 'row', gap: 8}}>
              <TouchableOpacity
                style={styles.clearLogsButton}
                onPress={() => webLogger.clearLogs()}
                accessibilityLabel="Clear connection logs only">
                <Text style={styles.clearLogsButtonText}>🗑️ Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.clearLogsButton, {backgroundColor: '#dc3545'}]}
                onPress={async () => {
                  // Clear both web logs and Claude logs from storage
                  webLogger.clearLogs();
                  await clearAllLogsFromStorage();
                  // Clear state as well
                  setExecutionLogs([]);
                  setLastPrompt('');
                  setScreenExecutionLogs([]);
                  setLastScreenPrompt('');
                  setUpdateExecutionLogs([]);
                  setLastUpdatePrompt('');
                  log.info('claude', 'All Claude logs cleared manually');
                }}
                accessibilityLabel="Clear all logs including Claude execution logs from storage">
                <Text style={styles.clearLogsButtonText}>🗑️ Clear All</Text>
              </TouchableOpacity>
            </View>
            <div style={{
              maxHeight: '200px',
              overflow: 'auto',
              backgroundColor: '#f8f9fa',
              border: '1px solid #e9ecef',
              borderRadius: '6px',
              padding: '8px',
              fontSize: '11px',
              fontFamily: 'monospace'
            }}>
              {webLogger.getLogs(20).map((logEntry, index) => (
                <div key={index} style={{
                  marginBottom: '2px',
                  color: logEntry.level === 'error' ? '#dc3545' : 
                        logEntry.level === 'warn' ? '#ffc107' : 
                        logEntry.level === 'success' ? '#28a745' : '#495057'
                }}>
                  [{logEntry.timestamp.split('T')[1].split('.')[0]}] {logEntry.context}: {logEntry.message}
                </div>
              ))}
            </div>
          </View>
        )}
      </View>
      
      {/* Device Frame Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Frame</Text>
        <View style={styles.buttonRow}>
          {deviceFrames.map((frame) => (
            <TouchableOpacity
              key={frame.key}
              style={[
                styles.button,
                deviceFrame === frame.key && styles.activeButton,
              ]}
              onPress={() => setDeviceFrame(frame.key as any)}>
              <Text
                style={[
                  styles.buttonText,
                  deviceFrame === frame.key && styles.activeButtonText,
                ]}>
                {frame.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Screen Selection */}
      <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Screen Access</Text>
          <Text style={styles.hint}>💡 Use native tabs below for navigation</Text>
          {screens.map((screen) => (
            <TouchableOpacity
              key={screen.key}
              style={[
                styles.itemButton,
                selectedScreen === screen.key && styles.activeItemButton,
              ]}
              onPress={() => setSelectedScreen(screen.key as ScreenType)}>
              <Text
                style={[
                  styles.itemButtonText,
                  selectedScreen === screen.key && styles.activeItemButtonText,
                ]}>
                {screen.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      {/* Claude Code Generation Tabs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🤖 Claude Code Generation</Text>
        
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'screen' && styles.activeTab]}
            onPress={() => setActiveTab('screen')}>
            <Text style={[styles.tabText, activeTab === 'screen' && styles.activeTabText]}>
              📱 Create Screen
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'update' && styles.activeTab]}
            onPress={() => setActiveTab('update')}>
            <Text style={[styles.tabText, activeTab === 'update' && styles.activeTabText]}>
              🔄 Update Existing
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === 'app' && styles.activeTab]}
            onPress={() => setActiveTab('app')}>
            <Text style={[styles.tabText, activeTab === 'app' && styles.activeTabText]}>
              🚀 Generate App
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'screen' && (
            <View>
              <Text style={styles.hint}>Add a new screen to your app. Claude can analyze existing code and run shell commands.</Text>
              
              <View style={styles.inputContainer}>
                <input
                  type="text"
                  value={screenName}
                  onChange={(e) => setScreenName(e.target.value)}
                  placeholder="e.g., ProfileScreen, SettingsScreen"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: screenName.trim() ? '1px solid #e0e0e0' : '2px solid #ff6b6b',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginBottom: '8px',
                    backgroundColor: screenName.trim() ? '#fff' : '#ffebee',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                
                <input
                  type="text"
                  value={screenDescription}
                  onChange={(e) => setScreenDescription(e.target.value)}
                  placeholder="Screen description (optional, defaults to screen name)"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    marginBottom: '8px',
                    backgroundColor: '#fff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />

                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={screenCategory}
                    onChange={(e) => setScreenCategory(e.target.value)}
                    placeholder="Category (e.g., Main, Settings)"
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#fff',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  
                  <input
                    type="text"
                    value={screenIcon}
                    onChange={(e) => setScreenIcon(e.target.value)}
                    placeholder="Icon (e.g., 👤, ⚙️)"
                    style={{
                      width: '100px',
                      padding: '10px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#fff',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                
                <TouchableOpacity
                  style={[
                    styles.generateButton,
                    isCreatingScreen && styles.generatingButton,
                    !screenName.trim() && styles.disabledButton
                  ]}
                  onPress={createScreen}
                  disabled={isCreatingScreen || !screenName.trim()}>
                  <Text style={[
                    styles.generateButtonText,
                    isCreatingScreen && styles.generatingButtonText,
                    !screenName.trim() && styles.disabledButtonText
                  ]}>
                    {isCreatingScreen ? '⏳ Creating...' : '📱 Create Screen'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Screen Creation Logs */}
              {(lastScreenPrompt || screenExecutionLogs.length > 0) && (
                <View style={styles.logsSection}>
                  <Text style={styles.logsSectionTitle}>📋 Screen Creation Logs</Text>
                  
                  {lastScreenPrompt && (
                    <View style={styles.logItem}>
                      <Text style={styles.logItemTitle}>📝 Sent Prompt</Text>
                      <div style={{
                        maxHeight: '200px',
                        overflow: 'auto',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '6px',
                        padding: '10px',
                        fontSize: '12px',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {lastScreenPrompt}
                      </div>
                    </View>
                  )}

                  {screenExecutionLogs.length > 0 && (
                    <View style={styles.logItem}>
                      <Text style={styles.logItemTitle}>💬 Claude Messages</Text>
                      <div style={{
                        maxHeight: '300px',
                        overflow: 'auto',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '6px',
                        padding: '10px',
                        fontSize: '12px'
                      }}>
                        {screenExecutionLogs.map((message, index) => (
                          <div key={index} style={{
                            marginBottom: '8px',
                            paddingBottom: '8px',
                            borderBottom: index < screenExecutionLogs.length - 1 ? '1px solid #e9ecef' : 'none'
                          }}>
                            <div style={{
                              fontWeight: 'bold',
                              color: message.type === 'text' ? '#007bff' : 
                                    message.type === 'tool_use' ? '#28a745' : 
                                    message.type === 'tool_result' ? '#dc3545' : '#6c757d',
                              marginBottom: '4px'
                            }}>
                              {message.type === 'text' ? '🤖 assistant' :
                               message.type === 'tool_use' ? '🔧 tool_use' :
                               message.type === 'tool_result' ? '📝 tool_result' : 
                               `⚙️ ${message.type}`}
                            </div>
                            <div style={{
                              color: '#495057',
                              whiteSpace: 'pre-wrap',
                              lineHeight: '1.3'
                            }}>
                              {(() => {
                                if (message.type === 'text' && message.content) {
                                  return message.content;
                                } else if (message.type === 'tool_use') {
                                  return `🔧 Tool: ${message.name}\nInput: ${JSON.stringify(message.input, null, 2)}`;
                                } else if (message.type === 'tool_result') {
                                  return `📝 Tool Result:\n${typeof message.content === 'string' ? message.content : JSON.stringify(message.content, null, 2)}`;
                                } else if (message.content) {
                                  return typeof message.content === 'string' ? message.content : JSON.stringify(message.content, null, 2);
                                } else {
                                  return JSON.stringify(message, null, 2);
                                }
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {activeTab === 'update' && (
            <View>
              <Text style={styles.hint}>Improve or modify existing screens and functionality. Claude can use shell commands like `ls`, `cat`, `grep`, `git`, `npm`, etc.</Text>
              
              <View style={styles.inputContainer}>
                <textarea
                  value={updateDescription}
                  onChange={(e) => setUpdateDescription(e.target.value)}
                  placeholder="Describe what you want to update, improve, or modify. E.g., 'Add a search feature to the ProfileScreen', 'Improve the styling of all buttons', 'Add navigation between different screens'"
                  style={{
                    ...htmlStyles.textArea,
                    border: updateDescription.trim() ? '1px solid #e0e0e0' : '2px solid #ff6b6b',
                    backgroundColor: updateDescription.trim() ? '#fff' : '#ffebee',
                  }}
                />
                
                <TouchableOpacity
                  style={[
                    styles.generateButton,
                    isUpdating && styles.generatingButton,
                    !updateDescription.trim() && styles.disabledButton
                  ]}
                  onPress={updateExisting}
                  disabled={isUpdating || !updateDescription.trim()}>
                  <Text style={[
                    styles.generateButtonText,
                    isUpdating && styles.generatingButtonText,
                    !updateDescription.trim() && styles.disabledButtonText
                  ]}>
                    {isUpdating ? '⏳ Updating...' : '🔄 Update Existing'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Update Logs */}
              {(lastUpdatePrompt || updateExecutionLogs.length > 0) && (
                <View style={styles.logsSection}>
                  <Text style={styles.logsSectionTitle}>📋 Update Logs</Text>
                  
                  {lastUpdatePrompt && (
                    <View style={styles.logItem}>
                      <Text style={styles.logItemTitle}>📝 Sent Prompt</Text>
                      <div style={{
                        maxHeight: '200px',
                        overflow: 'auto',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '6px',
                        padding: '10px',
                        fontSize: '12px',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {lastUpdatePrompt}
                      </div>
                    </View>
                  )}

                  {updateExecutionLogs.length > 0 && (
                    <View style={styles.logItem}>
                      <Text style={styles.logItemTitle}>💬 Claude Messages</Text>
                      <div style={{
                        maxHeight: '300px',
                        overflow: 'auto',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '6px',
                        padding: '10px',
                        fontSize: '12px'
                      }}>
                        {updateExecutionLogs.map((message, index) => (
                          <div key={index} style={{
                            marginBottom: '8px',
                            paddingBottom: '8px',
                            borderBottom: index < updateExecutionLogs.length - 1 ? '1px solid #e9ecef' : 'none'
                          }}>
                            <div style={{
                              fontWeight: 'bold',
                              color: message.type === 'text' ? '#007bff' : 
                                    message.type === 'tool_use' ? '#28a745' : 
                                    message.type === 'tool_result' ? '#dc3545' : '#6c757d',
                              marginBottom: '4px'
                            }}>
                              {message.type === 'text' ? '🤖 assistant' :
                               message.type === 'tool_use' ? '🔧 tool_use' :
                               message.type === 'tool_result' ? '📝 tool_result' : 
                               `⚙️ ${message.type}`}
                            </div>
                            <div style={{
                              color: '#495057',
                              whiteSpace: 'pre-wrap',
                              lineHeight: '1.3'
                            }}>
                              {(() => {
                                if (message.type === 'text' && message.content) {
                                  return message.content;
                                } else if (message.type === 'tool_use') {
                                  return `🔧 Tool: ${message.name}\nInput: ${JSON.stringify(message.input, null, 2)}`;
                                } else if (message.type === 'tool_result') {
                                  return `📝 Tool Result:\n${typeof message.content === 'string' ? message.content : JSON.stringify(message.content, null, 2)}`;
                                } else if (message.content) {
                                  return typeof message.content === 'string' ? message.content : JSON.stringify(message.content, null, 2);
                                } else {
                                  return JSON.stringify(message, null, 2);
                                }
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {activeTab === 'app' && (
            <View>
              <Text style={styles.hint}>Describe your app idea to generate screens. Claude can set up the project structure and dependencies.</Text>
              
              <View style={styles.inputContainer}>
                <textarea
                  value={appDescription}
                  onChange={(e) => setAppDescription(e.target.value)}
                  placeholder="e.g., A fitness tracking app where users can log workouts, track progress, and share achievements with friends."
                  style={{
                    ...htmlStyles.textArea,
                    border: appDescription.trim() ? '1px solid #e0e0e0' : '2px solid #ff6b6b',
                    backgroundColor: appDescription.trim() ? '#fff' : '#ffebee',
                  }}
                />
                
                <TouchableOpacity
                  style={[
                    styles.generateButton,
                    isGenerating && styles.generatingButton,
                    !appDescription.trim() && styles.disabledButton
                  ]}
                  onPress={generateApp}
                  disabled={isGenerating || !appDescription.trim()}>
                  <Text style={[
                    styles.generateButtonText,
                    isGenerating && styles.generatingButtonText,
                    !appDescription.trim() && styles.disabledButtonText
                  ]}>
                    {isGenerating ? '⏳ Generating...' : '🚀 Generate App'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Claude Code Logs */}
              {(lastPrompt || executionLogs.length > 0) && (
                <View style={styles.logsSection}>
                  <Text style={styles.logsSectionTitle}>📋 Execution Logs</Text>
                  
                  {lastPrompt && (
                    <View style={styles.logItem}>
                      <Text style={styles.logItemTitle}>📝 Sent Prompt</Text>
                      <div style={{
                        maxHeight: '200px',
                        overflow: 'auto',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '6px',
                        padding: '10px',
                        fontSize: '12px',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {lastPrompt}
                      </div>
                    </View>
                  )}

                                      {executionLogs.length > 0 && (
                      <View style={styles.logItem}>
                        <Text style={styles.logItemTitle}>💬 Claude Messages</Text>
                        <div style={{
                          maxHeight: '300px',
                          overflow: 'auto',
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #e9ecef',
                          borderRadius: '6px',
                          padding: '10px',
                          fontSize: '12px'
                        }}>
                          {executionLogs.map((message, index) => (
                            <div key={index} style={{
                              marginBottom: '8px',
                              paddingBottom: '8px',
                              borderBottom: index < executionLogs.length - 1 ? '1px solid #e9ecef' : 'none'
                            }}>
                              <div style={{
                                fontWeight: 'bold',
                                color: message.type === 'text' ? '#007bff' : 
                                      message.type === 'tool_use' ? '#28a745' : 
                                      message.type === 'tool_result' ? '#dc3545' : '#6c757d',
                                marginBottom: '4px'
                              }}>
                                {message.type === 'text' ? '🤖 assistant' :
                                 message.type === 'tool_use' ? '🔧 tool_use' :
                                 message.type === 'tool_result' ? '📝 tool_result' : 
                                 `⚙️ ${message.type}`}
                              </div>
                              <div style={{
                                color: '#495057',
                                whiteSpace: 'pre-wrap',
                                lineHeight: '1.3'
                              }}>
                                {(() => {
                                  if (message.type === 'text' && message.content) {
                                    return message.content;
                                  } else if (message.type === 'tool_use') {
                                    return `🔧 Tool: ${message.name}\nInput: ${JSON.stringify(message.input, null, 2)}`;
                                  } else if (message.type === 'tool_result') {
                                    return `📝 Tool Result:\n${typeof message.content === 'string' ? message.content : JSON.stringify(message.content, null, 2)}`;
                                  } else if (message.content) {
                                    return typeof message.content === 'string' ? message.content : JSON.stringify(message.content, null, 2);
                                  } else {
                                    return JSON.stringify(message, null, 2);
                                  }
                                })()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </View>
                    )}
                </View>
              )}
            </View>
          )}
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 500,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    marginRight: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  activeButtonText: {
    color: '#ffffff',
  },
  modeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  activeModeButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activeModeButtonText: {
    color: '#ffffff',
  },
  modeSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  activeModeSubtitle: {
    color: '#ffffff',
    opacity: 0.9,
  },
  itemButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f8f8f8',
    marginBottom: 6,
  },
  activeItemButton: {
    backgroundColor: '#007AFF',
  },
  itemButtonText: {
    fontSize: 14,
    color: '#333',
  },
  activeItemButtonText: {
    color: '#ffffff',
  },
  generateButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#28a745',
    alignItems: 'center',
    marginTop: 5,
  },
  generatingButton: {
    backgroundColor: '#6c757d',
  },
  disabledButton: {
    backgroundColor: '#e9ecef',
  },
  generateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  generatingButtonText: {
    color: '#ffffff',
  },
  disabledButtonText: {
    color: '#6c757d',
  },
  inputContainer: {
    marginTop: 8,
  },
  logsSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  logsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  logItem: {
    marginBottom: 16,
  },
  logItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007bff',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  activeTabText: {
    color: '#007bff',
    fontWeight: '600',
  },
  tabContent: {
    paddingTop: 16,
  },
  healthSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  healthIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  logsButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#6c757d',
    borderRadius: 4,
  },
  logsButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  metricsText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 8,
  },
  logsContainer: {
    marginTop: 8,
  },
  clearLogsButton: {
    alignSelf: 'flex-end',
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: '#dc3545',
    borderRadius: 4,
    marginBottom: 4,
  },
  clearLogsButtonText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '500',
  },
});

// CSS styles for HTML elements (separate from React Native StyleSheet)
const htmlStyles = {
  textArea: {
    width: '100%',
    minHeight: '100px',
    padding: '12px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    resize: 'vertical' as const,
    marginBottom: '12px',
    backgroundColor: '#fff',
    outline: 'none',
    lineHeight: '1.4',
    boxSizing: 'border-box' as const,
  }
};

export default PreviewNavigation; 