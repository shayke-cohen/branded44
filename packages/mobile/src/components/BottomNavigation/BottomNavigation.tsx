import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {useTheme} from '../../context/ThemeContext';
import {useWixCart} from '../../context/WixCartContext';
import {BottomNavigationProps} from '../../types';
import {getNavTabs} from '../../screen-templates/templateConfig';

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabPress,
}) => {
  const {theme} = useTheme();
  const {getItemCount} = useWixCart();

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
    tabIconContainer: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cartBadge: {
      position: 'absolute',
      top: -4,
      right: -8,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: '#FF3B30', // Red color for badge
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#FFFFFF',
    },
    cartBadgeText: {
      color: '#FFFFFF',
      fontSize: 9,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });

  // Get navigation tabs from unified registry
  const navTabs = getNavTabs();
  const cartItemCount = getItemCount();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        {navTabs.map(tab => {
          // Use shortName from metadata if available, otherwise no text
          const displayName = tab.metadata?.shortName || '';
          const showLabel = displayName.length > 0;
          const isCartTab = tab.icon === '🛒'; // Identify cart tab by icon
          
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => onTabPress(tab.id)}
              activeOpacity={0.7}
              testID={`tab-${tab.id}`}>
              <View style={styles.tabIconContainer}>
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                {isCartTab && cartItemCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </Text>
                  </View>
                )}
              </View>
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