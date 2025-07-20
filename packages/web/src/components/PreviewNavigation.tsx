import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import {usePreview} from '../context/PreviewContext';

const PreviewNavigation: React.FC = () => {
  const {
    mode,
    setMode,
    selectedScreen,
    setSelectedScreen,
    selectedSampleApp,
    setSelectedSampleApp,
    selectedTemplate,
    setSelectedTemplate,
    deviceFrame,
    setDeviceFrame,
  } = usePreview();

  const screens = [
    {id: 'home', name: 'Home Screen'},
    {id: 'settings', name: 'Settings Screen'},
    {id: 'templates', name: 'Template Index'},
  ];

  const sampleApps = [
    {id: 'todo', name: 'Todo App'},
    {id: 'notes', name: 'Notes App'},
    {id: 'weather', name: 'Weather App'},
    {id: 'calculator', name: 'Calculator App'},
  ];

  const templates = [
    {id: 'auth', name: 'Auth Template'},
    {id: 'dashboard', name: 'Dashboard Template'},
    {id: 'form', name: 'Form Template'},
    {id: 'list', name: 'List Template'},
    {id: 'profile', name: 'Profile Template'},
  ];

  const renderModeButton = (modeId: string, label: string) => (
    <TouchableOpacity
      key={modeId}
      style={[
        styles.modeButton,
        mode === modeId && styles.modeButtonActive,
      ]}
      onPress={() => setMode(modeId as any)}>
      <Text
        style={[
          styles.modeButtonText,
          mode === modeId && styles.modeButtonTextActive,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderNavItem = (item: any, isSelected: boolean, onPress: () => void) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.navItem, isSelected && styles.navItemActive]}
      onPress={onPress}>
      <Text
        style={[
          styles.navItemText,
          isSelected && styles.navItemTextActive,
        ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preview Mode</Text>
        <View style={styles.modeButtons}>
          {renderModeButton('screens', 'Screens')}
          {renderModeButton('sample-apps', 'Sample Apps')}
          {renderModeButton('templates', 'Templates')}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Frame</Text>
        <View style={styles.modeButtons}>
          <TouchableOpacity
            style={[
              styles.deviceButton,
              deviceFrame === 'iphone' && styles.deviceButtonActive,
            ]}
            onPress={() => setDeviceFrame('iphone')}>
            <Text
              style={[
                styles.deviceButtonText,
                deviceFrame === 'iphone' && styles.deviceButtonTextActive,
              ]}>
              iPhone
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.deviceButton,
              deviceFrame === 'android' && styles.deviceButtonActive,
            ]}
            onPress={() => setDeviceFrame('android')}>
            <Text
              style={[
                styles.deviceButtonText,
                deviceFrame === 'android' && styles.deviceButtonTextActive,
              ]}>
              Android
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.navigation}>
        {mode === 'screens' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Screens</Text>
            {screens.map(screen =>
              renderNavItem(
                screen,
                selectedScreen === screen.id,
                () => setSelectedScreen(screen.id as any),
              ),
            )}
          </View>
        )}

        {mode === 'sample-apps' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sample Apps</Text>
            {sampleApps.map(app =>
              renderNavItem(
                app,
                selectedSampleApp === app.id,
                () => setSelectedSampleApp(app.id as any),
              ),
            )}
          </View>
        )}

        {mode === 'templates' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Screen Templates</Text>
            {templates.map(template =>
              renderNavItem(
                template,
                selectedTemplate === template.id,
                () => setSelectedTemplate(template.id as any),
              ),
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    height: 'fit-content',
    maxHeight: '80vh',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  modeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    flex: 1,
    minWidth: 80,
  },
  modeButtonActive: {
    backgroundColor: '#667eea',
  },
  modeButtonText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  modeButtonTextActive: {
    color: '#ffffff',
  },
  deviceButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    flex: 1,
  },
  deviceButtonActive: {
    backgroundColor: '#764ba2',
  },
  deviceButtonText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  deviceButtonTextActive: {
    color: '#ffffff',
  },
  navigation: {
    flex: 1,
  },
  navItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: '#f0f4ff',
  },
  navItemText: {
    fontSize: 16,
    color: '#666',
  },
  navItemTextActive: {
    color: '#667eea',
    fontWeight: '500',
  },
});

export default PreviewNavigation; 