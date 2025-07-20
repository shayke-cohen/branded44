import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView} from 'react-native';
import {useTheme} from '../../context';
import {registerScreen} from '../../config/registry';

const MessagesScreen = () => {
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
    messageCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    avatarText: {
      color: theme.colors.background,
      fontSize: 18,
      fontWeight: 'bold',
    },
    messageInfo: {
      flex: 1,
    },
    senderName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    messagePreview: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    timestamp: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    unreadBadge: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      minWidth: 24,
      alignItems: 'center',
    },
    unreadText: {
      color: theme.colors.background,
      fontSize: 12,
      fontWeight: 'bold',
    },
    composeButton: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    composeIcon: {
      fontSize: 24,
      color: theme.colors.background,
    },
  });

  const messages = [
    {
      id: '1',
      sender: 'Alice Cooper',
      preview: 'Hey! Are we still on for the meeting tomorrow?',
      timestamp: '2m ago',
      unread: 2,
      avatar: 'AC'
    },
    {
      id: '2', 
      sender: 'Bob Smith',
      preview: 'Thanks for the presentation slides!',
      timestamp: '15m ago',
      unread: 0,
      avatar: 'BS'
    },
    {
      id: '3',
      sender: 'Carol Johnson',
      preview: 'The project looks great. Let\'s discuss the timeline.',
      timestamp: '1h ago',
      unread: 1,
      avatar: 'CJ'
    },
    {
      id: '4',
      sender: 'David Wilson',
      preview: 'Can you review the latest changes?',
      timestamp: '3h ago',
      unread: 0,
      avatar: 'DW'
    },
    {
      id: '5',
      sender: 'Emma Davis',
      preview: 'Great work on the new feature!',
      timestamp: 'Yesterday',
      unread: 0,
      avatar: 'ED'
    },
  ];

  const renderMessage = (message: typeof messages[0]) => (
    <TouchableOpacity 
      key={message.id} 
      style={styles.messageCard}
      onPress={() => console.log('Open message:', message.sender)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{message.avatar}</Text>
      </View>
      
      <View style={styles.messageInfo}>
        <Text style={styles.senderName}>{message.sender}</Text>
        <Text style={styles.messagePreview} numberOfLines={1}>
          {message.preview}
        </Text>
        <Text style={styles.timestamp}>{message.timestamp}</Text>
      </View>
      
      {message.unread > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{message.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💬 Messages</Text>
        <Text style={styles.subtitle}>Stay connected with your team</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {messages.map(renderMessage)}
      </ScrollView>

      <TouchableOpacity 
        style={styles.composeButton}
        onPress={() => console.log('Compose new message')}
      >
        <Text style={styles.composeIcon}>✏️</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Self-register this screen - NO MANUAL IMPORTS NEEDED ANYWHERE! 🎉
registerScreen(MessagesScreen, {
  name: 'Messages',
  icon: '💬',
  category: 'Communication',
  hasTab: true,
  tabPosition: 2,
  description: 'Messages and team communication',
  tags: ['messages', 'chat', 'communication', 'team']
});

export default MessagesScreen; 