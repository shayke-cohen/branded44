import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface PhoneStatusBarProps {
  deviceFrame?: 'iphone' | 'android';
}

const PhoneStatusBar: React.FC<PhoneStatusBarProps> = ({deviceFrame = 'iphone'}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const renderSignalBars = () => {
    return (
      <View style={styles.signalContainer}>
        <View style={[styles.signalBar, styles.signalBar1]} />
        <View style={[styles.signalBar, styles.signalBar2]} />
        <View style={[styles.signalBar, styles.signalBar3]} />
        <View style={[styles.signalBar, styles.signalBar4]} />
      </View>
    );
  };

  const renderWifiIcon = () => {
    return (
      <View style={styles.wifiContainer}>
        <View style={styles.wifiIcon}>
          <View style={[styles.wifiArc, styles.wifiArc1]} />
          <View style={[styles.wifiArc, styles.wifiArc2]} />
          <View style={[styles.wifiArc, styles.wifiArc3]} />
          <View style={styles.wifiDot} />
        </View>
      </View>
    );
  };

  const renderBattery = () => {
    return (
      <View style={styles.batteryContainer}>
        <View style={styles.batteryBody}>
          <View style={styles.batteryLevel} />
        </View>
        <View style={styles.batteryTip} />
      </View>
    );
  };

  const renderCarrier = () => {
    return (
      <Text style={styles.carrierText}>
        {deviceFrame === 'iphone' ? 'Verizon' : 'AT&T'}
      </Text>
    );
  };

  return (
    <View style={[
      styles.statusBar,
      deviceFrame === 'android' ? styles.androidStatusBar : styles.iphoneStatusBar
    ]}>
      {/* Left side - Time */}
      <View style={styles.leftSection}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        {deviceFrame === 'android' && (
          <Text style={styles.carrierTextAndroid}>AT&T</Text>
        )}
      </View>

      {/* Center - Dynamic Island (iPhone) or Notch area */}
      <View style={styles.centerSection}>
        {deviceFrame === 'iphone' ? (
          <View style={styles.dynamicIsland}>
            <View style={styles.cameraLens} />
            <View style={styles.speaker} />
          </View>
        ) : (
          <View style={styles.androidNotch} />
        )}
      </View>

      {/* Right side - Status indicators */}
      <View style={styles.rightSection}>
        {renderSignalBars()}
        {renderWifiIcon()}
        <Text style={styles.batteryPercentage}>100%</Text>
        {renderBattery()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#000000',
  },
  iphoneStatusBar: {
    backgroundColor: '#000000',
    paddingTop: 8,
  },
  androidStatusBar: {
    backgroundColor: '#000000',
    paddingTop: 4,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  carrierText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '400',
  },
  carrierTextAndroid: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '400',
    marginLeft: 8,
  },
  dynamicIsland: {
    width: 126,
    height: 32,
    backgroundColor: '#000000',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  cameraLens: {
    width: 6,
    height: 6,
    backgroundColor: '#1a1a1a',
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: '#444444',
  },
  speaker: {
    width: 40,
    height: 4,
    backgroundColor: '#1a1a1a',
    borderRadius: 2,
  },
  androidNotch: {
    width: 80,
    height: 20,
    backgroundColor: '#000000',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  signalBar: {
    width: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  signalBar1: {
    height: 4,
  },
  signalBar2: {
    height: 6,
  },
  signalBar3: {
    height: 8,
  },
  signalBar4: {
    height: 10,
  },
  wifiContainer: {
    marginLeft: 4,
  },
  wifiIcon: {
    width: 15,
    height: 11,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  wifiArc: {
    position: 'absolute',
    borderColor: '#FFFFFF',
    borderStyle: 'solid',
    borderRadius: 10,
  },
  wifiArc1: {
    width: 4,
    height: 4,
    borderWidth: 1,
    bottom: 0,
    left: 6,
  },
  wifiArc2: {
    width: 8,
    height: 8,
    borderWidth: 1,
    bottom: 0,
    left: 4,
  },
  wifiArc3: {
    width: 12,
    height: 12,
    borderWidth: 1,
    bottom: 0,
    left: 2,
  },
  wifiDot: {
    width: 2,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    bottom: 1,
  },
  batteryPercentage: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 2,
  },
  batteryBody: {
    width: 24,
    height: 12,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 2,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    paddingHorizontal: 1,
  },
  batteryLevel: {
    flex: 1,
    backgroundColor: '#34C759',
    borderRadius: 1,
  },
  batteryTip: {
    width: 2,
    height: 6,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 1,
    borderBottomRightRadius: 1,
    marginLeft: 1,
  },
});

export default PhoneStatusBar; 