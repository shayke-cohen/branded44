/**
 * WixRestaurantService - Service layer for restaurant operations
 * 
 * Centralizes all restaurant/food API calls and business logic
 * Provides clean interface for restaurant data management
 */

import { wixRestaurantApiClient } from '../../../../utils/wix';
import { adaptWixMenuSection, adaptWixMenuItem } from './wixRestaurantAdapter';
import type { Restaurant, MenuItem, MenuCategoryData, OrderItem } from '../components/blocks/restaurant';

export interface RestaurantOrder {
  id?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  customerInfo?: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  orderType: 'delivery' | 'pickup';
  status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
}

export interface RestaurantOperationResult {
  success: boolean;
  data?: any;
  error?: string;
}

class WixRestaurantService {
  private static instance: WixRestaurantService;

  public static getInstance(): WixRestaurantService {
    if (!WixRestaurantService.instance) {
      WixRestaurantService.instance = new WixRestaurantService();
    }
    return WixRestaurantService.instance;
  }

  /**
   * Get restaurant information
   */
  public async getRestaurant(restaurantId?: string): Promise<Restaurant> {
    try {
      console.log('🔄 [RESTAURANT SERVICE] Loading restaurant...', { restaurantId });

      // Use getCompleteMenuStructure to get restaurant data
      const menuStructure = await wixRestaurantApiClient.getCompleteMenuStructure();
      
      if (menuStructure?.menus && menuStructure.menus.length > 0) {
        // Create a restaurant object from the first menu
        const firstMenu = menuStructure.menus[0];
        const restaurant: Restaurant = {
          id: firstMenu._id || 'default-restaurant',
          name: firstMenu.name || 'Restaurant',
          description: firstMenu.description || 'Welcome to our restaurant',
          imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
          rating: 4.5,
          reviewCount: 128,
          cuisine: 'International',
          cuisines: ['International', 'Modern'], // Add cuisines array for RestaurantHeader
          priceRange: '$$',
          deliveryTime: '30-45 min',
          deliveryFee: 5.00,
          minimumOrder: 15.00,
          isOpen: true,
          address: '123 Main St, City, State',
          phone: '(555) 123-4567',
        };
        
        console.log('✅ [RESTAURANT SERVICE] Restaurant loaded successfully');
        return restaurant;
      }

      throw new Error('No restaurant data found');
    } catch (error) {
      console.error('❌ [RESTAURANT SERVICE] Error loading restaurant:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load restaurant');
    }
  }

  /**
   * Get menu categories and items
   */
  public async getMenu(restaurantId?: string): Promise<MenuCategoryData[]> {
    try {
      console.log('🔄 [RESTAURANT SERVICE] Loading menu...', { restaurantId });

      // Use getCompleteMenuStructure to get menu data
      const menuStructure = await wixRestaurantApiClient.getCompleteMenuStructure();
      
      if (menuStructure?.sections && menuStructure.items) {
        // Transform sections and items using the proper adapter
        const categories: MenuCategoryData[] = menuStructure.sections.map(section => {
          // Get items for this section
          const sectionItems = menuStructure.items
            .filter(item => section.itemIds?.includes(item._id || ''))
            .map(item => adaptWixMenuItem(item, { 
              currency: 'USD',
              timezone: 'UTC',
              locale: 'en-US'
            }));

          return {
            id: section._id || '',
            name: section.name || '',
            description: section.description || '',
            type: 'main' as const,
            icon: '🍽️',
            itemCount: sectionItems.length,
            availableItemCount: sectionItems.filter(item => item.available).length,
            availability: {
              available: true,
              availableFrom: new Date().toISOString(),
              availableUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            },
            items: sectionItems,
            sortOrder: section.sortOrder || 0,
          };
        });
        
        console.log('✅ [RESTAURANT SERVICE] Menu loaded successfully', {
          categoriesCount: categories.length
        });
        return categories;
      }

      throw new Error('No menu data found');
    } catch (error) {
      console.error('❌ [RESTAURANT SERVICE] Error loading menu:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load menu');
    }
  }

  /**
   * Get menu items by category
   */
  public async getMenuItemsByCategory(categoryId: string, restaurantId?: string): Promise<MenuItem[]> {
    try {
      console.log('🔄 [RESTAURANT SERVICE] Loading menu items for category:', categoryId);

      // Get the complete menu structure and filter by category
      const menuStructure = await wixRestaurantApiClient.getCompleteMenuStructure();
      
      if (menuStructure?.sections && menuStructure.items) {
        // Find the section with the given categoryId
        const section = menuStructure.sections.find(s => s._id === categoryId);
        
        if (section && section.itemIds) {
          // Get items for this section using the proper adapter
          const items = menuStructure.items
            .filter(item => section.itemIds?.includes(item._id || ''))
            .map(item => adaptWixMenuItem(item, { 
              currency: 'USD',
              timezone: 'UTC',
              locale: 'en-US'
            }));

          console.log('✅ [RESTAURANT SERVICE] Menu items loaded successfully', {
            itemsCount: items.length
          });
          return items;
        }
      }

      return [];
    } catch (error) {
      console.error('❌ [RESTAURANT SERVICE] Error loading menu items:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to load menu items');
    }
  }

