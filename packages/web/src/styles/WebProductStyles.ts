/**
 * WebProductStyles - Responsive styles for web product components
 * 
 * Adapts to different screen sizes and provides mobile-like layout on web
 */

import { StyleSheet, Dimensions } from 'react-native';
import type { Theme } from '../context/ThemeContext';

// Get screen dimensions and calculate responsive layout
const getResponsiveLayout = () => {
  const { width, height } = Dimensions.get('window');
  
  // Check if we're in the iPhone frame (web preview mode)
  // iPhone frame is 375px wide, so we should detect this and use mobile layout
  const isInIPhoneFrame = width <= 375 || (typeof window !== 'undefined' && window.innerWidth <= 375);
  const isInAndroidFrame = width <= 360 || (typeof window !== 'undefined' && window.innerWidth <= 360);
  
  // For iPhone/Android frame, always use mobile layout (2 columns)
  if (isInIPhoneFrame || isInAndroidFrame) {
    const containerPadding = 12; // Slightly less padding for mobile frame
    const cardSpacing = 6; // Slightly less spacing for mobile frame
    const numColumns = 2;
    const effectiveWidth = isInIPhoneFrame ? 375 : (isInAndroidFrame ? 360 : width);
    const totalSpacing = (containerPadding * 2) + (cardSpacing * (numColumns - 1));
    const cardWidth = (effectiveWidth - totalSpacing) / numColumns;
    
    return {
      width: effectiveWidth,
      height,
      isSmallScreen: true,
      isMediumScreen: false,
      isLargeScreen: false,
      isXLargeScreen: false,
      numColumns,
      cardWidth: Math.floor(cardWidth),
      containerPadding,
      cardSpacing,
      isInMobileFrame: true,
    };
  }
  
  // For larger screens (actual desktop/tablet), use responsive breakpoints
  const isSmallScreen = width < 480;
  const isMediumScreen = width >= 480 && width < 768;
  const isLargeScreen = width >= 768 && width < 1024;
  const isXLargeScreen = width >= 1024;
  
  // Calculate number of columns based on screen size
  let numColumns = 2; // Default for mobile
  if (isLargeScreen) numColumns = 3;
  if (isXLargeScreen) numColumns = 4;
  
  // Calculate card width with proper spacing
  const containerPadding = 16;
  const cardSpacing = 8;
  const totalSpacing = (containerPadding * 2) + (cardSpacing * (numColumns - 1));
  const cardWidth = (width - totalSpacing) / numColumns;
  
  return {
    width,
    height,
    isSmallScreen,
    isMediumScreen,
    isLargeScreen,
    isXLargeScreen,
    numColumns,
    cardWidth: Math.floor(cardWidth),
    containerPadding,
    cardSpacing,
    isInMobileFrame: false,
  };
};

export const getResponsiveColumns = () => {
  const { numColumns } = getResponsiveLayout();
  return numColumns;
};

