import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { usePoolRecommendations } from '../../hooks/usePoolRecommendations';

export default function RecommendationsScreen() {
  const { userPreferences } = useApp();
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);

  const {
    recommendations,
    loading,
    error,
    refresh,
    isConnected,
    lastUpdated,
    priceUpdates
  } = usePoolRecommendations({
    totalInvestment: userPreferences.totalInvestment,
    expectedDailyFeesPercent: userPreferences.expectedDailyFeesPercent,
    selectedPoolIds: userPreferences.selectedPoolIds,
    riskTolerance: userPreferences.riskTolerance,
    autoRefresh: true,
    refreshInterval: 30000
  });

  if (loading && !recommendations) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Carregando recomendações...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={80} color="#ef4444" />
          <Text style={styles.errorTitle}>Erro ao carregar dados</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Mock recommendations for fallback (to be removed in production)
  const mockRecommendations = [
  {
    id: '1',
    poolName: 'SOL/USDC',
    allocation: '$2,500 (25%)',
    priceRange: '$198.50 - $245.30',
    expectedAPY: '12.4%',
    impermanentLoss: '-2.1%',
    volatilityRisk: 'High',
    trend: 'Bull',
    trendStrength: '+15.2%',
    currentPrice: '$221.85',
    liquidity: '$45.2M',
    volume24h: '$12.8M',
    alerts: ['Price approaching upper range', 'High volatility expected'],
  },
  {
    id: '2',
    poolName: 'EURC/USDC',
    allocation: '$2,000 (20%)',
    priceRange: '$1.048 - $1.072',
    expectedAPY: '4.2%',
    impermanentLoss: '-0.3%',
    volatilityRisk: 'Low',
    trend: 'Stable',
    trendStrength: '-0.8%',
    currentPrice: '$1.059',
    liquidity: '$28.5M',
    volume24h: '$3.2M',
    alerts: ['Optimal hedge position', 'Low IL risk'],
  },
  {
    id: '3',
    poolName: 'cbBTC/USDC',
    allocation: '$2,000 (20%)',
    priceRange: '$97,200 - $108,500',
    expectedAPY: '8.7%',
    impermanentLoss: '-1.8%',
    volatilityRisk: 'Medium',
    trend: 'Bull',
    trendStrength: '+8.9%',
    currentPrice: '$102,850',
    liquidity: '$67.8M',
    volume24h: '$18.4M',
    alerts: ['Strong uptrend continues'],
  },
];

  // Use real data if available, fallback to mock data
  const displayData = recommendations || {
    totalInvestment: userPreferences.totalInvestment,
    expectedDailyYield: 42.50,
    expectedDailyYieldPercentage: 0.425,
    portfolioRisk: 'medium' as const,
    pools: mockRecommendations.map(mock => ({
      poolId: mock.id,
      poolName: mock.poolName,
      address: '',
      currentPrice: parseFloat(mock.currentPrice.replace('$', '').replace(',', '')),
      priceChange24h: parseFloat(mock.trendStrength.replace('%', '')),
      liquidity: parseFloat(mock.liquidity.replace('$', '').replace('M', '')) * 1000000,
      volume24h: parseFloat(mock.volume24h.replace('$', '').replace('M', '')) * 1000000,
      apy: parseFloat(mock.expectedAPY.replace('%', '')),
      tvl: parseFloat(mock.liquidity.replace('$', '').replace('M', '')) * 1000000,
      fee: 0.25,
      riskLevel: mock.volatilityRisk.toLowerCase() as 'low' | 'medium' | 'high',
      hedgeType: 'bluechip' as const,
      trend: mock.trend.toLowerCase() as 'bull' | 'bear' | 'stable',
      trendStrength: parseFloat(mock.trendStrength.replace('%', '')),
      impermanentLossEstimate: parseFloat(mock.impermanentLoss.replace('%', '')),
      allocationSuggestion: {
        amount: parseFloat(mock.allocation.split('$')[1].split(' ')[0].replace(',', '')),
        percentage: parseFloat(mock.allocation.split('(')[1].split('%')[0])
      }
    })),
    hedgeRatio: 20,
    correlationScore: 0.3,
    lastUpdated: new Date()
  };

  const onRefresh = React.useCallback(() => {
    refresh();
  }, [refresh]);

  const getTrendColor = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'bull': return '#10b981';
      case 'bear': return '#ef4444';
      case 'stable': return '#6b7280';
      default: return '#64748b';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pool Recommendations</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Ionicons name="refresh" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Strategy Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Strategy Overview</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Allocation:</Text>
            <Text style={styles.summaryValue}>${displayData.totalInvestment.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Expected Daily Yield:</Text>
            <Text style={[styles.summaryValue, { color: '#10b981' }]}>
              ${displayData.expectedDailyYield.toFixed(2)} ({displayData.expectedDailyYieldPercentage.toFixed(3)}%)
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Portfolio Risk:</Text>
            <Text style={[styles.summaryValue, { color: getRiskColor(displayData.portfolioRisk) }]}>
              {displayData.portfolioRisk.charAt(0).toUpperCase() + displayData.portfolioRisk.slice(1)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>WebSocket Status:</Text>
            <Text style={[styles.summaryValue, { color: isConnected ? '#10b981' : '#ef4444' }]}>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Last Updated:</Text>
            <Text style={styles.summaryValue}>
              {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Carregando...'}
            </Text>
          </View>
        </View>

        {/* Recommendations List */}
        {displayData.pools.map((pool) => (
          <View key={pool.poolId} style={styles.recommendationCard}>
            <TouchableOpacity
              onPress={() => 
                setSelectedRecommendation(
                  selectedRecommendation === pool.poolId ? null : pool.poolId
                )
              }
            >
              <View style={styles.cardHeader}>
                <View style={styles.poolInfo}>
                  <Text style={styles.poolName}>{pool.poolName}</Text>
                  <Text style={styles.allocation}>
                    ${pool.allocationSuggestion?.amount.toLocaleString()} ({pool.allocationSuggestion?.percentage.toFixed(1)}%)
                  </Text>
                </View>
                <View style={styles.trendBadge}>
                  <View style={[
                    styles.trendIndicator,
                    { backgroundColor: getTrendColor(pool.trend) }
                  ]}>
                    <Text style={styles.trendText}>{pool.trend.toUpperCase()}</Text>
                  </View>
                  <Text style={[
                    styles.trendStrength,
                    { color: getTrendColor(pool.trend) }
                  ]}>
                    {pool.trendStrength > 0 ? '+' : ''}{pool.trendStrength.toFixed(1)}%
                  </Text>
                </View>
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>APY</Text>
                  <Text style={[styles.metricValue, { color: '#10b981' }]}>
                    {pool.apy.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>IL Risk</Text>
                  <Text style={[styles.metricValue, { color: '#ef4444' }]}>
                    {pool.impermanentLossEstimate.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Risk</Text>
                  <Text style={[
                    styles.metricValue,
                    { color: getRiskColor(pool.riskLevel) }
                  ]}>
                    {pool.riskLevel.charAt(0).toUpperCase() + pool.riskLevel.slice(1)}
                  </Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Price</Text>
                  <Text style={styles.metricValue}>
                    ${pool.currentPrice.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Expanded Details */}
              {selectedRecommendation === pool.poolId && (
                <View style={styles.expandedDetails}>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailTitle}>Position Details</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Recommended Range:</Text>
                      <Text style={styles.detailValue}>
                        ${pool.optimalRange?.lower.toFixed(2)} - ${pool.optimalRange?.upper.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Pool Liquidity:</Text>
                      <Text style={styles.detailValue}>${(pool.liquidity / 1000000).toFixed(1)}M</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>24h Volume:</Text>
                      <Text style={styles.detailValue}>${(pool.volume24h / 1000000).toFixed(1)}M</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Pool Type:</Text>
                      <Text style={styles.detailValue}>{pool.hedgeType}</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailTitle}>Price Updates</Text>
                    {priceUpdates[pool.poolId] && (
                      <View style={styles.alertItem}>
                        <Ionicons name="trending-up" size={16} color="#6366f1" />
                        <Text style={styles.alertText}>
                          Última atualização: {new Date(priceUpdates[pool.poolId].timestamp).toLocaleTimeString()}
                        </Text>
                      </View>
                    )}
                    <View style={styles.alertItem}>
                      <Ionicons name="information-circle" size={16} color="#10b981" />
                      <Text style={styles.alertText}>
                        Pool configurada com hedge estratégico
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ))}

        {/* Update Button */}
        <TouchableOpacity style={styles.updateButton} onPress={onRefresh}>
          <Ionicons name="refresh-circle" size={24} color="#fff" />
          <Text style={styles.updateButtonText}>Update Recommendations</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  recommendationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  poolInfo: {
    flex: 1,
  },
  poolName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  allocation: {
    fontSize: 14,
    color: '#64748b',
  },
  trendBadge: {
    alignItems: 'flex-end',
  },
  trendIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  trendStrength: {
    fontSize: 12,
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  expandedDetails: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 20,
  },
  detailSection: {
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertText: {
    fontSize: 14,
    color: '#f59e0b',
    marginLeft: 8,
    flex: 1,
  },
  updateButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 24,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});