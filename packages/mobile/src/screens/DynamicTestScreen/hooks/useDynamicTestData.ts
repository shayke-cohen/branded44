import { useState, useEffect, useCallback } from 'react';

interface TestData {
  message: string;
  timestamp: string;
  randomValue: number;
  sessionInfo?: any;
}

/**
 * useDynamicTestData - Custom hook to demonstrate dynamic hook loading
 * 
 * This hook will be loaded separately from the main component,
 * showcasing the dynamic dependency loading system.
 */
export const useDynamicTestData = () => {
  const [testData, setTestData] = useState<TestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const generateTestData = useCallback((): TestData => {
    const messages = [
      "Dynamic loading working perfectly! 🎉",
      "Real-time updates are amazing! ⚡",
      "File-based screen loading rocks! 🚀",
      "Individual component loading! 📦",
      "Live development experience! 🔥"
    ];

    return {
      message: messages[Math.floor(Math.random() * messages.length)],
      timestamp: new Date().toISOString(),
      randomValue: Math.floor(Math.random() * 1000),
      sessionInfo: {
        loadedAt: new Date().toISOString(),
        hookVersion: '1.0.0'
      }
    };
  }, []);

  const refreshData = useCallback(() => {
    console.log('🔄 [useDynamicTestData] Refreshing test data...');
    setLoading(true);
    
    // Simulate async data loading
    setTimeout(() => {
      try {
        const newData = generateTestData();
        setTestData(newData);
        setError(null);
        console.log('✅ [useDynamicTestData] Data refreshed:', newData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('❌ [useDynamicTestData] Error refreshing data:', err);
      } finally {
        setLoading(false);
      }
    }, 500 + Math.random() * 1000); // Random delay between 500-1500ms
  }, [generateTestData]);

  // Initial data load
  useEffect(() => {
    console.log('🎣 [useDynamicTestData] Hook initialized, loading initial data...');
    refreshData();
  }, [refreshData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('⏰ [useDynamicTestData] Auto-refreshing data...');
      refreshData();
    }, 30000);

    return () => {
      console.log('🧹 [useDynamicTestData] Cleaning up auto-refresh interval');
      clearInterval(interval);
    };
  }, [refreshData]);

  // Return hook interface
  return {
    testData,
    loading,
    error,
    refreshData
  };
};

