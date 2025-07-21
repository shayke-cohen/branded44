import React, {useState} from 'react';
import {View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity} from 'react-native';
import {useTheme} from '../context';
import {registerScreen} from '../config/registry';

const WorkoutScreen = () => {
  const {theme} = useTheme();
  const [todayStats] = useState({
    steps: 8542,
    distance: 6.2,
    calories: 420,
    activeTime: 45
  });

  const [quickWorkouts] = useState([
    {id: 1, name: 'Morning Run', duration: '30 min', icon: '🏃‍♂️'},
    {id: 2, name: 'Bike Ride', duration: '45 min', icon: '🚴‍♀️'},
    {id: 3, name: 'Strength Training', duration: '60 min', icon: '💪'},
    {id: 4, name: 'Yoga Session', duration: '20 min', icon: '🧘‍♀️'}
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
    statsContainer: {
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
    statsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    statItem: {
      width: '48%',
      alignItems: 'center',
      marginBottom: 16,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#007AFF',
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    workoutsContainer: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    workoutsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
    workoutItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#f8f9fa',
      borderRadius: 8,
      marginBottom: 12,
    },
    workoutIcon: {
      fontSize: 24,
      marginRight: 16,
    },
    workoutInfo: {
      flex: 1,
    },
    workoutName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    workoutDuration: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    startButton: {
      backgroundColor: '#007AFF',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    startButtonText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
    },
  });

  const handleStartWorkout = (workoutName: string) => {
    // In a real app, this would start a workout session
    console.log(`Starting ${workoutName} workout`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Good Morning! 🌅</Text>
        <Text style={styles.subtitle}>Ready for today's workout?</Text>
        
        {/* Today's Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Today's Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{todayStats.steps.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Steps</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{todayStats.distance}</Text>
              <Text style={styles.statLabel}>Miles</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{todayStats.calories}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{todayStats.activeTime}</Text>
              <Text style={styles.statLabel}>Active Minutes</Text>
            </View>
          </View>
        </View>

        {/* Quick Start Workouts */}
        <View style={styles.workoutsContainer}>
          <Text style={styles.workoutsTitle}>Quick Start</Text>
          {quickWorkouts.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              style={styles.workoutItem}
              onPress={() => handleStartWorkout(workout.name)}>
              <Text style={styles.workoutIcon}>{workout.icon}</Text>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutDuration}>{workout.duration}</Text>
              </View>
              <TouchableOpacity 
                style={styles.startButton}
                onPress={() => handleStartWorkout(workout.name)}>
                <Text style={styles.startButtonText}>Start</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Self-register this screen
registerScreen(WorkoutScreen, {
  name: 'Workouts',
  icon: '🏃‍♂️',
  category: 'Fitness',
  hasTab: true,
  tabPosition: 1,
  description: 'Main workout dashboard with stats and quick start options',
  tags: ['fitness', 'workout', 'dashboard', 'stats']
});

export default WorkoutScreen; 