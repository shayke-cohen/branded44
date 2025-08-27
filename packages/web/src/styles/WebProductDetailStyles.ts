/**
 * WebProductDetailStyles - Web-specific styles for Product Detail screens
 * 
 * Adapts to mobile frame constraints and provides mobile-like layout on web
 */

import { StyleSheet, Dimensions } from 'react-native';
import type { Theme } from '../context/ThemeContext';

// Use the same responsive layout logic as WebProductStyles
const getResponsiveLayout = () => {
  const { width, height } = Dimensions.get('window');
  
  // For web, detect if we're inside a mobile frame by checking the actual container width
  let actualContentWidth = width;
  
  if (typeof window !== 'undefined') {
    // Try to find the mobile frame elements based on actual DOM structure
    const potentialContainers = [
      // Look for React Native Web generated styles that indicate mobile frame
      document.querySelector('div[style*="width: 375px"]'), // iPhone frame
      document.querySelector('div[style*="width: 360px"]'), // Android frame  
      document.querySelector('div[style*="width:375px"]'),  // Without spaces
      document.querySelector('div[style*="width:360px"]'),  // Without spaces
      // Look for common mobile frame container patterns
      document.querySelector('div[style*="borderRadius"][style*="375"]'),
      document.querySelector('div[style*="borderRadius"][style*="360"]'),
      // Look for the app content container (after status bar)
      document.querySelector('div[style*="flex: 1"][style*="backgroundColor"]'),
    ];
    
    const appContainer = potentialContainers.find(container => container !== null);
    
    if (appContainer) {
      const rect = appContainer.getBoundingClientRect();
      actualContentWidth = rect.width;
      
      // If this is the device frame itself, subtract padding  
      if (rect.width === 375) {
        actualContentWidth = 359; // iPhone: 375 - 16px padding
      } else if (rect.width === 360) {
        actualContentWidth = 344; // Android: 360 - 16px padding  
      }
    } else {
      // Fallback: if window width suggests we're in a mobile frame
      if (window.innerWidth <= 400) {
        // Probably in a mobile frame, use conservative estimate
        actualContentWidth = Math.min(window.innerWidth - 40, 359); // Account for frame padding
      }
    }
  }
  
  const isInMobileFrame = actualContentWidth <= 375;
  
  // Use actual content width instead of full window width
  const effectiveWidth = isInMobileFrame ? actualContentWidth : width;
  const imageHeight = effectiveWidth * 0.8; // Same ratio as mobile
  

  
  return {
    width: effectiveWidth,
    height,
    imageHeight,
    isInMobileFrame,
    actualContentWidth
  };
};

