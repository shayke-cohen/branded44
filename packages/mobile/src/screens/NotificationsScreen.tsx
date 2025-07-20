import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView} from 'react-native';
import {useTheme} from '../context';
import {registerScreen} from '../config/registry';

const NotificationsScreen = () => {
  const {theme} = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 20,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    notificationCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.primary,
    },
    notificationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    notificationTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
      marginRight: 12,
    },
    timestamp: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    notificationMessage: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: 8,
    },
    notificationFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    notificationType: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    markAsRead: {
      fontSize: 12,
      color: theme.colors.primary,
      textDecorationLine: 'underline',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    emptyMessage: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: 40,
    },
  });

  const notifications = [
    {
      id: '1',
      title: 'Welcome to the App!',
      message: 'Thanks for joining us. Explore all the features we have to offer.',
      type: 'Welcome',
      timestamp: '2 minutes ago',
      isRead: false,
    },
    {
      id: '2',
      title: 'New Feature Available',
      message: 'Check out our new messaging system. Connect with your team like never before.',
      type: 'Feature',
      timestamp: '1 hour ago',
      isRead: false,
    },
    {
      id: '3',
      title: 'Profile Updated',
      message: 'Your profile information has been successfully updated.',
      type: 'Account',
      timestamp: '3 hours ago',
      isRead: true,
    },
    {
      id: '4',
      title: 'Weekly Summary',
      message: 'Your weekly activity summary is now available in the dashboard.',
      type: 'Report',
      timestamp: '1 day ago',
      isRead: true,
    },
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderNotification = (notification: typeof notifications[0]) => (
    <TouchableOpacity 
      key={notification.id} 
      style={[
        styles.notificationCard,
        { borderLeftColor: notification.isRead ? theme.colors.border : theme.colors.primary }
      ]}
      onPress={() => console.log('Open notification:', notification.title)}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>{notification.title}</Text>
        <Text style={styles.timestamp}>{notification.timestamp}</Text>
      </View>
      
      <Text style={styles.notificationMessage}>
        {notification.message}
      </Text>
      
      <View style={styles.notificationFooter}>
        <Text style={styles.notificationType}>{notification.type}</Text>
        {!notification.isRead && (
          <TouchableOpacity onPress={() => console.log('Mark as read:', notification.id)}>
            <Text style={styles.markAsRead}>Mark as read</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔔 Notifications</Text>
        <Text style={styles.subtitle}>
          {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
        </Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.length > 0 ? (
          notifications.map(renderNotification)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔕</Text>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyMessage}>
              You're all caught up! New notifications will appear here.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// SINGLE FILE SCREEN CREATION - THIS IS THE ONLY FILE WE NEED! 🎉
registerScreen(NotificationsScreen, {
  name: 'Notifications',
  icon: '🔔',
  category: 'System',
  hasTab: true,
  tabPosition: 3,
  description: 'App notifications and alerts',
  tags: ['notifications', 'alerts', 'system', 'updates']
});

export default NotificationsScreen; 