/**
 * Wix-Enhanced Menu Screen Template
 * 
 * This is an enhanced version of MenuScreen that can optionally fetch data
 * directly from Wix Restaurant API while maintaining full compatibility
 * with our generic restaurant interfaces.
 * 
 * @category Restaurant Templates
 * @subcategory Wix Enhanced
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';

// Import the base MenuScreen
import MenuScreen, { type MenuScreenProps } from './MenuScreen';

// Import Wix integration
import {
  wixRestaurantApiClient,
  adaptWixRestaurant,
  adaptWixRestaurantHeader,
  adaptWixMenuSection,
  type WixRestaurantAdapterContext,
} from '../../../utils/wix';

// Import types
import type {
  MenuCategoryData,
  RestaurantHeaderData,
} from '../../blocks/restaurant';

// Import UI components
import { LoadingCard } from '../../blocks/utility/LoadingCard';
import { ErrorCard } from '../../blocks/utility/ErrorCard';

// === TYPES ===

export interface WixMenuScreenProps extends Omit<MenuScreenProps, 'restaurant' | 'menuCategories'> {
  // Required props
  menuId?: string; // If not provided, will use first available menu
  
  // Optional props that can override Wix data
  restaurant?: RestaurantHeaderData;
  menuCategories?: MenuCategoryData[];
  
  // Enhanced callbacks
  onWixDataLoaded?: (data: {
    restaurant: RestaurantHeaderData;
    menuCategories: MenuCategoryData[];
  }) => void;
  onWixError?: (error: string) => void;
  
  // Loading states
  showLoadingIndicator?: boolean;
  loadingTitle?: string;
  loadingSubtitle?: string;
}

interface WixMenuState {
  loading: boolean;
  error: string | null;
  restaurant: RestaurantHeaderData | null;
  menuCategories: MenuCategoryData[];
}

// === COMPONENT ===

const WixMenuScreen: React.FC<WixMenuScreenProps> = ({
  menuId,
  restaurant: providedRestaurant,
  menuCategories: providedMenuCategories,
  onWixDataLoaded,
  onWixError,
  showLoadingIndicator = true,
  loadingTitle = "Loading Menu",
  loadingSubtitle = "Fetching restaurant data from Wix...",
  ...props
}) => {
  const [wixState, setWixState] = useState<WixMenuState>({
    loading: false,
    error: null,
    restaurant: null,
    menuCategories: [],
  });

  /**
   * Load menu data from Wix API
   */
  const loadWixData = useCallback(async () => {
    // If data is provided directly, don't fetch from Wix
    if (providedRestaurant && providedMenuCategories) {
      return;
    }

    try {
      setWixState(prev => ({ ...prev, loading: true, error: null }));

      console.log('🍽️ [WIX MENU] Loading data from Wix API');

      // Get complete menu structure
      const wixData = await wixRestaurantApiClient.getCompleteMenuStructure();
      
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
          console.warn(`🍽️ [WIX MENU] Menu with ID ${menuId} not found, using first menu`);
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
      const restaurant = adaptWixRestaurantHeader(targetMenu, adapterContext);
      
      // Get sections for the target menu
      const menuSectionIds = targetMenu.sectionIds || [];
      const menuSections = wixData.sections.filter(section => 
        menuSectionIds.includes(section._id || '')
      );
      
      // Adapt sections to menu categories
      const menuCategories = menuSections.map(section => 
        adaptWixMenuSection(section, adapterContext)
      );

      console.log(`🍽️ [WIX MENU] Loaded: ${menuCategories.length} categories`);

      setWixState({
        loading: false,
        error: null,
        restaurant,
        menuCategories,
      });

      // Notify parent component
      onWixDataLoaded?.({ restaurant, menuCategories });

    } catch (error) {
      console.error('❌ [WIX MENU] Error loading data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load menu data';
      
      setWixState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      onWixError?.(errorMessage);
    }
  }, [menuId, providedRestaurant, providedMenuCategories, onWixDataLoaded, onWixError]);

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
          title="Unable to Load Menu"
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
  const menuCategories = providedMenuCategories || wixState.menuCategories;

  // Must have restaurant and menu data to render
  if (!restaurant || menuCategories.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ErrorCard
          title="No Menu Data"
          subtitle="Restaurant menu data is not available"
          onRetry={handleRetry}
        />
      </View>
    );
  }

  // Render the base MenuScreen with Wix data
  return (
    <MenuScreen
      restaurant={restaurant}
      menuCategories={menuCategories}
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

export default WixMenuScreen;
export type { WixMenuScreenProps };

console.log('🍽️ [WIX MENU TEMPLATE] WixMenuScreen template loaded');
