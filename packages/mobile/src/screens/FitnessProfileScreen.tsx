import React, {useState} from 'react';
import {View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity} from 'react-native';
import {useTheme} from '../context';
import {registerScreen} from '../config/registry';

const FitnessProfileScreen = () => {
  const {theme} = useTheme();
  const [userProfile] = useState({
    name: 'Alex Runner',
    level: 'Intermediate',
    joinDate: 'March 2023',
    totalWorkouts: 156,
    totalMiles: 423.7,
    totalCalories: 65420
  });

  const [goals] = useState([
    {id: 1, name: 'Daily Steps', current: 8500, target: 10000, unit: 'steps', icon: '👟'},
    {id: 2, name: 'Weekly Workouts', current: 4, target: 5, unit: 'workouts', icon: '💪'},
    {id: 3, name: 'Monthly Distance', current: 28.5, target: 50, unit: 'miles', icon: '🏃‍♂️'},
    {id: 4, name: 'Calories per Day', current: 420, target: 500, unit: 'calories', icon: '🔥'}
  ]);

  const [achievements] = useState([
    {id: 1, name: 'First 5K', date: 'March 15, 2023', icon: '🥉'},
    {id: 2, name: '100 Day Streak', date: 'July 22, 2023', icon: '🔥'},
    {id: 3, name: '500 Miles', date: 'August 10, 2023', icon: '🏆'},
    {id: 4, name: 'Marathon Finisher', date: 'September 8, 2023', icon: '🥇'}
  ]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 20,
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
      marginBottom: 30,
    },
    profileCard: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    profileAvatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#007AFF',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      alignSelf: 'center',
    },
    profileAvatarText: {
      fontSize: 32,
      color: '#ffffff',
      fontWeight: 'bold',
    },
    profileName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    profileLevel: {
      fontSize: 16,
      color: '#007AFF',
      textAlign: 'center',
      marginBottom: 4,
    },
    profileJoinDate: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    goalsContainer: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    goalsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 20,
    },
    goalItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    goalIcon: {
      fontSize: 24,
      marginRight: 16,
    },
    goalInfo: {
      flex: 1,
    },
    goalName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    goalProgress: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    goalBar: {
      height: 6,
      backgroundColor: '#f0f0f0',
      borderRadius: 3,
      overflow: 'hidden',
    },
    goalFill: {
      height: '100%',
      backgroundColor: '#007AFF',
    },
    goalPercentage: {
      fontSize: 16,
      fontWeight: '600',
      color: '#007AFF',
      marginLeft: 12,
    },
    achievementsContainer: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    achievementsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 20,
    },
    achievementItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    achievementIcon: {
      fontSize: 28,
      marginRight: 16,
    },
    achievementInfo: {
      flex: 1,
    },
    achievementName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    achievementDate: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    settingsContainer: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    settingsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 20,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingIcon: {
      fontSize: 20,
      marginRight: 12,
    },
    settingText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    settingArrow: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
  });

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const handleSettingPress = (setting: string) => {
    console.log(`Opening ${setting} settings`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Profile 👤</Text>
        <Text style={styles.subtitle}>Your fitness journey and goals</Text>
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>AR</Text>
          </View>
          <Text style={styles.profileName}>{userProfile.name}</Text>
          <Text style={styles.profileLevel}>{userProfile.level} Athlete</Text>
          <Text style={styles.profileJoinDate}>Member since {userProfile.joinDate}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProfile.totalWorkouts}</Text>
              <Text style={styles.statLabel}>Total Workouts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProfile.totalMiles}</Text>
              <Text style={styles.statLabel}>Miles Covered</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{(userProfile.totalCalories / 1000).toFixed(0)}K</Text>
              <Text style={styles.statLabel}>Calories Burned</Text>
            </View>
          </View>
        </View>

        {/* Current Goals */}
        <View style={styles.goalsContainer}>
          <Text style={styles.goalsTitle}>Current Goals</Text>
          {goals.map((goal) => (
            <View key={goal.id} style={styles.goalItem}>
              <Text style={styles.goalIcon}>{goal.icon}</Text>
              <View style={styles.goalInfo}>
                <Text style={styles.goalName}>{goal.name}</Text>
                <Text style={styles.goalProgress}>
                  {goal.current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
                </Text>
                <View style={styles.goalBar}>
                  <View style={[
                    styles.goalFill, 
                    {width: `${getProgressPercentage(goal.current, goal.target)}%`}
                  ]} />
                </View>
              </View>
              <Text style={styles.goalPercentage}>
                {Math.round(getProgressPercentage(goal.current, goal.target))}%
              </Text>
            </View>
          ))}
        </View>

        {/* Recent Achievements */}
        <View style={styles.achievementsContainer}>
          <Text style={styles.achievementsTitle}>Recent Achievements</Text>
          {achievements.map((achievement) => (
            <View key={achievement.id} style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementName}>{achievement.name}</Text>
                <Text style={styles.achievementDate}>{achievement.date}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Settings */}
        <View style={styles.settingsContainer}>
          <Text style={styles.settingsTitle}>Settings</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleSettingPress('goals')}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🎯</Text>
              <Text style={styles.settingText}>Edit Goals</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleSettingPress('notifications')}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🔔</Text>
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleSettingPress('privacy')}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>🔒</Text>
              <Text style={styles.settingText}>Privacy</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => handleSettingPress('sync')}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>⚙️</Text>
              <Text style={styles.settingText}>Sync Devices</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Self-register this screen
registerScreen(FitnessProfileScreen, {
  name: 'Profile',
  icon: '👤',
  category: 'Fitness',
  hasTab: true,
  tabPosition: 4,
  description: 'User profile with fitness goals and settings',
  tags: ['fitness', 'profile', 'goals', 'settings', 'achievements']
});

export default FitnessProfileScreen; 