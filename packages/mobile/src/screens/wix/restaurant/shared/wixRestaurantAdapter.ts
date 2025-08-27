/**
 * Wix Restaurant Data Adapter - Generic Interface Bridge
 * 
 * This adapter transforms Wix Restaurant API data into our generic restaurant interfaces,
 * allowing our components to remain platform-agnostic while supporting Wix integration.
 * 
 * @category Wix Adapters
 * @author AI Component System
 * @version 1.0.0
 */

import type {
  RestaurantMenu as WixMenu,
  MenuSection as WixMenuSection,
  MenuItem as WixMenuItem,
  ItemVariant as WixItemVariant,
  ItemLabel as WixItemLabel,
} from './wixRestaurantSdkClient';

// Helper functions for adapter
function formatRestaurantPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
}

function safeRestaurantString(value: string | undefined | null, fallback: string = ''): string {
  return value && typeof value === 'string' ? value.trim() : fallback;
}

function extractCurrency(items: WixMenuItem[]): string {
  for (const item of items) {
    if (item.priceInfo?.currency) {
      return item.priceInfo.currency;
    }
  }
  return 'USD'; // fallback
}

// Import our generic restaurant interfaces
import type {
  Restaurant,
  MenuItem,
  MenuCategoryData,
  OrderItem,
  OrderSummaryData,
  RestaurantHeaderData,
  CuisineType,
  DietaryTag,
  PriceRange,
} from '../../components/blocks/restaurant';

/**
 * Adapter context containing lookup data
 */
export interface WixRestaurantAdapterContext {
  menus: WixMenu[];
  sections: WixMenuSection[];
  items: WixMenuItem[];
  variants: WixItemVariant[];
  labels: WixItemLabel[];
}

// === RESTAURANT ADAPTERS ===

/**
 * Adapt Wix restaurant data to generic Restaurant interface
 * Since Wix doesn't have a direct restaurant entity, we create one from menu context
 */
export function adaptWixRestaurant(
  menuData: WixMenu,
  context: WixRestaurantAdapterContext
): Restaurant {
  // Extract basic info from menu
  const restaurantId = menuData._id || menuData.id || 'unknown';
  const restaurantName = safeRestaurantString(menuData.name, 'Restaurant');
  
  // Calculate stats from menu items
  const menuItems = context.items || [];
  const avgPrice = calculateAveragePrice(menuItems);
  const totalItems = menuItems.length;
  
  // Generate mock data that would typically come from restaurant entity
  const restaurant: Restaurant = {
    id: restaurantId,
    name: restaurantName,
    description: safeRestaurantString(menuData.description, 'Delicious food and great service'),
    images: generateMockRestaurantImages(),
    logo: generateMockRestaurantLogo(),
    cuisines: inferCuisinesFromMenu(context),
    priceRange: determinePriceRange(avgPrice),
    rating: 4.5, // Mock rating
    reviewCount: Math.floor(totalItems * 12), // Mock review count based on items
    location: {
      address: '123 Main Street', // Mock address
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      coordinates: { latitude: 40.7128, longitude: -74.0060 },
      distance: 0.5,
    },
    delivery: {
      available: true,
      estimatedTime: 25 + Math.floor(totalItems / 10), // Dynamic based on menu size
      fee: 2.99,
      minimumOrder: 15.00,
      radius: 5.0,
    },
    pickup: {
      available: true,
      estimatedTime: 15,
    },
    isOpen: true,
    serviceTypes: ['delivery', 'pickup', 'dine-in'],
  };

  return restaurant;
}

/**
 * Adapt Wix restaurant data to RestaurantHeaderData
 */
export function adaptWixRestaurantHeader(
  menuData: WixMenu,
  context: WixRestaurantAdapterContext
): RestaurantHeaderData {
  const restaurant = adaptWixRestaurant(menuData, context);
  
  return {
    id: restaurant.id,
    name: restaurant.name,
    description: restaurant.description,
    bannerImage: restaurant.images[0] || '',
    logo: restaurant.logo,
    cuisines: restaurant.cuisines,
    priceRange: restaurant.priceRange,
    rating: restaurant.rating,
    reviewCount: restaurant.reviewCount,
    address: `${restaurant.location.address}, ${restaurant.location.city}`,
    distance: restaurant.location.distance,
    isOpen: restaurant.isOpen,
    deliveryTime: restaurant.delivery.estimatedTime,
    deliveryFee: restaurant.delivery.fee,
    minimumOrder: restaurant.delivery.minimumOrder,
  };
}

// === MENU ADAPTERS ===

/**
 * Adapt Wix menu section to generic MenuCategoryData
 */
