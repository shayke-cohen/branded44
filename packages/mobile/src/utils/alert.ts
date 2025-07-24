import { AlertButton } from '../components/CustomAlert';

// Store the current alert context globally for utility function access
let alertContextRef: {
  showAlert: (options: { title: string; message: string; buttons?: AlertButton[] }) => void;
} | null = null;

// Function to set the alert context reference
export const setAlertContext = (context: typeof alertContextRef) => {
  alertContextRef = context;
};

// Utility function that mimics React Native's Alert.alert API
export const Alert = {
  alert: (
    title: string,
    message?: string,
    buttons?: Array<{
      text: string;
      onPress?: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>
  ) => {
    if (!alertContextRef) {
      console.error('Alert context not initialized. Make sure AlertProvider is properly set up.');
      return;
    }

    // Default to a single OK button if no buttons provided
    const alertButtons: AlertButton[] = buttons || [{ text: 'OK' }];

    alertContextRef.showAlert({
      title,
      message: message || '',
      buttons: alertButtons,
    });
  }
};

// For convenience, also export the alert function directly
export const showAlert = Alert.alert; 