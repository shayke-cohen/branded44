import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {usePreview, ScreenType} from '../context/PreviewContext';
import {getScreens, getSampleApps, getTemplateMappings} from '@mobile/screen-templates/templateConfig';

const PreviewNavigation: React.FC = () => {
  const {
    previewMode,
    setPreviewMode,
    deviceFrame,
    setDeviceFrame,
    selectedScreen,
    setSelectedScreen,
  } = usePreview();

  const modes = [
    {key: 'screens', label: '📱 Screens', subtitle: 'With native tabs'},
  ];

  const deviceFrames = [
    {key: 'iphone', label: '📱 iPhone'},
    {key: 'android', label: '🤖 Android'},
  ];

  // Get dynamic data from unified registry
  const screenEntities = getScreens();
  const sampleAppEntities = getSampleApps();
  const templateMappingEntities = getTemplateMappings();
  
  const screens = screenEntities.map(screen => ({
    key: screen.id,
    label: `${screen.icon || '📱'} ${screen.name}`
  }));

  // Generate UI keys dynamically from registry data (e.g., 'Todo App' -> 'TodoApp')
  const sampleApps = sampleAppEntities.map(app => ({
    key: app.name.replace(/\s+/g, '') + 'App', // Convert 'Todo App' to 'TodoApp'
    label: `${app.icon || '🎮'} ${app.name}`,
    registryId: app.id // Keep track of registry ID for debugging
  }));

  // Use template mapping keys for Quick Template Access (these map to template IDs)
  const templates = templateMappingEntities.map(mapping => ({
    key: mapping.metadata?.key || mapping.id,
    label: `🎨 ${mapping.metadata?.key?.replace('Template', '') || mapping.name}`
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mobile Preview</Text>
      
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

      {/* Preview Mode Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preview Mode</Text>
        {modes.map((mode) => (
          <TouchableOpacity
            key={mode.key}
            style={[
              styles.modeButton,
              previewMode === mode.key && styles.activeModeButton,
            ]}
            onPress={() => setPreviewMode(mode.key as any)}>
            <Text
              style={[
                styles.modeButtonText,
                previewMode === mode.key && styles.activeModeButtonText,
              ]}>
              {mode.label}
            </Text>
            <Text
              style={[
                styles.modeSubtitle,
                previewMode === mode.key && styles.activeModeSubtitle,
              ]}>
              {mode.subtitle}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Screen Selection - Only show for screens mode */}
      {previewMode === 'screens' && (
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
      )}


    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
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
});

export default PreviewNavigation; 