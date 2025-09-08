import { Connection, PublicKey } from '@solana/web3.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const SOLANA_RPC_URL = process.env.EXPO_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const CACHE_PREFIX = 'orca_cache_';
const CACHE_TTL = 30000; // 30 seconds for pool data
const PRICE_CACHE_TTL = 5000; // 5 seconds for price data

// ORCA Whirlpool Program ID
const ORCA_WHIRLPOOL_PROGRAM_ID = 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc';

export interface PoolData {
  address: string;
  tokenA: {
    symbol: string;
    mint: string;
    decimals: number;
  };
  tokenB: {
    symbol: string;
    mint: string;
    decimals: number;
  };
  price: number;
  liquidity: number;
  volume24h: number;
  fee: number;
  apy: number;
  tvl: number;
}

export interface PriceData {
  poolAddress: string;
  currentPrice: number;
  priceChange24h: number;
  priceChange7d: number;
  high24h: number;
  low24h: number;
  timestamp: number;
}

export interface PositionData {
  poolAddress: string;
  lowerPrice: number;
  upperPrice: number;
  liquidity: number;
  tokenAAmount: number;
  tokenBAmount: number;
  fees: {
    tokenA: number;
    tokenB: number;
  };
  impermanentLoss: number;
}

class OrcaClient {
  private connection: Connection;
  private cacheEnabled: boolean = true;

  constructor() {
    this.connection = new Connection(SOLANA_RPC_URL, 'confirmed');
  }

  /**
   * Get pool data from ORCA DEX
   */
  async getPoolData(poolAddress: string): Promise<PoolData | null> {
    try {
      // Check cache first
      const cached = await this.getFromCache<PoolData>(`pool_${poolAddress}`, CACHE_TTL);
      if (cached) return cached;

      // Fetch from blockchain
      const poolPubkey = new PublicKey(poolAddress);
      const accountInfo = await this.connection.getAccountInfo(poolPubkey);
      
      if (!accountInfo) {
        console.error('Pool account not found:', poolAddress);
        return null;
      }

      // Parse pool data (simplified - actual implementation would decode the account data)
      // For now, returning mock data that would come from ORCA API
      const poolData: PoolData = await this.fetchPoolDataFromAPI(poolAddress);
      
      // Cache the result
      await this.saveToCache(`pool_${poolAddress}`, poolData);
      
      return poolData;
    } catch (error) {
      console.error('Error fetching pool data:', error);
      return null;
    }
  }

  /**
   * Get real-time price data for a pool
   */
  async getPriceData(poolAddress: string): Promise<PriceData | null> {
    try {
      // Check cache with shorter TTL for price data
      const cached = await this.getFromCache<PriceData>(`price_${poolAddress}`, PRICE_CACHE_TTL);
      if (cached) return cached;

      // Fetch latest price data
      const priceData = await this.fetchPriceDataFromAPI(poolAddress);
      
      // Cache the result
      await this.saveToCache(`price_${poolAddress}`, priceData);
      
      return priceData;
    } catch (error) {
      console.error('Error fetching price data:', error);
      return null;
    }
  }

  /**
   * Calculate optimal position range based on volatility
   */
  async calculateOptimalRange(
    poolAddress: string,
    investment: number,
    riskTolerance: 'low' | 'medium' | 'high'
  ): Promise<{ lowerPrice: number; upperPrice: number; expectedAPY: number }> {
    const priceData = await this.getPriceData(poolAddress);
    if (!priceData) {
      throw new Error('Unable to fetch price data');
    }

    const volatilityMultiplier = {
      low: 0.05,    // ±5% range
      medium: 0.10, // ±10% range  
      high: 0.20    // ±20% range
    };

    const multiplier = volatilityMultiplier[riskTolerance];
    const currentPrice = priceData.currentPrice;

    // Calculate range based on volatility and risk tolerance
    const lowerPrice = currentPrice * (1 - multiplier);
    const upperPrice = currentPrice * (1 + multiplier);

    // Estimate APY based on range (tighter range = higher APY)
    const baseAPY = 10; // Base APY percentage
    const rangeBonus = (1 / multiplier) * 0.5; // Bonus for tighter ranges
    const expectedAPY = baseAPY + rangeBonus;

    return {
      lowerPrice,
      upperPrice,
      expectedAPY: Math.min(expectedAPY, 50) // Cap at 50% APY
    };
  }

  /**
   * Calculate impermanent loss for a position
   */
  calculateImpermanentLoss(
    initialPriceRatio: number,
    currentPriceRatio: number
  ): number {
    const priceRatioChange = currentPriceRatio / initialPriceRatio;
    const impermanentLoss = 2 * Math.sqrt(priceRatioChange) / (1 + priceRatioChange) - 1;
    return impermanentLoss * 100; // Return as percentage
  }

