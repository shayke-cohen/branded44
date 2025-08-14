/**
 * useProductDetail - Custom hook for product detail logic
 * 
 * Centralizes all product detail state management and business logic
 * Makes screens thin and focused on presentation
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { productService } from '../shared/WixProductService';
import type { WixProduct } from '../../../../utils/wixApiClient';

interface UseProductDetailState {
  product: WixProduct | null;
  loading: boolean;
  error: string | null;
  selectedVariant: any | null;
  selectedQuantity: number;
  relatedProducts: WixProduct[];
  loadingRelated: boolean;
}

interface UseProductDetailActions {
  loadProduct: () => Promise<void>;
  loadRelatedProducts: () => Promise<void>;
  selectVariant: (variant: any) => void;
  setQuantity: (quantity: number) => void;
  retryLoad: () => Promise<void>;
  clearError: () => void;
}

interface UseProductDetailReturn extends UseProductDetailState, UseProductDetailActions {
  canAddToCart: boolean;
  totalPrice: number;
  isInStock: boolean;
}

const INITIAL_STATE: UseProductDetailState = {
  product: null,
  loading: true,
  error: null,
  selectedVariant: null,
  selectedQuantity: 1,
  relatedProducts: [],
  loadingRelated: false,
};

export const useProductDetail = (productId: string): UseProductDetailReturn => {
  // State
  const [state, setState] = useState<UseProductDetailState>(INITIAL_STATE);
  
  // Refs
  const mounted = useRef(true);
  const currentProductId = useRef(productId);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  // Update product ID if it changes
  useEffect(() => {
    if (productId !== currentProductId.current) {
      currentProductId.current = productId;
      setState(INITIAL_STATE);
      loadProduct();
    }
  }, [productId]);

  /**
   * Update state safely if component is still mounted
   */
  const safeSetState = useCallback((updater: Partial<UseProductDetailState> | ((prev: UseProductDetailState) => UseProductDetailState)) => {
    if (mounted.current) {
      setState(prev => typeof updater === 'function' ? updater(prev) : { ...prev, ...updater });
    }
  }, []);

  /**
   * Load product details
   */
  const loadProduct = useCallback(async () => {
    if (!productId) {
      safeSetState({ error: 'Product ID is required', loading: false });
      return;
    }

    try {
      safeSetState({ loading: true, error: null });

      console.log('🔄 [PRODUCT DETAIL HOOK] Loading product:', productId);

      const product = await productService.getProduct(productId);

      if (mounted.current) {
        safeSetState(prev => ({
          product,
          loading: false,
          error: null,
          selectedVariant: product.variants?.[0] || null,
        }));

        console.log('✅ [PRODUCT DETAIL HOOK] Product loaded successfully');

        // Auto-load related products
        loadRelatedProducts();
      }
    } catch (error) {
      console.error('❌ [PRODUCT DETAIL HOOK] Error loading product:', error);
      
      if (mounted.current) {
        safeSetState({
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load product',
        });
      }
    }
  }, [productId, safeSetState]);

  /**
   * Load related products
   */
  const loadRelatedProducts = useCallback(async () => {
    if (!state.product) return;

    try {
      safeSetState({ loadingRelated: true });

      console.log('🔄 [PRODUCT DETAIL HOOK] Loading related products');

      // Get products from the same category
      const relatedProducts = await productService.getProductsByCategory(
        state.product.categoryIds?.[0] || '',
        { limit: 6 }
      );

      // Filter out the current product
      const filtered = relatedProducts.products.filter(p => p.id !== productId);

      if (mounted.current) {
        safeSetState({
          relatedProducts: filtered.slice(0, 4), // Limit to 4 related products
          loadingRelated: false,
        });

        console.log('✅ [PRODUCT DETAIL HOOK] Related products loaded');
      }
    } catch (error) {
      console.error('❌ [PRODUCT DETAIL HOOK] Error loading related products:', error);
      
      if (mounted.current) {
        safeSetState({ loadingRelated: false });
      }
    }
  }, [state.product, productId, safeSetState]);

  /**
   * Select a product variant
   */
  const selectVariant = useCallback((variant: any) => {
    safeSetState({ selectedVariant: variant });
  }, [safeSetState]);

  /**
   * Set quantity
   */
  const setQuantity = useCallback((quantity: number) => {
    const validQuantity = Math.max(1, Math.min(quantity, 99)); // Clamp between 1-99
    safeSetState({ selectedQuantity: validQuantity });
  }, [safeSetState]);

  /**
   * Retry loading after error
   */
  const retryLoad = useCallback(async () => {
    await loadProduct();
  }, [loadProduct]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    safeSetState({ error: null });
  }, [safeSetState]);

  /**
   * Auto-load product when hook is first used
   */
  useEffect(() => {
    if (productId && mounted.current) {
      loadProduct();
    }
  }, []); // Only run once on mount

  /**
   * Derived state
   */
  const isInStock = !!(state.product?.inStock);
  const canAddToCart = !!(state.product && isInStock && !state.loading);
  
  const totalPrice = state.product 
    ? (state.product.priceValue || 0) * state.selectedQuantity 
    : 0;

  return {
    // State
    product: state.product,
    loading: state.loading,
    error: state.error,
    selectedVariant: state.selectedVariant,
    selectedQuantity: state.selectedQuantity,
    relatedProducts: state.relatedProducts,
    loadingRelated: state.loadingRelated,

    // Actions
    loadProduct,
    loadRelatedProducts,
    selectVariant,
    setQuantity,
    retryLoad,
    clearError,

    // Derived state
    canAddToCart,
    totalPrice,
    isInStock,
  };
};
