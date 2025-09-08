import orcaClient, { PoolData, PriceData } from './orca/orcaClient';
import { SUPPORTED_POOLS, POOL_CORRELATIONS, DEFAULT_ALLOCATION_WEIGHTS } from '../config/pools';

export interface AggregatedPoolData {
  poolId: string;
  poolName: string;
  address: string;
  currentPrice: number;
  priceChange24h: number;
  liquidity: number;
  volume24h: number;
  apy: number;
  tvl: number;
  fee: number;
  riskLevel: 'low' | 'medium' | 'high';
  hedgeType: 'bluechip' | 'stablecoin' | 'hedge';
  trend: 'bull' | 'bear' | 'stable';
  trendStrength: number;
  impermanentLossEstimate: number;
  optimalRange?: {
    lower: number;
    upper: number;
  };
  allocationSuggestion?: {
    amount: number;
    percentage: number;
  };
}

export interface PortfolioRecommendation {
  totalInvestment: number;
  expectedDailyYield: number;
  expectedDailyYieldPercentage: number;
  portfolioRisk: 'low' | 'medium' | 'high';
  pools: AggregatedPoolData[];
  hedgeRatio: number;
  correlationScore: number;
  lastUpdated: Date;
}

class PoolDataAggregator {
  /**
   * Fetch and aggregate data for all supported pools
   */
  async getAllPoolsData(): Promise<AggregatedPoolData[]> {
    const poolsData: AggregatedPoolData[] = [];

    for (const [poolId, poolConfig] of Object.entries(SUPPORTED_POOLS)) {
      try {
        const poolData = await orcaClient.getPoolData(poolConfig.address);
        const priceData = await orcaClient.getPriceData(poolConfig.address);

        if (poolData && priceData) {
          const aggregated = await this.aggregatePoolData(
            poolId,
            poolConfig,
            poolData,
            priceData
          );
          poolsData.push(aggregated);
        }
      } catch (error) {
        console.error(`Error fetching data for pool ${poolId}:`, error);
      }
    }

    return poolsData;
  }

  /**
   * Get data for specific pools
   */
  async getPoolsData(poolIds: string[]): Promise<AggregatedPoolData[]> {
    const poolsData: AggregatedPoolData[] = [];

    for (const poolId of poolIds) {
      const poolConfig = SUPPORTED_POOLS[poolId];
      if (!poolConfig) continue;

      try {
        const poolData = await orcaClient.getPoolData(poolConfig.address);
        const priceData = await orcaClient.getPriceData(poolConfig.address);

        if (poolData && priceData) {
          const aggregated = await this.aggregatePoolData(
            poolId,
            poolConfig,
            poolData,
            priceData
          );
          poolsData.push(aggregated);
        }
      } catch (error) {
        console.error(`Error fetching data for pool ${poolId}:`, error);
      }
    }

    return poolsData;
  }

