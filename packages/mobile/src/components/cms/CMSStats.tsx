/**
 * CMSStats - Reusable CMS statistics display component
 * 
 * Shows overview statistics for CMS data
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { createCMSStyles } from '../../shared/styles/CMSStyles';

interface CMSStatsProps {
  stats: {
    totalCollections: number;
    totalItems: number;
    recentItems: number;
  };
  style?: any;
}

export const CMSStats: React.FC<CMSStatsProps> = ({
  stats,
  style,
}) => {
  const { theme } = useTheme();
  const styles = createCMSStyles(theme);

  const statsData = [
    {
      label: 'Collections',
      value: stats.totalCollections.toString(),
      icon: '📁',
    },
    {
      label: 'Total Items',
      value: stats.totalItems.toString(),
      icon: '📄',
    },
    {
      label: 'Recent',
      value: stats.recentItems.toString(),
      icon: '🆕',
    },
  ];

  return (
    <View style={[styles.statsSection, style]}>
      <Text style={styles.statsTitle}>Content Overview</Text>
      
      <View style={styles.statsGrid}>
        {statsData.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <Text style={styles.emptyIcon}>{stat.icon}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default CMSStats;
