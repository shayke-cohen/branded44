import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
  SafeAreaView,
  Dimensions,
  Animated,
  Easing,
  Vibration,
  Platform,
} from 'react-native';
import { useTheme } from '../../context';
import { wixApiClient, WixProduct } from '../../utils/wixApiClient';
import { registerScreen } from '../../config/registry';

// Add sort/filter options
interface SortOption {
  label: string;
  value: string;
  field: string;
  order: 'ASC' | 'DESC';
}

const SORT_OPTIONS: SortOption[] = [
  { label: 'Name A-Z', value: 'name_asc', field: 'name', order: 'ASC' },
  { label: 'Name Z-A', value: 'name_desc', field: 'name', order: 'DESC' },
  { label: 'Price Low-High', value: 'price_asc', field: 'price', order: 'ASC' },
  { label: 'Price High-Low', value: 'price_desc', field: 'price', order: 'DESC' },
  { label: 'Newest First', value: 'newest', field: 'lastUpdated', order: 'DESC' },
];

interface FilterOption {
  label: string;
  value: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { label: 'All Products', value: 'all' },
  { label: 'In Stock Only', value: 'in_stock' },
  { label: 'Visible Only', value: 'visible' },
];

const { width } = Dimensions.get('window');
const PRODUCT_CARD_WIDTH = (width - 48) / 2;

// Fun animated components
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Fun loading component with bouncing dots
const FunLoadingIndicator = ({ theme }: { theme: any }) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDots = () => {
      const createAnimation = (dot: Animated.Value, delay: number) => {
        return Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -10,
            duration: 400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]);
      };

      Animated.loop(
        Animated.parallel([
          createAnimation(dot1, 0),
          createAnimation(dot2, 200),
          createAnimation(dot3, 400),
        ])
      ).start();
    };

    animateDots();
  }, []);

  return (
    <View style={styles.funLoadingContainer}>
      <Text style={[styles.funLoadingText, { color: theme.colors.text }]}>
        Loading awesome products
      </Text>
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, { backgroundColor: theme.colors.primary, transform: [{ translateY: dot1 }] }]} />
        <Animated.View style={[styles.dot, { backgroundColor: theme.colors.success, transform: [{ translateY: dot2 }] }]} />
        <Animated.View style={[styles.dot, { backgroundColor: theme.colors.error, transform: [{ translateY: dot3 }] }]} />
      </View>
    </View>
  );
};

