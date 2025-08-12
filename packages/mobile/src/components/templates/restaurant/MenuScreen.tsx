/**
 * MenuScreen Template - AI-Optimized React Native Component
 * 
 * A comprehensive restaurant menu screen template that displays categorized menu items
 * with search, filtering, and cart functionality. Perfect for food ordering applications.
 * 
 * @category Restaurant Templates
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { SearchForm, type SearchFormData } from '../../blocks/forms';
import { 
  MenuCard, 
  MenuCategoryHeader, 
  RestaurantHeader,
  type MenuItem, 
  type MenuCategoryData,
  type RestaurantHeaderData 
} from '../../blocks/restaurant';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import type { BaseComponentProps } from '../../../lib/types';

/**
 * Menu screen configuration
 */
export interface MenuScreenConfig {
  /** Screen title */
  title?: string;
  /** Show search functionality */
  showSearch?: boolean;
  /** Show restaurant header */
  showRestaurantHeader?: boolean;
  /** Show category headers */
  showCategoryHeaders?: boolean;
  /** Show dietary filters */
  showDietaryFilters?: boolean;
  /** Available dietary filters */
  dietaryFilters?: string[];
  /** Available sort options */
  sortOptions?: Array<{
    id: string;
    label: string;
    field: string;
    direction: 'asc' | 'desc';
  }>;
  /** Menu layout style */
  menuLayout?: 'card' | 'list' | 'compact';
  /** Items per row in grid layout */
  gridColumns?: number;
  /** Show item customization options */
  showCustomization?: boolean;
  /** Show nutritional information */
  showNutrition?: boolean;
}

/**
 * Cart item interface
 */
export interface CartItem {
  id: string;
  menuItemId: string;
  quantity: number;
  customizations?: Array<{
    optionId: string;
    choiceId: string;
    additionalPrice: number;
  }>;
}

/**
 * Menu screen state
 */
export interface MenuScreenState {
  /** Current search query */
  searchQuery: string;
  /** Selected category filter */
  selectedCategory?: string;
  /** Selected dietary filters */
  selectedDietaryFilters: string[];
  /** Current sort option */
  sortBy?: string;
  /** Items currently in cart */
  cartItems: CartItem[];
  /** Loading states */
  loading: {
    menu: boolean;
    cart: boolean;
    refresh: boolean;
  };
}

/**
 * Properties for the MenuScreen template
 */
export interface MenuScreenProps extends BaseComponentProps {
  /** Restaurant information */
  restaurant: RestaurantHeaderData;
  /** Menu categories with items */
  menuCategories: Array<MenuCategoryData & { items: MenuItem[] }>;
  /** Current cart items */
  cartItems?: CartItem[];
  /** Callback when menu item is selected */
  onMenuItemSelect?: (item: MenuItem) => void;
  /** Callback when item is added to cart */
  onAddToCart?: (item: MenuItem, quantity: number, customizations?: any[]) => Promise<void>;
  /** Callback when item is favorited */
  onToggleItemFavorite?: (item: MenuItem) => Promise<void>;
  /** Callback when restaurant is favorited */
  onToggleRestaurantFavorite?: () => Promise<void>;
  /** Callback when search is performed */
  onSearch?: (query: string) => void;
  /** Callback when category is selected */
  onCategorySelect?: (categoryId: string) => void;
  /** Callback when dietary filter is toggled */
  onDietaryFilterToggle?: (filter: string) => void;
  /** Callback for pull to refresh */
  onRefresh?: () => Promise<void>;
  /** Callback to view cart */
  onViewCart?: () => void;
  /** Callback to start order */
  onStartOrder?: () => void;
  /** Callback to call restaurant */
  onCallRestaurant?: () => void;
  /** Callback to get directions */
  onGetDirections?: () => void;
  /** Callback when item customization is requested */
  onCustomizeItem?: (item: MenuItem) => void;
  /** Configuration for the menu screen */
  config?: MenuScreenConfig;
  /** Loading state */
  loading?: boolean;
  /** Whether restaurant is favorited */
  isRestaurantFavorited?: boolean;
  /** Favorited item IDs */
  favoritedItems?: Set<string>;
}

/**
 * Default configuration
 */
