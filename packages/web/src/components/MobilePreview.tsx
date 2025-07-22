import React from 'react';
import {View, StyleSheet} from 'react-native';
import {usePreview} from '../context/PreviewContext';
import MobileApp from './MobileApp';
import PhoneStatusBar from './PhoneStatusBar';

const MobilePreview: React.FC = () => {
  const {
    deviceFrame,
    previewMode,
    selectedScreen,
  } = usePreview();

  const getFrameStyles = () => {
    if (deviceFrame === 'android') {
      return {
        ...styles.deviceFrame,
        ...styles.androidFrame,
      };
    }
    return {
      ...styles.deviceFrame,
      ...styles.iphoneFrame,
    };
  };

  return (
    <View style={styles.container}>
      <View style={getFrameStyles()}>
        <View style={styles.screen}>
          <PhoneStatusBar deviceFrame={deviceFrame} />
          <View style={styles.appContent}>
            <MobileApp
              previewMode={previewMode}
              selectedScreen={selectedScreen || undefined}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deviceFrame: {
    borderRadius: 25,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iphoneFrame: {
    backgroundColor: '#1a1a1a',
    width: 375,
    height: 812,
    borderRadius: 40,
  },
  androidFrame: {
    backgroundColor: '#2a2a2a',
    width: 360,
    height: 800,
    borderRadius: 25,
  },
  screen: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 32,
    overflow: 'hidden',
  },
  appContent: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});

export default MobilePreview; 