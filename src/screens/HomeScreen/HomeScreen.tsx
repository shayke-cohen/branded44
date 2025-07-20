import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '../../context';

const HomeScreen = () => {
  const {theme} = useTheme();

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
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Your App</Text>
      <Text style={styles.subtitle}>
        This is your home screen. Start building your app from here!
      </Text>
    </View>
  );
};

export default HomeScreen; 