// Fun product card with animations
const FunProductCard = ({ product, theme, onPress }: { product: WixProduct, theme: any, onPress: () => void }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Shimmer effect for new products
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePressIn = () => {
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Vibration.vibrate(10);
    }
    
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '2deg'],
  });

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  return (
    <AnimatedTouchableOpacity
      style={[
        styles.funProductCard,
        { 
          backgroundColor: theme.colors.surface,
          transform: [{ scale: scaleAnim }, { rotate }]
        }
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <Animated.View style={[styles.shimmerOverlay, { opacity: shimmerOpacity }]} />
      {product}
    </AnimatedTouchableOpacity>
  );
};

interface ProductListScreenProps {
  navigation?: any; // Optional for backward compatibility
  onProductPress?: (productId: string) => void; // New callback-based navigation
}

const ProductListScreen: React.FC<ProductListScreenProps> = ({ navigation, onProductPress }) => {
  const { theme } = useTheme();

  // Helper function to safely render strings
  const safeString = (value: any): string => {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return '';
    return String(value);
  };
  
  // State management
  const [products, setProducts] = useState<WixProduct[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFilteringInProgress, setIsFilteringInProgress] = useState(false);
  
  // Add new state for sort/filter
  const [selectedSort, setSelectedSort] = useState<SortOption>(SORT_OPTIONS[0]);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>(FILTER_OPTIONS[0]);
  const [showSortFilter, setShowSortFilter] = useState(false);
  
  // Add view mode toggle state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  console.log('🛍️ [DEBUG] ProductListScreen rendered');

  // Initialize data
  useEffect(() => {
    initializeData();
  }, []);

  // Filter products when category or search changes (with debouncing for search)
  useEffect(() => {
    // Only apply filters when user explicitly changes them, not on initial load
    if (!loading && (selectedCategoryId || searchQuery.trim())) {
      console.log('🔄 [FILTER] User changed filters, applying...');
      
      // Debounce search queries to reduce API calls
      if (searchQuery.trim()) {
        const timeoutId = setTimeout(() => {
          applyFiltersAndSort();
        }, 500); // 500ms debounce for search
        
        return () => clearTimeout(timeoutId);
      } else {
        // Apply category filters immediately
        applyFiltersAndSort();
      }
    }
  }, [selectedCategoryId, searchQuery]);

  const initializeData = useCallback(async () => {
    console.log('🛍️ [DEBUG] Initializing product list data...');
    
    try {
      setLoading(true);
      setError(null);

      // Visitor authentication is handled automatically by the API client
      const [productsResult, categoriesResult] = await Promise.all([
        loadProducts(),
        loadCategories(),
      ]);

      console.log(`✅ [DEBUG] Loaded ${productsResult?.length || 0} products and ${categoriesResult?.length || 0} categories`);
    } catch (err) {
      console.error('❌ [ERROR] Failed to initialize data:', err);
      setError('Failed to load store data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async (): Promise<WixProduct[]> => {
    try {
      console.log('🛍️ [DEBUG] Loading products from Wix API...');
      const result = await wixApiClient.queryProducts({
        visible: true,
        limit: 50,
      });
      
      const loadedProducts = result.products || [];
      setProducts(loadedProducts);
      console.log(`✅ [DEBUG] Loaded ${loadedProducts.length} products`);
      return loadedProducts;
    } catch (err) {
      console.error('❌ [ERROR] Failed to load products:', err);
      throw err;
    }
  }, []);

  const loadCategories = useCallback(async (): Promise<any[]> => {
    try {
      console.log('🛍️ [DEBUG] Loading categories from Wix API...');
      const result = await wixApiClient.queryCategories();
      
      const loadedCategories = result.categories || [];
      setCategories(loadedCategories);
      console.log(`✅ [DEBUG] Loaded ${loadedCategories.length} categories`);
      return loadedCategories;
    } catch (err) {
      console.error('❌ [ERROR] Failed to load categories:', err);
      return [];
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    console.log('🔄 [REFRESH] Starting pull-to-refresh...');
    try {
      setRefreshing(true);
      setError(null);
      
      // Log current cache info before refresh
      const cacheInfo = await wixApiClient.getCacheInfo();
      console.log('📊 [CACHE INFO] Before refresh:', cacheInfo);
      
      // Clear cache completely to ensure fresh data
      await wixApiClient.clearCache();
      console.log('🗑️ [CACHE] Cache cleared');
      
      // Force refresh both products and collections
      const [productsResult, categoriesResult] = await Promise.all([
        wixApiClient.queryProducts({ visible: true, limit: 50, forceRefresh: true }),
        wixApiClient.queryCategories(true) // true = force refresh
      ]);
      
      setProducts(productsResult.products || []);
      setCategories(categoriesResult.categories || []);
      
      // Reset any filters to show all refreshed products
      setSelectedCategoryId(null);
      setSearchQuery('');
      setSelectedSort(SORT_OPTIONS[0]);
      setSelectedFilter(FILTER_OPTIONS[0]);
      
      console.log(`✅ [REFRESH] Successfully refreshed: ${productsResult.products?.length || 0} products, ${categoriesResult.categories?.length || 0} categories`);
      
      // Log new cache info after refresh
      const newCacheInfo = await wixApiClient.getCacheInfo();
      console.log('📊 [CACHE INFO] After refresh:', newCacheInfo);
      
    } catch (err) {
      console.error('❌ [REFRESH ERROR] Failed to refresh:', err);
      setError('Failed to refresh data. Please check your connection and try again.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleProductPress = useCallback((product: WixProduct) => {
    console.log('🛍️ [DEBUG] Product selected:', safeString(product.name));
    if (onProductPress) {
      // Use callback-based navigation (new pattern)
      onProductPress(product.id);
    } else if (navigation) {
      // Fallback to React Navigation (backward compatibility)
      navigation.navigate('ProductDetail', { productId: product.id });
    }
  }, [navigation, onProductPress]);

  const renderProductCard = useCallback((product: WixProduct) => {
    const productName = safeString(product.name);
    
    // Fix price handling based on actual API structure
    const formatProductPrice = (product: WixProduct): string => {
      try {
        // Handle different possible price structures from Wix API
        if (product.priceData?.price !== undefined) {
          const price = product.priceData.price;
          const currency = product.priceData.currency || 'USD';
          return `${currency === 'USD' ? '$' : currency === 'ILS' ? '₪' : currency}${price}`;
        } else if (product.price?.price !== undefined) {
          const price = product.price.price;
          const currency = product.price.currency || 'USD';
          return `${currency === 'USD' ? '$' : currency === 'ILS' ? '₪' : currency}${price}`;
        }
        return 'Price unavailable';
      } catch (err) {
        console.warn('⚠️ [PRICE] Error formatting price:', err);
        return 'Price unavailable';
      }
    };

    const productPrice = formatProductPrice(product);
    
    // Fix image handling based on actual API structure  
    const getProductImageUrl = (product: WixProduct): string | null => {
      try {
        const media = product.media;
        if (!media) return null;

        // Check if media is the new object format with mainMedia/items
        if (typeof media === 'object' && !Array.isArray(media)) {
          if (media.mainMedia?.image?.url) {
            return media.mainMedia.image.url;
          } else if (media.items?.[0]?.image?.url) {
            return media.items[0].image.url;
          } else if (media.mainMedia?.url) {
            return media.mainMedia.url;
          }
        }
        
        // Check if media is the old array format
        if (Array.isArray(media) && media.length > 0) {
          return media[0].url;
        }

        return null;
      } catch (err) {
        console.warn('⚠️ [IMAGE] Error getting image URL:', err);
        return null;
      }
    };

    const imageUrl = getProductImageUrl(product);
    const optimizedImageUrl = imageUrl ? 
      wixApiClient.getOptimizedImageUrl(imageUrl, 300, 300) : null;

    // Check stock status
    const isInStock = product.stock?.inventoryStatus === 'IN_STOCK' || 
                     product.stock?.inStock === true || 
                     product.inStock === true;

    // Fun badges and indicators
    const isNew = product.lastUpdated && new Date(product.lastUpdated) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const isOnSale = product.priceData?.discountedPrice && product.priceData.discountedPrice < product.priceData.price;

    return (
      <AnimatedTouchableOpacity
        key={product.id}
        style={[styles.funProductCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => handleProductPress(product)}
        onPressIn={() => {
          if (Platform.OS === 'ios') {
            Vibration.vibrate(10);
          }
        }}
        activeOpacity={0.8}
      >
        <View style={styles.productImageContainer}>
          {optimizedImageUrl ? (
            <Image
              source={{ uri: optimizedImageUrl }}
              style={styles.productImage}
              resizeMode="cover"
              onError={(error) => {
                console.warn('⚠️ [IMAGE] Failed to load image:', optimizedImageUrl, error);
              }}
            />
          ) : (
            <View style={[styles.productImagePlaceholder, { backgroundColor: theme.colors.border }]}>
              <Text style={[styles.imagePlaceholderText, { color: theme.colors.textSecondary }]}>
                📦
              </Text>
            </View>
          )}
          
          {/* Fun badges */}
          <View style={styles.badgeContainer}>
            {isNew && (
              <View style={[styles.badge, styles.newBadge]}>
                <Text style={styles.badgeText}>✨ NEW</Text>
              </View>
            )}
            {isOnSale && (
              <View style={[styles.badge, styles.saleBadge]}>
                <Text style={styles.badgeText}>🔥 SALE</Text>
              </View>
            )}
            {!isInStock && (
              <View style={[styles.badge, styles.outOfStockBadge]}>
                <Text style={styles.badgeText}>😴 OUT</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.productInfo}>
          <Text 
            style={[styles.productName, { color: theme.colors.text }]} 
            numberOfLines={2}
          >
            {productName}
          </Text>
          <View style={styles.priceContainer}>
            <Text style={[styles.productPrice, { color: theme.colors.primary }]}>
              {productPrice}
            </Text>
            {isInStock && (
              <Text style={styles.stockEmoji}>✅</Text>
            )}
          </View>
        </View>
        
        {/* Shimmer overlay for visual appeal */}
        <View style={styles.shimmerOverlay} />
      </AnimatedTouchableOpacity>
    );
  }, [theme, handleProductPress]);

  // List view component for products
  const renderProductListItem = useCallback((product: WixProduct) => {
    const productName = safeString(product.name);
    
    // Fix price handling based on actual API structure
    const formatProductPrice = (product: WixProduct): string => {
      try {
        // Handle different possible price structures from Wix API
        if (product.priceData?.price !== undefined) {
          const price = product.priceData.price;
          const currency = product.priceData.currency || 'USD';
          return `${currency === 'USD' ? '$' : currency === 'ILS' ? '₪' : currency}${price}`;
        } else if (product.price?.price !== undefined) {
          const price = product.price.price;
          const currency = product.price.currency || 'USD';
          return `${currency === 'USD' ? '$' : currency === 'ILS' ? '₪' : currency}${price}`;
        }
        return 'Price unavailable';
      } catch (err) {
        console.warn('⚠️ [PRICE] Error formatting price:', err);
        return 'Price unavailable';
      }
    };

    const productPrice = formatProductPrice(product);
    
    // Fix image handling based on actual API structure  
    const getProductImageUrl = (product: WixProduct): string | null => {
      try {
        const media = product.media;
        if (!media) return null;

        // Check if media is the new object format with mainMedia/items
        if (typeof media === 'object' && !Array.isArray(media)) {
          if (media.mainMedia?.image?.url) {
            return media.mainMedia.image.url;
          } else if (media.items?.[0]?.image?.url) {
            return media.items[0].image.url;
          } else if (media.mainMedia?.url) {
            return media.mainMedia.url;
          }
        }
        
        // Check if media is the old array format
        if (Array.isArray(media) && media.length > 0) {
          return media[0].url;
        }

        return null;
      } catch (err) {
        console.warn('⚠️ [IMAGE] Error getting image URL:', err);
        return null;
      }
    };

    const imageUrl = getProductImageUrl(product);
    const optimizedImageUrl = imageUrl ? 
      wixApiClient.getOptimizedImageUrl(imageUrl, 120, 120) : null;

    // Check stock status
    const isInStock = product.stock?.inventoryStatus === 'IN_STOCK' || 
                     product.stock?.inStock === true || 
                     product.inStock === true;

    return (
      <TouchableOpacity
        key={product.id}
        style={[styles.listItem, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
        onPress={() => handleProductPress(product)}
        activeOpacity={0.7}
      >
        <View style={styles.listImageContainer}>
          {optimizedImageUrl ? (
            <Image
              source={{ uri: optimizedImageUrl }}
              style={styles.listImage}
              resizeMode="cover"
              onError={(error) => {
                console.warn('⚠️ [IMAGE] Failed to load image:', optimizedImageUrl, error);
              }}
            />
          ) : (
            <View style={[styles.listImagePlaceholder, { backgroundColor: theme.colors.border }]}>
              <Text style={[styles.listImagePlaceholderText, { color: theme.colors.textSecondary }]}>
                No Image
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.listContent}>
          <Text 
            style={[styles.listProductName, { color: theme.colors.text }]} 
            numberOfLines={2}
          >
            {productName}
          </Text>
          <Text style={[styles.listProductPrice, { color: theme.colors.primary }]}>
            {productPrice}
          </Text>
          
          {!isInStock && (
            <Text style={[styles.listOutOfStockText, { color: theme.colors.error }]}>
              Out of Stock
            </Text>
          )}
        </View>
        
        <View style={styles.listArrow}>
          <Text style={[styles.listArrowText, { color: theme.colors.textSecondary }]}>›</Text>
        </View>
      </TouchableOpacity>
    );
  }, [theme, handleProductPress]);

  // Add sort/filter methods
  const applyFiltersAndSort = useCallback(async () => {
    // Prevent concurrent filtering operations
    if (isFilteringInProgress) {
      console.log('🔄 [FILTER] Filtering already in progress, skipping...');
      return;
    }
    
    try {
      setIsFilteringInProgress(true);
      setRefreshing(true);
      setError(null);

      console.log('🛍️ [DEBUG] Loading products with filters/sort...', {
        selectedSort: selectedSort.label,
        selectedFilter: selectedFilter.label,
        searchQuery,
        selectedCategoryId
      });

      const filters: any = {
        limit: 50,
      };

      // Apply search filter
      if (searchQuery.trim()) {
        filters.searchQuery = searchQuery.trim();
        console.log('🔍 [SEARCH] Applied search:', searchQuery.trim());
      }

      // Apply category filter
      if (selectedCategoryId) {
        filters.categoryIds = [selectedCategoryId];
        console.log('📂 [CATEGORY] Applied category:', selectedCategoryId);
      }

      // Apply stock filter
      if (selectedFilter.value === 'in_stock') {
        filters.inStock = true;
        console.log('📦 [FILTER] Applied in-stock filter');
      } else if (selectedFilter.value === 'visible') {
        filters.visible = true;
        console.log('👁️ [FILTER] Applied visible filter');
      }

      // Build sort parameter for V1 API (simple field:order format)
      if (selectedSort.field && selectedSort.order) {
        const sortField = selectedSort.field === 'price' ? 'priceData.price' : selectedSort.field;
        const order = selectedSort.order.toLowerCase(); // V1 API expects lowercase
        filters.sort = `{"${sortField}": "${order}"}`;
        console.log('🔄 [SORT] Applied sort:', filters.sort);
      }

      console.log('🛍️ [DEBUG] Final filters object:', JSON.stringify(filters, null, 2));

      // Use client-side filtering for better performance (reduces API calls)
      const result = await wixApiClient.queryProductsWithClientFiltering(filters);
      setProducts(result.products || []);
      
      console.log(`✅ [DEBUG] Loaded ${result.products?.length || 0} products with filters applied`);
    } catch (err) {
      console.error('❌ [ERROR] Failed to load products with filters:', err);
      setError('Failed to load products with filters');
    } finally {
      setRefreshing(false);
      setIsFilteringInProgress(false);
    }
  }, [selectedCategoryId, searchQuery, selectedSort, selectedFilter]);

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <FunLoadingIndicator theme={theme} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {safeString(error)}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleRefresh}
        >
          <Text style={[styles.retryButtonText, { color: '#FFFFFF' }]}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header with Search and Sort/Filter */}
        <View style={styles.headerContainer}>
          {/* Fun Header Title */}
          <View style={styles.funHeaderTitle}>
            <Text style={[styles.headerTitleText, { color: theme.colors.text }]}>
              🛍️ Awesome Products
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              {products.length} amazing items waiting for you!
            </Text>
          </View>
          
          {/* Search Bar with fun styling */}
          <View style={styles.searchContainer}>
            <View style={[styles.funSearchWrapper, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={[
                  styles.funSearchInput,
                  { 
                    color: theme.colors.text 
                  }
                ]}
                placeholder="What are you looking for? ✨"
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={applyFiltersAndSort}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Text style={styles.clearIcon}>❌</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Sort and Filter Controls */}
          <View style={styles.controlsContainer}>
            {/* View Mode Toggle */}
            <TouchableOpacity
              style={[styles.viewToggleButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              <Text style={[styles.viewToggleText, { color: theme.colors.text }]}>
                {viewMode === 'grid' ? '☰' : '⊞'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => setShowSortFilter(!showSortFilter)}
            >
              <Text style={[styles.controlButtonText, { color: theme.colors.text }]}>
                Sort & Filter
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sort/Filter Panel */}
          {showSortFilter && (
            <View style={[styles.sortFilterPanel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              {/* Sort Options */}
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sort By:</Text>
              <View style={styles.optionsContainer}>
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      selectedSort.value === option.value && { backgroundColor: theme.colors.primary }
                    ]}
                    onPress={() => setSelectedSort(option)}
                  >
                    <Text style={[
                      styles.optionText,
                      { color: selectedSort.value === option.value ? '#FFFFFF' : theme.colors.text }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Categories/Collections Filter */}
              {categories.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Collections:</Text>
                  <View style={styles.optionsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.optionButton,
                        !selectedCategoryId && { backgroundColor: theme.colors.primary }
                      ]}
                      onPress={() => setSelectedCategoryId(null)}
                    >
                      <Text style={[
                        styles.optionText,
                        { color: !selectedCategoryId ? '#FFFFFF' : theme.colors.text }
                      ]}>
                        All Collections
                      </Text>
                    </TouchableOpacity>
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.optionButton,
                          selectedCategoryId === category.id && { backgroundColor: theme.colors.primary }
                        ]}
                        onPress={() => setSelectedCategoryId(category.id)}
                      >
                        <Text style={[
                          styles.optionText,
                          { color: selectedCategoryId === category.id ? '#FFFFFF' : theme.colors.text }
                        ]}>
                          {category.name} {category.numberOfProducts ? `(${category.numberOfProducts})` : ''}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Filter Options */}
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Filter:</Text>
              <View style={styles.optionsContainer}>
                {FILTER_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      selectedFilter.value === option.value && { backgroundColor: theme.colors.primary }
                    ]}
                    onPress={() => setSelectedFilter(option)}
                  >
                    <Text style={[
                      styles.optionText,
                      { color: selectedFilter.value === option.value ? '#FFFFFF' : theme.colors.text }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Apply Button */}
              <TouchableOpacity
                style={[styles.applyButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                  setShowSortFilter(false);
                  applyFiltersAndSort();
                }}
              >
                <Text style={[styles.applyButtonText, { color: '#FFFFFF' }]}>
                  Apply Filters
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Products Display */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={products.length === 0 ? styles.scrollViewEmpty : undefined}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                console.log('🔄 [REFRESH CONTROL] Pull-to-refresh triggered');
                handleRefresh();
              }}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
              title="Pull to refresh"
              titleColor={theme.colors.text}
            />
          }
        >
          {products.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {searchQuery || selectedCategoryId 
                  ? 'No products found matching your criteria'
                  : 'No products available - Connect to a real Wix store to see products'}
              </Text>
            </View>
          ) : viewMode === 'grid' ? (
            <View style={styles.productsGrid}>
              {products.map(renderProductCard)}
            </View>
          ) : (
            <View style={styles.productsList}>
              {products.map(renderProductListItem)}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  
  // Fun loading styles
  funLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  funLoadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  
  // Fun header styles
  funHeaderTitle: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Fun search styles
  searchContainer: {
    marginBottom: 8,
  },
  funSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 16,
    gap: 8,
  },
  searchIcon: {
    fontSize: 18,
  },
  funSearchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  clearIcon: {
    fontSize: 14,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  viewToggleButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewToggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  controlButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortFilterPanel: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  optionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  applyButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  productsList: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  productCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  // Fun product card styles
  funProductCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    position: 'relative',
  },
  
  // Badge styles
  badgeContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    zIndex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  newBadge: {
    backgroundColor: '#FF6B6B',
  },
  saleBadge: {
    backgroundColor: '#4ECDC4',
  },
  outOfStockBadge: {
    backgroundColor: '#95A5A6',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // Price container
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stockEmoji: {
    fontSize: 16,
  },
  
  // Shimmer overlay
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  productImageContainer: {
    width: '100%',
    height: 150,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 14,
    fontWeight: '500',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  outOfStockText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  
  // List view styles
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  listImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  listImage: {
    width: '100%',
    height: '100%',
  },
  listImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  listImagePlaceholderText: {
    fontSize: 10,
    fontWeight: '500',
  },
  listContent: {
    flex: 1,
    justifyContent: 'center',
  },
  listProductName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  listProductPrice: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  listOutOfStockText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  listArrow: {
    paddingLeft: 8,
  },
  listArrowText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});

// Note: This screen is now managed by ProductsNavigation and not directly registered

export default ProductListScreen;

console.log('🛍️ [DEBUG] ProductListScreen component loaded'); 