export function adaptWixMenuSection(
  section: WixMenuSection,
  context: WixRestaurantAdapterContext
): MenuCategoryData & { items: MenuItem[] } {
  const sectionItems = (section.itemIds || [])
    .map(itemId => context.items.find(item => item._id === itemId || item.id === itemId))
    .filter((item): item is WixMenuItem => item != null);

  const prices = sectionItems
    .map(item => extractItemPrice(item))
    .filter(price => price > 0);

  const priceRange = prices.length > 0
    ? { min: Math.min(...prices), max: Math.max(...prices), currency: 'USD' }
    : { min: 0, max: 0, currency: 'USD' };

  return {
    id: section._id || section.id || 'unknown',
    name: safeRestaurantString(section.name, 'Category'),
    type: inferCategoryType(section.name),
    description: safeRestaurantString(section.description),
    itemCount: sectionItems.length,
    priceRange,
    availability: {
      available: section.visible !== false,
      dailySpecial: false, // Could be enhanced based on Wix data
    },
    items: sectionItems.map(item => adaptWixMenuItem(item, context)),
  };
}

/**
 * Adapt Wix menu item to generic MenuItem
 */
export function adaptWixMenuItem(
  item: WixMenuItem,
  context: WixRestaurantAdapterContext
): MenuItem {
  const basePrice = extractItemPrice(item);
  const currency = extractItemCurrency(item);
  
  return {
    id: item._id || item.id || 'unknown',
    name: safeRestaurantString(item.name, 'Menu Item'),
    description: safeRestaurantString(item.description),
    category: 'main' as const, // Could be enhanced based on section data
    pricing: {
      basePrice,
      currency,
    },
    images: (() => {
      // Enhanced image processing to handle multiple formats from Wix API
      console.log(`🔍 [RESTAURANT ADAPTER] Processing image for "${item.name}":`, {
        imageType: typeof item.image,
        imageValue: item.image,
        hasImageUrl: !!(item.image && item.image.url),
        hasAdditionalImages: !!(item.additionalImages && item.additionalImages.length > 0)
      });
      
      // Handle object format with url property (most common in Wix API)
      if (item.image && typeof item.image === 'object' && item.image.url) {
        try {
          let imageUrl = item.image.url;
          
          // Convert wix:image:// URLs to https URLs if needed
          if (imageUrl.startsWith('wix:image://')) {
            imageUrl = imageUrl
              .replace('wix:image://v1/', 'https://static.wixstatic.com/media/')
              .split('#')[0];
          }
          
          console.log(`✅ [RESTAURANT ADAPTER] Converted object image URL for "${item.name}": ${imageUrl}`);
          return [imageUrl];
        } catch (error) {
          console.warn(`⚠️ [RESTAURANT ADAPTER] Failed to process object image for "${item.name}":`, error);
        }
      }
      
      // Handle string format (wix:image:// URLs)
      if (item.image && typeof item.image === 'string' && item.image.startsWith('wix:image://')) {
        try {
          // Try different URL conversion formats for Wix media
          // Format 1: Standard Wix static URL
          const staticUrl = item.image
            .replace('wix:image://v1/', 'https://static.wixstatic.com/media/')
            .split('#')[0];
            
          // Format 2: Wix images CDN format  
          const wixImagesUrl = item.image
            .replace('wix:image://v1/', 'https://wixmp-')
            .replace('~', '.wixmp.')
            .split('#')[0] + '.jpg';
            
          // Format 3: Direct media format
          const mediaId = item.image.replace('wix:image://v1/', '').split('~')[0];
          const directUrl = `https://static.wixstatic.com/media/${mediaId}.jpg`;
          
          console.log(`✅ [RESTAURANT ADAPTER] Item "${item.name}" image URL attempts:`, {
            wixUrl: item.image,
            staticUrl: staticUrl,
            wixImagesUrl: wixImagesUrl, 
            directUrl: directUrl
          });
          
          // Return the static URL format first
          return [staticUrl];
        } catch (error) {
          console.error(`❌ [RESTAURANT ADAPTER] Error converting image URL for "${item.name}":`, error);
          return [];
        }
      }
      
      // Check for additional images array
      if (item.additionalImages && item.additionalImages.length > 0) {
        const imageUrls = item.additionalImages
          .map(img => {
            if (typeof img === 'string' && img.startsWith('wix:image://')) {
              return img.replace('wix:image://v1/', 'https://static.wixstatic.com/media/').split('#')[0];
            }
            return img?.url;
          })
          .filter(Boolean);
        if (imageUrls.length > 0) {
          console.log(`✅ [RESTAURANT ADAPTER] Item "${item.name}" has ${imageUrls.length} additional images`);
          return imageUrls;
        }
      }
      
              console.log(`⚠️ [RESTAURANT ADAPTER] Item "${item.name}" has no Wix images`, {
          hasImage: !!item.image,
          imageType: typeof item.image,
          hasAdditionalImages: !!(item.additionalImages && item.additionalImages.length > 0)
        });
        return [];
    })(),
    dietaryTags: adaptWixLabelsToTags(item.labels || [], context),
    spiceLevel: inferSpiceLevel(item.name),
    available: item.visible !== false,
    prepTime: 10 + Math.floor(Math.random() * 20), // Mock prep time
    rating: 4.0 + Math.random(), // Mock rating
    reviewCount: Math.floor(Math.random() * 50) + 5,
    customizations: adaptWixVariantsToCustomizations(item.priceVariants?.variants || [], context),
  };
}

