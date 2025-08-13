/**
 * WebWixProductService - Web-specific service layer for product-related operations
 * 
 * This is a web-specific override of the mobile WixProductService that uses
 * the webWixApiClient to handle CORS issues and provide fallback functionality
 */

import { webWixApiClient } from './webWixApiClient';
import type { WixProduct } from '@mobile/utils/wixApiClient';

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

class WebWixProductService {
  private static instance: WebWixProductService;

  static getInstance(): WebWixProductService {
    if (!WebWixProductService.instance) {
      WebWixProductService.instance = new WebWixProductService();
    }
    return WebWixProductService.instance;
  }

  /**
   * Fetch products with filtering, sorting, and pagination
   * Uses web-specific fallback approach similar to booking services
   */
  async getProducts(query: ProductQuery = {}): Promise<ProductListResponse> {
    const {
      sortBy = SORT_OPTIONS[0],
      filterBy = FILTER_OPTIONS[0],
      searchTerm,
      categoryId,
      limit = 20,
      offset = 0,
    } = query;

    console.log('🛍️ [WEB PRODUCT SERVICE] Fetching products (web fallback mode):', { 
      sortBy: sortBy.value, 
      filterBy: filterBy.value, 
      searchTerm,
      limit,
      offset 
    });

    // For web, immediately return demo products to avoid CORS issues
    // This is similar to how booking services handle web environments
    const demoProducts = this.generateDemoProducts();
    
    // Apply basic filtering
    let filteredProducts = demoProducts;
    
    if (searchTerm) {
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    if (sortBy.field === 'name') {
      filteredProducts.sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return sortBy.order === 'ASC' ? comparison : -comparison;
      });
    } else if (sortBy.field === 'price') {
      filteredProducts.sort((a, b) => {
        const comparison = a.priceValue - b.priceValue;
        return sortBy.order === 'ASC' ? comparison : -comparison;
      });
    }
    
    // Apply pagination
    const startIndex = offset;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    console.log('✅ [WEB PRODUCT SERVICE] Demo products loaded:', { 
      count: paginatedProducts.length, 
      totalCount: filteredProducts.length, 
      hasMore: endIndex < filteredProducts.length,
      isDemo: true
    });
    
    console.log('ℹ️ [WEB PRODUCT SERVICE] Using demo data for web preview. Real products available in mobile app.');

    return {
      products: paginatedProducts,
      totalCount: filteredProducts.length,
      hasMore: endIndex < filteredProducts.length,
    };
  }

  /**
   * Generate demo products for web preview
   */
  private generateDemoProducts(): WixProduct[] {
    return [
      {
        id: 'demo-product-1',
        name: 'Premium Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation and premium sound quality.',
        price: '$299.99',
        priceValue: 299.99,
        currency: 'USD',
        imageUrl: 'https://via.placeholder.com/400x400/4A90E2/FFFFFF?text=Headphones',
        images: ['https://via.placeholder.com/400x400/4A90E2/FFFFFF?text=Headphones'],
        inStock: true,
        stockQuantity: 15,
        sku: 'WH-DEMO-001',
        visible: true,
        categories: ['electronics', 'audio'],
        createdDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        variants: [],
        additionalInfoSections: [],
      },
      {
        id: 'demo-product-2',
        name: 'Smart Fitness Tracker',
        description: 'Advanced fitness tracker with heart rate monitoring, GPS, and smartphone integration.',
        price: '$199.99',
        priceValue: 199.99,
        currency: 'USD',
        imageUrl: 'https://via.placeholder.com/400x400/50C878/FFFFFF?text=Fitness+Tracker',
        images: ['https://via.placeholder.com/400x400/50C878/FFFFFF?text=Fitness+Tracker'],
        inStock: true,
        stockQuantity: 8,
        sku: 'FT-DEMO-002',
        visible: true,
        categories: ['electronics', 'fitness'],
        createdDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        variants: [],
        additionalInfoSections: [],
      },
      {
        id: 'demo-product-3',
        name: 'Organic Coffee Blend',
        description: 'Premium organic coffee blend with rich flavor and sustainable sourcing.',
        price: '$24.99',
        priceValue: 24.99,
        currency: 'USD',
        imageUrl: 'https://via.placeholder.com/400x400/8B4513/FFFFFF?text=Coffee',
        images: ['https://via.placeholder.com/400x400/8B4513/FFFFFF?text=Coffee'],
        inStock: true,
        stockQuantity: 25,
        sku: 'CF-DEMO-003',
        visible: true,
        categories: ['food', 'beverages'],
        createdDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        variants: [],
        additionalInfoSections: [],
      },
      {
        id: 'demo-product-4',
        name: 'Eco-Friendly Water Bottle',
        description: 'Sustainable stainless steel water bottle that keeps drinks cold for 24 hours.',
        price: '$39.99',
        priceValue: 39.99,
        currency: 'USD',
        imageUrl: 'https://via.placeholder.com/400x400/20B2AA/FFFFFF?text=Water+Bottle',
        images: ['https://via.placeholder.com/400x400/20B2AA/FFFFFF?text=Water+Bottle'],
        inStock: true,
        stockQuantity: 12,
        sku: 'WB-DEMO-004',
        visible: true,
        categories: ['lifestyle', 'eco-friendly'],
        createdDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        variants: [],
        additionalInfoSections: [],
      },
      {
        id: 'demo-product-5',
        name: 'Luxury Skincare Set',
        description: 'Complete skincare routine with natural ingredients and anti-aging properties.',
        price: '$149.99',
        priceValue: 149.99,
        currency: 'USD',
        imageUrl: 'https://via.placeholder.com/400x400/FF69B4/FFFFFF?text=Skincare',
        images: ['https://via.placeholder.com/400x400/FF69B4/FFFFFF?text=Skincare'],
        inStock: true,
        stockQuantity: 6,
        sku: 'SK-DEMO-005',
        visible: true,
        categories: ['beauty', 'skincare'],
        createdDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        variants: [],
        additionalInfoSections: [],
      },
    ];
  }

  /**
   * Get a single product by ID
   */
  async getProduct(productId: string): Promise<WixProduct> {
    try {
      console.log('🛍️ [WEB PRODUCT SERVICE] Fetching product:', productId);

      const product = await webWixApiClient.getProduct(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      console.log('✅ [WEB PRODUCT SERVICE] Product loaded:', product.name);
      return this.transformProduct(product);
    } catch (error) {
      console.error('❌ [WEB PRODUCT SERVICE] Error fetching product:', error);
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
      console.log('🛍️ [WEB PRODUCT SERVICE] Fetching categories');
      
      const categories = await webWixApiClient.getCollections();

      console.log('✅ [WEB PRODUCT SERVICE] Categories loaded:', categories.length);
      return categories;
    } catch (error) {
      console.error('❌ [WEB PRODUCT SERVICE] Error fetching categories:', error);
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
   * Transform API response to standardized format
   */
  private transformProduct(apiProduct: any): WixProduct {
    return {
      id: apiProduct.id || '',
      name: apiProduct.name || 'Unnamed Product',
      description: apiProduct.description || '',
      price: apiProduct.price?.formatted?.price || '$0.00',
      priceValue: apiProduct.price?.value || 0,
      currency: apiProduct.price?.currency || 'USD',
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

export const productService = WebWixProductService.getInstance();
