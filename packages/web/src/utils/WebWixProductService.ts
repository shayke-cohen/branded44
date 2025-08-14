/**
 * WebWixProductService - Web-specific service layer for product-related operations
 * 
 * This is a web-specific override of the mobile WixProductService that uses
 * the webWixApiClient to handle CORS issues and provide fallback functionality
 */

import { wixApiClient } from '@mobile/utils/wixApiClient';
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

    // Use real Wix API via our server proxy (no more demo data!)
    try {
      const response = await wixApiClient.queryProducts({
        visible: true,
        limit,
        offset,
        // Note: Additional filtering/sorting can be implemented as needed
        // searchQuery: searchTerm,
        // sort: sortBy ? `[{"${sortBy.field}": "${sortBy.order}"}]` : undefined,
      });

      const products = response.products || [];
      const totalCount = response.totalCount || products.length;
      const hasMore = response.hasNext || false;

      console.log('✅ [WEB PRODUCT SERVICE] Real products loaded via API:', { 
        count: products.length, 
        totalCount, 
        hasMore,
        isReal: true
      });

      return {
        products: products.map(product => this.transformProduct(product)),
        totalCount,
        hasMore,
      };
    } catch (error) {
      console.error('❌ [WEB PRODUCT SERVICE] Error fetching real products:', error);
      throw new Error('Failed to load products. Please try again.');
    }
  }



  /**
   * Get a single product by ID
   */
  async getProduct(productId: string): Promise<WixProduct> {
    try {
      console.log('🛍️ [WEB PRODUCT SERVICE] Fetching product:', productId);

      const product = await wixApiClient.getProduct(productId);
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
      
      const categories = await wixApiClient.queryCategories();

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
