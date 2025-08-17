import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { sessionBundleLoader } from '../services/SessionBundleLoader';
import { componentRegistry } from '../services/ComponentRegistry';

interface ComponentInfo {
  name: string;
  isSession: boolean;
}

/**
 * Demo component showing dynamic component loading and hot-swapping
 * This demonstrates how session bundles can override app components at runtime
 */
export const DynamicComponentDemo: React.FC = () => {
  const [components, setComponents] = useState<ComponentInfo[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [executionEnabled, setExecutionEnabled] = useState(true);

  useEffect(() => {
    // Load initial state
    updateComponentList();
    updateStats();
    setExecutionEnabled(sessionBundleLoader.getExecuteBundle());

    // Set up event listeners
    const handleComponentsUpdated = (data: any) => {
      console.log('📱 [DynamicComponentDemo] Components updated:', data);
      updateComponentList();
      updateStats();
      
      Alert.alert(
        'Components Updated!',
        `${data.componentsCount} session components loaded for session: ${data.sessionId}`,
        [{ text: 'Great!' }]
      );
    };

    const handleBundleExecuted = (data: any) => {
      console.log('📱 [DynamicComponentDemo] Bundle executed:', data);
      updateComponentList();
      updateStats();
    };

    const handleExecutionError = (data: any) => {
      console.error('📱 [DynamicComponentDemo] Bundle execution error:', data);
      Alert.alert('Execution Error', data.error);
    };

    const handleSessionCleared = () => {
      console.log('📱 [DynamicComponentDemo] Session cleared');
      updateComponentList();
      updateStats();
    };

    // Subscribe to events
    sessionBundleLoader.on('components-updated', handleComponentsUpdated);
    sessionBundleLoader.on('bundle-executed', handleBundleExecuted);
    sessionBundleLoader.on('bundle-execution-error', handleExecutionError);
    sessionBundleLoader.on('session-cleared', handleSessionCleared);

    return () => {
      // Cleanup listeners
      sessionBundleLoader.off('components-updated', handleComponentsUpdated);
      sessionBundleLoader.off('bundle-executed', handleBundleExecuted);
      sessionBundleLoader.off('bundle-execution-error', handleExecutionError);
      sessionBundleLoader.off('session-cleared', handleSessionCleared);
    };
  }, []);

  const updateComponentList = () => {
    const componentList = sessionBundleLoader.listComponents();
    setComponents(componentList);
  };

  const updateStats = () => {
    const registryStats = sessionBundleLoader.getRegistryStats();
    setStats(registryStats);
  };

  const handleToggleExecution = () => {
    const newValue = !executionEnabled;
    setExecutionEnabled(newValue);
    sessionBundleLoader.setExecuteBundle(newValue);
    
    Alert.alert(
      'Bundle Execution',
      `Bundle execution ${newValue ? 'enabled' : 'disabled'}`,
      [{ text: 'OK' }]
    );
  };

  const handleClearSession = () => {
    Alert.alert(
      'Clear Session Components',
      'This will remove all session components and revert to defaults. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            sessionBundleLoader.clearSessionComponents();
            Alert.alert('Session Cleared', 'All session components have been removed');
          }
        }
      ]
    );
  };

  const handleForceReload = async () => {
    try {
      await sessionBundleLoader.forceReloadAndExecute();
      Alert.alert('Success', 'Bundle reloaded and executed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to reload bundle: ${errorMessage}`);
    }
  };

  const renderComponent = (componentName: string) => {
    try {
      const Component = componentRegistry.getComponent(componentName);
      
      if (!Component) {
        return (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Component "{componentName}" not found</Text>
          </View>
        );
      }

      // Render the dynamic component with some sample props
      return (
        <View style={styles.componentContainer}>
          <Text style={styles.componentLabel}>Rendering: {componentName}</Text>
          <Component testProp="Hello from dynamic loading!" />
        </View>
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error rendering {componentName}: {errorMessage}</Text>
        </View>
      );
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={true}
      nestedScrollEnabled={true}
    >
      <Text style={styles.title}>🎯 Dynamic Component Demo</Text>
      <Text style={styles.subtitle}>Hot-swappable React Native Components</Text>

      {/* Execution Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Controls</Text>
        
        <TouchableOpacity 
          style={[styles.button, executionEnabled ? styles.buttonEnabled : styles.buttonDisabled]} 
          onPress={handleToggleExecution}
        >
          <Text style={styles.buttonText}>
            Bundle Execution: {executionEnabled ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleClearSession}>
          <Text style={styles.buttonText}>Clear Session Components</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleForceReload}>
          <Text style={styles.buttonText}>Force Reload Bundle</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      {stats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Registry Stats</Text>
          <Text style={styles.statText}>Total Components: {stats.totalComponents}</Text>
          <Text style={styles.statText}>Session Components: {stats.sessionComponents}</Text>
          <Text style={styles.statText}>Session ID: {stats.sessionId || 'None'}</Text>
          <Text style={styles.statText}>
            Last Update: {stats.lastUpdateTime ? new Date(stats.lastUpdateTime).toLocaleTimeString() : 'Never'}
          </Text>
        </View>
      )}

      {/* Component List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧩 Available Components ({components.length})</Text>
        {components.map((comp) => (
          <TouchableOpacity
            key={comp.name}
            style={[
              styles.componentItem,
              comp.isSession ? styles.sessionComponent : styles.defaultComponent,
              selectedComponent === comp.name ? styles.selectedComponent : null
            ]}
            onPress={() => setSelectedComponent(comp.name)}
          >
            <Text style={styles.componentName}>{comp.name}</Text>
            <Text style={styles.componentType}>
              {comp.isSession ? '🎯 Session' : '📱 Default'}
            </Text>
          </TouchableOpacity>
        ))}
        
        {components.length === 0 && (
          <Text style={styles.emptyText}>No components available</Text>
        )}
      </View>

      {/* Component Preview */}
      {selectedComponent && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👁️ Component Preview</Text>
          {renderComponent(selectedComponent)}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 600, // Set minimum height for better visibility
    maxHeight: 800, // Prevent it from getting too tall
    backgroundColor: '#f5f5f5',
    padding: 8, // Reduced container padding for more space
  },
  title: {
    fontSize: 20, // Slightly smaller for embedded use
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4, // Reduced margin
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14, // Smaller subtitle
    color: '#666',
    marginBottom: 16, // Reduced margin
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12, // Reduced padding for more compact layout
    marginBottom: 12, // Reduced margin for more compact layout
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonEnabled: {
    backgroundColor: '#34C759',
  },
  buttonDisabled: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  componentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  defaultComponent: {
    backgroundColor: '#f9f9f9',
  },
  sessionComponent: {
    backgroundColor: '#e8f5e8',
  },
  selectedComponent: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  componentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  componentType: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  componentContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  componentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  errorContainer: {
    backgroundColor: '#ffe6e6',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ffcccc',
  },
  errorText: {
    fontSize: 14,
    color: '#cc0000',
    textAlign: 'center',
  },
});
