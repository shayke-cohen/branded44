import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {THEME_OPTIONS} from '../../constants';

const SettingsScreen = () => {
  const {theme, themeMode, setThemeMode, isDark} = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 20,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 15,
    },
    optionContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    optionContent: {
      flex: 1,
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
      marginBottom: 2,
    },
    optionDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioButtonSelected: {
      backgroundColor: theme.colors.primary,
    },
    radioButtonInner: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#FFFFFF',
    },
    infoSection: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginTop: 20,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    infoText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    currentThemeIndicator: {
      backgroundColor: isDark ? theme.colors.primary : theme.colors.success,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginTop: 10,
    },
    currentThemeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          {THEME_OPTIONS.map(option => (
            <TouchableOpacity
              key={option.key}
              style={styles.optionContainer}
              onPress={() => setThemeMode(option.key)}>
              <View style={styles.option}>
                <View style={styles.optionContent}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radioButton,
                    themeMode === option.key && styles.radioButtonSelected,
                  ]}>
                  {themeMode === option.key && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Current Theme</Text>
          <Text style={styles.infoText}>
            You are currently using the{' '}
            <Text style={{fontWeight: '600'}}>
              {themeMode === 'system' 
                ? `system (${isDark ? 'dark' : 'light'})` 
                : themeMode}
            </Text>{' '}
            theme. The app will automatically adapt its colors and appearance
            based on your selection.
          </Text>
          <View style={styles.currentThemeIndicator}>
            <Text style={styles.currentThemeText}>
              {isDark ? 'DARK MODE' : 'LIGHT MODE'}
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>About</Text>
          <Text style={styles.infoText}>
            This is a simple todo app with dark mode support. The app respects
            your system preferences when set to "System" mode and provides
            manual override options for light and dark themes.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;