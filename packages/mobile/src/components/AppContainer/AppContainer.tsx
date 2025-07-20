import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  StatusBar,
} from 'react-native';
import {useTheme} from '../../context';

interface AppContainerProps {
  isVisible: boolean;
  onClose: () => void;
  appName: string;
  appIcon?: string;
  children: React.ReactNode;
}

const AppContainer: React.FC<AppContainerProps> = ({
  isVisible,
  onClose,
  appName,
  appIcon,
  children,
}) => {
  const {theme} = useTheme();

  const styles = StyleSheet.create({
    modal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      marginTop: 44, // Status bar height for iOS
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    backButtonText: {
      fontSize: 16,
      color: theme.colors.text,
      marginLeft: 4,
    },
    headerTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 2,
    },
    appIcon: {
      fontSize: 20,
      marginRight: 8,
    },
    appName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    headerRight: {
      flex: 1,
      alignItems: 'flex-end',
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: theme.colors.primary + '20',
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    content: {
      flex: 1,
    },
  });

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onClose}
              testID="app-back-button">
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.headerTitle}>
            {appIcon && <Text style={styles.appIcon}>{appIcon}</Text>}
            <Text style={styles.appName}>{appName}</Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Sample App</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>{children}</View>
      </SafeAreaView>
    </Modal>
  );
};

export default AppContainer; 