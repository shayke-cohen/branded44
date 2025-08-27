/**
 * Formatting utilities for the DynamicTestScreen
 * 
 * This utility file demonstrates how individual utility functions
 * can be loaded separately in the dynamic screen loading system.
 */

/**
 * Format test data timestamp for display
 */
export const formatTestData = (date: Date): string => {
  try {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    console.warn('⚠️ [formatTestData] Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format duration in milliseconds to human-readable string
 */
export const formatDuration = (ms: number): string => {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  
  if (ms < 3600000) {
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  }
  
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
};

/**
 * Format file size in bytes to human-readable string
 */
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  
  return `${size.toFixed(2)} ${sizes[i]}`;
};

/**
 * Format cache statistics for display
 */
export const formatCacheStats = (stats: {
  memorySize: number;
  hitRate: number;
  totalUsage: number;
}): string => {
  const hitRatePercent = (stats.hitRate * 100).toFixed(1);
  return `${stats.memorySize} entries, ${hitRatePercent}% hit rate, ${stats.totalUsage} total requests`;
};

/**
 * Generate a random color for UI elements
 */
export const getRandomColor = (): string => {
  const colors = [
    '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
    '#1abc9c', '#34495e', '#e67e22', '#f1c40f', '#8e44ad'
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Validate screen ID format
 */
export const validateScreenId = (screenId: string): boolean => {
  // Screen ID should be PascalCase and end with 'Screen'
  const pattern = /^[A-Z][a-zA-Z0-9]*Screen$/;
  return pattern.test(screenId);
};

/**
 * Extract screen name from screen ID
 */
export const extractScreenName = (screenId: string): string => {
  if (!validateScreenId(screenId)) {
    return screenId;
  }
  
  // Remove 'Screen' suffix and add spaces before capital letters
  const withoutSuffix = screenId.replace(/Screen$/, '');
  return withoutSuffix.replace(/([A-Z])/g, ' $1').trim();
};

/**
 * Debug utility to log function calls
 */
export const debugLog = (functionName: string, ...args: any[]): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔧 [${functionName}]`, ...args);
  }
};

/**
 * Calculate load time and format it
 */
export const measureLoadTime = (startTime: number): string => {
  const loadTime = performance.now() - startTime;
  return formatDuration(loadTime);
};