const defaultConfig: MenuScreenConfig = {
  title: 'Menu',
  showSearch: true,
  showRestaurantHeader: true,
  showCategoryHeaders: true,
  showDietaryFilters: true,
  dietaryFilters: ['vegetarian', 'vegan', 'gluten-free', 'keto', 'spicy'],
  menuLayout: 'card',
  gridColumns: 1,
  showCustomization: true,
  showNutrition: true,
  sortOptions: [
    { id: 'name', label: 'Name', field: 'name', direction: 'asc' },
    { id: 'price', label: 'Price', field: 'pricing.basePrice', direction: 'asc' },
    { id: 'rating', label: 'Rating', field: 'rating', direction: 'desc' },
    { id: 'popularity', label: 'Popular', field: 'reviewCount', direction: 'desc' },
  ],
};

/**
 * MenuScreen - Complete restaurant menu interface
 * 
 * @example
 * ```tsx
 * <MenuScreen
 *   restaurant={restaurantData}
 *   menuCategories={categoriesWithItems}
 *   cartItems={currentCartItems}
 *   onAddToCart={handleAddToCart}
 *   onMenuItemSelect={handleItemSelect}
 *   onToggleItemFavorite={handleToggleFavorite}
 *   onSearch={handleSearch}
 *   onViewCart={handleViewCart}
 *   config={{
 *     showSearch: true,
 *     showRestaurantHeader: true,
 *     menuLayout: 'card'
 *   }}
 * />
 * ```
 */