export const createWebProductStyles = (theme: Theme) => {
  const layout = getResponsiveLayout();
  
  return StyleSheet.create({
    // Container styles
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      paddingHorizontal: layout.containerPadding,
      paddingBottom: layout.isInMobileFrame ? 16 : 20,
      paddingTop: layout.isInMobileFrame ? 12 : 16,
    },

    // Header styles
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
      flex: 1,
      textAlign: 'center',
    },
    backButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    backButtonText: {
      fontSize: 16,
      color: theme.colors.text,
    },

    // Search styles
    searchContainer: {
      padding: 16,
      backgroundColor: theme.colors.surface,
    },
    searchInput: {
      height: 40,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      fontSize: 16,
    },

    // Filter and sort styles
    filterSortContainer: {
      flexDirection: 'row',
      padding: 16,
      gap: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    filterButton: {
      flex: 1,
      height: 40,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: 12,
    },
    filterButtonText: {
      fontSize: 14,
      color: theme.colors.text,
      marginRight: 4,
    },
    filterArrow: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },

    // Responsive product grid styles
    productRow: {
      justifyContent: 'space-between',
      marginBottom: layout.isInMobileFrame ? 12 : 16,
      gap: layout.cardSpacing,
    },
    productCardContainer: {
      flex: 1,
      maxWidth: layout.cardWidth,
      minWidth: layout.isSmallScreen ? '48%' : layout.cardWidth,
    },
    productCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      // Web-specific hover effects
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    productCardHover: {
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 5,
      transform: [{ scale: 1.02 }],
    },
    productImage: {
      width: '100%',
      height: layout.isInMobileFrame ? 100 : (layout.isSmallScreen ? 100 : 120),
      borderRadius: 8,
      backgroundColor: theme.colors.background,
      marginBottom: 8,
    },
    productImagePlaceholder: {
      width: '100%',
      height: layout.isInMobileFrame ? 100 : (layout.isSmallScreen ? 100 : 120),
      borderRadius: 8,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
    },
    productImagePlaceholderText: {
      fontSize: layout.isSmallScreen ? 10 : 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },

    // Product info styles
    productInfo: {
      flex: 1,
    },
    productName: {
      fontSize: layout.isInMobileFrame ? 13 : (layout.isSmallScreen ? 13 : 14),
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
      minHeight: layout.isInMobileFrame ? 30 : (layout.isSmallScreen ? 32 : 36), // Consistent height for 2 lines
      lineHeight: layout.isInMobileFrame ? 15 : (layout.isSmallScreen ? 16 : 18),
    },
    productPrice: {
      fontSize: layout.isInMobileFrame ? 14 : (layout.isSmallScreen ? 15 : 16),
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 6,
    },
    productStock: {
      fontSize: layout.isInMobileFrame ? 10 : (layout.isSmallScreen ? 11 : 12),
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    productStockInStock: {
      color: theme.colors.success || '#4CAF50',
    },
    productStockOutOfStock: {
      color: theme.colors.error || '#F44336',
    },

    // Action button styles
    addToCartButton: {
      height: layout.isInMobileFrame ? 28 : (layout.isSmallScreen ? 30 : 32),
      borderRadius: 6,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    addToCartButtonDisabled: {
      backgroundColor: theme.colors.border,
      cursor: 'not-allowed',
    },
    addToCartButtonHover: {
      backgroundColor: theme.colors.primaryDark || theme.colors.primary,
      transform: [{ scale: 1.05 }],
    },
    addToCartButtonText: {
      fontSize: layout.isInMobileFrame ? 10 : (layout.isSmallScreen ? 11 : 12),
      fontWeight: '600',
      color: theme.colors.background || '#FFFFFF',
    },
    addToCartButtonTextDisabled: {
      color: theme.colors.textSecondary,
    },

    // Loading states
    loadingFooter: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      minHeight: 200,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },

    // Error states
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.colors.background,
      minHeight: 200,
    },
    errorText: {
      fontSize: 16,
      color: theme.colors.error,
      textAlign: 'center',
      marginBottom: 16,
    },
    retryButton: {
      height: 40,
      paddingHorizontal: 24,
      borderRadius: 8,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
    },
    retryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.background,
    },

    // Empty state
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
      backgroundColor: theme.colors.background,
      minHeight: 200,
    },
    emptyText: {
      fontSize: 18,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },

    // Cart button
    cartButton: {
      width: 50,
      height: 40,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cartIconContainer: {
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cartIcon: {
      fontSize: 20,
      color: theme.colors.text,
    },
    cartBadge: {
      position: 'absolute',
      top: -8,
      right: -8,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.background,
      paddingHorizontal: 4,
    },
    cartBadgeText: {
      color: theme.colors.background,
      fontSize: 10,
      fontWeight: 'bold',
    },

    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 20,
      margin: 20,
      maxHeight: '80%',
      width: '90%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },

    // Option list styles
    optionItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      cursor: 'pointer',
    },
    optionItemSelected: {
      backgroundColor: theme.colors.primaryLight || theme.colors.primary + '20',
    },
    optionText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    optionTextSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
    },

    // Responsive utilities
    responsiveContainer: {
      maxWidth: layout.isXLargeScreen ? 1200 : '100%',
      alignSelf: 'center',
      width: '100%',
    },
  });
};

// Hook to get current responsive layout info
export const useResponsiveLayout = () => {
  return getResponsiveLayout();
};
