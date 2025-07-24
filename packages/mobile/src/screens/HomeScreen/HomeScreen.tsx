import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useTheme} from '../../context';

const HomeScreen = () => {
  const {theme} = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stopperActive, setStopperActive] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    clockContainer: {
      marginTop: 30,
      padding: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    timeText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: 8,
    },
    dateText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    stopperContainer: {
      marginTop: 30,
      padding: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    stopperTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
    stopperStatus: {
      fontSize: 16,
      marginBottom: 16,
      fontWeight: '500',
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
      minWidth: 80,
      alignItems: 'center',
    },
    startButton: {
      backgroundColor: theme.colors.success,
    },
    stopButton: {
      backgroundColor: theme.colors.error,
    },
    buttonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleStartStopper = () => {
    setStopperActive(true);
  };

  const handleStopStopper = () => {
    setStopperActive(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Your App</Text>
      <Text style={styles.subtitle}>
        This is your home screen. Start building your app from here!
      </Text>
      <View style={styles.clockContainer}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
      </View>
      <View style={styles.stopperContainer}>
        <Text style={styles.stopperTitle}>Stopper Control</Text>
        <Text style={[styles.stopperStatus, { 
          color: stopperActive ? theme.colors.error : theme.colors.success 
        }]}>
          Status: {stopperActive ? 'ACTIVE' : 'STOPPED'}
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={handleStartStopper}
            disabled={stopperActive}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={handleStopStopper}
            disabled={!stopperActive}>
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default HomeScreen; 