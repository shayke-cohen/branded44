import React from 'react';
import { View } from 'react-native';

// Mock WebView component for testing
export const WebView = React.forwardRef((props, ref) => {
  return <View testID="webview-mock" ref={ref} {...props} />;
});

// Default export
export default WebView; 