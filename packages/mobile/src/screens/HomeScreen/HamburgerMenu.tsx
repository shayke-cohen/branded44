import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '../../context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MenuItem {
  id: string;
  name: string;
  icon: string;
}

interface HamburgerMenuProps {
  isVisible: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ 
  isVisible, 
  onClose, 
  onNavigate 
}) => {
  const { theme } = useTheme();
  const isWeb = Platform.OS === 'web';
  
  // Responsive width calculation
  const getDrawerWidth = () => {
    if (isWeb) {
      if (screenWidth > 1200) return 320; // Fixed width for large screens
      if (screenWidth > 768) return Math.min(screenWidth * 0.4, 320); // 40% max 320px for tablets
      return screenWidth * 0.8; // 80% for small screens
    }
    return screenWidth * 0.75; // 75% for mobile
  };

  const menuItems: MenuItem[] = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
    { id: 'cart', name: 'Cart', icon: '🛒' },
    { id: 'store', name: 'Store', icon: '🛍️' },
    { id: 'cms', name: 'CMS', icon: '🗄️' },
  ];

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'flex-end',
      ...(isWeb ? {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
      } : {}),
    },
    overlayTouchable: {
      flex: 1,
    },
    drawerContainer: {
      backgroundColor: theme.colors.background,
      width: getDrawerWidth(),
      height: screenHeight,
      position: 'absolute',
      left: 0,
      top: 0,
      shadowColor: '#000',
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 16,
      ...(isWeb ? {
        maxWidth: 400,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
      } : {}),
    },
    drawerHeader: {
      paddingTop: isWeb ? 20 : 60, // Less padding for web (no status bar)
      paddingHorizontal: 24,
      paddingBottom: 20,
      backgroundColor: theme.colors.primary,
      borderBottomRightRadius: 20,
      ...(isWeb && {
        borderTopRightRadius: 0,
      }),
    },
    headerTitle: {
      fontSize: isWeb ? 24 : 26,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 6,
    },
    headerSubtitle: {
      fontSize: isWeb ? 14 : 16,
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '400',
    },
    closeButton: {
      position: 'absolute',
      top: isWeb ? 20 : 60,
      right: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      ...(isWeb && {
        cursor: 'pointer',
      }),
    },
    closeButtonText: {
      fontSize: 24,
      color: '#FFFFFF',
      fontWeight: '300',
      lineHeight: 24,
      ...(isWeb && {
        userSelect: 'none',
      }),
    },
    menuContent: {
      flex: 1,
      paddingTop: 16,
      paddingBottom: isWeb ? 24 : 0,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: isWeb ? 12 : 8,
      paddingHorizontal: 20,
      marginHorizontal: 12,
      marginVertical: 2,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
      minHeight: 44,
      ...(isWeb && {
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        '&:hover': {
          backgroundColor: theme.colors.primary + '10',
        },
      }),
    },

    menuIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    menuIcon: {
      fontSize: 16,
      ...(isWeb && {
        userSelect: 'none',
      }),
    },
    menuTextContainer: {
      flex: 1,
    },
    menuItemName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      ...(isWeb && {
        userSelect: 'none',
      }),
    },
    chevron: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '300',
      ...(isWeb && {
        userSelect: 'none',
      }),
    },
    footer: {
      padding: 24,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border + '50',
      ...(isWeb && {
        paddingBottom: 24,
      }),
    },
    appInfo: {
      alignItems: 'center',
      paddingVertical: 16,
    },
    appVersion: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 4,
      ...(isWeb && {
        userSelect: 'none',
      }),
    },
    appName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      ...(isWeb && {
        userSelect: 'none',
      }),
    },
  });

  const handleItemPress = (item: MenuItem) => {
    onNavigate(item.id);
    onClose();
  };

  const handleOverlayPress = () => {
    onClose();
  };

  const handleClosePress = () => {
    console.log('Close button pressed'); // Debug log
    onClose();
  };

  // Web-specific render
  if (isWeb && isVisible) {
    return (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'stretch',
        }}
        onClick={handleOverlayPress}
      >
        <div
          style={{
            backgroundColor: theme.colors.background,
            width: Math.min(getDrawerWidth(), screenWidth * 0.8), // Constrain to 80% max
            maxWidth: Math.min(300, screenWidth * 0.75), // Smaller max width for phone frame
            height: '100%',
            boxShadow: '2px 0 10px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              paddingTop: 20,
              paddingLeft: 20,
              paddingRight: 20,
              paddingBottom: 16,
              backgroundColor: theme.colors.primary,
              borderBottomRightRadius: 16,
              position: 'relative',
            }}
          >
            <button
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: 20,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onClick={handleClosePress}
            >
              ×
            </button>
            
            <h2 style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#FFFFFF',
              margin: '0 0 4px 0',
            }}>
              Navigation
            </h2>
            <p style={{
              fontSize: 13,
              color: 'rgba(255, 255, 255, 0.8)',
              margin: 0,
            }}>
              Choose where to go
            </p>
          </div>
          
          {/* Menu items */}
          <div style={{ flex: 1, paddingTop: 12, paddingBottom: 16, overflowY: 'auto' }}>
            {menuItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  paddingTop: 10,
                  paddingBottom: 10,
                  paddingLeft: 16,
                  paddingRight: 16,
                  marginLeft: 8,
                  marginRight: 8,
                  marginTop: 1,
                  marginBottom: 1,
                  borderRadius: 6,
                  backgroundColor: theme.colors.surface,
                  minHeight: 40,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease',
                }}
                onClick={() => handleItemPress(item)}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: theme.colors.primary + '20',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 10,
                  }}
                >
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                </div>
                
                <div style={{ flex: 1 }}>
                  <span style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: theme.colors.text,
                  }}>
                    {item.name}
                  </span>
                </div>
                
                <span style={{
                  fontSize: 14,
                  color: theme.colors.primary,
                  fontWeight: '300',
                }}>
                  ›
                </span>
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <div style={{
            padding: 16,
            borderTop: `1px solid ${theme.colors.border}50`,
            textAlign: 'center',
          }}>
            <p style={{
              fontSize: 11,
              color: theme.colors.textSecondary,
              margin: '0 0 2px 0',
            }}>
              v1.0.0
            </p>
            <p style={{
              fontSize: 12,
              fontWeight: '600',
              color: theme.colors.text,
              margin: 0,
            }}>
              Branded44 AI Builder
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Mobile render (React Native Modal)
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Overlay touchable area */}
        <TouchableOpacity 
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleOverlayPress}
        />
        
        {/* Slide-in drawer */}
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={(e) => e.stopPropagation()}
          style={styles.drawerContainer}
        >
          {/* Header */}
          <View style={styles.drawerHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleClosePress}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Navigation</Text>
            <Text style={styles.headerSubtitle}>Choose where to go</Text>
          </View>
          
          {/* Menu items */}
          <ScrollView 
            style={styles.menuContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem]}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconContainer}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                </View>
                
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuItemName}>{item.name}</Text>
                </View>
                
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.appInfo}>
              <Text style={styles.appVersion}>v1.0.0</Text>
              <Text style={styles.appName}>Branded44 AI Builder</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default HamburgerMenu; 