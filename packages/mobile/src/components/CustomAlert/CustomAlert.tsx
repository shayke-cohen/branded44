import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '../../context';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
}

const { width } = Dimensions.get('window');

// Detect if running in web environment
const isWeb = Platform.OS === 'web' || (typeof (global as any).document !== 'undefined');

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: 'OK' }],
  onDismiss,
}) => {
  const { theme } = useTheme();

  const handleButtonPress = (button: AlertButton) => {
    button.onPress?.();
    onDismiss?.();
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    // Web-specific overlay that uses absolute positioning
    webOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      zIndex: 1000,
    },
    alertContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 24,
      maxWidth: Math.min(width - 40, 400),
      width: '100%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 12,
    },
    // Web-specific alert container with constrained width
    webAlertContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 24,
      maxWidth: 280, // Smaller max width for phone frame
      width: '80%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    message: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 24,
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
    },
    defaultButton: {
      backgroundColor: theme.colors.primary,
    },
    cancelButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    destructiveButton: {
      backgroundColor: '#ff4444',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '500',
    },
    defaultButtonText: {
      color: '#fff',
    },
    cancelButtonText: {
      color: theme.colors.text,
    },
    destructiveButtonText: {
      color: '#fff',
    },
  });

  if (!visible) {
    return null;
  }

  const renderAlertContent = () => (
    <TouchableOpacity
      style={isWeb ? styles.webAlertContainer : styles.alertContainer}
      activeOpacity={1}
      onPress={(e) => e.stopPropagation()}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      
      <View style={styles.buttonsContainer}>
        {buttons.map((button, index) => {
          const buttonStyle = button.style || 'default';
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.button,
                buttonStyle === 'cancel' && styles.cancelButton,
                buttonStyle === 'destructive' && styles.destructiveButton,
                buttonStyle === 'default' && styles.defaultButton,
              ]}
              onPress={() => handleButtonPress(button)}
            >
              <Text
                style={[
                  styles.buttonText,
                  buttonStyle === 'cancel' && styles.cancelButtonText,
                  buttonStyle === 'destructive' && styles.destructiveButtonText,
                  buttonStyle === 'default' && styles.defaultButtonText,
                ]}
              >
                {button.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </TouchableOpacity>
  );

  // Use different rendering approaches for web vs native
  if (isWeb) {
    // For web, use absolute positioning to stay within the phone frame
    return (
      <TouchableOpacity
        style={styles.webOverlay}
        activeOpacity={1}
        onPress={onDismiss}
      >
        {renderAlertContent()}
      </TouchableOpacity>
    );
  }

  // For native, use Modal as before
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onDismiss}
      >
        {renderAlertContent()}
      </TouchableOpacity>
    </Modal>
  );
}; 