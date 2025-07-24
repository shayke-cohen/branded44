import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Alert } from '../../utils/alert';
import { useTheme } from '../../context';
import { useWixCart } from '../../context/WixCartContext';

// Import cache hook dynamically to test if exports work
let useCachedProduct: any;
try {
  const cacheModule = require('../../context/ProductCacheContext');
  useCachedProduct = cacheModule.useCachedProduct || (() => ({ 
    cachedProduct: null, 
    isCached: false, 
    setCachedProduct: () => {} 
  }));
} catch (e) {
  console.warn('ProductCache not available:', e);
  useCachedProduct = () => ({ 
    cachedProduct: null, 
    isCached: false, 
    setCachedProduct: () => {} 
  });
}
import { wixApiClient, formatPrice, safeString, WixProduct } from '../../utils/wixApiClient';

const { width } = Dimensions.get('window');

interface ProductDetailScreenProps {
  // New callback-based navigation
  productId?: string;
  onBack?: () => void;
  onCartPress?: () => void; // Callback for cart navigation
  
  // Legacy React Navigation support
  navigation?: any;
  route?: {
    params: {
      productId: string;
    };
  };
}

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ 
  productId: propProductId, 
  onBack, 
  onCartPress,
  navigation, 
  route 
}) => {
  const { theme } = useTheme();
  const { addToCart, getItemCount } = useWixCart();
  
  // Support both new callback-based navigation and legacy route-based navigation
  const productId = propProductId || route?.params?.productId;
  
  // Use cached product if available
  const { cachedProduct, isCached, setCachedProduct } = useCachedProduct(productId || '');
  
  // State management - all hooks must come before any conditional logic
  const [product, setProduct] = useState<WixProduct | null>(cachedProduct);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(!isCached); // Don't show loading if we have cached data
  const [addingToCart, setAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  console.log('🛍️ [DETAIL] ProductDetailScreen loaded for product:', productId);
  console.log('📦 [PRODUCT CACHE] Cache status:', { isCached, hasCachedProduct: !!cachedProduct });

  // Load product data
  useEffect(() => {
    if (productId) {
      loadProductDetails();
    }
  }, [productId]);

  const loadProductDetails = useCallback(async () => {
    if (!productId) {
      console.error('❌ [DETAIL ERROR] No productId provided for loadProductDetails');
      setError('No product ID provided');
      setLoading(false);
      return;
    }
    
    // Check if we already have the product from cache and it's current
    if (cachedProduct && !loading) {
      console.log('✅ [PRODUCT CACHE] Using cached product data for:', productId);
      
      // Initialize selected options with first choice of each option
             if (cachedProduct.options && cachedProduct.options.length > 0) {
         const initialOptions: Record<string, string> = {};
         cachedProduct.options.forEach((option: any) => {
           if (option.choices && option.choices.length > 0) {
             initialOptions[option.id] = option.choices[0].id;
           }
         });
         setSelectedOptions(initialOptions);
       }
      return;
    }
    
    console.log('🛍️ [DEBUG] Loading product details from API for:', productId);
    
    try {
      setLoading(true);
      setError(null);

      const productData = await wixApiClient.getProduct(productId);
      setProduct(productData);
      
      // Cache the fetched product for future use
      setCachedProduct(productData);
      console.log('💾 [PRODUCT CACHE] Cached product from detail API:', productId);
      
      // Initialize selected options with first choice of each option
      if (productData.options && productData.options.length > 0) {
        const initialOptions: Record<string, string> = {};
        productData.options.forEach(option => {
          if (option.choices && option.choices.length > 0) {
            initialOptions[option.id] = option.choices[0].id;
          }
        });
        setSelectedOptions(initialOptions);
      }

      console.log('✅ [DEBUG] Product loaded from API:', safeString(productData.name));
    } catch (err) {
      console.error('❌ [ERROR] Failed to load product:', err);
      setError('Failed to load product details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [productId, cachedProduct, loading, setCachedProduct]);

  const handleOptionChange = useCallback((optionId: string, choiceId: string) => {
    console.log('🛍️ [DEBUG] Option changed:', { optionId, choiceId });
    setSelectedOptions(prev => ({
      ...prev,
      [optionId]: choiceId,
    }));
  }, []);

  const handleImagePress = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (!product) return;

    try {
      setAddingToCart(true);
      console.log('🛍️ [DEBUG] Adding product to cart:', safeString(product.name));

             await addToCart({
         catalogReference: {
           appId: wixApiClient.getStoresAppId(),
           catalogItemId: product.id,
           options: selectedOptions,
         },
         quantity: 1,
       });

      const alertButtons: Array<{ text: string; style?: 'cancel' | 'destructive'; onPress?: () => void }> = [
        { text: 'Continue Shopping', style: 'cancel' },
      ];
      
      // Only show "View Cart" option if navigation is available (legacy mode)
      if (navigation) {
        alertButtons.push({ text: 'View Cart', onPress: () => navigation.navigate('Cart') });
      }

      Alert.alert(
        'Added to Cart',
        `${safeString(product.name)} has been added to your cart.`,
        alertButtons
      );
    } catch (err) {
      console.error('❌ [ERROR] Failed to add to cart:', err);
      Alert.alert(
        'Error',
        'Failed to add item to cart. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setAddingToCart(false);
    }
  }, [product, selectedOptions, addToCart, navigation]);

  // Helper function to extract images from different media formats
  const getProductImages = useCallback(() => {
    if (!product?.media) return [];
    
    try {
      // Handle object format with mainMedia/items
      if (typeof product.media === 'object' && !Array.isArray(product.media)) {
        const images: Array<{url: string; id?: string}> = [];
        
        // Add main media image
        if (product.media.mainMedia?.image?.url) {
          images.push({ 
            url: product.media.mainMedia.image.url, 
            id: 'main' 
          });
        } else if (product.media.mainMedia?.url) {
          images.push({ 
            url: product.media.mainMedia.url, 
            id: 'main' 
          });
        }
        
        // Add additional images from items array
        if (product.media.items && Array.isArray(product.media.items)) {
          product.media.items.forEach((item, index) => {
            if (item.image?.url) {
              images.push({ 
                url: item.image.url, 
                id: `item-${index}` 
              });
            } else if (item.url) {
              images.push({ 
                url: item.url, 
                id: `item-${index}` 
              });
            }
          });
        }
        
        return images;
      }
      
      // Handle array format (legacy)
      if (Array.isArray(product.media)) {
        return product.media.map((item, index) => ({
          url: item.url,
          id: item.id || `legacy-${index}`
        }));
      }
      
      return [];
    } catch (err) {
      console.warn('⚠️ [IMAGE] Error parsing media:', err);
      return [];
    }
  }, [product?.media]);

  const renderProductImages = useCallback(() => {
    const images = getProductImages();
    
    if (images.length === 0) {
      return (
        <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.border }]}>
          <Text style={[styles.imagePlaceholderText, { color: theme.colors.textSecondary }]}>
            No Image Available
          </Text>
        </View>
      );
    }

    const selectedImage = images[selectedImageIndex] || images[0];
    const imageUrl = selectedImage?.url ? 
      wixApiClient.getOptimizedImageUrl(selectedImage.url, width, width) : null;

    return (
      <View style={styles.imageContainer}>
        {/* Main Image */}
        <View style={styles.mainImageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.mainImage}
              resizeMode="cover"
              onError={(error) => {
                console.warn('⚠️ [IMAGE] Failed to load main image:', imageUrl, error);
              }}
            />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.border }]}>
              <Text style={[styles.imagePlaceholderText, { color: theme.colors.textSecondary }]}>
                No Image
              </Text>
            </View>
          )}
        </View>

        {/* Image Thumbnails */}
        {images.length > 1 && (
          <ScrollView horizontal style={styles.thumbnailContainer} showsHorizontalScrollIndicator={false}>
            {images.map((imageItem, index) => {
              const thumbnailUrl = imageItem.url ? 
                wixApiClient.getOptimizedImageUrl(imageItem.url, 80, 80) : null;
              
              return (
                <TouchableOpacity
                  key={imageItem.id || index}
                  style={[
                    styles.thumbnail,
                    selectedImageIndex === index && { borderColor: theme.colors.primary, borderWidth: 2 }
                  ]}
                  onPress={() => handleImagePress(index)}
                >
                  {thumbnailUrl ? (
                    <Image
                      source={{ uri: thumbnailUrl }}
                      style={styles.thumbnailImage}
                      resizeMode="cover"
                      onError={(error) => {
                        console.warn('⚠️ [IMAGE] Failed to load thumbnail:', thumbnailUrl, error);
                      }}
                    />
                  ) : (
                    <View style={[styles.thumbnailPlaceholder, { backgroundColor: theme.colors.border }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  }, [getProductImages, selectedImageIndex, theme, handleImagePress]);

  // Helper function to determine if product is in stock
  const isProductInStock = useCallback(() => {
    if (!product) return false;
    
    try {
      // Check the stock object first (most accurate)
      if (product.stock) {
        // Check inventory status
        if (product.stock.inventoryStatus === 'IN_STOCK') return true;
        if (product.stock.inventoryStatus === 'OUT_OF_STOCK') return false;
        if (product.stock.inventoryStatus === 'PARTIALLY_OUT_OF_STOCK') return true; // Some variants available
        
        // Check inStock boolean
        if (product.stock.inStock !== undefined) {
          return product.stock.inStock;
        }
        
        // Check quantity if available
        if (product.stock.quantity !== undefined) {
          return product.stock.quantity > 0;
        }
      }
      
      // Fallback to product-level inStock property
      if (product.inStock !== undefined) {
        return product.inStock;
      }
      
      // Default to true if no stock info (assume available)
      return true;
    } catch (err) {
      console.warn('⚠️ [STOCK] Error checking stock status:', err);
      return true; // Default to available if error
    }
  }, [product]);

  const renderProductOptions = useCallback(() => {
    if (!product?.options || product.options.length === 0) return null;

    return (
      <View style={styles.optionsContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Options
        </Text>
        
        {product.options.map(option => {
          const optionName = safeString(option.name);
          const selectedChoiceId = selectedOptions[option.id];
          
          return (
            <View key={option.id} style={styles.optionGroup}>
              <Text style={[styles.optionTitle, { color: theme.colors.text }]}>
                {optionName}
              </Text>
              
              <View style={styles.choicesContainer}>
                {option.choices?.map(choice => {
                  const choiceName = safeString(choice.value);
                  const isSelected = selectedChoiceId === choice.id;
                  const isInStock = choice.inStock;
                  
                  return (
                    <TouchableOpacity
                      key={choice.id}
                      style={[
                        styles.choiceButton,
                        {
                          backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                          opacity: isInStock ? 1 : 0.5,
                        }
                      ]}
                      onPress={() => isInStock && handleOptionChange(option.id, choice.id)}
                      disabled={!isInStock}
                    >
                      <Text style={[
                        styles.choiceText,
                        { color: isSelected ? '#FFFFFF' : theme.colors.text }
                      ]}>
                        {choiceName}
                        {!isInStock && ' (Out of Stock)'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>
    );
  }, [product, selectedOptions, theme, handleOptionChange]);

  // Handle case where no productId is provided
  if (!productId) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Error: No product ID provided
          </Text>
          {onBack && (
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
              onPress={onBack}
            >
              <Text style={[styles.retryButtonText, { color: '#FFFFFF' }]}>
                Go Back
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading product details...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {safeString(error || 'Product not found')}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={loadProductDetails}
        >
          <Text style={[styles.retryButtonText, { color: '#FFFFFF' }]}>
            Try Again
          </Text>
        </TouchableOpacity>
        {onBack && (
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.border, marginTop: 10 }]}
            onPress={onBack}
          >
            <Text style={[styles.retryButtonText, { color: theme.colors.text }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  }

  const productName = safeString(product.name);
  const productPrice = formatPrice(product.price);
  const productDescription = safeString(product.description);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with back button and cart icon */}
      <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
        {onBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>← Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
        
        {/* Cart Icon */}
        <TouchableOpacity
          style={[styles.cartButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => {
            if (onCartPress) {
              onCartPress();
            } else if (navigation) {
              // Fallback to navigation prop if available
              navigation.navigate('Cart');
            } else {
              console.log('🛒 [NAV] Cart icon pressed - no navigation handler available');
            }
          }}
        >
          <View style={styles.cartIconContainer}>
            <Text style={[styles.cartIcon, { color: theme.colors.text }]}>🛒</Text>
            {getItemCount() > 0 && (
              <View style={[styles.cartBadge, { backgroundColor: theme.colors.error }]}>
                <Text style={styles.cartBadgeText}>{getItemCount()}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        {renderProductImages()}

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: theme.colors.text }]}>
            {productName}
          </Text>
          
          <Text style={[styles.productPrice, { color: theme.colors.primary }]}>
            {productPrice}
          </Text>

          {!isProductInStock() && (
            <View style={[styles.outOfStockBadge, { backgroundColor: theme.colors.error }]}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          )}

          {productDescription ? (
            <View style={styles.descriptionContainer}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Description
              </Text>
              <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
                {productDescription}
              </Text>
            </View>
          ) : null}

          {/* Product Options */}
          {renderProductOptions()}
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={[styles.addToCartContainer, { backgroundColor: theme.colors.background }]}>
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            {
              backgroundColor: isProductInStock() ? theme.colors.primary : theme.colors.border,
            }
          ]}
          onPress={handleAddToCart}
          disabled={!isProductInStock() || addingToCart}
        >
          {addingToCart ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={[styles.addToCartText, { color: '#FFFFFF' }]}>
              {isProductInStock() ? 'Add to Cart' : 'Out of Stock'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerSpacer: {
    flex: 1,
  },
  cartButton: {
    width: 50,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
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
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
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
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    marginBottom: 20,
  },
  mainImageContainer: {
    width: '100%',
    height: width,
    backgroundColor: '#f5f5f5',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 16,
    fontWeight: '500',
  },
  thumbnailContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  thumbnail: {
    width: 80,
    height: 80,
    marginRight: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    lineHeight: 32,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  outOfStockBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  outOfStockText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionGroup: {
    marginBottom: 20,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  choicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  choiceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addToCartContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addToCartButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

// Note: This screen is now managed by ProductsNavigation and not directly registered

export default ProductDetailScreen;

console.log('🛍️ [DEBUG] ProductDetailScreen component loaded'); 