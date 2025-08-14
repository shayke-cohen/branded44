/**
 * WixProductService - Service layer for product-related operations
 * 
 * Centralizes all product API calls, data transformations, and business logic
 * Keeps screens thin and focused on presentation
 */

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
   * Transform API response to standardized format
   */
  /**
   * Strip HTML tags from text
   */
  private stripHtmlTags(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

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
