/**
 * MenuCategoryHeader Component - AI-Optimized React Native Component
 * 
 * A comprehensive menu category header for organizing menu sections.
 * Perfect for displaying category names, descriptions, icons, and item counts.
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
 * Menu category types
 */
export type MenuCategoryType = 
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
  | 'kids'
  | 'healthy'
  | 'vegan'
  | 'gluten-free'
  | 'chef-special'
  | 'seasonal'
  | 'other';

/**
 * Category availability info
 */
export interface CategoryAvailability {
  /** Whether category is available */
  available: boolean;
  /** Availability start time */
  availableFrom?: string;
  /** Availability end time */
  availableUntil?: string;
  /** Days when available */
  availableDays?: string[];
  /** Reason if not available */
  unavailableReason?: string;
}

/**
 * Menu category data structure
 */
export interface MenuCategoryData {
  /** Category unique identifier */
  id: string;
  /** Category name */
  name: string;
  /** Category description */
  description?: string;
  /** Category type */
  type: MenuCategoryType;
  /** Category icon/emoji */
  icon?: string;
  /** Category image */
  image?: string;
  /** Number of items in category */
  itemCount: number;
  /** Number of available items */
  availableItemCount?: number;
  /** Category availability */
  availability: CategoryAvailability;
  /** Whether category is featured */
  featured?: boolean;
  /** Whether category is popular */
  popular?: boolean;
  /** Whether category is new */
  isNew?: boolean;
  /** Special badges */
  badges?: string[];
  /** Price range for items in category */
  priceRange?: {
    min: number;
    max: number;
    currency: string;
  };
  /** Average preparation time for items */
  avgPrepTime?: number;
  /** Special dietary tags */
  dietaryTags?: string[];
  /** Order/display index */
  sortOrder?: number;
}

/**
 * Action button configuration
 */
export interface CategoryHeaderAction {
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
  /** Whether action is disabled */
  disabled?: boolean;
}

/**
 * MenuCategoryHeader component props
 */
export interface MenuCategoryHeaderProps {
  /** Category data to display */
  category: MenuCategoryData;
  /** Header press handler */
  onPress?: () => void;
  /** Filter by category handler */
  onFilter?: () => void;
  /** View all items handler */
  onViewAll?: () => void;
  /** Toggle category collapse */
  onToggleCollapse?: () => void;
  /** Custom action buttons */
  actions?: CategoryHeaderAction[];
  /** Layout variant */
  layout?: 'standard' | 'compact' | 'card' | 'minimal';
  /** Whether category is currently selected/active */
  isActive?: boolean;
  /** Whether category is collapsed */
  isCollapsed?: boolean;
  /** Whether to show item count */
  showItemCount?: boolean;
  /** Whether to show availability info */
  showAvailability?: boolean;
  /** Whether to show price range */
  showPriceRange?: boolean;
  /** Whether to show dietary tags */
  showDietaryTags?: boolean;
  /** Whether category is collapsible */
  collapsible?: boolean;
  /** Custom card width */
  width?: number;
  /** Custom test ID */
  testID?: string;
}

// === UTILITY FUNCTIONS ===

/**
 * Get category icon based on type
 */
const getCategoryIcon = (type: MenuCategoryType): string => {
  const iconMap: Record<MenuCategoryType, string> = {
    appetizers: '🥗',
    soups: '🍲',
    salads: '🥬',
    mains: '🍽️',
    desserts: '🍰',
    beverages: '🥤',
    sides: '🍟',
    specials: '⭐',
    breakfast: '🍳',
    lunch: '🥪',
    dinner: '🍖',
    kids: '👶',
    healthy: '🥗',
    vegan: '🌱',
    'gluten-free': '🌾',
    'chef-special': '👨‍🍳',
    seasonal: '🍂',
    other: '🍴',
  };
  return iconMap[type] || '🍴';
};

/**
 * Get category color scheme
 */
