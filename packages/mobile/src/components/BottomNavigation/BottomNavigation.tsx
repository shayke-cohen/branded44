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
import {getNavTabs} from '../../screen-templates';

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
      fontSize: 24,
      marginBottom: 4,
    },
    tabLabel: {
      fontSize: 12,
      fontWeight: '500',
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
        {navTabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => onTabPress(tab.id)}
            activeOpacity={0.7}
            testID={`tab-${tab.id}`}>
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.id
                  ? styles.activeTabLabel
                  : styles.inactiveTabLabel,
              ]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default BottomNavigation;