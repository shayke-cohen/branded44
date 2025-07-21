import React, {useState} from 'react';
import {View, Text, StyleSheet, SafeAreaView, ScrollView} from 'react-native';
import {useTheme} from '../context';
import {registerScreen} from '../config/registry';

const ProgressScreen = () => {
  const {theme} = useTheme();
  const [weeklyData] = useState([
    {day: 'Mon', steps: 8500, calories: 420},
    {day: 'Tue', steps: 10200, calories: 510},
    {day: 'Wed', steps: 7800, calories: 390},
    {day: 'Thu', steps: 12000, calories: 600},
    {day: 'Fri', steps: 9500, calories: 475},
    {day: 'Sat', steps: 15000, calories: 750},
    {day: 'Sun', steps: 11200, calories: 560}
  ]);

  const [monthlyGoals] = useState({
    steps: {current: 285000, target: 300000},
    calories: {current: 12500, target: 15000},
    workouts: {current: 18, target: 20},
    distance: {current: 85.5, target: 100}
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
    chartContainer: {
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
    chartTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 20,
    },
    weeklyChart: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      height: 120,
      marginBottom: 10,
    },
    chartBar: {
      width: 28,
      backgroundColor: '#007AFF',
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingBottom: 4,
    },
    chartValue: {
      fontSize: 10,
      color: '#ffffff',
      fontWeight: '600',
    },
    chartDay: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 4,
    },
    goalsContainer: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      padding: 20,
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
      marginBottom: 20,
    },
    goalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    goalName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    goalProgress: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    progressBar: {
      height: 8,
      backgroundColor: '#f0f0f0',
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#007AFF',
      borderRadius: 4,
    },
    streakContainer: {
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
    streakTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
    streakGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    streakItem: {
      width: '48%',
      alignItems: 'center',
      marginBottom: 16,
    },
    streakValue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#28a745',
      marginBottom: 4,
    },
    streakLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getBarHeight = (steps: number) => {
    const maxSteps = Math.max(...weeklyData.map(d => d.steps));
    return (steps / maxSteps) * 100;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Progress 📊</Text>
        <Text style={styles.subtitle}>Track your fitness journey</Text>
        
        {/* Weekly Steps Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>This Week's Steps</Text>
          <View style={styles.weeklyChart}>
            {weeklyData.map((data, index) => (
              <View key={index} style={{alignItems: 'center'}}>
                <View style={[
                  styles.chartBar, 
                  {height: `${getBarHeight(data.steps)}%`}
                ]}>
                  <Text style={styles.chartValue}>
                    {(data.steps / 1000).toFixed(0)}k
                  </Text>
                </View>
                <Text style={styles.chartDay}>{data.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Monthly Goals */}
        <View style={styles.goalsContainer}>
          <Text style={styles.goalsTitle}>Monthly Goals</Text>
          
          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalName}>👟 Steps</Text>
              <Text style={styles.goalProgress}>
                {monthlyGoals.steps.current.toLocaleString()} / {monthlyGoals.steps.target.toLocaleString()}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill, 
                {width: `${getProgressPercentage(monthlyGoals.steps.current, monthlyGoals.steps.target)}%`}
              ]} />
            </View>
          </View>

          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalName}>🔥 Calories</Text>
              <Text style={styles.goalProgress}>
                {monthlyGoals.calories.current.toLocaleString()} / {monthlyGoals.calories.target.toLocaleString()}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill, 
                {width: `${getProgressPercentage(monthlyGoals.calories.current, monthlyGoals.calories.target)}%`}
              ]} />
            </View>
          </View>

          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalName}>💪 Workouts</Text>
              <Text style={styles.goalProgress}>
                {monthlyGoals.workouts.current} / {monthlyGoals.workouts.target}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill, 
                {width: `${getProgressPercentage(monthlyGoals.workouts.current, monthlyGoals.workouts.target)}%`}
              ]} />
            </View>
          </View>

          <View style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalName}>🏃‍♂️ Distance (mi)</Text>
              <Text style={styles.goalProgress}>
                {monthlyGoals.distance.current} / {monthlyGoals.distance.target}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill, 
                {width: `${getProgressPercentage(monthlyGoals.distance.current, monthlyGoals.distance.target)}%`}
              ]} />
            </View>
          </View>
        </View>

        {/* Streaks */}
        <View style={styles.streakContainer}>
          <Text style={styles.streakTitle}>Achievement Streaks</Text>
          <View style={styles.streakGrid}>
            <View style={styles.streakItem}>
              <Text style={styles.streakValue}>12</Text>
              <Text style={styles.streakLabel}>Day Workout Streak</Text>
            </View>
            <View style={styles.streakItem}>
              <Text style={styles.streakValue}>28</Text>
              <Text style={styles.streakLabel}>Day Step Goal</Text>
            </View>
            <View style={styles.streakItem}>
              <Text style={styles.streakValue}>5</Text>
              <Text style={styles.streakLabel}>Personal Records</Text>
            </View>
            <View style={styles.streakItem}>
              <Text style={styles.streakValue}>156</Text>
              <Text style={styles.streakLabel}>Total Workouts</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Self-register this screen
registerScreen(ProgressScreen, {
  name: 'Progress',
  icon: '📊',
  category: 'Fitness',
  hasTab: true,
  tabPosition: 2,
  description: 'Charts and analytics showing fitness progress over time',
  tags: ['fitness', 'progress', 'charts', 'analytics', 'goals']
});

export default ProgressScreen; 