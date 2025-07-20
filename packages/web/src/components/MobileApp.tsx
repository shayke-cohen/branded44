import React from 'react';
import {View, StyleSheet} from 'react-native';
import {usePreview} from '../context/PreviewContext';

// Import mobile components (we'll use dynamic imports to handle loading)
// These will be resolved via webpack alias to @mobile
import {ThemeProvider, CartProvider} from '@mobile/context';

// Lazy load components to handle potential import issues
const MobileScreens = React.lazy(() => import('./MobileScreens'));
const MobileSampleApps = React.lazy(() => import('./MobileSampleApps'));
const MobileTemplates = React.lazy(() => import('./MobileTemplates'));

const MobileApp: React.FC = () => {
  const {mode} = usePreview();

  const renderContent = () => {
    switch (mode) {
      case 'screens':
        return <MobileScreens />;
      case 'sample-apps':
        return <MobileSampleApps />;
      case 'templates':
        return <MobileTemplates />;
      default:
        return <MobileScreens />;
    }
  };

  return (
    <ThemeProvider>
      <CartProvider>
        <View style={styles.container}>
          <React.Suspense fallback={<View style={styles.loading} />}>
            {renderContent()}
          </React.Suspense>
        </View>
      </CartProvider>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loading: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default MobileApp; 