  /**
   * Generate portfolio recommendations based on user parameters
   */
  async generateRecommendations(
    totalInvestment: number,
    expectedDailyFeesPercent: number,
    selectedPoolIds: string[],
    riskTolerance: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<PortfolioRecommendation> {
    // Get data for selected pools
    const poolsData = await this.getPoolsData(selectedPoolIds);

    // Calculate allocations based on strategy
    const allocatedPools = await this.calculateOptimalAllocations(
      poolsData,
      totalInvestment,
      riskTolerance
    );

    // Calculate portfolio metrics
    const expectedDailyYield = this.calculateExpectedDailyYield(allocatedPools);
    const portfolioRisk = this.assessPortfolioRisk(allocatedPools);
    const hedgeRatio = this.calculateHedgeRatio(allocatedPools);
    const correlationScore = this.calculateCorrelationScore(allocatedPools);

    return {
      totalInvestment,
      expectedDailyYield,
      expectedDailyYieldPercentage: (expectedDailyYield / totalInvestment) * 100,
      portfolioRisk,
      pools: allocatedPools,
      hedgeRatio,
      correlationScore,
      lastUpdated: new Date()
    };
  }

  /**
   * Aggregate pool data from multiple sources
   */
  private async aggregatePoolData(
    poolId: string,
    poolConfig: any,
    poolData: PoolData,
    priceData: PriceData
  ): Promise<AggregatedPoolData> {
    // Determine trend based on price change
    const trend = this.determineTrend(priceData.priceChange24h);
    
    // Calculate IL estimate based on volatility
    const ilEstimate = this.estimateImpermanentLoss(
      priceData.priceChange24h,
      poolConfig.riskLevel
    );

    // Calculate optimal range
    const optimalRange = await orcaClient.calculateOptimalRange(
      poolConfig.address,
      10000, // Base amount for calculation
      poolConfig.riskLevel
    );

    return {
      poolId,
      poolName: poolConfig.name,
      address: poolConfig.address,
      currentPrice: priceData.currentPrice,
      priceChange24h: priceData.priceChange24h,
      liquidity: poolData.liquidity,
      volume24h: poolData.volume24h,
      apy: poolData.apy,
      tvl: poolData.tvl,
      fee: poolData.fee,
      riskLevel: poolConfig.riskLevel,
      hedgeType: poolConfig.hedgeType,
      trend,
      trendStrength: priceData.priceChange24h,
      impermanentLossEstimate: ilEstimate,
      optimalRange: {
        lower: optimalRange.lowerPrice,
        upper: optimalRange.upperPrice
      }
    };
  }

  /**
   * Calculate optimal allocations with hedge strategy
   */
  private async calculateOptimalAllocations(
    pools: AggregatedPoolData[],
    totalInvestment: number,
    riskTolerance: 'low' | 'medium' | 'high'
  ): Promise<AggregatedPoolData[]> {
    // Adjust default weights based on risk tolerance
    const adjustedWeights = this.adjustWeightsForRiskTolerance(
      pools,
      riskTolerance
    );

    // Apply hedge strategy (increase EURC allocation if market is volatile)
    const finalWeights = this.applyHedgeStrategy(pools, adjustedWeights);

    // Calculate actual allocations
    return pools.map(pool => {
      const weight = finalWeights[pool.poolId] || 0;
      const amount = totalInvestment * weight;
      
      return {
        ...pool,
        allocationSuggestion: {
          amount,
          percentage: weight * 100
        }
      };
    });
  }

  /**
   * Adjust weights based on risk tolerance
   */
  private adjustWeightsForRiskTolerance(
    pools: AggregatedPoolData[],
    riskTolerance: 'low' | 'medium' | 'high'
  ): Record<string, number> {
    const weights: Record<string, number> = {};
    const totalPools = pools.length;

    if (riskTolerance === 'low') {
      // Favor stable and hedge pools
      pools.forEach(pool => {
        if (pool.hedgeType === 'stablecoin' || pool.hedgeType === 'hedge') {
          weights[pool.poolId] = 0.35 / 2; // 70% split between stable pools
        } else {
          weights[pool.poolId] = 0.30 / (totalPools - 2); // 30% for others
        }
      });
    } else if (riskTolerance === 'high') {
      // Favor high-yield pools
      pools.forEach(pool => {
        if (pool.riskLevel === 'high') {
          weights[pool.poolId] = 0.50 / 2; // 50% for high risk
        } else if (pool.hedgeType === 'hedge') {
          weights[pool.poolId] = 0.15; // 15% hedge minimum
        } else {
          weights[pool.poolId] = 0.35 / (totalPools - 3);
        }
      });
    } else {
      // Use default balanced weights
      pools.forEach(pool => {
        weights[pool.poolId] = DEFAULT_ALLOCATION_WEIGHTS[pool.poolId] || 0.20;
      });
    }

    return weights;
  }

  /**
   * Apply hedge strategy based on market conditions
   */
  private applyHedgeStrategy(
    pools: AggregatedPoolData[],
    weights: Record<string, number>
  ): Record<string, number> {
    // Check market volatility
    const avgVolatility = pools.reduce((sum, pool) => 
      sum + Math.abs(pool.priceChange24h), 0
    ) / pools.length;

    // If high volatility, increase hedge allocation
    if (avgVolatility > 5) {
      const eurcPool = pools.find(p => p.poolId === 'EURC_USDC');
      if (eurcPool) {
        // Increase EURC allocation by 10% and reduce others proportionally
        const eurcBoost = 0.10;
        const currentEurcWeight = weights['EURC_USDC'] || 0;
        weights['EURC_USDC'] = Math.min(currentEurcWeight + eurcBoost, 0.40);
        
        // Reduce other pools proportionally
        const reduction = eurcBoost / (pools.length - 1);
        pools.forEach(pool => {
          if (pool.poolId !== 'EURC_USDC') {
            weights[pool.poolId] = Math.max((weights[pool.poolId] || 0) - reduction, 0.05);
          }
        });
      }
    }

    // Normalize weights to sum to 1
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    Object.keys(weights).forEach(poolId => {
      weights[poolId] = weights[poolId] / totalWeight;
    });

    return weights;
  }

  /**
   * Calculate expected daily yield for portfolio
   */
  private calculateExpectedDailyYield(pools: AggregatedPoolData[]): number {
    return pools.reduce((total, pool) => {
      const allocation = pool.allocationSuggestion?.amount || 0;
      const dailyYield = (allocation * pool.apy) / 365 / 100;
      return total + dailyYield;
    }, 0);
  }

  /**
   * Assess overall portfolio risk
   */
  private assessPortfolioRisk(pools: AggregatedPoolData[]): 'low' | 'medium' | 'high' {
    const weightedRisk = pools.reduce((total, pool) => {
      const weight = (pool.allocationSuggestion?.percentage || 0) / 100;
      const riskScore = pool.riskLevel === 'low' ? 1 : pool.riskLevel === 'medium' ? 2 : 3;
      return total + (weight * riskScore);
    }, 0);

    if (weightedRisk < 1.5) return 'low';
    if (weightedRisk < 2.5) return 'medium';
    return 'high';
  }

  /**
   * Calculate hedge ratio in portfolio
   */
  private calculateHedgeRatio(pools: AggregatedPoolData[]): number {
    const hedgeAllocation = pools
      .filter(p => p.hedgeType === 'hedge' || p.hedgeType === 'stablecoin')
      .reduce((sum, p) => sum + (p.allocationSuggestion?.percentage || 0), 0);
    
    return hedgeAllocation;
  }

  /**
   * Calculate correlation score (lower is better for diversification)
   */
  private calculateCorrelationScore(pools: AggregatedPoolData[]): number {
    let totalCorrelation = 0;
    let pairCount = 0;

    for (let i = 0; i < pools.length; i++) {
      for (let j = i + 1; j < pools.length; j++) {
        const correlation = POOL_CORRELATIONS[pools[i].poolId]?.[pools[j].poolId] || 0;
        totalCorrelation += Math.abs(correlation);
        pairCount++;
      }
    }

    return pairCount > 0 ? totalCorrelation / pairCount : 0;
  }

  /**
   * Determine trend based on price change
   */
  private determineTrend(priceChange24h: number): 'bull' | 'bear' | 'stable' {
    if (priceChange24h > 2) return 'bull';
    if (priceChange24h < -2) return 'bear';
    return 'stable';
  }

  /**
   * Estimate impermanent loss based on volatility
   */
  private estimateImpermanentLoss(
    priceChange24h: number,
    riskLevel: 'low' | 'medium' | 'high'
  ): number {
    const baseIL = Math.abs(priceChange24h) * 0.1; // Simplified IL calculation
    const riskMultiplier = riskLevel === 'low' ? 0.5 : riskLevel === 'medium' ? 1 : 1.5;
    return -(baseIL * riskMultiplier); // Negative value represents loss
  }
}

// Export singleton instance
export default new PoolDataAggregator();