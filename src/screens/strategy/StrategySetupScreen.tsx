import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllPools } from '../../config/pools';

interface StrategySetupScreenProps {
  navigation?: any;
}

export default function StrategySetupScreen({ navigation }: StrategySetupScreenProps) {
  const [totalVolume, setTotalVolume] = useState('');
  const [expectedDailyFees, setExpectedDailyFees] = useState('');
  const [selectedPools, setSelectedPools] = useState<Record<string, boolean>>({
    SOL_USDC: true,
    CBBTC_USDC: true,
    WETH_USDC: true,
    EURC_USDC: true,
    USDT_USDC: false,
  });

  const pools = getAllPools();

  const handlePoolToggle = (poolId: string) => {
    setSelectedPools(prev => ({
      ...prev,
      [poolId]: !prev[poolId]
    }));
  };

  const handleContinue = () => {
    const selectedPoolIds = Object.keys(selectedPools).filter(id => selectedPools[id]);
    
    if (!totalVolume || !expectedDailyFees) {
      alert('Please fill in all required fields');
      return;
    }

    if (selectedPoolIds.length === 0) {
      alert('Please select at least one pool');
      return;
    }

    // TODO: Save strategy configuration
    console.log('Strategy Configuration:', {
      totalVolume: parseFloat(totalVolume),
      expectedDailyFees: parseFloat(expectedDailyFees),
      selectedPools: selectedPoolIds,
    });

    // Navigate to recommendations
    alert('Strategy saved! Proceeding to recommendations...');
  };

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Setup Your Strategy</Text>
          <Text style={styles.subtitle}>
            Configure your investment parameters and pool preferences
          </Text>
        </View>

        {/* Investment Parameters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Investment Parameters</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Total Volume (USDC)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 10000"
              value={totalVolume}
              onChangeText={setTotalVolume}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Expected 24h Fees (%)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 0.5"
              value={expectedDailyFees}
              onChangeText={setExpectedDailyFees}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Pool Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Pools</Text>
          <Text style={styles.sectionDescription}>
            Choose which ORCA DEX pools you're comfortable providing liquidity to
          </Text>

          {pools.map((pool) => (
            <View key={pool.id} style={styles.poolItem}>
              <View style={styles.poolInfo}>
                <View style={styles.poolHeader}>
                  <Text style={styles.poolName}>{pool.name}</Text>
                  <View style={[
                    styles.riskBadge,
                    { backgroundColor: getRiskLevelColor(pool.riskLevel) }
                  ]}>
                    <Text style={styles.riskText}>{pool.riskLevel.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.poolDescription}>{pool.description}</Text>
                <Text style={styles.poolType}>Type: {pool.hedgeType}</Text>
              </View>
              <Switch
                value={selectedPools[pool.id] || false}
                onValueChange={() => handlePoolToggle(pool.id)}
                trackColor={{ false: '#e2e8f0', true: '#6366f1' }}
                thumbColor={selectedPools[pool.id] ? '#fff' : '#f4f4f5'}
              />
            </View>
          ))}
        </View>

        {/* Strategy Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="information-circle" size={20} color="#6366f1" />
            <Text style={styles.infoText}>
              EURC is recommended as a hedge against blue-chip volatility
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark" size={20} color="#10b981" />
            <Text style={styles.infoText}>
              All recommendations are based on real-time ORCA DEX data
            </Text>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Generate Recommendations</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingVertical: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  poolItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  poolInfo: {
    flex: 1,
    marginRight: 16,
  },
  poolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  poolName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  poolDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
    lineHeight: 18,
  },
  poolType: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  infoSection: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  continueButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});