/**
 * Adapt Wix price variants to customization options
 */
export function adaptWixVariantsToCustomizations(
  variants: Array<{ variantId?: string; priceInfo?: { price?: string; currency?: string } }>,
  context: WixRestaurantAdapterContext
): Array<{
  id: string;
  name: string;
  required: boolean;
  maxChoices: number;
  choices: Array<{
    id: string;
    name: string;
    additionalPrice: number;
  }>;
}> {
  if (variants.length === 0) return [];

  // Group variants into customization options
  const customizations: Array<{
    id: string;
    name: string;
    required: boolean;
    maxChoices: number;
    choices: Array<{
      id: string;
      name: string;
      additionalPrice: number;
    }>;
  }> = [];

  variants.forEach((variantRef, index) => {
    const variant = context.variants?.find(v => 
      v.id === variantRef.variantId
    );

    if (variant) {
      const additionalPrice = variantRef.priceInfo?.price 
        ? parseFloat(variantRef.priceInfo.price) 
        : 0;

      customizations.push({
        id: `variant_${index}`,
        name: safeRestaurantString(variant.name, 'Option'),
        required: false,
        maxChoices: 1,
        choices: [
          {
            id: variant.id || `choice_${index}`,
            name: safeRestaurantString(variant.name, 'Choice'),
            additionalPrice,
          },
        ],
      });
    }
  });

  return customizations;
}

/**
 * Adapt Wix labels to dietary tags
 */
export function adaptWixLabelsToTags(
  itemLabels: Array<{ id?: string; labelId?: string }>,
  context: WixRestaurantAdapterContext
): DietaryTag[] {
  const tags: DietaryTag[] = [];

  itemLabels.forEach(labelRef => {
    const label = context.labels?.find(l => 
      l.id === labelRef.id || 
      l.id === labelRef.labelId
    );

    if (label && label.name) {
      const tag = mapLabelNameToTag(label.name);
      if (tag && !tags.includes(tag)) {
        tags.push(tag);
      }
    }
  });

  return tags;
}

// === ORDER ADAPTERS ===

/**
 * Adapt Wix menu item to OrderItem (for cart functionality)
 */
export function adaptWixItemToOrderItem(
  item: WixMenuItem,
  quantity: number,
  customizations: Array<{
    optionId: string;
    choiceId: string;
    additionalPrice: number;
  }> = []
): OrderItem {
  const basePrice = extractItemPrice(item);
  const customizationTotal = customizations.reduce((sum, c) => sum + c.additionalPrice, 0);
  const itemSubtotal = basePrice + customizationTotal;
  const lineTotal = itemSubtotal * quantity;

  return {
    id: `order_${item._id || item.id}_${Date.now()}`,
    menuItemId: item._id || item.id || 'unknown',
    name: safeRestaurantString(item.name, 'Menu Item'),
    description: safeRestaurantString(item.description),
    quantity,
    customizations: customizations.map(c => ({
      optionId: c.optionId,
      optionName: c.optionId, // Could be enhanced with actual option names
      choiceId: c.choiceId,
      choiceName: c.choiceId, // Could be enhanced with actual choice names
      additionalPrice: c.additionalPrice,
    })),
    pricing: {
      basePrice,
      customizationTotal,
      itemSubtotal,
      lineTotal,
      currency: extractItemCurrency(item),
    },
    available: item.visible !== false,
  };
}

// === UTILITY FUNCTIONS ===

/**
 * Extract price from Wix menu item
 */
function extractItemPrice(item: WixMenuItem): number {
  if (item.priceInfo?.price) {
    return parseFloat(item.priceInfo.price) || 0;
  }
  
  // If no direct price, try to get from variants
  const variants = item.priceVariants?.variants || [];
  if (variants.length > 0 && variants[0].priceInfo?.price) {
    return parseFloat(variants[0].priceInfo.price) || 0;
  }
  
  return 0;
}

/**
 * Extract currency from Wix menu item
 */
function extractItemCurrency(item: WixMenuItem): string {
  return item.priceInfo?.currency || 
         item.priceVariants?.variants?.[0]?.priceInfo?.currency || 
         'USD';
}

