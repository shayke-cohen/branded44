import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView} from 'react-native';
import {useTheme} from '../../context';


const ProfileScreen = () => {
  const {theme} = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      alignItems: 'center',
      padding: 24,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    avatarText: {
      fontSize: 36,
      fontWeight: 'bold',
      color: theme.colors.background,
    },
    name: {
      fontSize: 24,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    email: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginBottom: 8,
    },
    menuIcon: {
      fontSize: 20,
      marginRight: 16,
      width: 24,
      textAlign: 'center',
    },
    menuText: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
    },
    menuArrow: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    stat: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      marginBottom: 8,
    },
    statLabel: {
      fontSize: 16,
      color: theme.colors.text,
    },
    statValue: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
    },
  });

  const menuItems = [
    { icon: '👤', label: 'Edit Profile', onPress: () => console.log('Edit Profile') },
    { icon: '🔔', label: 'Notifications', onPress: () => console.log('Notifications') },
    { icon: '🔒', label: 'Privacy & Security', onPress: () => console.log('Privacy') },
    { icon: '💳', label: 'Payment Methods', onPress: () => console.log('Payment') },
    { icon: '📱', label: 'App Preferences', onPress: () => console.log('App Preferences') },
    { icon: '❓', label: 'Help & Support', onPress: () => console.log('Help') },
  ];

  const stats = [
    { label: 'Tasks Completed', value: '127' },
    { label: 'Projects', value: '8' },
    { label: 'Team Members', value: '12' },
    { label: 'Days Active', value: '45' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>john.doe@example.com</Text>
        </View>

        <View style={styles.content}>
          {/* Stats Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Your Stats</Text>
            {stats.map((stat, index) => (
              <View key={index} style={styles.stat}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>

          {/* Menu Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚙️ Account</Text>
            {menuItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuText}>{item.label}</Text>
                <Text style={styles.menuArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Self-register this screen - THIS IS ALL YOU NEED TO ADD A NEW SCREEN! 🎉
export default ProfileScreen; 