import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {useTheme} from '../context';

// Define your data types here
interface StatCard {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: string;
}

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  onPress: () => void;
}

interface DashboardScreenTemplateProps {
  title?: string;
  stats?: StatCard[];
  quickActions?: QuickAction[];
  onRefresh?: () => void;
  onStatPress?: (stat: StatCard) => void;
  children?: React.ReactNode;
}

const DashboardScreenTemplate: React.FC<DashboardScreenTemplateProps> = ({
  title = 'Dashboard',
  stats = [],
  quickActions = [],
  onRefresh,
  onStatPress,
  children,
}) => {
  const {theme} = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  // Sample data - replace with your actual data
  const defaultStats: StatCard[] = [
    {id: '1', title: 'Total Items', value: 127, change: '+12%', changeType: 'positive', icon: '📊'},
    {id: '2', title: 'Active Users', value: 1045, change: '+5%', changeType: 'positive', icon: '👥'},
    {id: '3', title: 'Revenue', value: '$12,345', change: '-2%', changeType: 'negative', icon: '💰'},
    {id: '4', title: 'Pending', value: 23, change: '0%', changeType: 'neutral', icon: '⏳'},
  ];

  const defaultActions: QuickAction[] = [
    {id: '1', title: 'Add New', icon: '➕', onPress: () => console.log('Add new')},
    {id: '2', title: 'Reports', icon: '📈', onPress: () => console.log('Reports')},
    {id: '3', title: 'Settings', icon: '⚙️', onPress: () => console.log('Settings')},
    {id: '4', title: 'Export', icon: '📤', onPress: () => console.log('Export')},
  ];

  const statsToShow = stats.length > 0 ? stats : defaultStats;
  const actionsToShow = quickActions.length > 0 ? quickActions : defaultActions;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 16,
      paddingTop: 60,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    content: {
      flex: 1,
    },
    section: {
      paddingHorizontal: 16,
      paddingVertical: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    statCard: {
      width: '48%',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statIcon: {
      fontSize: 24,
      marginBottom: 8,
    },
    statTitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    statChange: {
      fontSize: 12,
      fontWeight: '600',
    },
    positiveChange: {
      color: theme.colors.success,
    },
    negativeChange: {
      color: theme.colors.error,
    },
    neutralChange: {
      color: theme.colors.textSecondary,
    },
    actionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    actionCard: {
      width: '48%',
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    actionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
    },
    customContent: {
      paddingHorizontal: 16,
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh?.();
    } finally {
      setRefreshing(false);
    }
  };

  const renderStatCard = (stat: StatCard) => (
    <TouchableOpacity
      key={stat.id}
      style={styles.statCard}
      onPress={() => onStatPress?.(stat)}
      testID={`stat-card-${stat.id}`}
      activeOpacity={0.7}>
      {stat.icon && <Text style={styles.statIcon}>{stat.icon}</Text>}
      <Text style={styles.statTitle}>{stat.title}</Text>
      <Text style={styles.statValue}>{stat.value}</Text>
      {stat.change && (
        <Text style={[
          styles.statChange,
          stat.changeType === 'positive' && styles.positiveChange,
          stat.changeType === 'negative' && styles.negativeChange,
          stat.changeType === 'neutral' && styles.neutralChange,
        ]}>
          {stat.change}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderActionCard = (action: QuickAction) => (
    <TouchableOpacity
      key={action.id}
      style={styles.actionCard}
      onPress={action.onPress}
      testID={`action-card-${action.id}`}
      activeOpacity={0.7}>
      <Text style={styles.actionIcon}>{action.icon}</Text>
      <Text style={styles.actionTitle}>{action.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>Welcome back! Here's your overview</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          ) : undefined
        }>
        
        {/* Stats Section */}
        {statsToShow.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsContainer}>
              {statsToShow.map(renderStatCard)}
            </View>
          </View>
        )}

        {/* Quick Actions Section */}
        {actionsToShow.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsContainer}>
              {actionsToShow.map(renderActionCard)}
            </View>
          </View>
        )}

        {/* Custom Content */}
        {children && (
          <View style={styles.customContent}>
            {children}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default DashboardScreenTemplate; 