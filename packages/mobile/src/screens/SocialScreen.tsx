import React, {useState} from 'react';
import {View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity} from 'react-native';
import {useTheme} from '../context';


const SocialScreen = () => {
  const {theme} = useTheme();
  const [activities] = useState([
    {
      id: 1,
      user: 'Sarah Johnson',
      action: 'completed a 5K run',
      time: '2 hours ago',
      details: 'Distance: 3.1 mi • Time: 28:45 • Pace: 9:15/mi',
      likes: 12,
      emoji: '🏃‍♀️'
    },
    {
      id: 2,
      user: 'Mike Chen',
      action: 'achieved a new PR',
      time: '4 hours ago',
      details: 'Bench Press: 185 lbs • Previous: 175 lbs',
      likes: 8,
      emoji: '💪'
    },
    {
      id: 3,
      user: 'Emma Davis',
      action: 'completed 100-day streak',
      time: '6 hours ago',
      details: 'Daily step goal achieved for 100 consecutive days!',
      likes: 25,
      emoji: '🔥'
    },
    {
      id: 4,
      user: 'Alex Kim',
      action: 'joined a cycling challenge',
      time: '1 day ago',
      details: 'September Cycling Challenge: 500 miles',
      likes: 6,
      emoji: '🚴‍♂️'
    },
    {
      id: 5,
      user: 'Lisa Rodriguez',
      action: 'completed yoga session',
      time: '1 day ago',
      details: 'Morning Flow • 45 minutes • 320 calories',
      likes: 15,
      emoji: '🧘‍♀️'
    }
  ]);

  const [myStats] = useState({
    todaySteps: 8542,
    weeklyWorkouts: 5,
    currentStreak: 12
  });

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
    shareContainer: {
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
    shareTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
    shareButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    shareButton: {
      flex: 1,
      backgroundColor: '#007AFF',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 4,
    },
    shareButtonText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
    },
    feedContainer: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    feedTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 20,
    },
    activityItem: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    activityHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    activityEmoji: {
      fontSize: 24,
      marginRight: 12,
    },
    activityUser: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
    },
    activityTime: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    activityAction: {
      fontSize: 15,
      color: theme.colors.text,
      marginBottom: 4,
      marginLeft: 36,
    },
    activityDetails: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginLeft: 36,
      marginBottom: 8,
    },
    activityFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 36,
    },
    likeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f8f9fa',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    likeText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginLeft: 4,
    },
    statsContainer: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 20,
      marginTop: 24,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    statsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#007AFF',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  const handleLike = (activityId: number) => {
    console.log(`Liked activity ${activityId}`);
  };

  const handleShare = (type: string) => {
    console.log(`Sharing ${type}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Social 👥</Text>
        <Text style={styles.subtitle}>Share and discover fitness achievements</Text>
        
        {/* Quick Share */}
        <View style={styles.shareContainer}>
          <Text style={styles.shareTitle}>Share Your Achievement</Text>
          <View style={styles.shareButtons}>
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={() => handleShare('workout')}>
              <Text style={styles.shareButtonText}>💪 Workout</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={() => handleShare('steps')}>
              <Text style={styles.shareButtonText}>👟 Steps</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={() => handleShare('pr')}>
              <Text style={styles.shareButtonText}>🏆 New PR</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Activity Feed */}
        <View style={styles.feedContainer}>
          <Text style={styles.feedTitle}>Friend Activity</Text>
          {activities.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                <Text style={styles.activityUser}>{activity.user}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
              <Text style={styles.activityAction}>{activity.action}</Text>
              <Text style={styles.activityDetails}>{activity.details}</Text>
              <View style={styles.activityFooter}>
                <TouchableOpacity 
                  style={styles.likeButton}
                  onPress={() => handleLike(activity.id)}>
                  <Text>❤️</Text>
                  <Text style={styles.likeText}>{activity.likes}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* My Quick Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Your Today's Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{myStats.todaySteps.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Steps Today</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{myStats.weeklyWorkouts}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{myStats.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Self-register this screen
export default SocialScreen; 