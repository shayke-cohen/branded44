/**
 * WishlistScreen Template - AI-Optimized React Native Component Library
 * 
 * A comprehensive wishlist screen template that displays saved products
 * with management features and shopping functionality.
 * 
 * Features:
 * - Product grid/list layout with ProductCard integration
 * - Bulk selection and management actions
 * - Add to cart functionality for wishlist items
 * - Share wishlist with friends
 * - Search and filter wishlist items
 * - Price drop notifications setup
 * - Move items between wishlists
 * - Empty state with product recommendations
 * - Pull-to-refresh functionality
 * - Pagination and infinite scroll
 * - Export wishlist functionality
 * - Recently viewed products integration
 * 
 * @example
 * ```tsx
 * <WishlistScreen
 *   wishlistItems={userWishlist}
 *   onRemoveFromWishlist={(productId) => handleRemoveFromWishlist(productId)}
 *   onAddToCart={(product) => handleAddToCart(product)}
 *   onProductPress={(product) => navigation.navigate('ProductDetails', product)}
 *   onShareWishlist={() => handleShareWishlist()}
 *   loading={wishlistLoading}
 * />
 * ```
 * 
 * @author AI Component System
 * @version 1.0.0
 */

import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList 
} from 'react-native';
import { 
  ProductCard
} from '../../blocks/ecommerce';
import { 
  ProductGrid 
} from '../../blocks/lists';
import type { 
  Product,
  ProductGridProps
} from '../../blocks/lists';
import { 
  SearchForm,
  FilterPanel 
} from '../../blocks/forms';
import type { 
  SearchFormProps, 
  SearchFormData,
  FilterPanelProps
} from '../../blocks/forms';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { Alert as UIAlert } from '../../../../~/components/ui/alert';
import { Checkbox } from '../../../../~/components/ui/checkbox';
import { ChevronLeft } from '../../../../~/lib/icons/ChevronLeft';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn, formatCurrency } from '../../../lib/utils';
import type { BaseComponentProps } from '../../../lib/types';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * Wishlist item
 */
export interface WishlistItem extends Product {
  /** Date added to wishlist */
  dateAdded: Date;
  /** Original price when added */
  originalPrice?: number;
  /** Has price dropped */
  priceDropped?: boolean;
  /** Price drop percentage */
  priceDropPercentage?: number;
  /** Wishlist ID (for multiple wishlists) */
  wishlistId?: string;
  /** Item notes */
  notes?: string;
}

/**
 * Wishlist metadata
 */
export interface WishlistMetadata {
  /** Wishlist ID */
  id: string;
  /** Wishlist name */
  name: string;
  /** Wishlist description */
  description?: string;
  /** Is public */
  isPublic: boolean;
  /** Creation date */
  createdAt: Date;
  /** Last updated */
  updatedAt: Date;
  /** Total items */
  itemCount: number;
  /** Total value */
  totalValue: number;
}

/**
 * Wishlist filter
 */
export interface WishlistFilter {
  /** Filter key */
  key: string;
  /** Filter label */
  label: string;
  /** Filter type */
  type: 'select' | 'range' | 'toggle';
  /** Filter options */
  options?: Array<{ label: string; value: any }>;
  /** Current value */
  value?: any;
  /** Is active */
  active?: boolean;
}

/**
 * Wishlist screen configuration
 */
export interface WishlistScreenConfig {
  /** Display layout */
  layout?: 'grid' | 'list';
  /** Grid columns */
  gridColumns?: number;
  /** Show search */
  showSearch?: boolean;
  /** Show filters */
  showFilters?: boolean;
  /** Show bulk actions */
  showBulkActions?: boolean;
  /** Show sort options */
  showSort?: boolean;
  /** Show price alerts */
  showPriceAlerts?: boolean;
  /** Show share functionality */
  showShare?: boolean;
  /** Enable multiple wishlists */
  enableMultipleWishlists?: boolean;
  /** Show recently viewed */
  showRecentlyViewed?: boolean;
  /** Items per page */
  itemsPerPage?: number;
  /** Enable export */
  enableExport?: boolean;
  /** Custom header component */
  headerComponent?: React.ReactNode;
  /** Custom footer component */
  footerComponent?: React.ReactNode;
}

/**
 * Properties for the WishlistScreen template
 */
