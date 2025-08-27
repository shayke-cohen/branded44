import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useDynamicTestData } from './hooks/useDynamicTestData';
import { formatTestData } from './utils/formatting';

/**
 * DynamicTestScreen - A demonstration screen for the dynamic loading system
 * 
 * This screen showcases various features:
 * - State management
 * - Custom hooks
 * - Utility functions  
 * - Styled components
 * - Real-time updates
 */
const DynamicTestScreen: React.FC = () => {
  const [counter, setCounter] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Use custom hook (will be loaded separately)
  const { testData, loading, refreshData } = useDynamicTestData();

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleIncrement = () => {
    setCounter(prev => prev + 1);
  };

  const handleReset = () => {
    setCounter(0);
    refreshData();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎭 Dynamic Screen Loading</Text>
        <Text style={styles.subtitle}>Testing Real-time Updates</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Live Data</Text>
        <Text style={styles.timestamp}>
          Last Update: {formatTestData(lastUpdate)}
        </Text>
        <Text style={styles.counter}>
          Counter: {counter}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔄 Dynamic Hook Data</Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : (
          <View>
            <Text style={styles.dataText}>
              Test Data: {testData?.message || 'No data'}
            </Text>
            <Text style={styles.dataText}>
              Generated: {testData?.timestamp ? formatTestData(new Date(testData.timestamp)) : 'N/A'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleIncrement}
        >
          <Text style={styles.buttonText}>➕ Increment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleReset}
        >
          <Text style={styles.buttonTextSecondary}>🔄 Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.warningButton]}
          onPress={refreshData}
        >
          <Text style={styles.buttonText}>🔄 Refresh Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This screen is loaded dynamically from individual files.
          Changes to this file will be reflected immediately without rebuilding bundles.
        </Text>
        
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>✅ Individual file loading</Text>
          <Text style={styles.featureItem}>✅ Custom hooks integration</Text>
          <Text style={styles.featureItem}>✅ Utility functions</Text>
          <Text style={styles.featureItem}>✅ Real-time updates</Text>
          <Text style={styles.featureItem}>✅ Intelligent caching</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#3498db',
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ecf0f1',
  },
  section: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  counter: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  loadingText: {
    fontSize: 14,
    color: '#f39c12',
    fontStyle: 'italic',
  },
  dataText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#27ae60',
  },
  secondaryButton: {
    backgroundColor: '#95a5a6',
  },
  warningButton: {
    backgroundColor: '#f39c12',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  buttonTextSecondary: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    backgroundColor: '#ecf0f1',
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  featureList: {
    alignItems: 'flex-start',
  },
  featureItem: {
    fontSize: 12,
    color: '#27ae60',
    marginBottom: 4,
  },
};

export default DynamicTestScreen;

