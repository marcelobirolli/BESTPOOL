import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import poolDataAggregator, { PortfolioRecommendation, AggregatedPoolData } from '../services/poolDataAggregator';
import priceWebSocket, { PriceUpdate } from '../services/priceWebSocket';

export interface UsePoolRecommendationsConfig {
  totalInvestment: number;
  expectedDailyFeesPercent: number;
  selectedPoolIds: string[];
  riskTolerance?: 'low' | 'medium' | 'high';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UsePoolRecommendationsReturn {
  recommendations: PortfolioRecommendation | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isConnected: boolean;
  lastUpdated: Date | null;
  priceUpdates: Record<string, PriceUpdate>;
}

const STORAGE_KEY = 'pool_recommendations_config';

export function usePoolRecommendations(
  config: UsePoolRecommendationsConfig
): UsePoolRecommendationsReturn {
  const [recommendations, setRecommendations] = useState<PortfolioRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [priceUpdates, setPriceUpdates] = useState<Record<string, PriceUpdate>>({});

  const {
    totalInvestment,
    expectedDailyFeesPercent,
    selectedPoolIds,
    riskTolerance = 'medium',
    autoRefresh = true,
    refreshInterval = 30000 // 30 seconds
  } = config;

  /**
   * Save configuration to storage
   */
  const saveConfiguration = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        totalInvestment,
        expectedDailyFeesPercent,
        selectedPoolIds,
        riskTolerance,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  }, [totalInvestment, expectedDailyFeesPercent, selectedPoolIds, riskTolerance]);

  /**
   * Load saved configuration
   */
  const loadConfiguration = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
    return null;
  }, []);

  /**
   * Fetch recommendations from the aggregator
   */
  const fetchRecommendations = useCallback(async () => {
    if (!totalInvestment || !selectedPoolIds.length) {
      setError('Invalid configuration');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await poolDataAggregator.generateRecommendations(
        totalInvestment,
        expectedDailyFeesPercent,
        selectedPoolIds,
        riskTolerance
      );

      setRecommendations(data);
      setLastUpdated(new Date());
      
      // Save configuration on successful fetch
      await saveConfiguration();
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  }, [totalInvestment, expectedDailyFeesPercent, selectedPoolIds, riskTolerance, saveConfiguration]);

  /**
   * Handle price updates from WebSocket
   */
  const handlePriceUpdate = useCallback((update: PriceUpdate) => {
    setPriceUpdates(prev => ({
      ...prev,
      [update.poolId]: update
    }));

    // Update recommendations if significant price change
    if (Math.abs(update.change) > 2 && recommendations) {
      // Update the price in recommendations
      setRecommendations(prev => {
        if (!prev) return prev;
        
        const updatedPools = prev.pools.map(pool => {
          if (pool.poolId === update.poolId) {
            return {
              ...pool,
              currentPrice: update.price,
              trendStrength: update.change
            };
          }
          return pool;
        });

        return {
          ...prev,
          pools: updatedPools,
          lastUpdated: new Date()
        };
      });
    }
  }, [recommendations]);

  /**
   * Handle WebSocket connection status
   */
  const handleConnectionStatus = useCallback((connected: boolean) => {
    setIsConnected(connected);
    if (!connected) {
      console.log('WebSocket disconnected, attempting to reconnect...');
    }
  }, []);

  /**
   * Initialize WebSocket connection
   */
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        // Connect to WebSocket
        await priceWebSocket.connect();
        
        // Subscribe to selected pools
        if (selectedPoolIds.length > 0) {
          await priceWebSocket.subscribeToPools(selectedPoolIds);
        }

        // Set up event listeners
        priceWebSocket.on('connected', () => handleConnectionStatus(true));
        priceWebSocket.on('disconnected', () => handleConnectionStatus(false));
        priceWebSocket.on('priceUpdate', handlePriceUpdate);
        
        // Monitor volatility for each pool
        selectedPoolIds.forEach(poolId => {
          priceWebSocket.monitorVolatility(poolId, 5);
        });

        setIsConnected(true);
      } catch (error) {
        console.error('WebSocket connection error:', error);
        setIsConnected(false);
      }
    };

    connectWebSocket();

    // Cleanup
    return () => {
      priceWebSocket.removeListener('connected', () => handleConnectionStatus(true));
      priceWebSocket.removeListener('disconnected', () => handleConnectionStatus(false));
      priceWebSocket.removeListener('priceUpdate', handlePriceUpdate);
      priceWebSocket.disconnect();
    };
  }, [selectedPoolIds, handlePriceUpdate, handleConnectionStatus]);

  /**
   * Auto-refresh logic
   */
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchRecommendations();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchRecommendations]);

  /**
   * Initial fetch
   */
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendations,
    loading,
    error,
    refresh: fetchRecommendations,
    isConnected,
    lastUpdated,
    priceUpdates
  };
}

/**
 * Hook to get individual pool data
 */
export function usePoolData(poolId: string) {
  const [poolData, setPoolData] = useState<AggregatedPoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPoolData = async () => {
      setLoading(true);
      setError(null);

      try {
        const pools = await poolDataAggregator.getPoolsData([poolId]);
        if (pools.length > 0) {
          setPoolData(pools[0]);
        } else {
          setError('Pool not found');
        }
      } catch (err) {
        console.error('Error fetching pool data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch pool data');
      } finally {
        setLoading(false);
      }
    };

    fetchPoolData();
  }, [poolId]);

  return { poolData, loading, error };
}