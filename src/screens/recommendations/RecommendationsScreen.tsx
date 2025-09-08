import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Mock recommendation data
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

export default function RecommendationsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

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
            <Text style={styles.summaryValue}>$10,000</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Expected Daily Yield:</Text>
            <Text style={[styles.summaryValue, { color: '#10b981' }]}>$42.50 (0.425%)</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Portfolio Risk:</Text>
            <Text style={[styles.summaryValue, { color: '#f59e0b' }]}>Medium</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Last Updated:</Text>
            <Text style={styles.summaryValue}>2 minutes ago</Text>
          </View>
        </View>

        {/* Recommendations List */}
        {mockRecommendations.map((recommendation) => (
          <View key={recommendation.id} style={styles.recommendationCard}>
            <TouchableOpacity
              onPress={() => 
                setSelectedRecommendation(
                  selectedRecommendation === recommendation.id ? null : recommendation.id
                )
              }
            >
              <View style={styles.cardHeader}>
                <View style={styles.poolInfo}>
                  <Text style={styles.poolName}>{recommendation.poolName}</Text>
                  <Text style={styles.allocation}>{recommendation.allocation}</Text>
                </View>
                <View style={styles.trendBadge}>
                  <View style={[
                    styles.trendIndicator,
                    { backgroundColor: getTrendColor(recommendation.trend) }
                  ]}>
                    <Text style={styles.trendText}>{recommendation.trend.toUpperCase()}</Text>
                  </View>
                  <Text style={[
                    styles.trendStrength,
                    { color: getTrendColor(recommendation.trend) }
                  ]}>
                    {recommendation.trendStrength}
                  </Text>
                </View>
              </View>

              <View style={styles.metricsRow}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>APY</Text>
                  <Text style={[styles.metricValue, { color: '#10b981' }]}>
                    {recommendation.expectedAPY}
                  </Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>IL Risk</Text>
                  <Text style={[styles.metricValue, { color: '#ef4444' }]}>
                    {recommendation.impermanentLoss}
                  </Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Risk</Text>
                  <Text style={[
                    styles.metricValue,
                    { color: getRiskColor(recommendation.volatilityRisk) }
                  ]}>
                    {recommendation.volatilityRisk}
                  </Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Price</Text>
                  <Text style={styles.metricValue}>
                    {recommendation.currentPrice}
                  </Text>
                </View>
              </View>

              {/* Expanded Details */}
              {selectedRecommendation === recommendation.id && (
                <View style={styles.expandedDetails}>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailTitle}>Position Details</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Recommended Range:</Text>
                      <Text style={styles.detailValue}>{recommendation.priceRange}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Pool Liquidity:</Text>
                      <Text style={styles.detailValue}>{recommendation.liquidity}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>24h Volume:</Text>
                      <Text style={styles.detailValue}>{recommendation.volume24h}</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailTitle}>Alerts & Triggers</Text>
                    {recommendation.alerts.map((alert, index) => (
                      <View key={index} style={styles.alertItem}>
                        <Ionicons name="warning" size={16} color="#f59e0b" />
                        <Text style={styles.alertText}>{alert}</Text>
                      </View>
                    ))}
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
});