import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { CustomAlert, AlertButton } from '../components/CustomAlert';
import { setAlertContext } from '../utils/alert';

interface AlertOptions {
  title: string;
  message: string;
  buttons?: AlertButton[];
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alertOptions, setAlertOptions] = useState<AlertOptions | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showAlert = (options: AlertOptions) => {
    setAlertOptions(options);
    setIsVisible(true);
  };

  const hideAlert = () => {
    setIsVisible(false);
    setTimeout(() => {
      setAlertOptions(null);
    }, 300); // Wait for animation to complete
  };

  // Set the alert context reference for the utility function
  useEffect(() => {
    setAlertContext({ showAlert });
    return () => setAlertContext(null);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      {alertOptions && (
        <CustomAlert
          visible={isVisible}
          title={alertOptions.title}
          message={alertOptions.message}
          buttons={alertOptions.buttons}
          onDismiss={hideAlert}
        />
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

// Create a simple alert function that mimics Alert.alert API
export const showAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[]
) => {
  // This will be replaced with the actual context function when used within components
  console.warn('showAlert called outside of AlertProvider context');
}; 