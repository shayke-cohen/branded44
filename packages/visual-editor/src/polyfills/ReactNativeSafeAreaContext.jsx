// React Native Safe Area Context polyfill for web
import React from 'react';

const SafeAreaContext = React.createContext({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});

export const SafeAreaProvider = ({ children }) => {
  const safeAreaInsets = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  };

  return (
    <SafeAreaContext.Provider value={safeAreaInsets}>
      {children}
    </SafeAreaContext.Provider>
  );
};

export const useSafeAreaInsets = () => {
  return React.useContext(SafeAreaContext);
};

export const SafeAreaView = ({ children, style, ...props }) => {
  return (
    <div style={{ ...style, paddingTop: 0 }} {...props}>
      {children}
    </div>
  );
};

export default {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
};
