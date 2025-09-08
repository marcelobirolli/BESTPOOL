import { EventEmitter } from 'events';
import { Connection, PublicKey } from '@solana/web3.js';
import { SUPPORTED_POOLS } from '../config/pools';

export interface PriceUpdate {
  poolId: string;
  poolAddress: string;
  price: number;
  timestamp: number;
  change: number;
}

export interface VolumeUpdate {
  poolId: string;
  poolAddress: string;
  volume24h: number;
  timestamp: number;
}

class PriceWebSocketService extends EventEmitter {
  private connection: Connection;
  private subscriptions: Map<string, number> = new Map();
  private priceUpdateInterval: NodeJS.Timeout | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor() {
    super();
    const rpcUrl = process.env.EXPO_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(rpcUrl, {
      wsEndpoint: rpcUrl.replace('https', 'wss'),
      commitment: 'confirmed'
    });
  }

  /**
   * Connect to WebSocket and start monitoring
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('WebSocket already connected');
      return;
    }

    try {
      // Subscribe to all pool accounts
      await this.subscribeToPoolAccounts();
      
      // Start price update simulation (replace with real WebSocket in production)
      this.startPriceUpdateSimulation();
      
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected');
      
      console.log('WebSocket connected successfully');
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleConnectionError();
    }
  }

  /**
   * Disconnect WebSocket
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) return;

    try {
      // Unsubscribe from all accounts
      for (const [poolId, subscriptionId] of this.subscriptions.entries()) {
        await this.connection.removeAccountChangeListener(subscriptionId);
      }
      this.subscriptions.clear();

      // Stop price update simulation
      if (this.priceUpdateInterval) {
        clearInterval(this.priceUpdateInterval);
        this.priceUpdateInterval = null;
      }

      this.isConnected = false;
      this.emit('disconnected');
      
      console.log('WebSocket disconnected');
    } catch (error) {
      console.error('WebSocket disconnect error:', error);
    }
  }

  /**
   * Subscribe to specific pools for updates
   */
  async subscribeToPools(poolIds: string[]): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    for (const poolId of poolIds) {
      const poolConfig = SUPPORTED_POOLS[poolId];
      if (!poolConfig) continue;

      // Check if already subscribed
      if (this.subscriptions.has(poolId)) continue;

      try {
        const pubkey = new PublicKey(poolConfig.address);
        
        // Subscribe to account changes (simplified - actual implementation would decode pool data)
        const subscriptionId = this.connection.onAccountChange(
          pubkey,
          (accountInfo) => {
            this.handleAccountChange(poolId, accountInfo);
          },
          'confirmed'
        );

        this.subscriptions.set(poolId, subscriptionId);
        console.log(`Subscribed to pool ${poolId}`);
      } catch (error) {
        console.error(`Error subscribing to pool ${poolId}:`, error);
      }
    }
  }

  /**
   * Unsubscribe from specific pools
   */
  async unsubscribeFromPools(poolIds: string[]): Promise<void> {
    for (const poolId of poolIds) {
      const subscriptionId = this.subscriptions.get(poolId);
      if (!subscriptionId) continue;

      try {
        await this.connection.removeAccountChangeListener(subscriptionId);
        this.subscriptions.delete(poolId);
        console.log(`Unsubscribed from pool ${poolId}`);
      } catch (error) {
        console.error(`Error unsubscribing from pool ${poolId}:`, error);
      }
    }
  }

  /**
   * Subscribe to all supported pool accounts
   */
  private async subscribeToPoolAccounts(): Promise<void> {
    const poolIds = Object.keys(SUPPORTED_POOLS);
    await this.subscribeToPools(poolIds);
  }

  /**
   * Handle account changes (pool updates)
   */
  private handleAccountChange(poolId: string, accountInfo: any): void {
    // In production, decode the account data to get actual pool state
    // For now, we'll emit a simulated update
    console.log(`Pool ${poolId} account changed`);
    
    // Emit update event
    this.emit('poolUpdate', {
      poolId,
      timestamp: Date.now(),
      accountInfo
    });
  }

  /**
   * Simulate price updates (replace with actual WebSocket data in production)
   */
  private startPriceUpdateSimulation(): void {
    if (this.priceUpdateInterval) return;

    // Mock price data for simulation
    const basePrices: Record<string, number> = {
      'SOL_USDC': 221.85,
      'CBBTC_USDC': 102850,
      'WETH_USDC': 3850,
      'EURC_USDC': 1.059,
      'USDT_USDC': 1.0001
    };

    // Update prices every 5 seconds
    this.priceUpdateInterval = setInterval(() => {
      for (const [poolId, poolConfig] of Object.entries(SUPPORTED_POOLS)) {
        if (!this.subscriptions.has(poolId)) continue;

        const basePrice = basePrices[poolId] || 100;
        
        // Generate random price movement (±0.5%)
        const change = (Math.random() - 0.5) * 0.01;
        const newPrice = basePrice * (1 + change);

        const priceUpdate: PriceUpdate = {
          poolId,
          poolAddress: poolConfig.address,
          price: newPrice,
          timestamp: Date.now(),
          change: change * 100
        };

        this.emit('priceUpdate', priceUpdate);

        // Also emit volume updates occasionally
        if (Math.random() > 0.7) {
          const volumeUpdate: VolumeUpdate = {
            poolId,
            poolAddress: poolConfig.address,
            volume24h: Math.random() * 10000000 + 1000000,
            timestamp: Date.now()
          };

          this.emit('volumeUpdate', volumeUpdate);
        }
      }
    }, 5000);
  }

  /**
   * Handle connection errors and attempt reconnection
   */
  private handleConnectionError(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('error', new Error('Unable to establish WebSocket connection'));
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(`Attempting reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Get current subscription status
   */
  getSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Check if connected
   */
  isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Send alert for significant price movement
   */
  private checkPriceAlert(priceUpdate: PriceUpdate): void {
    // Check if price change exceeds threshold (e.g., 5%)
    if (Math.abs(priceUpdate.change) > 5) {
      this.emit('priceAlert', {
        poolId: priceUpdate.poolId,
        message: `Significant price movement detected: ${priceUpdate.change.toFixed(2)}%`,
        severity: Math.abs(priceUpdate.change) > 10 ? 'high' : 'medium',
        timestamp: priceUpdate.timestamp
      });
    }
  }

  /**
   * Monitor for volatility events
   */
  monitorVolatility(poolId: string, threshold: number = 5): void {
    const priceHistory: number[] = [];
    const historyLimit = 20; // Keep last 20 price points

    this.on('priceUpdate', (update: PriceUpdate) => {
      if (update.poolId !== poolId) return;

      priceHistory.push(update.price);
      if (priceHistory.length > historyLimit) {
        priceHistory.shift();
      }

      if (priceHistory.length >= 5) {
        const volatility = this.calculateVolatility(priceHistory);
        
        if (volatility > threshold) {
          this.emit('volatilityAlert', {
            poolId,
            volatility,
            message: `High volatility detected: ${volatility.toFixed(2)}%`,
            timestamp: Date.now()
          });
        }
      }
    });
  }

  /**
   * Calculate price volatility
   */
  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;

    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);

    return stdDev * 100; // Return as percentage
  }
}

// Export singleton instance
export default new PriceWebSocketService();