/**
 * Calculate average price from menu items
 */
function calculateAveragePrice(items: WixMenuItem[]): number {
  const prices = items.map(extractItemPrice).filter(price => price > 0);
  if (prices.length === 0) return 0;
  return prices.reduce((sum, price) => sum + price, 0) / prices.length;
}

/**
 * Determine price range based on average price
 */
function determinePriceRange(avgPrice: number): PriceRange {
  if (avgPrice < 15) return '$';
  if (avgPrice < 30) return '$$';
  if (avgPrice < 50) return '$$$';
  return '$$$$';
}

/**
 * Infer cuisines from menu context
 */
function inferCuisinesFromMenu(context: WixRestaurantAdapterContext): CuisineType[] {
  // Analyze menu names and item names to infer cuisine types
  const allText = [
    ...context.menus.map(m => m.name || ''),
    ...context.sections.map(s => s.name || ''),
    ...context.items.map(i => i.name || ''),
  ].join(' ').toLowerCase();

  const cuisines: CuisineType[] = [];
  
  // Cuisine detection patterns
  const cuisinePatterns: Record<string, CuisineType> = {
    'pizza|italian|pasta|marinara': 'italian',
    'burger|fries|american|bbq': 'american',
    'sushi|ramen|japanese|miso': 'japanese',
    'taco|burrito|mexican|salsa': 'mexican',
    'curry|indian|tandoori|naan': 'indian',
    'pad thai|thai|coconut': 'thai',
    'pho|vietnamese|banh': 'vietnamese',
    'dim sum|chinese|wok': 'chinese',
    'mediterranean|greek|hummus': 'mediterranean',
  };

  Object.entries(cuisinePatterns).forEach(([pattern, cuisine]) => {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(allText) && !cuisines.includes(cuisine)) {
      cuisines.push(cuisine);
    }
  });

  // Default to american if no cuisine detected
  return cuisines.length > 0 ? cuisines : ['american'];
}

/**
 * Infer category type from section name
 */
function inferCategoryType(sectionName?: string): 'appetizers' | 'main' | 'desserts' | 'beverages' | 'other' {
  if (!sectionName) return 'other';
  
  const name = sectionName.toLowerCase();
  
  if (name.includes('appetizer') || name.includes('starter') || name.includes('app')) {
    return 'appetizers';
  }
  if (name.includes('dessert') || name.includes('sweet') || name.includes('cake')) {
    return 'desserts';
  }
  if (name.includes('drink') || name.includes('beverage') || name.includes('coffee') || name.includes('juice')) {
    return 'beverages';
  }
  if (name.includes('main') || name.includes('entree') || name.includes('pizza') || name.includes('burger')) {
    return 'main';
  }
  
  return 'other';
}

/**
 * Infer spice level from item name
 */
function inferSpiceLevel(itemName?: string): 'mild' | 'medium' | 'hot' | 'very-hot' | undefined {
  if (!itemName) return undefined;
  
  const name = itemName.toLowerCase();
  
  if (name.includes('very hot') || name.includes('extra spicy') || name.includes('fire')) {
    return 'very-hot';
  }
  if (name.includes('hot') || name.includes('spicy')) {
    return 'hot';
  }
  if (name.includes('medium spice') || name.includes('mild spice')) {
    return 'medium';
  }
  if (name.includes('mild')) {
    return 'mild';
  }
  
  return undefined;
}

/**
 * Map Wix label name to dietary tag
 */
function mapLabelNameToTag(labelName: string): DietaryTag | null {
  const name = labelName.toLowerCase();
  
  const tagMap: Record<string, DietaryTag> = {
    'vegetarian': 'vegetarian',
    'vegan': 'vegan',
    'gluten-free': 'gluten-free',
    'gluten free': 'gluten-free',
    'dairy-free': 'dairy-free',
    'dairy free': 'dairy-free',
    'keto': 'keto',
    'ketogenic': 'keto',
    'low-carb': 'keto',
    'spicy': 'spicy',
    'hot': 'spicy',
    'organic': 'organic',
    'fresh': 'organic',
    'nut-free': 'nut-free',
    'nut free': 'nut-free',
  };

  return tagMap[name] || null;
}

/**
 * Generate mock restaurant images
 */
function generateMockRestaurantImages(): string[] {
  return [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=600&h=400&fit=crop',
  ];
}

/**
 * Generate mock restaurant logo
 */
function generateMockRestaurantLogo(): string {
  return 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=100&h=100&fit=crop';
}

// === EXPORTS ===

export {
  formatRestaurantPrice,
  safeRestaurantString,
  extractCurrency,
} from './wixRestaurantApiClient';

console.log('🔄 [RESTAURANT ADAPTER] Wix Restaurant Adapter module loaded');
