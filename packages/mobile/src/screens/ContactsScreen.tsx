import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView} from 'react-native';
import {useTheme} from '../context';
import {registerScreen} from '../config/registry';

const ContactsScreen = () => {
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
    contactCard: {
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
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    avatarText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
    },
    contactInfo: {
      flex: 1,
    },
    contactName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    contactDetails: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    actionButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.primary + '20',
    },
    actionText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '500',
    },
  });

  const contacts = [
    {
      id: '1',
      name: 'Sarah Johnson',
      phone: '+1 (555) 123-4567',
      email: 'sarah.j@example.com',
      initials: 'SJ'
    },
    {
      id: '2', 
      name: 'Mike Chen',
      phone: '+1 (555) 987-6543',
      email: 'mike.chen@example.com',
      initials: 'MC'
    },
    {
      id: '3',
      name: 'Emma Rodriguez',
      phone: '+1 (555) 456-7890',
      email: 'emma.r@example.com',
      initials: 'ER'
    },
    {
      id: '4',
      name: 'David Kim',
      phone: '+1 (555) 234-5678',
      email: 'david.kim@example.com',
      initials: 'DK'
    },
    {
      id: '5',
      name: 'Lisa Thompson',
      phone: '+1 (555) 345-6789',
      email: 'lisa.t@example.com',
      initials: 'LT'
    }
  ];

  const renderContact = (contact: typeof contacts[0]) => (
    <TouchableOpacity 
      key={contact.id}
      style={styles.contactCard}
      onPress={() => console.log('Call contact:', contact.name)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{contact.initials}</Text>
      </View>
      
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.contactDetails}>{contact.phone}</Text>
        <Text style={styles.contactDetails}>{contact.email}</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => console.log('Message contact:', contact.name)}
      >
        <Text style={styles.actionText}>Message</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>👥 Contacts</Text>
        <Text style={styles.subtitle}>
          {contacts.length} contacts
        </Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {contacts.map(renderContact)}
      </ScrollView>
    </SafeAreaView>
  );
};

// 🎯 SINGLE FILE REGISTRATION - TESTING OUR NEW SYSTEM!
registerScreen(ContactsScreen, {
  name: 'Contacts',
  icon: '👥',
  category: 'Communication',
  hasTab: true,
  tabPosition: 6,
  description: 'Manage your contacts and communications',
  tags: ['contacts', 'people', 'communication', 'directory']
});

export default ContactsScreen; 