export const createWebProductDetailStyles = (theme: Theme) => {
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
      paddingBottom: 100, // Space for action buttons
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
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 16,
    },
    backButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minWidth: 44,
      alignItems: 'center',
    },
    backButtonText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    cartButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minWidth: 44,
      alignItems: 'center',
      position: 'relative',
    },
    cartIcon: {
      fontSize: 18,
      color: theme.colors.text,
    },
    cartBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    cartBadgeText: {
      color: theme.colors.background,
      fontSize: 10,
      fontWeight: 'bold',
    },

    // Image gallery styles - FIXED FOR WEB MOBILE FRAME
    imageGallery: {
      backgroundColor: theme.colors.surface,
    },
    imageContainer: {
      width: layout.width, // Use effective width instead of full window width
      height: layout.imageHeight, // Use calculated height based on effective width
      backgroundColor: theme.colors.background,
    },
    productImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    imagePlaceholder: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.border,
    },
    imagePlaceholderText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    imageIndicators: {
      flexDirection: 'row',
      justifyContent: 'center',
      paddingVertical: 12,
      gap: 8,
    },
    imageIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.border,
    },
    imageIndicatorActive: {
      backgroundColor: theme.colors.primary,
    },

    // Product info styles
    productInfo: {
      padding: 16,
      backgroundColor: theme.colors.surface,
      marginBottom: 8,
    },
    productName: {
      fontSize: layout.isInMobileFrame ? 20 : 24, // Adjust font size for mobile frame
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    productDescription: {
      fontSize: layout.isInMobileFrame ? 14 : 16, // Adjust font size for mobile frame
      color: theme.colors.textSecondary,
      lineHeight: layout.isInMobileFrame ? 20 : 24,
      marginBottom: 16,
    },
    productMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 16,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    metaIcon: {
      fontSize: 14,
      marginRight: 6,
      color: theme.colors.primary,
    },
    metaText: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: '500',
    },

    // Price styles
    priceSection: {
      backgroundColor: theme.colors.primaryLight,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    priceLabel: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: '500',
    },
    priceValue: {
      fontSize: layout.isInMobileFrame ? 24 : 28, // Adjust font size for mobile frame
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    originalPrice: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textDecorationLine: 'line-through',
      marginLeft: 8,
    },
    discountBadge: {
      backgroundColor: theme.colors.error,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 8,
    },
    discountText: {
      color: theme.colors.background,
      fontSize: 12,
      fontWeight: 'bold',
    },

    // Variants section
    variantsSection: {
      backgroundColor: theme.colors.surface,
      marginBottom: 8,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: layout.isInMobileFrame ? 16 : 18, // Adjust font size for mobile frame
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    variantGrid: {
      padding: 16,
      gap: 12,
    },
    variantOption: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      marginRight: 8,
      marginBottom: 8,
    },
    variantOptionSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    variantText: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: '500',
    },
    variantTextSelected: {
      color: theme.colors.background,
    },

    // Quantity section
    quantitySection: {
      backgroundColor: theme.colors.surface,
      marginBottom: 8,
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
    },
    quantityLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    quantityButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    quantityButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    quantityInput: {
      width: 60,
      height: 40,
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: theme.colors.border,
    },

    // Stock status
    stockStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    stockIcon: {
      fontSize: 12,
      marginRight: 6,
    },
    stockText: {
      fontSize: 14,
      fontWeight: '500',
    },
    stockInStock: {
      color: theme.colors.success,
    },
    stockOutOfStock: {
      color: theme.colors.error,
    },
    stockLowStock: {
      color: theme.colors.warning,
    },

    // Related products section
    relatedSection: {
      backgroundColor: theme.colors.surface,
      marginBottom: 8,
    },
    relatedGrid: {
      padding: 16,
    },
    relatedProduct: {
      width: 120,
      marginRight: 12,
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 8,
    },
    relatedImage: {
      width: '100%',
      height: 80,
      borderRadius: 6,
      backgroundColor: theme.colors.border,
      marginBottom: 8,
    },
    relatedName: {
      fontSize: 12,
      color: theme.colors.text,
      fontWeight: '500',
      marginBottom: 4,
      textAlign: 'center',
    },
    relatedPrice: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.primary,
      textAlign: 'center',
    },

    // Action buttons
    actionButtons: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 12,
    },
    addToCartButton: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addToCartButtonDisabled: {
      backgroundColor: theme.colors.border,
    },
    addToCartButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.background,
    },
    addToCartButtonTextDisabled: {
      color: theme.colors.textSecondary,
    },
    buyNowButton: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buyNowButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },

    // Additional info section
    additionalInfo: {
      backgroundColor: theme.colors.surface,
      marginBottom: 8,
    },
    infoItem: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
    },
    infoContent: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },

    // Loading states
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      padding: 32,
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
      padding: 32,
      backgroundColor: theme.colors.background,
    },
    errorText: {
      fontSize: 16,
      color: theme.colors.error,
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 24,
    },
    retryButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    retryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.background,
    },

    // Responsive adjustments - adjusted for mobile frame
    tablet: {
      paddingHorizontal: layout.isInMobileFrame ? 16 : Math.max(32, (layout.width - 768) / 2),
    },
    desktop: {
      paddingHorizontal: layout.isInMobileFrame ? 16 : Math.max(64, (layout.width - 1024) / 2),
    },
  });
};