  /**
   * Get yield metrics for a pool
   */
  async getYieldMetrics(poolAddress: string): Promise<{
    apy: number;
    apr: number;
    dailyFees: number;
    weeklyFees: number;
  }> {
    const poolData = await this.getPoolData(poolAddress);
    if (!poolData) {
      throw new Error('Unable to fetch pool data');
    }

    // Calculate metrics
    const apr = poolData.fee * 365; // Simplified APR calculation
    const apy = (Math.pow(1 + poolData.fee / 365, 365) - 1) * 100;
    const dailyFees = poolData.volume24h * (poolData.fee / 100);
    const weeklyFees = dailyFees * 7;

    return {
      apy,
      apr,
      dailyFees,
      weeklyFees
    };
  }

  /**
   * Mock API call - Replace with actual ORCA API integration
   */
  private async fetchPoolDataFromAPI(poolAddress: string): Promise<PoolData> {
    // This would be replaced with actual ORCA API call
    // For now, returning mock data based on pool address
    const mockPools: Record<string, Partial<PoolData>> = {
      'Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE': {
        tokenA: { symbol: 'SOL', mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
        tokenB: { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
        price: 221.85,
        liquidity: 45200000,
        volume24h: 12800000,
        fee: 0.25,
        apy: 12.4,
        tvl: 45200000
      },
      'HxA6SKW5qA4o12fjVgTpXdq2YnZ5Zv1s7SB4FFomsyLM': {
        tokenA: { symbol: 'cbBTC', mint: 'cbBTCmint', decimals: 8 },
        tokenB: { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
        price: 102850,
        liquidity: 67800000,
        volume24h: 18400000,
        fee: 0.25,
        apy: 8.7,
        tvl: 67800000
      },
      'ArisQNcbjXPJD7RgPRvysatX3xcfHPTbcTkfD8kDoZ9i': {
        tokenA: { symbol: 'EURC', mint: 'EURCmint', decimals: 6 },
        tokenB: { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
        price: 1.059,
        liquidity: 28500000,
        volume24h: 3200000,
        fee: 0.05,
        apy: 4.2,
        tvl: 28500000
      },
      '4fuUiYxTQ6QCrdSq9ouBYcTM7bqSwYTSyLueGZLTy4T4': {
        tokenA: { symbol: 'USDT', mint: 'USDTmint', decimals: 6 },
        tokenB: { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
        price: 1.0001,
        liquidity: 52000000,
        volume24h: 8500000,
        fee: 0.01,
        apy: 3.1,
        tvl: 52000000
      },
      'AU971DrPyhhrpRnmEBp5pDTWL2ny7nofb5vYBjDJkR2E': {
        tokenA: { symbol: 'WETH', mint: 'WETHmint', decimals: 8 },
        tokenB: { symbol: 'USDC', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
        price: 3850,
        liquidity: 38400000,
        volume24h: 9200000,
        fee: 0.25,
        apy: 9.8,
        tvl: 38400000
      }
    };

    return {
      address: poolAddress,
      ...mockPools[poolAddress]
    } as PoolData;
  }

  /**
   * Mock price data API call
   */
  private async fetchPriceDataFromAPI(poolAddress: string): Promise<PriceData> {
    const poolData = await this.getPoolData(poolAddress);
    if (!poolData) {
      throw new Error('Pool data not found');
    }

    // Generate mock price data with some randomness
    const randomChange = (Math.random() - 0.5) * 0.1; // ±5% random change
    const currentPrice = poolData.price * (1 + randomChange);
    
    return {
      poolAddress,
      currentPrice,
      priceChange24h: randomChange * 100,
      priceChange7d: randomChange * 200,
      high24h: currentPrice * 1.05,
      low24h: currentPrice * 0.95,
      timestamp: Date.now()
    };
  }

  /**
   * Cache management utilities
   */
  private async getFromCache<T>(key: string, ttl: number): Promise<T | null> {
    if (!this.cacheEnabled) return null;
    
    try {
      const cached = await AsyncStorage.getItem(CACHE_PREFIX + key);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > ttl) {
        await AsyncStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }
      
      return data as T;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  private async saveToCache(key: string, data: any): Promise<void> {
    if (!this.cacheEnabled) return;
    
    try {
      await AsyncStorage.setItem(
        CACHE_PREFIX + key,
        JSON.stringify({
          data,
          timestamp: Date.now()
        })
      );
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }

  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }
}

// Export singleton instance
export default new OrcaClient();