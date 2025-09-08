// BESTPOOL - ORCA DEX Pool Configuration

export interface PoolConfig {
  id: string;
  name: string;
  symbol: string;
  address: string;
  token0: string;
  token1: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  hedgeType: 'bluechip' | 'stablecoin' | 'hedge';
}

export const SUPPORTED_POOLS: Record<string, PoolConfig> = {
  'SOL_USDC': {
    id: 'SOL_USDC',
    name: 'SOL/USDC Pool',
    symbol: 'SOL-USDC',
    address: 'Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE',
    token0: 'SOL',
    token1: 'USDC',
    description: 'Solana native token paired with USDC stablecoin',
    riskLevel: 'high',
    hedgeType: 'bluechip'
  },
  'CBBTC_USDC': {
    id: 'CBBTC_USDC',
    name: 'cbBTC/USDC Pool',
    symbol: 'cbBTC-USDC',
    address: 'HxA6SKW5qA4o12fjVgTpXdq2YnZ5Zv1s7SB4FFomsyLM',
    token0: 'cbBTC',
    token1: 'USDC',
    description: 'Coinbase wrapped Bitcoin paired with USDC',
    riskLevel: 'medium',
    hedgeType: 'bluechip'
  },
  'EURC_USDC': {
    id: 'EURC_USDC',
    name: 'EURC/USDC Pool',
    symbol: 'EURC-USDC',
    address: 'ArisQNcbjXPJD7RgPRvysatX3xcfHPTbcTkfD8kDoZ9i',
    token0: 'EURC',
    token1: 'USDC',
    description: 'Euro Coin paired with USDC - Primary hedge asset',
    riskLevel: 'low',
    hedgeType: 'hedge'
  },
  'USDT_USDC': {
    id: 'USDT_USDC',
    name: 'USDT/USDC Pool',
    symbol: 'USDT-USDC',
    address: '4fuUiYxTQ6QCrdSq9ouBYcTM7bqSwYTSyLueGZLTy4T4',
    token0: 'USDT',
    token1: 'USDC',
    description: 'Tether USD paired with USDC - Low volatility stablecoin pair',
    riskLevel: 'low',
    hedgeType: 'stablecoin'
  },
  'WETH_USDC': {
    id: 'WETH_USDC',
    name: 'WETH/USDC Pool',
    symbol: 'WETH-USDC',
    address: 'AU971DrPyhhrpRnmEBp5pDTWL2ny7nofb5vYBjDJkR2E',
    token0: 'WETH',
    token1: 'USDC',
    description: 'Wrapped Ethereum paired with USDC',
    riskLevel: 'medium',
    hedgeType: 'bluechip'
  }
};

// Get all available pools
export const getAllPools = (): PoolConfig[] => {
  return Object.values(SUPPORTED_POOLS);
};

// Get pool by ID
export const getPoolById = (id: string): PoolConfig | undefined => {
  return SUPPORTED_POOLS[id];
};

// Get pools by risk level
export const getPoolsByRiskLevel = (riskLevel: 'low' | 'medium' | 'high'): PoolConfig[] => {
  return Object.values(SUPPORTED_POOLS).filter(pool => pool.riskLevel === riskLevel);
};

// Get pools by hedge type
export const getPoolsByHedgeType = (hedgeType: 'bluechip' | 'stablecoin' | 'hedge'): PoolConfig[] => {
  return Object.values(SUPPORTED_POOLS).filter(pool => pool.hedgeType === hedgeType);
};

// Pool correlation matrix (for hedge optimization)
export const POOL_CORRELATIONS: Record<string, Record<string, number>> = {
  'SOL_USDC': {
    'CBBTC_USDC': 0.65,    // Moderate positive correlation
    'WETH_USDC': 0.70,     // High correlation with ETH
    'EURC_USDC': -0.15,    // Slight negative correlation (hedge)
    'USDT_USDC': 0.05      // Near zero correlation
  },
  'CBBTC_USDC': {
    'SOL_USDC': 0.65,
    'WETH_USDC': 0.75,     // High correlation with ETH
    'EURC_USDC': -0.10,    // Slight negative correlation (hedge)
    'USDT_USDC': 0.02
  },
  'WETH_USDC': {
    'SOL_USDC': 0.70,
    'CBBTC_USDC': 0.75,    // High correlation with BTC
    'EURC_USDC': -0.12,    // Slight negative correlation (hedge)
    'USDT_USDC': 0.03
  },
  'EURC_USDC': {
    'SOL_USDC': -0.15,     // Primary hedge for SOL
    'CBBTC_USDC': -0.10,   // Primary hedge for BTC
    'WETH_USDC': -0.12,    // Primary hedge for ETH
    'USDT_USDC': 0.85      // High correlation with stablecoin pair
  },
  'USDT_USDC': {
    'SOL_USDC': 0.05,
    'CBBTC_USDC': 0.02,
    'WETH_USDC': 0.03,
    'EURC_USDC': 0.85
  }
};

// Default pool allocation weights for balanced strategy (5 pools)
export const DEFAULT_ALLOCATION_WEIGHTS: Record<string, number> = {
  'SOL_USDC': 0.25,      // 25% - High yield, high risk
  'CBBTC_USDC': 0.20,    // 20% - Medium yield, medium risk  
  'WETH_USDC': 0.20,     // 20% - Medium yield, medium risk
  'EURC_USDC': 0.20,     // 20% - Hedge position
  'USDT_USDC': 0.15      // 15% - Stability anchor
};