export default function MenuScreen({
  restaurant,
  menuCategories,
  cartItems = [],
  onMenuItemSelect,
  onAddToCart,
  onToggleItemFavorite,
  onToggleRestaurantFavorite,
  onSearch,
  onCategorySelect,
  onDietaryFilterToggle,
  onRefresh,
  onViewCart,
  onStartOrder,
  onCallRestaurant,
  onGetDirections,
  onCustomizeItem,
  config = defaultConfig,
  loading = false,
  isRestaurantFavorited = false,
  favoritedItems = new Set(),
  testID = 'menu-screen',
}: MenuScreenProps) {

  // Merge with default config
  const screenConfig = { ...defaultConfig, ...config };

  // Ensure safe access to menuCategories
  const safeMenuCategories = menuCategories || [];

  // Internal state
  const [state, setState] = useState<MenuScreenState>({
    searchQuery: '',
    selectedCategory: undefined,
    selectedDietaryFilters: [],
    sortBy: screenConfig.sortOptions?.[0]?.id,
    cartItems: cartItems,
    loading: {
      menu: false,
      cart: false,
      refresh: false,
    },
  });

  // Handle search
  const handleSearch = useCallback(async (searchData: SearchFormData) => {
    const query = searchData.query || '';
    setState(prev => ({ ...prev, searchQuery: query }));
    onSearch?.(query);
  }, [onSearch]);

  // Handle category selection
  const handleCategorySelect = useCallback((categoryId: string) => {
    setState(prev => ({ 
      ...prev, 
      selectedCategory: prev.selectedCategory === categoryId ? undefined : categoryId 
    }));
    onCategorySelect?.(categoryId);
  }, [onCategorySelect]);

  // Handle add to cart
  const handleAddToCart = useCallback(async (item: MenuItem, quantity: number) => {
    try {
      setState(prev => ({ ...prev, loading: { ...prev.loading, cart: true } }));
      await onAddToCart?.(item, quantity);
      Alert.alert('Added to Cart', `${item.name} has been added to your cart!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    } finally {
      setState(prev => ({ ...prev, loading: { ...prev.loading, cart: false } }));
    }
  }, [onAddToCart]);

  // Handle item customization
  const handleCustomizeItem = useCallback((item: MenuItem) => {
    if (item.customizations && item.customizations.length > 0) {
      onCustomizeItem?.(item);
    } else {
      // Default to adding 1 item if no customizations
      handleAddToCart(item, 1);
    }
  }, [onCustomizeItem, handleAddToCart]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setState(prev => ({ ...prev, loading: { ...prev.loading, refresh: true } }));
      try {
        await onRefresh();
      } finally {
        setState(prev => ({ ...prev, loading: { ...prev.loading, refresh: false } }));
      }
    }
  }, [onRefresh]);

  // Filter and sort menu items
  const getFilteredItems = useCallback((items: MenuItem[]) => {
    // Ensure safe array access
    const safeItems = items || [];
    let filtered = safeItems;

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.dietaryTags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply dietary filters
    if (state.selectedDietaryFilters.length > 0) {
      filtered = filtered.filter(item =>
        state.selectedDietaryFilters.every(filter =>
          item.dietaryTags.includes(filter as any)
        )
      );
    }

    // Apply availability filter
    filtered = filtered.filter(item => item.available);

    return filtered;
  }, [state.searchQuery, state.selectedDietaryFilters]);

  // Get cart quantity for an item
  const getCartQuantity = useCallback((itemId: string): number => {
    return cartItems.filter(item => item.menuItemId === itemId)
      .reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  // Calculate total cart items
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <SafeAreaView style={styles.container} testID={testID}>
      
      {/* Restaurant Header */}
      {screenConfig.showRestaurantHeader && (
        <RestaurantHeader
          restaurant={restaurant}
          onBack={() => {}} // Will be handled by navigation
          onFavorite={onToggleRestaurantFavorite}
          onCall={onCallRestaurant}
          onDirections={onGetDirections}
          onStartOrder={onStartOrder}
          isFavorite={isRestaurantFavorited}
          showContactOptions={true}
          showDeliveryInfo={true}
          showHours={true}
          height={280}
        />
      )}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={state.loading.refresh}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary[500]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        
        {/* Search Section */}
        {screenConfig.showSearch && (
          <View style={styles.searchSection}>
            <SearchForm
              onSubmit={handleSearch}
              placeholder="Search menu items..."
              showFilters={false}
              loading={state.loading.menu}
            />
          </View>
        )}

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{safeMenuCategories.length}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {safeMenuCategories.reduce((sum, cat) => sum + (cat.items || []).length, 0)}
            </Text>
            <Text style={styles.statLabel}>Items</Text>
          </View>
          {totalCartItems > 0 && (
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.cartValue]}>{totalCartItems}</Text>
              <Text style={styles.statLabel}>In Cart</Text>
            </View>
          )}
        </View>

        {/* Menu Categories and Items */}
        {safeMenuCategories.map((category) => {
          const filteredItems = getFilteredItems(category.items || []);
          
          if (filteredItems.length === 0) return null;

          return (
            <View key={category.id} style={styles.categorySection}>
              
              {/* Category Header */}
              {screenConfig.showCategoryHeaders && (
                <MenuCategoryHeader
                  category={category}
                  onPress={() => handleCategorySelect(category.id)}
                  onViewAll={() => handleCategorySelect(category.id)}
                  isActive={state.selectedCategory === category.id}
                  showItemCount={true}
                  showPriceRange={true}
                  layout="standard"
                />
              )}

              {/* Category Items */}
              <View style={styles.itemsContainer}>
                {filteredItems.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    onPress={() => onMenuItemSelect?.(item)}
                    onAddToCart={(quantity) => handleAddToCart(item, quantity || 1)}
                    onFavorite={() => onToggleItemFavorite?.(item)}
                    onCustomize={() => handleCustomizeItem(item)}
                    isFavorite={favoritedItems.has(item.id)}
                    cartQuantity={getCartQuantity(item.id)}
                    showDietaryTags={true}
                    showAddToCart={true}
                    showRating={true}
                    layout={screenConfig.menuLayout}
                  />
                ))}
              </View>
            </View>
          );
        })}

        {/* Empty State */}
        {safeMenuCategories.every(cat => getFilteredItems(cat.items || []).length === 0) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No items found</Text>
            <Text style={styles.emptyStateMessage}>
              {state.searchQuery 
                ? `No items match "${state.searchQuery}"`
                : 'No menu items available at the moment'
              }
            </Text>
          </View>
        )}

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Cart Button */}
      {totalCartItems > 0 && onViewCart && (
        <View style={styles.floatingCartContainer}>
          <TouchableOpacity
            style={styles.floatingCartButton}
            onPress={onViewCart}
            activeOpacity={0.8}
          >
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalCartItems}</Text>
            </View>
            <Text style={styles.floatingCartText}>View Cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// === STYLES ===

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
  },
  searchSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.neutral[900],
    marginBottom: 4,
  },
  cartValue: {
    color: COLORS.primary[600],
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categorySection: {
    marginBottom: SPACING.lg,
  },
  itemsContainer: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 100,
  },
  floatingCartContainer: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.md,
    right: SPACING.md,
  },
  floatingCartButton: {
    backgroundColor: COLORS.primary[600],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 8,
    shadowColor: COLORS.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cartBadge: {
    backgroundColor: 'white',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cartBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary[600],
  },
  floatingCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

// === EXPORTS ===

export type {
  MenuScreenProps,
  MenuScreenConfig,
  MenuScreenState,
  CartItem,
};
