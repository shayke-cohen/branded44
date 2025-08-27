/**
 * RestaurantCacheService - Cache management for restaurant data
 * 
 * Provides intelligent caching to prevent unnecessary API calls
 * and improve user experience with faster loading times.
 * 
 * Features:
 * - Time-based cache expiry
 * - Granular cache keys for different data types
 * - Memory-efficient storage
 * - Cache hit/miss tracking
 * 
 * @version 1.0.0
 */

// === TYPES ===

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number;
}

type CacheKey = 
  | 'restaurant'
  | 'menu'
  | 'popularItems'
  | 'featuredItems'
  | 'searchResults';

// === CACHE SERVICE ===

class RestaurantCacheService {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    hitRate: 0,
  };

  // Cache expiry times (in milliseconds)
  private readonly CACHE_EXPIRY = {
    restaurant: 15 * 60 * 1000,     // 15 minutes
    menu: 10 * 60 * 1000,          // 10 minutes  
    popularItems: 5 * 60 * 1000,   // 5 minutes
    featuredItems: 5 * 60 * 1000,  // 5 minutes
    searchResults: 2 * 60 * 1000,  // 2 minutes
  };

  /**
   * Generate cache key with optional restaurant ID
   */
  private generateKey(type: CacheKey, restaurantId?: string): string {
    return restaurantId ? `${type}:${restaurantId}` : type;
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid(entry: CacheEntry<any>): boolean {
    return Date.now() < entry.expiresAt;
  }

  /**
   * Update cache statistics
   */
  private updateStats(hit: boolean): void {
    this.stats.totalRequests++;
    if (hit) {
      this.stats.hits++;
    } else {
      this.stats.misses++;
    }
    this.stats.hitRate = (this.stats.hits / this.stats.totalRequests) * 100;
  }

  /**
   * Get data from cache
   */
  get<T>(type: CacheKey, restaurantId?: string): T | null {
    const key = this.generateKey(type, restaurantId);
    const entry = this.cache.get(key);

    if (entry && this.isValid(entry)) {
      this.updateStats(true);
      console.log(`✅ [CACHE HIT] ${key} - ${Math.round((entry.expiresAt - Date.now()) / 1000)}s remaining`);
      return entry.data as T;
    }

    // Remove expired entries
    if (entry) {
      this.cache.delete(key);
      console.log(`🗑️ [CACHE EXPIRED] ${key} - removed expired entry`);
    }

    this.updateStats(false);
    console.log(`❌ [CACHE MISS] ${key} - data not cached or expired`);
    return null;
  }

  /**
   * Store data in cache
   */
  set<T>(type: CacheKey, data: T, restaurantId?: string): void {
    const key = this.generateKey(type, restaurantId);
    const now = Date.now();
    const expiresAt = now + this.CACHE_EXPIRY[type];

    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt,
    };

    this.cache.set(key, entry);
    
    const expiresInMin = Math.round(this.CACHE_EXPIRY[type] / 1000 / 60);
    console.log(`💾 [CACHE SET] ${key} - expires in ${expiresInMin} minutes`);
  }

  /**
   * Check if cache has valid data
   */
  has(type: CacheKey, restaurantId?: string): boolean {
    const key = this.generateKey(type, restaurantId);
    const entry = this.cache.get(key);
    return entry ? this.isValid(entry) : false;
  }

  /**
   * Clear specific cache entry
   */
  clear(type: CacheKey, restaurantId?: string): void {
    const key = this.generateKey(type, restaurantId);
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`🗑️ [CACHE CLEAR] ${key} - manually cleared`);
    }
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    const count = this.cache.size;
    this.cache.clear();
    console.log(`🗑️ [CACHE CLEAR ALL] Cleared ${count} entries`);
  }

  /**
   * Clear expired entries (garbage collection)
   */
  clearExpired(): void {
    const before = this.cache.size;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now >= entry.expiresAt) {
        this.cache.delete(key);
      }
    }

    const after = this.cache.size;
    const removed = before - after;
    
    if (removed > 0) {
      console.log(`🧹 [CACHE GC] Removed ${removed} expired entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get cache info for debugging
   */
  getDebugInfo(): {
    entries: Array<{
      key: string;
      size: number;
      age: number;
      expiresIn: number;
    }>;
    stats: CacheStats;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      size: JSON.stringify(entry.data).length,
      age: Math.round((now - entry.timestamp) / 1000),
      expiresIn: Math.round((entry.expiresAt - now) / 1000),
    }));

    return {
      entries,
      stats: this.getStats(),
    };
  }

  /**
   * Preload data for better user experience
   */
  preload<T>(type: CacheKey, dataLoader: () => Promise<T>, restaurantId?: string): Promise<void> {
    return new Promise((resolve) => {
      // Only preload if data is not cached
      if (!this.has(type, restaurantId)) {
        dataLoader().then(data => {
          this.set(type, data, restaurantId);
          resolve();
        }).catch(() => {
          // Ignore preload failures
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Export singleton instance
export const restaurantCache = new RestaurantCacheService();

// Auto garbage collection every 5 minutes
setInterval(() => {
  restaurantCache.clearExpired();
}, 5 * 60 * 1000);

export default restaurantCache;
