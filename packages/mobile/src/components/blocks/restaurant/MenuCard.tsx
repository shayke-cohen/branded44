/**
 * MenuCard Component - AI-Optimized React Native Component
 * 
 * A comprehensive menu item display card for restaurant and food ordering applications.
 * Perfect for displaying food items with photos, descriptions, pricing, dietary info, and customization options.
 * 
 * @category Restaurant Blocks
 * @author AI Component System
 * @version 1.0.0
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Card } from '../../../../~/components/ui/card';
import { Button } from '../../../../~/components/ui/button';
import { Badge } from '../../../../~/components/ui/badge';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../lib/constants';
import { cn } from '../../../lib/utils';

// === TYPES ===

/**
 * Menu item category types for consistent categorization
 */
export type MenuCategory = 
  | 'appetizers' 
  | 'soups' 
  | 'salads' 
  | 'mains' 
  | 'desserts' 
  | 'beverages' 
  | 'sides' 
  | 'specials'
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'other';

/**
 * Dietary restriction and preference tags
 */
export type DietaryTag = 
  | 'vegetarian' 
  | 'vegan' 
  | 'gluten-free' 
  | 'dairy-free' 
  | 'nut-free' 
  | 'keto' 
  | 'low-carb' 
  | 'halal' 
  | 'kosher'
  | 'organic'
  | 'spicy'
  | 'healthy';

/**
 * Spice level indicator
 */
export type SpiceLevel = 'none' | 'mild' | 'medium' | 'hot' | 'very-hot';

/**
 * Menu item pricing structure
 */
export interface MenuItemPricing {
  /** Base price for the item */
  basePrice: number;
  /** Original price if on sale */
  originalPrice?: number;
  /** Currency code (USD, EUR, etc.) */
  currency: string;
  /** Whether item is currently on sale */
  onSale?: boolean;
  /** Discount percentage if on sale */
  discountPercentage?: number;
  /** Size variants with different prices */
  sizeVariants?: {
    size: string;
    price: number;
    description?: string;
  }[];
}

/**
 * Nutritional information
 */
export interface NutritionInfo {
  /** Calories per serving */
  calories: number;
  /** Protein in grams */
  protein?: number;
  /** Carbohydrates in grams */
  carbs?: number;
  /** Fat in grams */
  fat?: number;
  /** Fiber in grams */
  fiber?: number;
  /** Sodium in milligrams */
  sodium?: number;
  /** Sugar in grams */
  sugar?: number;
}

/**
 * Customization option for menu items
 */
export interface CustomizationOption {
  /** Option ID */
  id: string;
  /** Option name */
  name: string;
  /** Option description */
  description?: string;
  /** Option type */
  type: 'single' | 'multiple' | 'text';
  /** Whether option is required */
  required: boolean;
  /** Additional price for option */
  additionalPrice?: number;
  /** Available choices for single/multiple types */
  choices?: {
    id: string;
    name: string;
    price?: number;
    available?: boolean;
  }[];
  /** Maximum selections for multiple type */
  maxSelections?: number;
}

/**
 * Menu item data structure
 */
export interface MenuItem {
  /** Menu item unique identifier */
  id: string;
  /** Item name */
  name: string;
  /** Item description */
  description: string;
  /** Menu category */
  category: MenuCategory;
  /** Item pricing */
  pricing: MenuItemPricing;
  /** Item images */
  images: string[];
  /** Dietary tags */
  dietaryTags: DietaryTag[];
  /** Spice level */
  spiceLevel?: SpiceLevel;
  /** Nutritional information */
  nutrition?: NutritionInfo;
  /** Preparation time in minutes */
  prepTime?: number;
  /** Whether item is available */
  available: boolean;
  /** Whether item is popular/featured */
  popular?: boolean;
  /** Whether item is new */
  isNew?: boolean;
  /** Customization options */
  customizations?: CustomizationOption[];
  /** Allergen information */
  allergens?: string[];
  /** Item rating */
  rating?: number;
  /** Number of reviews */
  reviewCount?: number;
  /** Recommended pairings */
  recommendations?: string[];
  /** Cooking instructions or notes */
  cookingNotes?: string;
}

/**
 * Action button configuration
 */