const getCategoryColors = (type: MenuCategoryType): { bg: string; text: string; border: string } => {
  const colorMap: Record<MenuCategoryType, { bg: string; text: string; border: string }> = {
    appetizers: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
    soups: { bg: '#FEF3C7', text: '#D97706', border: '#FCD34D' },
    salads: { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
    mains: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
    desserts: { bg: '#FDF2F8', text: '#EC4899', border: '#FBCFE8' },
    beverages: { bg: '#F0F9FF', text: '#0284C7', border: '#BAE6FD' },
    sides: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
    specials: { bg: '#FDF4FF', text: '#C026D3', border: '#F3E8FF' },
    breakfast: { bg: '#FEF3C7', text: '#D97706', border: '#FCD34D' },
    lunch: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
    dinner: { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' },
    kids: { bg: '#FEF2F2', text: '#EF4444', border: '#FECACA' },
    healthy: { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
    vegan: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
    'gluten-free': { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
    'chef-special': { bg: '#FDF4FF', text: '#A21CAF', border: '#F3E8FF' },
    seasonal: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
    other: { bg: '#F9FAFB', text: '#6B7280', border: '#E5E7EB' },
  };
  return colorMap[type] || colorMap.other;
};

/**
 * Format currency display
 */
const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(amount);
};

// === COMPONENT ===

/**
 * MenuCategoryHeader - Display menu category section header
 * 
 * @example
 * ```tsx
 * const categoryData = {
 *   id: 'cat_appetizers',
 *   name: 'Appetizers',
 *   description: 'Perfect starters to begin your meal',
 *   type: 'appetizers',
 *   icon: '🥗',
 *   itemCount: 12,
 *   availableItemCount: 10,
 *   availability: {
 *     available: true
 *   },
 *   priceRange: {
 *     min: 8.99,
 *     max: 16.99,
 *     currency: 'USD'
 *   },
 *   popular: true
 * };
 * 
 * <MenuCategoryHeader
 *   category={categoryData}
 *   onPress={() => scrollToCategory(categoryData.id)}
 *   onViewAll={() => filterByCategory(categoryData.id)}
 *   showItemCount={true}
 *   showPriceRange={true}
 *   collapsible={true}
 * />
 * ```
 */
export default function MenuCategoryHeader({
  category,
  onPress,
  onFilter,
  onViewAll,
  onToggleCollapse,
  actions = [],
  layout = 'standard',
  isActive = false,
  isCollapsed = false,
  showItemCount = true,
  showAvailability = true,
  showPriceRange = false,
  showDietaryTags = false,
  collapsible = false,
  width,
  testID = 'menu-category-header',
}: MenuCategoryHeaderProps) {

  const colors = getCategoryColors(category.type);
  const icon = category.icon || getCategoryIcon(category.type);
  const isCompact = layout === 'compact';
  const isMinimal = layout === 'minimal';
  const isCard = layout === 'card';

  if (isMinimal) {
    return (
      <TouchableOpacity onPress={onPress} testID={testID} activeOpacity={0.7}>
        <View style={{
          width,
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: isActive ? colors.bg : 'transparent',
          borderLeftWidth: isActive ? 4 : 0,
          borderLeftColor: colors.text,
        }}>
          <Text style={{ fontSize: 20, marginRight: 12 }}>{icon}</Text>
          <Text style={{
            fontSize: 16,
            fontWeight: isActive ? '600' : '500',
            color: isActive ? colors.text : '#374151',
            flex: 1,
          }}>
            {category.name}
          </Text>
          {showItemCount && (
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              {category.availableItemCount || category.itemCount}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  const containerStyle = isCard ? {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 8,
  } : {};

  return (
    <TouchableOpacity onPress={onPress} testID={testID} activeOpacity={0.95}>
      <View style={{ width, ...containerStyle }}>
        <View style={{
          paddingVertical: isCompact ? 12 : 16,
          paddingHorizontal: isCard ? 16 : 0,
          backgroundColor: isActive ? colors.bg : isCard ? '#ffffff' : 'transparent',
          borderRadius: isCard ? 12 : 0,
          borderWidth: isActive && !isCard ? 1 : 0,
          borderColor: colors.border,
        }}>
          
          {/* Main Header Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            
            {/* Left Side - Icon, Name, Count */}
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              
              {/* Category Icon */}
              {category.image ? (
                <View style={{
                  width: isCompact ? 32 : 40,
                  height: isCompact ? 32 : 40,
                  borderRadius: 8,
                  marginRight: 12,
                  overflow: 'hidden',
                  backgroundColor: colors.bg,
                }}>
                  <Image
                    source={{ uri: category.image }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>
              ) : (
                <View style={{
                  width: isCompact ? 32 : 40,
                  height: isCompact ? 32 : 40,
                  borderRadius: 8,
                  backgroundColor: colors.bg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}>
                  <Text style={{ fontSize: isCompact ? 16 : 20 }}>{icon}</Text>
                </View>
              )}
              
              {/* Category Info */}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <Text style={{
                    fontSize: isCompact ? 16 : 18,
                    fontWeight: '600',
                    color: isActive ? colors.text : '#111827',
                    marginRight: 8,
                  }}>
                    {category.name}
                  </Text>
                  
                  {/* Badges */}
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    {category.featured && (
                      <View style={{
                        backgroundColor: '#FFD700',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 8,
                      }}>
                        <Text style={{ fontSize: 10, fontWeight: '600', color: '#8B4513' }}>
                          Featured
                        </Text>
                      </View>
                    )}
                    
                    {category.popular && (
                      <View style={{
                        backgroundColor: '#EF4444',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 8,
                      }}>
                        <Text style={{ fontSize: 10, fontWeight: '600', color: 'white' }}>
                          Popular
                        </Text>
                      </View>
                    )}
                    
                    {category.isNew && (
                      <View style={{
                        backgroundColor: '#10B981',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 8,
                      }}>
                        <Text style={{ fontSize: 10, fontWeight: '600', color: 'white' }}>
                          New
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                
                {/* Description */}
                {!isCompact && category.description && (
                  <Text style={{
                    fontSize: 12,
                    color: '#6B7280',
                    lineHeight: 16,
                    marginBottom: 4,
                  }}>
                    {category.description}
                  </Text>
                )}
                
                {/* Meta Info Row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  
                  {/* Item Count */}
                  {showItemCount && (
                    <Text style={{ fontSize: 11, color: '#6B7280' }}>
                      {category.availableItemCount && category.availableItemCount !== category.itemCount
                        ? `${category.availableItemCount}/${category.itemCount} available`
                        : `${category.itemCount} items`
                      }
                    </Text>
                  )}
                  
                  {/* Price Range */}
                  {showPriceRange && category.priceRange && (
                    <Text style={{ fontSize: 11, color: '#6B7280' }}>
                      {formatCurrency(category.priceRange.min, category.priceRange.currency)} - 
                      {formatCurrency(category.priceRange.max, category.priceRange.currency)}
                    </Text>
                  )}
                  
                  {/* Prep Time */}
                  {category.avgPrepTime && (
                    <Text style={{ fontSize: 11, color: '#6B7280' }}>
                      ~{category.avgPrepTime} min
                    </Text>
                  )}
                </View>
              </View>
            </View>
            
            {/* Right Side - Actions */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              
              {/* Availability Status */}
              {showAvailability && !category.availability.available && (
                <View style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  backgroundColor: '#FEE2E2',
                  borderWidth: 1,
                  borderColor: '#FCA5A5',
                }}>
                  <Text style={{ fontSize: 10, color: '#DC2626', fontWeight: '600' }}>
                    Unavailable
                  </Text>
                </View>
              )}
              
              {/* View All Button */}
              {onViewAll && (
                <TouchableOpacity
                  onPress={onViewAll}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.bg,
                  }}
                >
                  <Text style={{ fontSize: 11, color: colors.text, fontWeight: '600' }}>
                    View All
                  </Text>
                </TouchableOpacity>
              )}
              
              {/* Collapse Toggle */}
              {collapsible && onToggleCollapse && (
                <TouchableOpacity
                  onPress={onToggleCollapse}
                  style={{
                    width: 24,
                    height: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 14, color: '#6B7280' }}>
                    {isCollapsed ? '▼' : '▲'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {/* Dietary Tags */}
          {showDietaryTags && category.dietaryTags && category.dietaryTags.length > 0 && (
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap',
              gap: 4,
              marginTop: 8,
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: '#F3F4F6',
            }}>
              {category.dietaryTags.map((tag, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: '#F3F4F6',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ fontSize: 10, color: '#6B7280', fontWeight: '500' }}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Custom Actions */}
          {actions.length > 0 && (
            <View style={{ 
              flexDirection: 'row', 
              gap: 8, 
              marginTop: 12,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: '#F3F4F6',
            }}>
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
                    opacity: action.disabled ? 0.6 : 1,
                  }}
                >
                  <Text style={{
                    fontSize: 11,
                    fontWeight: '600',
                    color: action.variant === 'default' ? 'white' : '#374151',
                  }}>
                    {action.icon && `${action.icon} `}{action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          {/* Unavailable Reason */}
          {!category.availability.available && category.availability.unavailableReason && (
            <View style={{
              marginTop: 8,
              paddingTop: 8,
              borderTopWidth: 1,
              borderTopColor: '#F3F4F6',
            }}>
              <Text style={{ fontSize: 11, color: '#EF4444', fontStyle: 'italic' }}>
                {category.availability.unavailableReason}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// === EXPORTS ===

export type {
  MenuCategoryHeaderProps,
  MenuCategoryData,
  MenuCategoryType,
  CategoryAvailability,
  CategoryHeaderAction,
};
