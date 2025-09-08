import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LoginScreenProps {
  navigation?: any;
}

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement Google OAuth
      console.log('Google login pressed');
      Alert.alert('Coming Soon', 'Google login will be implemented next');
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhantomLogin = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement Phantom wallet connection
      console.log('Phantom login pressed');
      Alert.alert('Coming Soon', 'Phantom wallet login will be implemented next');
    } catch (error) {
      console.error('Phantom login error:', error);
      Alert.alert('Error', 'Wallet connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo and Title */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="analytics" size={80} color="#6366f1" />
          </View>
          <Text style={styles.title}>BESTPOOL</Text>
          <Text style={styles.subtitle}>
            Optimize your ORCA DEX liquidity positions with AI-powered recommendations
          </Text>
        </View>

        {/* Login Options */}
        <View style={styles.loginSection}>
          <Text style={styles.loginTitle}>Get Started</Text>
          
          <TouchableOpacity
            style={[styles.loginButton, styles.googleButton]}
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            <Ionicons name="logo-google" size={24} color="#fff" />
            <Text style={styles.loginButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, styles.phantomButton]}
            onPress={handlePhantomLogin}
            disabled={isLoading}
          >
            <Ionicons name="wallet" size={24} color="#fff" />
            <Text style={styles.loginButtonText}>Connect Phantom Wallet</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
            Your wallet will be used for read-only portfolio tracking only.
          </Text>
        </View>

        {/* Features Preview */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="shield-checkmark" size={24} color="#10b981" />
            <Text style={styles.featureText}>Secure & Read-Only</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="trending-up" size={24} color="#6366f1" />
            <Text style={styles.featureText}>AI-Powered Insights</Text>
          </View>
          <View style={styles.feature}>
            <Ionicons name="notifications" size={24} color="#f59e0b" />
            <Text style={styles.featureText}>Smart Alerts</Text>
          </View>
        </View>
      </View>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#f1f5f9',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  loginSection: {
    marginBottom: 40,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 24,
    textAlign: 'center',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleButton: {
    backgroundColor: '#dc2626',
  },
  phantomButton: {
    backgroundColor: '#7c3aed',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  disclaimer: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 16,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
  },
  feature: {
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
});