export interface MenuItemAction {
  /** Action identifier */
  id: string;
  /** Action label */
  label: string;
  /** Action icon */
  icon?: string;
  /** Action press handler */
  onPress: () => void;
  /** Button variant */
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  /** Whether action is loading */
  loading?: boolean;
  /** Whether action is disabled */
  disabled?: boolean;
}

/**
 * MenuCard component props
 */
export interface MenuCardProps {
  /** Menu item data to display */
  item: MenuItem;
  /** Card press handler */
  onPress?: () => void;
  /** Add to cart handler */
  onAddToCart?: (quantity?: number) => void;
  /** Add to favorites handler */
  onFavorite?: () => void;
  /** View nutrition info handler */
  onViewNutrition?: () => void;
  /** Customize item handler */
  onCustomize?: () => void;
  /** Whether item is favorited */
  isFavorite?: boolean;
  /** Current cart quantity */
  cartQuantity?: number;
  /** Custom action buttons */
  actions?: MenuItemAction[];
  /** Card layout variant */
  layout?: 'card' | 'list' | 'compact';
  /** Whether to show pricing */
  showPricing?: boolean;
  /** Whether to show dietary tags */
  showDietaryTags?: boolean;
  /** Whether to show nutrition info */
  showNutrition?: boolean;
  /** Whether to show prep time */
  showPrepTime?: boolean;
  /** Whether to show add to cart button */
  showAddToCart?: boolean;
  /** Whether to show rating */
  showRating?: boolean;
  /** Whether card is loading */
  loading?: boolean;
  /** Custom card width */
  width?: number;
  /** Custom test ID */
  testID?: string;
}

// === UTILITY FUNCTIONS ===

/**
 * Format currency display
 */
const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount);
};

/**
 * Get spice level display
 */
const getSpiceLevelDisplay = (level: SpiceLevel): string => {
  const levels = {
    none: '',
    mild: '🌶️',
    medium: '🌶️🌶️',
    hot: '🌶️🌶️🌶️',
    'very-hot': '🌶️🌶️🌶️🌶️',
  };
  return levels[level] || '';
};

/**
 * Get dietary tag color
 */
const getDietaryTagColor = (tag: DietaryTag): { bg: string; text: string } => {
  const tagColors: Record<DietaryTag, { bg: string; text: string }> = {
    vegetarian: { bg: '#DCFCE7', text: '#166534' },
    vegan: { bg: '#DCFCE7', text: '#14532D' },
    'gluten-free': { bg: '#FEF3C7', text: '#92400E' },
    'dairy-free': { bg: '#E0E7FF', text: '#3730A3' },
    'nut-free': { bg: '#FCE7F3', text: '#9D174D' },
    keto: { bg: '#F3E8FF', text: '#6B21A8' },
    'low-carb': { bg: '#F0F9FF', text: '#075985' },
    halal: { bg: '#ECFDF5', text: '#047857' },
    kosher: { bg: '#ECFDF5', text: '#047857' },
    organic: { bg: '#F7FEE7', text: '#365314' },
    spicy: { bg: '#FEF2F2', text: '#991B1B' },
    healthy: { bg: '#ECFDF5', text: '#059669' },
  };
  return tagColors[tag] || { bg: '#F3F4F6', text: '#374151' };
};

// === COMPONENT ===

/**
 * MenuCard - Display menu item with ordering functionality
 * 
 * @example
 * ```tsx
 * const menuItem = {
 *   id: 'item_123',
 *   name: 'Grilled Salmon',
 *   description: 'Fresh Atlantic salmon with lemon herbs and roasted vegetables',
 *   category: 'mains',
 *   pricing: {
 *     basePrice: 24.99,
 *     currency: 'USD'
 *   },
 *   images: ['salmon.jpg'],
 *   dietaryTags: ['gluten-free', 'healthy'],
 *   available: true,
 *   prepTime: 15,
 *   rating: 4.8,
 *   reviewCount: 124
 * };
 * 
 * <MenuCard
 *   item={menuItem}
 *   onPress={() => navigateToItem(menuItem.id)}
 *   onAddToCart={() => addToCart(menuItem.id)}
 *   onFavorite={() => toggleFavorite(menuItem.id)}
 *   showDietaryTags={true}
 *   showAddToCart={true}
 * />
 * ```
 */
