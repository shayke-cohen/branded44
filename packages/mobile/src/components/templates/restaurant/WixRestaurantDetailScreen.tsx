/**
 * Wix-Enhanced Restaurant Detail Screen Template
 * 
 * This is an enhanced version of RestaurantDetailScreen that can optionally fetch data
 * directly from Wix Restaurant API while maintaining full compatibility
 * with our generic restaurant interfaces.
 * 
 * @category Restaurant Templates
 * @subcategory Wix Enhanced
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';

// Import the base RestaurantDetailScreen
import RestaurantDetailScreen, { type RestaurantDetailScreenProps } from './RestaurantDetailScreen';

// Import Wix integration
import {
  wixRestaurantClient,
  adaptWixRestaurant,
  adaptWixMenuSection,
  type WixRestaurantAdapterContext,
} from '../../../utils/wix';

// Import types
import type {
  Restaurant,
  MenuItem,
} from '../../blocks/restaurant';

// Import UI components
import { LoadingCard } from '../../blocks/utility/LoadingCard';
import { ErrorCard } from '../../blocks/utility/ErrorCard';

// === TYPES ===

export interface WixRestaurantDetailScreenProps extends Omit<RestaurantDetailScreenProps, 'restaurant' | 'menuHighlights'> {
  // Required props
  menuId?: string; // If not provided, will use first available menu
  
  // Optional props that can override Wix data
  restaurant?: Restaurant;
  menuHighlights?: MenuItem[];
  
  // Enhanced callbacks
  onWixDataLoaded?: (data: {
    restaurant: Restaurant;
    menuHighlights: MenuItem[];
  }) => void;
  onWixError?: (error: string) => void;
  
  // Loading states
  showLoadingIndicator?: boolean;
  loadingTitle?: string;
  loadingSubtitle?: string;
  
  // Menu highlights options
  maxHighlights?: number;
  highlightCategories?: string[]; // Specific categories to highlight from
}

interface WixRestaurantState {
  loading: boolean;
  error: string | null;
  restaurant: Restaurant | null;
  menuHighlights: MenuItem[];
}

// === COMPONENT ===

const WixRestaurantDetailScreen: React.FC<WixRestaurantDetailScreenProps> = ({
  menuId,
  restaurant: providedRestaurant,
  menuHighlights: providedMenuHighlights,
  onWixDataLoaded,
  onWixError,
  showLoadingIndicator = true,
  loadingTitle = "Loading Restaurant",
  loadingSubtitle = "Fetching restaurant data from Wix...",
  maxHighlights = 4,
  highlightCategories = ['appetizers', 'main'],
  ...props
}) => {
  const [wixState, setWixState] = useState<WixRestaurantState>({
    loading: false,
    error: null,
    restaurant: null,
    menuHighlights: [],
  });

  /**
   * Load restaurant data from Wix API
   */
  const loadWixData = useCallback(async () => {
    // If data is provided directly, don't fetch from Wix
    if (providedRestaurant && providedMenuHighlights) {
      return;
    }

    try {
      setWixState(prev => ({ ...prev, loading: true, error: null }));

      console.log('🍽️ [WIX RESTAURANT DETAIL] Loading data from Wix API');

      // Get complete menu structure
      const wixData = await wixRestaurantClient.getCompleteMenuStructure();
      
      if (wixData.menus.length === 0) {
        throw new Error('No restaurant menus found in Wix');
      }

      // Find the specified menu or use the first one
      let targetMenu = wixData.menus[0];
      if (menuId) {
        const foundMenu = wixData.menus.find(menu => menu._id === menuId);
        if (foundMenu) {
          targetMenu = foundMenu;
        } else {
          console.warn(`🍽️ [WIX RESTAURANT DETAIL] Menu with ID ${menuId} not found, using first menu`);
        }
      }

      // Create adapter context
      const adapterContext: WixRestaurantAdapterContext = {
        menus: wixData.menus,
        sections: wixData.sections,
        items: wixData.items,
        variants: wixData.variants,
        labels: wixData.labels,
      };

      // Adapt data to our generic interfaces
      const restaurant = adaptWixRestaurant(targetMenu, adapterContext);
      
      // Get sections for the target menu
      const menuSectionIds = targetMenu.sectionIds || [];
      const menuSections = wixData.sections.filter(section => 
        menuSectionIds.includes(section._id || '')
      );
      
      // Get menu highlights from specified categories
      let menuHighlights: MenuItem[] = [];
      
      for (const section of menuSections) {
        const adaptedSection = adaptWixMenuSection(section, adapterContext);
        
        // Check if this section should be included in highlights
        const shouldInclude = highlightCategories.length === 0 || 
          highlightCategories.includes(adaptedSection.type);
        
        if (shouldInclude && adaptedSection.items.length > 0) {
          // Take the highest rated items from this section
          const sectionItems = adaptedSection.items
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, Math.ceil(maxHighlights / Math.max(menuSections.length, 2)));
          
          menuHighlights.push(...sectionItems);
        }
      }
      
      // Limit to max highlights and sort by rating
      menuHighlights = menuHighlights
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, maxHighlights);

      console.log(`🍽️ [WIX RESTAURANT DETAIL] Loaded restaurant with ${menuHighlights.length} highlights`);

      setWixState({
        loading: false,
        error: null,
        restaurant,
        menuHighlights,
      });

      // Notify parent component
      onWixDataLoaded?.({ restaurant, menuHighlights });

    } catch (error) {
      console.error('❌ [WIX RESTAURANT DETAIL] Error loading data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load restaurant data';
      
      setWixState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      onWixError?.(errorMessage);
    }
  }, [menuId, providedRestaurant, providedMenuHighlights, onWixDataLoaded, onWixError, maxHighlights, highlightCategories]);

  /**
   * Retry loading data
   */
  const handleRetry = useCallback(() => {
    loadWixData();
  }, [loadWixData]);

  /**
   * Load data on mount
   */
  useEffect(() => {
    loadWixData();
  }, [loadWixData]);

  // === RENDER ===

  // Show loading state
  if (wixState.loading && showLoadingIndicator) {
    return (
      <View style={styles.centerContainer}>
        <LoadingCard
          title={loadingTitle}
          subtitle={loadingSubtitle}
        />
      </View>
    );
  }

  // Show error state
  if (wixState.error && !providedRestaurant) {
    return (
      <View style={styles.centerContainer}>
        <ErrorCard
          title="Unable to Load Restaurant"
          subtitle={wixState.error}
          onRetry={handleRetry}
          actions={[
            {
              id: 'retry',
              label: 'Try Again',
              onPress: handleRetry,
              variant: 'default',
            },
          ]}
        />
      </View>
    );
  }

  // Determine which data to use
  const restaurant = providedRestaurant || wixState.restaurant;
  const menuHighlights = providedMenuHighlights || wixState.menuHighlights;

  // Must have restaurant data to render
  if (!restaurant) {
    return (
      <View style={styles.centerContainer}>
        <ErrorCard
          title="No Restaurant Data"
          subtitle="Restaurant information is not available"
          onRetry={handleRetry}
        />
      </View>
    );
  }

  // Render the base RestaurantDetailScreen with Wix data
  return (
    <RestaurantDetailScreen
      restaurant={restaurant}
      menuHighlights={menuHighlights}
      {...props}
      style={[styles.container, props.style]}
    />
  );
};

// === STYLES ===

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

// === EXPORTS ===

export default WixRestaurantDetailScreen;
export type { WixRestaurantDetailScreenProps };

console.log('🍽️ [WIX RESTAURANT DETAIL TEMPLATE] WixRestaurantDetailScreen template loaded');
