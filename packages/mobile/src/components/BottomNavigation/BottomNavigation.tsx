import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {BottomNavigationProps} from '../../types';
import {getNavTabs} from '../../screen-templates/templateConfig';

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabPress,
}) => {
  const {theme} = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.tabBarBackground,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    tabContainer: {
      flexDirection: 'row',
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    tabIcon: {
      fontSize: 28, // Larger icon since no text
      marginBottom: 2, // Reduced margin
    },
    tabLabel: {
      fontSize: 8,
      fontWeight: '500',
      marginTop: 1,
    },
    activeTabLabel: {
      color: theme.colors.tabBarActive,
    },
    inactiveTabLabel: {
      color: theme.colors.tabBarInactive,
    },
  });

  // Get navigation tabs from unified registry
  const navTabs = getNavTabs();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        {navTabs.map(tab => {
          // Use shortName from metadata if available, otherwise no text
          const displayName = tab.metadata?.shortName || '';
          const showLabel = displayName.length > 0;
          
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => onTabPress(tab.id)}
              activeOpacity={0.7}
              testID={`tab-${tab.id}`}>
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              {showLabel && (
                <Text
                  style={[
                    styles.tabLabel,
                    activeTab === tab.id
                      ? styles.activeTabLabel
                      : styles.inactiveTabLabel,
                  ]}>
                  {displayName}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

export default BottomNavigation;