export default function MenuCard({
  item,
  onPress,
  onAddToCart,
  onFavorite,
  onViewNutrition,
  onCustomize,
  isFavorite = false,
  cartQuantity = 0,
  actions = [],
  layout = 'card',
  showPricing = true,
  showDietaryTags = true,
  showNutrition = false,
  showPrepTime = true,
  showAddToCart = true,
  showRating = true,
  loading = false,
  width,
  testID = 'menu-card',
}: MenuCardProps) {
  
  // Handle loading state
  if (loading) {
    return (
      <Card style={{ width, padding: 16 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ width: 80, height: 80, backgroundColor: '#E5E7EB', borderRadius: 12 }} />
          <View style={{ flex: 1, gap: 8 }}>
            <View style={{ height: 16, backgroundColor: '#E5E7EB', borderRadius: 4, width: '75%' }} />
            <View style={{ height: 12, backgroundColor: '#E5E7EB', borderRadius: 4, width: '50%' }} />
            <View style={{ height: 12, backgroundColor: '#E5E7EB', borderRadius: 4, width: '67%' }} />
            <View style={{ height: 20, backgroundColor: '#E5E7EB', borderRadius: 4, width: '40%' }} />
          </View>
        </View>
      </Card>
    );
  }

  // Debug logging for image data
  console.log(`🔍 [MENU CARD] Rendering "${item.name}" with images:`, {
    hasImages: !!(item.images && item.images.length > 0),
    imageCount: item.images?.length || 0,
    firstImage: item.images?.[0],
    allImages: item.images
  });

  const isCompact = layout === 'compact';
  const isList = layout === 'list';

  return (
    <TouchableOpacity onPress={onPress} testID={testID} activeOpacity={0.95}>
      <Card style={{ 
        width,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
        marginBottom: isList ? 12 : 16,
        opacity: item.available ? 1 : 0.6,
      }}>
        
        {/* Menu Item Image */}
        <View style={{
          position: 'relative',
          flexDirection: isList ? 'row' : 'column',
        }}>
          <View style={{
            width: isList ? 120 : '100%',
            height: isCompact ? 100 : isList ? 100 : 180,
            position: 'relative',
          }}>
            {item.images && item.images.length > 0 && item.images[0] ? (
              <View style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Image
                  source={{ uri: item.images[0] }}
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    borderTopLeftRadius: isList ? 16 : 16,
                    borderTopRightRadius: isList ? 0 : 16,
                    borderBottomLeftRadius: isList ? 16 : 0,
                  }}
                  resizeMode="cover"
                  onError={(error) => {
                    console.error(`❌ [MENU CARD] Image load FAILED for "${item.name}":`, {
                      error: error.nativeEvent.error,
                      url: item.images[0],
                      imageLength: item.images?.length,
                      allImages: item.images
                    });
                  }}
                  onLoadStart={() => {
                    console.log(`🔄 [MENU CARD] Image load STARTED for "${item.name}":`, item.images[0]);
                  }}
                  onLoadEnd={() => {
                    console.log(`✅ [MENU CARD] Image load COMPLETED for "${item.name}":`, item.images[0]);
                  }}
                  onLoad={() => {
                    console.log(`🖼️ [MENU CARD] Image RENDERED successfully for "${item.name}":`, item.images[0]);
                  }}
                />
                {/* Debug indicator - small green dot when image is present */}
                <View style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#10B981',
                  zIndex: 10
                }} />
              </View>
            ) : (
              <View style={{ 
                width: '100%', 
                height: '100%',
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
                borderTopLeftRadius: isList ? 16 : 16,
                borderTopRightRadius: isList ? 0 : 16,
                borderBottomLeftRadius: isList ? 16 : 0,
              }}>
                <Text style={{ color: '#9CA3AF', fontSize: 12 }}>
                  No Image
                </Text>
              </View>
            )}
            
            {/* Overlay for unavailable items */}
            {!item.available && (
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.4)',
                alignItems: 'center',
                justifyContent: 'center',
                borderTopLeftRadius: isList ? 16 : 16,
                borderTopRightRadius: isList ? 0 : 16,
                borderBottomLeftRadius: isList ? 16 : 0,
              }}>
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
                  UNAVAILABLE
                </Text>
              </View>
            )}
            
            {/* Badges */}
            <View style={{ position: 'absolute', top: 8, left: 8, flexDirection: 'row', gap: 4 }}>
              {item.popular && (
                <View style={{ 
                  backgroundColor: '#EF4444',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}>
                  <Text style={{ color: 'white', fontSize: 11, fontWeight: '600' }}>
                    🔥 Popular
                  </Text>
                </View>
              )}
              
              {item.isNew && (
                <View style={{ 
                  backgroundColor: '#10B981',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}>
                  <Text style={{ color: 'white', fontSize: 11, fontWeight: '600' }}>
                    ✨ New
                  </Text>
                </View>
              )}
            </View>

            {/* Spice Level */}
            {item.spiceLevel && item.spiceLevel !== 'none' && (
              <View style={{ position: 'absolute', top: 8, right: 8 }}>
                <Text style={{ fontSize: 14 }}>
                  {getSpiceLevelDisplay(item.spiceLevel)}
                </Text>
              </View>
            )}

            {/* Favorite Button */}
            <TouchableOpacity
              style={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                width: 32,
                height: 32,
                backgroundColor: 'white',
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
              }}
              onPress={onFavorite}
            >
              <Text style={{ fontSize: 14 }}>
                {isFavorite ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Menu Item Content */}
          <View style={{ 
            padding: 16, 
            flex: isList ? 1 : undefined,
          }}>
            
            {/* Item Name and Rating */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text 
                numberOfLines={isCompact ? 1 : 2}
                style={{ 
                  fontWeight: 'bold',
                  color: '#111827',
                  fontSize: isCompact ? 14 : 18,
                  lineHeight: isCompact ? 18 : 24,
                  flex: 1,
                  marginRight: 8,
                }}
              >
                {item.name || 'Unnamed Item'}
              </Text>
              
              {/* Rating */}
              {showRating && item.rating && (
                <View style={{ 
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#FFF9E6', 
                  paddingHorizontal: 8, 
                  paddingVertical: 4, 
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#FCD34D',
                }}>
                  <Text style={{ fontSize: 11, marginRight: 2 }}>⭐</Text>
                  <Text style={{ fontSize: 11, color: '#92400E', fontWeight: '600' }}>
                    {item.rating.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>

            {/* Item Description */}
            {!isCompact && (
              <Text 
                numberOfLines={isList ? 2 : 3}
                style={{ 
                  fontSize: 14,
                  color: '#6B7280',
                  lineHeight: 20,
                  marginBottom: 12,
                }}
              >
                {item.description || 'No description available'}
              </Text>
            )}

            {/* Dietary Tags */}
            {showDietaryTags && item.dietaryTags && item.dietaryTags.length > 0 && (
              <View style={{ 
                flexDirection: 'row', 
                flexWrap: 'wrap',
                gap: 6, 
                marginBottom: 12,
              }}>
                {item.dietaryTags.slice(0, isCompact ? 2 : 4).map((tag, index) => {
                  const colors = getDietaryTagColor(tag);
                  return (
                    <View
                      key={index}
                      style={{ 
                        backgroundColor: colors.bg,
                        paddingHorizontal: 8, 
                        paddingVertical: 4, 
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.text + '20',
                      }}
                    >
                      <Text style={{ 
                        fontSize: 10, 
                        color: colors.text, 
                        fontWeight: '600',
                        textTransform: 'capitalize',
                      }}>
                        {tag.replace('-', ' ')}
                      </Text>
                    </View>
                  );
                })}
                {item.dietaryTags.length > (isCompact ? 2 : 4) && (
                  <View style={{ 
                    backgroundColor: '#F3F4F6',
                    paddingHorizontal: 8, 
                    paddingVertical: 4, 
                    borderRadius: 12,
                  }}>
                    <Text style={{ fontSize: 10, color: '#6B7280', fontWeight: '600' }}>
                      +{item.dietaryTags.length - (isCompact ? 2 : 4)} more
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Prep Time and Nutrition */}
            {!isCompact && (
              <View style={{ 
                flexDirection: 'row', 
                gap: 12, 
                marginBottom: 16,
              }}>
                {/* Prep Time */}
                {showPrepTime && item.prepTime && (
                  <View style={{ 
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#F8F9FA', 
                    paddingHorizontal: 10, 
                    paddingVertical: 6, 
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                  }}>
                    <Text style={{ fontSize: 12, marginRight: 4 }}>⏱️</Text>
                    <Text style={{ fontSize: 12, color: '#374151', fontWeight: '600' }}>
                      {item.prepTime} min
                    </Text>
                  </View>
                )}

                {/* Nutrition Info */}
                {showNutrition && item.nutrition && item.nutrition.calories && (
                  <TouchableOpacity
                    onPress={onViewNutrition}
                    style={{ 
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#EFF6FF', 
                      paddingHorizontal: 10, 
                      paddingVertical: 6, 
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: '#DBEAFE',
                    }}
                  >
                    <Text style={{ fontSize: 12, marginRight: 4 }}>📊</Text>
                    <Text style={{ fontSize: 12, color: '#1D4ED8', fontWeight: '600' }}>
                      {item.nutrition.calories} cal
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Pricing and Cart Actions */}
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: '#F3F4F6',
            }}>
              
              {/* Pricing */}
              {showPricing && item.pricing && (
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>
                      {item.pricing.basePrice ? formatCurrency(item.pricing.basePrice, item.pricing.currency || 'USD') : 'Price unavailable'}
                    </Text>
                    {item.pricing.originalPrice && item.pricing.onSale && (
                      <Text style={{ 
                        fontSize: 12, 
                        color: '#9CA3AF', 
                        textDecorationLine: 'line-through', 
                        marginLeft: 6 
                      }}>
                        {formatCurrency(item.pricing.originalPrice, item.pricing.currency || 'USD')}
                      </Text>
                    )}
                  </View>
                  {item.pricing.onSale && item.pricing.discountPercentage && (
                    <Text style={{ fontSize: 11, color: '#EF4444', fontWeight: '600' }}>
                      {item.pricing.discountPercentage}% OFF
                    </Text>
                  )}
                </View>
              )}
              {showPricing && !item.pricing && (
                <View>
                  <Text style={{ fontSize: 16, color: '#9CA3AF', fontStyle: 'italic' }}>
                    Price unavailable
                  </Text>
                </View>
              )}

              {/* Add to Cart Button */}
              {showAddToCart && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {cartQuantity > 0 && (
                    <View style={{
                      backgroundColor: '#3B82F6',
                      borderRadius: 16,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      minWidth: 24,
                      alignItems: 'center',
                    }}>
                      <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                        {cartQuantity}
                      </Text>
                    </View>
                  )}
                  
                  <TouchableOpacity
                    onPress={() => onAddToCart?.(1)}
                    disabled={!item.available}
                    style={{
                      backgroundColor: item.available ? '#3B82F6' : '#9CA3AF',
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderRadius: 20,
                      shadowColor: item.available ? '#3B82F6' : 'transparent',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 4,
                      elevation: 3,
                      minWidth: 80,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ 
                      color: 'white', 
                      fontWeight: '600', 
                      fontSize: 13,
                    }}>
                      {cartQuantity > 0 ? 'Add More' : 'Add to Cart'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Customization Option */}
            {item.customizations && item.customizations.length > 0 && (
              <TouchableOpacity
                onPress={onCustomize}
                style={{
                  marginTop: 12,
                  paddingVertical: 8,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  borderRadius: 12,
                  backgroundColor: '#F9FAFB',
                }}
              >
                <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600' }}>
                  🔧 Customize Options Available
                </Text>
              </TouchableOpacity>
            )}

            {/* Custom Actions */}
            {actions.length > 0 && (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                {actions.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    onPress={action.onPress}
                    disabled={action.disabled}
                    style={{
                      flex: 1,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      backgroundColor: action.variant === 'default' ? '#3B82F6' : '#F9FAFB',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: action.variant === 'default' ? 'white' : '#374151',
                    }}>
                      {action.icon && `${action.icon} `}{action.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

// === EXPORTS ===

export type {
  MenuCardProps,
  MenuItem,
  MenuCategory,
  DietaryTag,
  SpiceLevel,
  MenuItemPricing,
  NutritionInfo,
  CustomizationOption,
  MenuItemAction,
};
