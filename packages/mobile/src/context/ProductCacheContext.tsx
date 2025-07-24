import React, { createContext, useContext, useState, useCallback, useMemo, createElement } from 'react';

// Simple product cache interface
interface ProductCacheItem {
  product: any; // Using any to avoid complex type imports
  timestamp: number;
  source: string;
}

interface ProductCacheContextValue {
  getCachedProduct: (productId: string) => any | null;
  setCachedProduct: (product: any, source?: string) => void;
  setCachedProducts: (products: any[], source?: string) => void;
  clearCache: () => void;
  getCacheSize: () => number;
  stats: {
    hits: number;
    misses: number;
    totalRequests: number;
  };
}

// Create context with default value
const ProductCacheContext = createContext<ProductCacheContextValue>({
  getCachedProduct: () => null,
  setCachedProduct: () => {},
  setCachedProducts: () => {},
  clearCache: () => {},
  getCacheSize: () => 0,
  stats: { hits: 0, misses: 0, totalRequests: 0 }
});

// Simple provider props
interface ProductCacheProviderProps {
  children: React.ReactNode;
  maxCacheSize?: number;
  maxCacheAge?: number;
}

// Provider component
export const ProductCacheProvider = ({ 
  children, 
  maxCacheSize = 100,
  maxCacheAge = 30 * 60 * 1000 // 30 minutes
}: ProductCacheProviderProps) => {
  const [cache, setCache] = useState<Record<string, ProductCacheItem>>({});
  const [stats, setStats] = useState({
    hits: 0,
    misses: 0,
    totalRequests: 0
  });

  // Check if cached product is still valid
  const isCacheValid = useCallback((timestamp: number): boolean => {
    return Date.now() - timestamp < maxCacheAge;
  }, [maxCacheAge]);

  // Get cached product (non-reactive - doesn't update stats to avoid infinite loops)
  const getCachedProduct = useCallback((productId: string) => {
    const cached = cache[productId];
    
    if (!cached) {
      console.log(`❌ [PRODUCT CACHE] Cache miss for product: ${productId}`);
      return null;
    }
    
    if (!isCacheValid(cached.timestamp)) {
      console.log(`⏰ [PRODUCT CACHE] Cache expired for product: ${productId}`);
      
      // Remove expired entry (but don't update stats during render)
      setTimeout(() => {
        setCache(prev => {
          const newCache = { ...prev };
          delete newCache[productId];
          return newCache;
        });
      }, 0);
      
      return null;
    }
    
    const ageInMinutes = Math.round((Date.now() - cached.timestamp) / (1000 * 60));
    console.log(`✅ [PRODUCT CACHE] Cache hit for product: ${productId} (age: ${ageInMinutes}m, source: ${cached.source})`);
    
    return cached.product;
  }, [cache, isCacheValid]);

  // Update stats (separate function to avoid render loops)
  const updateStats = useCallback((type: 'hit' | 'miss') => {
    setStats(prev => ({
      ...prev,
      totalRequests: prev.totalRequests + 1,
      [type === 'hit' ? 'hits' : 'misses']: prev[type === 'hit' ? 'hits' : 'misses'] + 1
    }));
  }, []);

  // Cache a single product
  const setCachedProduct = useCallback((product: any, source: string = 'api') => {
    if (!product || !product.id) {
      console.warn('⚠️ [PRODUCT CACHE] Cannot cache product without ID');
      return;
    }
    
    setCache(prev => ({
      ...prev,
      [product.id]: {
        product,
        timestamp: Date.now(),
        source
      }
    }));
    
    console.log(`💾 [PRODUCT CACHE] Cached product: ${product.id} (source: ${source})`);
    
    // Clean up cache if it gets too large
    setTimeout(() => {
      setCache(currentCache => {
        const entries = Object.entries(currentCache);
        if (entries.length <= maxCacheSize) {
          return currentCache;
        }
        
        // Remove oldest entries
        const sortedEntries = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        const entriesToKeep = sortedEntries.slice(-maxCacheSize);
        
        const newCache: Record<string, ProductCacheItem> = {};
        entriesToKeep.forEach(([productId, entry]) => {
          newCache[productId] = entry;
        });
        
        console.log(`📦 [PRODUCT CACHE] Evicted ${entries.length - entriesToKeep.length} old entries`);
        return newCache;
      });
    }, 100);
  }, [maxCacheSize]);

  // Cache multiple products
  const setCachedProducts = useCallback((products: any[], source: string = 'list') => {
    const validProducts = products.filter(p => p && p.id);
    
    if (validProducts.length === 0) {
      console.warn('⚠️ [PRODUCT CACHE] No valid products to cache');
      return;
    }
    
    setCache(prev => {
      const newCache = { ...prev };
      const timestamp = Date.now();
      
      validProducts.forEach(product => {
        newCache[product.id] = {
          product,
          timestamp,
          source
        };
      });
      
      return newCache;
    });
    
    console.log(`💾 [PRODUCT CACHE] Bulk cached ${validProducts.length} products (source: ${source})`);
  }, []);

  // Clear entire cache
  const clearCache = useCallback(() => {
    setCache({});
    setStats({ hits: 0, misses: 0, totalRequests: 0 });
    console.log('🗑️ [PRODUCT CACHE] Cache cleared completely');
  }, []);

  // Get cache size
  const getCacheSize = useCallback(() => {
    return Object.keys(cache).length;
  }, [cache]);

  const contextValue: ProductCacheContextValue = {
    getCachedProduct,
    setCachedProduct,
    setCachedProducts,
    clearCache,
    getCacheSize,
    stats
  };

  return createElement(
    ProductCacheContext.Provider,
    { value: contextValue },
    children
  );
};

// Hook to use the cache
export const useProductCache = () => {
  const context = useContext(ProductCacheContext);
  if (!context) {
    throw new Error('useProductCache must be used within a ProductCacheProvider');
  }
  return context;
};

// Helper hook for components that need cached products (memoized to avoid infinite loops)
export const useCachedProduct = (productId: string) => {
  const { getCachedProduct, setCachedProduct } = useProductCache();
  
  // Use useMemo to avoid calling getCachedProduct on every render
  const cachedData = useMemo(() => {
    if (!productId) return { cachedProduct: null, isCached: false };
    
    const product = getCachedProduct(productId);
    return {
      cachedProduct: product,
      isCached: product !== null
    };
  }, [getCachedProduct, productId]);
  
  return {
    ...cachedData,
    setCachedProduct: useCallback((product: any) => setCachedProduct(product, 'detail'), [setCachedProduct])
  };
}; 