export interface WishlistScreenProps extends BaseComponentProps {
  /** Wishlist items */
  wishlistItems?: WishlistItem[];
  /** Wishlist metadata */
  wishlistMetadata?: WishlistMetadata;
  /** Available wishlists */
  availableWishlists?: WishlistMetadata[];
  /** Recently viewed products */
  recentlyViewed?: Product[];
  /** Available filters */
  filters?: WishlistFilter[];
  /** Sort options */
  sortOptions?: Array<{ label: string; value: string }>;
  /** Selected items */
  selectedItems?: string[];
  /** Current layout */
  layout?: 'grid' | 'list';
  /** Callback when product is pressed */
  onProductPress?: (product: WishlistItem) => void;
  /** Callback when item is removed from wishlist */
  onRemoveFromWishlist?: (productId: string) => Promise<void> | void;
  /** Callback when item is added to cart */
  onAddToCart?: (product: WishlistItem) => Promise<void> | void;
  /** Callback when items are moved to another wishlist */
  onMoveToWishlist?: (productIds: string[], wishlistId: string) => Promise<void> | void;
  /** Callback when bulk actions are performed */
  onBulkAction?: (action: string, productIds: string[]) => Promise<void> | void;
  /** Callback when search is performed */
  onSearch?: (query: SearchFormData) => void;
  /** Callback when filters change */
  onFilterChange?: (filters: WishlistFilter[]) => void;
  /** Callback when sort changes */
  onSortChange?: (sortOption: string) => void;
  /** Callback when layout changes */
  onLayoutChange?: (layout: 'grid' | 'list') => void;
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Callback when wishlist is shared */
  onShareWishlist?: () => void;
  /** Callback when price alerts are set */
  onSetPriceAlert?: (productId: string, targetPrice: number) => Promise<void> | void;
  /** Callback when wishlist is exported */
  onExportWishlist?: () => void;
  /** Callback for pull to refresh */
  onRefresh?: () => Promise<void> | void;
  /** Callback for load more items */
  onLoadMore?: () => Promise<void> | void;
  /** Callback for back navigation */
  onBack?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Loading more state */
  loadingMore?: boolean;
  /** Refreshing state */
  refreshing?: boolean;
  /** Has more items */
  hasMore?: boolean;
  /** Error message */
  error?: string;
  /** Configuration for the wishlist screen */
  config?: WishlistScreenConfig;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * WishlistScreen - AI-optimized wishlist screen template
 * 
 * A comprehensive wishlist screen that displays saved products
 * with management and shopping functionality.
 */
const WishlistScreen: React.FC<WishlistScreenProps> = ({
  wishlistItems = [],
  wishlistMetadata,
  availableWishlists = [],
  recentlyViewed = [],
  filters = [],
  sortOptions = [],
  selectedItems = [],
  layout: propLayout = 'grid',
  onProductPress,
  onRemoveFromWishlist,
  onAddToCart,
  onMoveToWishlist,
  onBulkAction,
  onSearch,
  onFilterChange,
  onSortChange,
  onLayoutChange,
  onSelectionChange,
  onShareWishlist,
  onSetPriceAlert,
  onExportWishlist,
  onRefresh,
  onLoadMore,
  onBack,
  loading = false,
  loadingMore = false,
  refreshing = false,
  hasMore = true,
  error,
  config = {},
  style,
  testID = 'wishlist-screen',
  ...props
}) => {
  const [localLayout, setLocalLayout] = useState<'grid' | 'list'>(propLayout);
  const [localSelectedItems, setLocalSelectedItems] = useState<string[]>(selectedItems);
  const [selectionMode, setSelectionMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<WishlistFilter[]>(filters);

  const {
    layout: configLayout = 'grid',
    gridColumns = 2,
    showSearch = true,
    showFilters = true,
    showBulkActions = true,
    showSort = true,
    showPriceAlerts = true,
    showShare = true,
    enableMultipleWishlists = false,
    showRecentlyViewed = true,
    itemsPerPage = 20,
    enableExport = false,
    headerComponent,
    footerComponent
  } = config;

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const hasItems = wishlistItems.length > 0;
  const hasSelectedItems = localSelectedItems.length > 0;
  const isAllSelected = localSelectedItems.length === wishlistItems.length && hasItems;
  
  const filteredItems = useMemo(() => {
    let filtered = [...wishlistItems];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply other filters
    activeFilters.forEach(filter => {
      if (filter.active && filter.value !== undefined) {
        switch (filter.key) {
          case 'priceRange':
            filtered = filtered.filter(item => {
              const price = item.pricing?.current || 0;
              return price >= filter.value[0] && price <= filter.value[1];
            });
            break;
          case 'brand':
            if (filter.value !== 'all') {
              filtered = filtered.filter(item => item.brand === filter.value);
            }
            break;
          case 'inStock':
            if (filter.value) {
              filtered = filtered.filter(item => item.inStock);
            }
            break;
          case 'priceDropped':
            if (filter.value) {
              filtered = filtered.filter(item => item.priceDropped);
            }
            break;
        }
      }
    });

    return filtered;
  }, [wishlistItems, searchQuery, activeFilters]);

  const totalValue = useMemo(() => {
    return wishlistItems.reduce((sum, item) => sum + (item.pricing?.current || 0), 0);
  }, [wishlistItems]);

  const priceDroppedItems = useMemo(() => {
    return wishlistItems.filter(item => item.priceDropped);
  }, [wishlistItems]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleLayoutChange = useCallback((newLayout: 'grid' | 'list') => {
    setLocalLayout(newLayout);
    onLayoutChange?.(newLayout);
  }, [onLayoutChange]);

  const handleSearch = useCallback((searchData: SearchFormData) => {
    setSearchQuery(searchData.query || '');
    onSearch?.(searchData);
  }, [onSearch]);

  const handleFilterChange = useCallback((newFilters: WishlistFilter[]) => {
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  }, [onFilterChange]);

  const handleSelectionToggle = useCallback((productId: string) => {
    const newSelectedItems = localSelectedItems.includes(productId)
      ? localSelectedItems.filter(id => id !== productId)
      : [...localSelectedItems, productId];
    
    setLocalSelectedItems(newSelectedItems);
    onSelectionChange?.(newSelectedItems);
  }, [localSelectedItems, onSelectionChange]);

  const handleSelectAll = useCallback(() => {
    const newSelectedItems = isAllSelected ? [] : filteredItems.map(item => item.id);
    setLocalSelectedItems(newSelectedItems);
    onSelectionChange?.(newSelectedItems);
  }, [isAllSelected, filteredItems, onSelectionChange]);

  const handleToggleSelectionMode = useCallback(() => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setLocalSelectedItems([]);
      onSelectionChange?.([]);
    }
  }, [selectionMode, onSelectionChange]);

  const handleBulkRemove = useCallback(async () => {
    if (!hasSelectedItems || !onBulkAction) return;

    try {
      await onBulkAction('remove', localSelectedItems);
      setLocalSelectedItems([]);
      setSelectionMode(false);
      onSelectionChange?.([]);
    } catch (err) {
      console.error('Bulk remove failed:', err);
    }
  }, [hasSelectedItems, localSelectedItems, onBulkAction, onSelectionChange]);

  const handleBulkAddToCart = useCallback(async () => {
    if (!hasSelectedItems || !onBulkAction) return;

    try {
      await onBulkAction('addToCart', localSelectedItems);
      setLocalSelectedItems([]);
      setSelectionMode(false);
      onSelectionChange?.([]);
    } catch (err) {
      console.error('Bulk add to cart failed:', err);
    }
  }, [hasSelectedItems, localSelectedItems, onBulkAction, onSelectionChange]);

  const handleRefresh = useCallback(async () => {
    if (!onRefresh) return;
    try {
      await onRefresh();
    } catch (err) {
      console.error('Refresh failed:', err);
    }
  }, [onRefresh]);

  const handleLoadMore = useCallback(async () => {
    if (!onLoadMore || loadingMore || !hasMore) return;
    try {
      await onLoadMore();
    } catch (err) {
      console.error('Load more failed:', err);
    }
  }, [onLoadMore, loadingMore, hasMore]);

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderHeader = () => {
    if (headerComponent) {
      return headerComponent;
    }

    return (
      <View style={styles.headerContainer} testID={`${testID}-header`}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            onPress={onBack}
            style={styles.backButton}
            testID={`${testID}-back`}
          >
            <ChevronLeft style={styles.backIcon} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            {wishlistMetadata?.name || 'My Wishlist'}
          </Text>
          
          <View style={styles.headerActions}>
            {showShare && (
              <TouchableOpacity 
                onPress={onShareWishlist}
                style={styles.headerAction}
                testID={`${testID}-share`}
              >
                <Text style={styles.headerActionIcon}>📤</Text>
              </TouchableOpacity>
            )}
            
            {showBulkActions && (
              <TouchableOpacity 
                onPress={handleToggleSelectionMode}
                style={styles.headerAction}
                testID={`${testID}-selection-toggle`}
              >
                <Text style={styles.headerActionText}>
                  {selectionMode ? 'Cancel' : 'Select'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Wishlist Stats */}
        {wishlistMetadata && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{wishlistItems.length}</Text>
              <Text style={styles.statLabel}>Items</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatCurrency(totalValue, 'USD')}
              </Text>
              <Text style={styles.statLabel}>Total Value</Text>
            </View>
            {priceDroppedItems.length > 0 && (
              <View style={styles.statItem}>
                <Text style={[styles.statValue, styles.statValueSpecial]}>
                  {priceDroppedItems.length}
                </Text>
                <Text style={styles.statLabel}>Price Drops</Text>
              </View>
            )}
          </View>
        )}

        {/* Search */}
        {showSearch && (
          <SearchForm
            onSearch={handleSearch}
            placeholder="Search wishlist..."
            style={styles.searchForm}
            testID={`${testID}-search`}
          />
        )}

        {/* Controls */}
        <View style={styles.controlsContainer}>
          {/* Layout Toggle */}
          <View style={styles.layoutToggle}>
            <TouchableOpacity
              onPress={() => handleLayoutChange('grid')}
              style={[
                styles.layoutButton,
                localLayout === 'grid' && styles.layoutButtonActive
              ]}
              testID={`${testID}-layout-grid`}
            >
              <Text style={styles.layoutButtonText}>⊞</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleLayoutChange('list')}
              style={[
                styles.layoutButton,
                localLayout === 'list' && styles.layoutButtonActive
              ]}
              testID={`${testID}-layout-list`}
            >
              <Text style={styles.layoutButtonText}>☰</Text>
            </TouchableOpacity>
          </View>

          {/* Filter and Sort */}
          {showFilters && (
            <TouchableOpacity 
              style={styles.controlButton}
              testID={`${testID}-filters`}
            >
              <Text style={styles.controlButtonText}>Filters</Text>
              {activeFilters.filter(f => f.active).length > 0 && (
                <Badge variant="default" style={styles.filterBadge}>
                  <Text style={styles.badgeText}>
                    {activeFilters.filter(f => f.active).length}
                  </Text>
                </Badge>
              )}
            </TouchableOpacity>
          )}

          {showSort && sortOptions.length > 0 && (
            <TouchableOpacity 
              style={styles.controlButton}
              testID={`${testID}-sort`}
            >
              <Text style={styles.controlButtonText}>Sort</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Selection Actions */}
        {selectionMode && (
          <View style={styles.selectionActions}>
            <TouchableOpacity 
              onPress={handleSelectAll}
              style={styles.selectionButton}
              testID={`${testID}-select-all`}
            >
              <Checkbox 
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
              />
              <Text style={styles.selectionButtonText}>
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>

            {hasSelectedItems && (
              <View style={styles.bulkActions}>
                <Button
                  onPress={handleBulkAddToCart}
                  variant="outline"
                  size="sm"
                  style={styles.bulkActionButton}
                  testID={`${testID}-bulk-add-to-cart`}
                >
                  <Text style={styles.bulkActionText}>Add to Cart</Text>
                </Button>
                <Button
                  onPress={handleBulkRemove}
                  variant="destructive"
                  size="sm"
                  style={styles.bulkActionButton}
                  testID={`${testID}-bulk-remove`}
                >
                  <Text style={styles.bulkActionText}>Remove</Text>
                </Button>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <UIAlert 
        variant="destructive"
        style={styles.errorAlert}
        testID={`${testID}-error`}
      >
        <Text style={styles.errorText}>{error}</Text>
      </UIAlert>
    );
  };

  const renderFilters = () => {
    if (!showFilters || filters.length === 0) return null;

    return (
      <Card style={styles.filtersCard} testID={`${testID}-filters-panel`}>
        <FilterPanel
          filters={activeFilters}
          onFiltersChange={handleFilterChange}
          testID={`${testID}-filter-panel`}
        />
      </Card>
    );
  };

  const renderEmptyState = () => {
    if (hasItems || loading) return null;

    return (
      <View style={styles.emptyContainer} testID={`${testID}-empty`}>
        <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
        <Text style={styles.emptyDescription}>
          Save products you love to view them later
        </Text>
        
        {showRecentlyViewed && recentlyViewed.length > 0 && (
          <View style={styles.recentlyViewedContainer}>
            <Text style={styles.recentlyViewedTitle}>Recently Viewed</Text>
            <FlatList
              data={recentlyViewed.slice(0, 4)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentlyViewedList}
              renderItem={({ item: product }) => (
                <ProductCard
                  product={product}
                  onPress={() => onProductPress?.(product as WishlistItem)}
                  layout="grid"
                  style={styles.recentlyViewedCard}
                  testID={`${testID}-recently-viewed-${product.id}`}
                />
              )}
              keyExtractor={(item) => item.id}
            />
          </View>
        )}
      </View>
    );
  };

  const renderWishlistItem = ({ item: product }: { item: WishlistItem }) => {
    const isSelected = localSelectedItems.includes(product.id);

    return (
      <TouchableOpacity
        onPress={() => {
          if (selectionMode) {
            handleSelectionToggle(product.id);
          } else {
            onProductPress?.(product);
          }
        }}
        onLongPress={() => {
          if (!selectionMode) {
            setSelectionMode(true);
            handleSelectionToggle(product.id);
          }
        }}
        style={[
          styles.wishlistItemContainer,
          isSelected && styles.wishlistItemSelected
        ]}
        testID={`${testID}-item-${product.id}`}
      >
        {selectionMode && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => handleSelectionToggle(product.id)}
            style={styles.itemCheckbox}
          />
        )}
        
        <ProductCard
          product={product}
          onPress={() => onProductPress?.(product)}
          onAddToCart={() => onAddToCart?.(product)}
          onToggleWishlist={() => onRemoveFromWishlist?.(product.id)}
          layout={localLayout}
          style={[
            styles.productCard,
            localLayout === 'list' && styles.productCardList
          ]}
          showWishlist={false} // Already in wishlist
          actionButtons={[
            {
              id: 'addToCart',
              label: 'Add to Cart',
              icon: '🛒',
              onPress: () => onAddToCart?.(product),
              variant: 'default'
            },
            {
              id: 'remove',
              label: 'Remove',
              icon: '❌',
              onPress: () => onRemoveFromWishlist?.(product.id),
              variant: 'destructive'
            }
          ]}
        />

        {/* Price Drop Indicator */}
        {product.priceDropped && (
          <Badge variant="destructive" style={styles.priceDropBadge}>
            <Text style={styles.priceDropText}>
              📉 {product.priceDropPercentage}% off
            </Text>
          </Badge>
        )}

        {/* Date Added */}
        <Text style={styles.dateAdded}>
          Added {product.dateAdded.toLocaleDateString()}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <Text style={styles.loadingText}>Loading more items...</Text>
      </View>
    );
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  const containerStyle = [styles.container, style];

  return (
    <SafeAreaView style={containerStyle} testID={testID} {...props}>
      {/* Header */}
      {renderHeader()}

      {/* Error Display */}
      {renderError()}

      {/* Filters */}
      {renderFilters()}

      <FlatList
        data={filteredItems}
        renderItem={renderWishlistItem}
        keyExtractor={(item) => item.id}
        numColumns={localLayout === 'grid' ? gridColumns : 1}
        key={`${localLayout}-${gridColumns}`} // Force re-render on layout change
        style={styles.wishlistList}
        contentContainerStyle={[
          styles.wishlistContent,
          !hasItems && styles.wishlistContentEmpty
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          ) : undefined
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        testID={`${testID}-list`}
      />

      {/* Footer */}
      {footerComponent && (
        <View style={styles.footerContainer}>
          {footerComponent}
        </View>
      )}
    </SafeAreaView>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
  },
  backIcon: {
    width: 24,
    height: 24,
    color: COLORS.text,
  },
  headerTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginHorizontal: SPACING.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerAction: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
  },
  headerActionIcon: {
    fontSize: 20,
  },
  headerActionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statValueSpecial: {
    color: COLORS.destructive,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
  },
  searchForm: {
    marginBottom: SPACING.md,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  layoutToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
  },
  layoutButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  layoutButtonActive: {
    backgroundColor: COLORS.primary,
  },
  layoutButtonText: {
    fontSize: 18,
    color: COLORS.text,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
  },
  controlButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text,
    marginRight: SPACING.xs,
  },
  filterBadge: {
    marginLeft: SPACING.xs,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  selectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: SPACING.md,
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  bulkActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  bulkActionButton: {
    paddingHorizontal: SPACING.md,
  },
  bulkActionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  errorAlert: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.destructive,
  },
  filtersCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
  },
  wishlistList: {
    flex: 1,
  },
  wishlistContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
  },
  wishlistContentEmpty: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  recentlyViewedContainer: {
    width: '100%',
  },
  recentlyViewedTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  recentlyViewedList: {
    gap: SPACING.md,
  },
  recentlyViewedCard: {
    width: 120,
  },
  wishlistItemContainer: {
    flex: 1,
    margin: SPACING.xs,
    position: 'relative',
  },
  wishlistItemSelected: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
  },
  itemCheckbox: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    zIndex: 10,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  productCard: {
    flex: 1,
  },
  productCardList: {
    marginHorizontal: 0,
  },
  priceDropBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    zIndex: 5,
  },
  priceDropText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  dateAdded: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  loadingFooter: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textSecondary,
  },
  footerContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
});

export default WishlistScreen;
export type { 
  WishlistScreenProps, 
  WishlistScreenConfig, 
  WishlistItem, 
  WishlistMetadata, 
  WishlistFilter 
};