  /**
   * Search menu items
   */
  public async searchMenuItems(query: string, restaurantId?: string): Promise<MenuItem[]> {
    try {
      console.log('🔄 [RESTAURANT SERVICE] Searching menu items:', query);

      // Get the complete menu structure and search through items
      const menuStructure = await wixRestaurantApiClient.getCompleteMenuStructure();
      
      if (menuStructure?.items && menuStructure.sections) {
        const searchTerm = query.toLowerCase();
        
        // Search through all items
        const matchingItems = menuStructure.items
          .filter(item => {
            const name = (item.name || '').toLowerCase();
            const description = (item.description || '').toLowerCase();
            return name.includes(searchTerm) || description.includes(searchTerm);
          })
          .map(item => adaptWixMenuItem(item, { 
            currency: 'USD',
            timezone: 'UTC',
            locale: 'en-US'
          }));

        console.log('✅ [RESTAURANT SERVICE] Search completed', {
          resultsCount: matchingItems.length
        });
        return matchingItems;
      }

      return [];
    } catch (error) {
      console.error('❌ [RESTAURANT SERVICE] Error searching menu items:', error);
      throw new Error(error instanceof Error ? error.message : 'Search failed');
    }
  }

  /**
   * Calculate order totals
   */
  public calculateOrderTotals(items: OrderItem[], deliveryFee: number = 0, taxRate: number = 0.1): {
    subtotal: number;
    tax: number;
    total: number;
  } {
    const subtotal = items.reduce((sum, item) => {
      const itemPrice = typeof item.price === 'string' 
        ? parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0
        : item.price || 0;
      return sum + (itemPrice * item.quantity);
    }, 0);

    const tax = subtotal * taxRate;
    const total = subtotal + tax + deliveryFee;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  /**
   * Submit order
   */
  public async submitOrder(order: RestaurantOrder): Promise<RestaurantOperationResult> {
    try {
      console.log('🔄 [RESTAURANT SERVICE] Submitting order...', {
        itemsCount: order.items.length,
        total: order.total,
        orderType: order.orderType
      });

      const response = await wixRestaurantApiClient.createOrder({
        items: order.items,
        customerInfo: order.customerInfo,
        orderType: order.orderType,
        totals: {
          subtotal: order.subtotal,
          tax: order.tax,
          deliveryFee: order.deliveryFee,
          total: order.total,
        }
      });

      if (response?.success) {
        console.log('✅ [RESTAURANT SERVICE] Order submitted successfully', {
          orderId: response.orderId
        });
        
        return {
          success: true,
          data: { orderId: response.orderId }
        };
      }

      throw new Error('Failed to submit order');
    } catch (error) {
      console.error('❌ [RESTAURANT SERVICE] Error submitting order:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit order'
      };
    }
  }

  /**
   * Get popular items
   */
  public async getPopularItems(restaurantId?: string, limit: number = 6): Promise<MenuItem[]> {
    try {
      console.log('🔄 [RESTAURANT SERVICE] Loading popular items...', { limit });

      // Get the complete menu structure and return first few items as "popular"
      const menuStructure = await wixRestaurantApiClient.getCompleteMenuStructure();
      
      if (menuStructure?.items && menuStructure.sections) {
        // Take the first few items as popular items
        const popularItems = menuStructure.items
          .slice(0, limit)
          .map(item => adaptWixMenuItem(item, { 
            currency: 'USD',
            timezone: 'UTC',
            locale: 'en-US'
          }));

        console.log('✅ [RESTAURANT SERVICE] Popular items loaded', {
          itemsCount: popularItems.length
        });
        return popularItems;
      }

      return [];
    } catch (error) {
      console.error('❌ [RESTAURANT SERVICE] Error loading popular items:', error);
      return [];
    }
  }

  /**
   * Get featured items
   */
  public async getFeaturedItems(restaurantId?: string, limit: number = 4): Promise<MenuItem[]> {
    try {
      console.log('🔄 [RESTAURANT SERVICE] Loading featured items...', { limit });

      // Get the complete menu structure and return some items as "featured"
      const menuStructure = await wixRestaurantApiClient.getCompleteMenuStructure();
      
      if (menuStructure?.items && menuStructure.sections) {
        // Take items from the middle as featured items
        const startIndex = Math.floor(menuStructure.items.length / 3);
        const featuredItems = menuStructure.items
          .slice(startIndex, startIndex + limit)
          .map(item => adaptWixMenuItem(item, { 
            currency: 'USD',
            timezone: 'UTC',
            locale: 'en-US'
          }));

        console.log('✅ [RESTAURANT SERVICE] Featured items loaded', {
          itemsCount: featuredItems.length
        });
        return featuredItems;
      }

      return [];
    } catch (error) {
      console.error('❌ [RESTAURANT SERVICE] Error loading featured items:', error);
      return [];
    }
  }

  /**
   * Check if restaurant is open
   */
  public isRestaurantOpen(restaurant: Restaurant): boolean {
    // This would typically check business hours
    // For now, return true as a default
    return true;
  }

  /**
   * Get estimated delivery time
   */
  public getEstimatedDeliveryTime(restaurant: Restaurant, orderType: 'delivery' | 'pickup'): string {
    // This would typically calculate based on location, current orders, etc.
    if (orderType === 'pickup') {
      return '15-25 min';
    }
    return '30-45 min';
  }

  /**
   * Validate order before submission
   */
  public validateOrder(order: RestaurantOrder): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!order.items || order.items.length === 0) {
      errors.push('Order must contain at least one item');
    }

    if (order.total <= 0) {
      errors.push('Order total must be greater than zero');
    }

    if (!order.customerInfo?.name?.trim()) {
      errors.push('Customer name is required');
    }

    if (!order.customerInfo?.phone?.trim()) {
      errors.push('Phone number is required');
    }

    if (order.orderType === 'delivery' && !order.customerInfo?.address?.trim()) {
      errors.push('Delivery address is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format price for display
   */
  public formatPrice(price: number | string, currency: string = 'USD'): string {
    const numericPrice = typeof price === 'string' 
      ? parseFloat(price.replace(/[^0-9.]/g, '')) || 0
      : price || 0;

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(numericPrice);
  }
}

// Export singleton instance
export const restaurantService = WixRestaurantService.getInstance();
