import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {usePreview} from '../context/PreviewContext';
import MobileApp from './MobileApp';

const MobilePreview: React.FC = () => {
  const {deviceFrame} = usePreview();

  const deviceStyles = deviceFrame === 'iphone' ? iphoneStyles : androidStyles;

  return (
    <View style={styles.container}>
      <View style={[styles.device, deviceStyles.device]}>
        <View style={[styles.screen, deviceStyles.screen]}>
          <MobileApp />
        </View>
        
        {/* Device-specific elements */}
        {deviceFrame === 'iphone' && (
          <>
            <View style={iphoneStyles.notch} />
            <View style={iphoneStyles.homeIndicator} />
          </>
        )}
        
        {deviceFrame === 'android' && (
          <View style={androidStyles.navigationBar}>
            <View style={androidStyles.navButton} />
            <View style={androidStyles.navButton} />
            <View style={androidStyles.navButton} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  device: {
    position: 'relative',
    backgroundColor: '#000',
    borderRadius: 30,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  screen: {
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    position: 'relative',
  },
});

const iphoneStyles = StyleSheet.create({
  device: {
    width: 375,
    height: 812,
    borderRadius: 40,
  },
  screen: {
    width: 359,
    height: 796,
    borderRadius: 32,
  },
  notch: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -75,
    width: 150,
    height: 30,
    backgroundColor: '#000',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    zIndex: 10,
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -67,
    width: 134,
    height: 5,
    backgroundColor: '#000',
    borderRadius: 3,
    zIndex: 10,
  },
});

const androidStyles = StyleSheet.create({
  device: {
    width: 360,
    height: 800,
    borderRadius: 25,
  },
  screen: {
    width: 344,
    height: 740,
    borderRadius: 17,
  },
  navigationBar: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    height: 52,
    backgroundColor: '#1a1a1a',
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  navButton: {
    width: 18,
    height: 18,
    backgroundColor: '#666',
    borderRadius: 2,
  },
});

export default MobilePreview; 