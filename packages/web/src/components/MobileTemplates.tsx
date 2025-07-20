import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {usePreview} from '../context/PreviewContext';

// Import screen templates
import {
  AuthScreenTemplate,
  DashboardScreenTemplate,
  FormScreenTemplate,
  // Add other templates as they become available
} from '@mobile/screen-templates';

const MobileTemplates: React.FC = () => {
  const {selectedTemplate} = usePreview();

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'auth':
        return <AuthScreenTemplate />;
      case 'dashboard':
        return <DashboardScreenTemplate />;
      case 'form':
        return <FormScreenTemplate />;
      case 'list':
        return (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>List Template</Text>
            <Text style={styles.placeholderSubtext}>Coming Soon</Text>
          </View>
        );
      case 'profile':
        return (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Profile Template</Text>
            <Text style={styles.placeholderSubtext}>Coming Soon</Text>
          </View>
        );
      default:
        return <AuthScreenTemplate />;
    }
  };

  return (
    <View style={styles.container}>
      {renderTemplate()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#666',
  },
});

export default MobileTemplates; 