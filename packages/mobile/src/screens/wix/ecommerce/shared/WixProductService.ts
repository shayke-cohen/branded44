/**
 * WixProductService - Service layer for product-related operations
 * 
 * Centralizes all product API calls, data transformations, and business logic
 * Keeps screens thin and focused on presentation
 */

import { Platform } from 'react-native';
import { wixApiClient, type WixProduct } from '../../../../utils/wixApiClient';

export interface SortOption {
  label: string;
  value: string;
  field: string;
  order: 'ASC' | 'DESC';
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface ProductQuery {
  sortBy?: SortOption;
  filterBy?: FilterOption;
  searchTerm?: string;
  categoryId?: string;
  limit?: number;
  offset?: number;
}

export interface ProductListResponse {
  products: WixProduct[];
  totalCount: number;
  hasMore: boolean;
}

export const SORT_OPTIONS: SortOption[] = [
  { label: 'Name A-Z', value: 'name_asc', field: 'name', order: 'ASC' },
  { label: 'Name Z-A', value: 'name_desc', field: 'name', order: 'DESC' },
  { label: 'Price Low-High', value: 'price_asc', field: 'price', order: 'ASC' },
  { label: 'Price High-Low', value: 'price_desc', field: 'price', order: 'DESC' },
  { label: 'Newest First', value: 'newest', field: 'lastUpdated', order: 'DESC' },
];

export const FILTER_OPTIONS: FilterOption[] = [
  { label: 'All Products', value: 'all' },
  { label: 'In Stock Only', value: 'in_stock' },
  { label: 'Visible Only', value: 'visible' },
];

// Demo products for web fallback
const DEMO_PRODUCTS: WixProduct[] = [
  {
    _id: 'demo-1',
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation and premium sound quality.',
    price: { formatted: { price: '$299.99' }, value: 299.99, currency: 'USD' },
    media: { mainMedia: { image: { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop' } } },
    stock: { inStock: true, quantity: 50 },
    ribbon: 'Best Seller',
    slug: 'premium-wireless-headphones'
  },
  {
    _id: 'demo-2',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracking with heart rate monitoring, GPS, and smartphone integration.',
    price: { formatted: { price: '$199.99' }, value: 199.99, currency: 'USD' },
    media: { mainMedia: { image: { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop' } } },
    stock: { inStock: true, quantity: 25 },
    ribbon: 'New',
    slug: 'smart-fitness-watch'
  },
  {
    _id: 'demo-3',
    name: 'Organic Coffee Beans',
    description: 'Premium organic coffee beans sourced from sustainable farms. Rich, full-bodied flavor.',
    price: { formatted: { price: '$24.99' }, value: 24.99, currency: 'USD' },
    media: { mainMedia: { image: { url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop' } } },
    stock: { inStock: true, quantity: 100 },
    ribbon: 'Organic',
    slug: 'organic-coffee-beans'
  },
  {
    _id: 'demo-4',
    name: 'Minimalist Desk Lamp',
    description: 'Modern LED desk lamp with adjustable brightness and sleek minimalist design.',
    price: { formatted: { price: '$89.99' }, value: 89.99, currency: 'USD' },
    media: { mainMedia: { image: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' } } },
    stock: { inStock: true, quantity: 15 },
    ribbon: 'Limited',
    slug: 'minimalist-desk-lamp'
  },
  {
    _id: 'demo-5',
    name: 'Eco-Friendly Water Bottle',
    description: 'Sustainable stainless steel water bottle that keeps drinks cold for 24 hours.',
    price: { formatted: { price: '$34.99' }, value: 34.99, currency: 'USD' },
    media: { mainMedia: { image: { url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop' } } },
    stock: { inStock: true, quantity: 75 },
    ribbon: 'Eco-Friendly',
    slug: 'eco-friendly-water-bottle'
  },
  {
    _id: 'demo-6',
    name: 'Wireless Phone Charger',
    description: 'Fast wireless charging pad compatible with all Qi-enabled devices.',
    price: { formatted: { price: '$49.99' }, value: 49.99, currency: 'USD' },
    media: { mainMedia: { image: { url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop' } } },
    stock: { inStock: true, quantity: 40 },
    ribbon: 'Fast Charging',
    slug: 'wireless-phone-charger'
  }
];

class WixProductService {
  private static instance: WixProductService;

  static getInstance(): WixProductService {
    if (!WixProductService.instance) {
      WixProductService.instance = new WixProductService();
    }
    return WixProductService.instance;
  }

  /**
   * Fetch products with filtering, sorting, and pagination
   */
  async getProducts(query: ProductQuery = {}): Promise<ProductListResponse> {
    try {
      const {
        sortBy = SORT_OPTIONS[0],
        filterBy = FILTER_OPTIONS[0],
        searchTerm,
        categoryId,
        limit = 20,
        offset = 0,
      } = query;

      console.log('🛍️ [PRODUCT SERVICE] Fetching products:', { 
        sortBy: sortBy.value, 
        filterBy: filterBy.value, 
        searchTerm,
        limit,
        offset 
      });

      // Web platform fallback - return demo products to avoid CORS issues
      if (Platform.OS === 'web') {
        console.log('🌐 [PRODUCT SERVICE] Using web fallback with demo products');
        console.log('ℹ️ [PRODUCT SERVICE] Note: Demo products shown for web preview. Real products available in mobile app.');
        
        let filteredProducts = [...DEMO_PRODUCTS];
        
        // Apply search filter
        if (searchTerm) {
          filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        // Apply stock filter
        if (filterBy.value === 'in_stock') {
          filteredProducts = filteredProducts.filter(product => product.stock?.inStock);
        }
        
        // Apply sorting
        if (sortBy.field === 'name') {
          filteredProducts.sort((a, b) => {
            const comparison = a.name.localeCompare(b.name);
            return sortBy.order === 'ASC' ? comparison : -comparison;
          });
        } else if (sortBy.field === 'price') {
          filteredProducts.sort((a, b) => {
            const priceA = a.price?.value || 0;
            const priceB = b.price?.value || 0;
            return sortBy.order === 'ASC' ? priceA - priceB : priceB - priceA;
          });
        }
        
        // Apply pagination
        const startIndex = offset;
        const endIndex = startIndex + limit;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        return {
          products: paginatedProducts,
          totalCount: filteredProducts.length,
          hasMore: endIndex < filteredProducts.length
        };
      }

      const response = await wixApiClient.queryProducts({
        visible: true,
        limit,
        // Note: The actual API doesn't support all these filters yet
        // searchQuery: searchTerm,
        // sort: sortBy ? `[{"${sortBy.field}": "${sortBy.order}"}]` : undefined,
      });

      const products = response.products || [];
      const totalCount = products.length; // Approximate - API doesn't provide total count
      const hasMore = products.length >= limit; // Estimate based on returned count

      console.log('✅ [PRODUCT SERVICE] Products loaded:', { 
        count: products.length, 
        totalCount, 
        hasMore 
      });

      return {
        products: products.map(product => this.transformProduct(product)),
        totalCount,
        hasMore,
      };
    } catch (error) {
      console.error('❌ [PRODUCT SERVICE] Error fetching products:', error);
      throw new Error('Failed to load products. Please try again.');
    }
  }

  /**
   * Get a single product by ID
   */
  async getProduct(productId: string): Promise<WixProduct> {
    try {
      console.log('🛍️ [PRODUCT SERVICE] Fetching product:', productId);

      const product = await wixApiClient.getProduct(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      console.log('✅ [PRODUCT SERVICE] Product loaded:', product.name);
      return this.transformProduct(product);
    } catch (error) {
      console.error('❌ [PRODUCT SERVICE] Error fetching product:', error);
      throw new Error('Failed to load product details. Please try again.');
    }
  }

  /**
   * Search products by term
   */
  async searchProducts(searchTerm: string, options: Omit<ProductQuery, 'searchTerm'> = {}): Promise<ProductListResponse> {
    return this.getProducts({ ...options, searchTerm });
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categoryId: string, options: Omit<ProductQuery, 'categoryId'> = {}): Promise<ProductListResponse> {
    return this.getProducts({ ...options, categoryId });
  }

  /**
   * Get product categories
   */
  async getCategories() {
    try {
      console.log('🛍️ [PRODUCT SERVICE] Fetching categories');
      
      const categories = await wixApiClient.getCollections();

      console.log('✅ [PRODUCT SERVICE] Categories loaded:', categories.length);
      return categories;
    } catch (error) {
      console.error('❌ [PRODUCT SERVICE] Error fetching categories:', error);
      throw new Error('Failed to load categories. Please try again.');
    }
  }

  /**
   * Build filter object for API query
   */
  private buildFilter(filterBy: FilterOption, searchTerm?: string, categoryId?: string) {
    const filters: any[] = [];

    // Apply status filter
    if (filterBy.value === 'in_stock') {
      filters.push({
        fieldName: 'stock.inStock',
        value: true,
      });
    } else if (filterBy.value === 'visible') {
      filters.push({
        fieldName: 'visible',
        value: true,
      });
    }

    // Apply search filter
    if (searchTerm) {
      filters.push({
        fieldName: 'name',
        value: searchTerm,
        operator: 'CONTAINS',
      });
    }

    // Apply category filter
    if (categoryId) {
      filters.push({
        fieldName: 'collectionIds',
        value: categoryId,
        operator: 'CONTAINS',
      });
    }

    return filters.length > 0 ? { $and: filters } : undefined;
  }

  /**
   * Strip HTML tags from text
   */
  private stripHtmlTags(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  /**
   * Transform API response to standardized format
   */
  private transformProduct(apiProduct: any): WixProduct {
    return {
      id: apiProduct.id || '',
      name: apiProduct.name || 'Unnamed Product',
      description: this.stripHtmlTags(apiProduct.description || ''),
      price: apiProduct.price?.formatted?.price || '$0.00',
      priceValue: apiProduct.price?.price || apiProduct.priceData?.price || 0,
      currency: apiProduct.price?.currency || apiProduct.priceData?.currency || 'USD',
      imageUrl: apiProduct.media?.mainMedia?.image?.url || '',
      images: apiProduct.media?.items?.map((item: any) => item.image?.url).filter(Boolean) || [],
      inStock: apiProduct.stock?.inStock ?? true,
      stockQuantity: apiProduct.stock?.quantity || 0,
      sku: apiProduct.sku || '',
      visible: apiProduct.visible ?? true,
      categories: apiProduct.collectionIds || [],
      createdDate: apiProduct.createdDate,
      lastUpdated: apiProduct.lastUpdated,
      variants: apiProduct.productOptions || [],
      additionalInfoSections: apiProduct.additionalInfoSections || [],
    };
  }
}

export const productService = WixProductService.getInstance();
