import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserPreferences {
  totalInvestment: number;
  expectedDailyFeesPercent: number;
  selectedPoolIds: string[];
  riskTolerance: 'low' | 'medium' | 'high';
}

interface UserProfile {
  email?: string;
  walletAddress?: string;
  isAuthenticated: boolean;
  hasCompletedSetup: boolean;
}

interface AppContextType {
  // User profile
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  
  // User preferences
  userPreferences: UserPreferences;
  setUserPreferences: (prefs: UserPreferences) => void;
  
  // Auth functions
  login: (email: string) => Promise<void>;
  connectWallet: (address: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Setup functions
  completeSetup: () => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  
  // Loading states
  isLoading: boolean;
}

const defaultPreferences: UserPreferences = {
  totalInvestment: 10000,
  expectedDailyFeesPercent: 0.5,
  selectedPoolIds: ['SOL_USDC', 'CBBTC_USDC', 'WETH_USDC', 'EURC_USDC'],
  riskTolerance: 'medium'
};

const defaultProfile: UserProfile = {
  isAuthenticated: false,
  hasCompletedSetup: false
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    setIsLoading(true);
    try {
      // Load user profile
      const savedProfile = await AsyncStorage.getItem('user_profile');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }

      // Load user preferences
      const savedPreferences = await AsyncStorage.getItem('user_preferences');
      if (savedPreferences) {
        setUserPreferences(JSON.parse(savedPreferences));
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserProfile = async (profile: UserProfile) => {
    try {
      await AsyncStorage.setItem('user_profile', JSON.stringify(profile));
      setUserProfile(profile);
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  };

  const saveUserPreferences = async (prefs: UserPreferences) => {
    try {
      await AsyncStorage.setItem('user_preferences', JSON.stringify(prefs));
      setUserPreferences(prefs);
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  };

  const login = async (email: string) => {
    const updatedProfile: UserProfile = {
      ...userProfile,
      email,
      isAuthenticated: true
    };
    await saveUserProfile(updatedProfile);
  };

  const connectWallet = async (address: string) => {
    const updatedProfile: UserProfile = {
      ...userProfile,
      walletAddress: address,
      isAuthenticated: true
    };
    await saveUserProfile(updatedProfile);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['user_profile', 'user_preferences']);
    setUserProfile(defaultProfile);
    setUserPreferences(defaultPreferences);
  };

  const completeSetup = async () => {
    const updatedProfile: UserProfile = {
      ...userProfile,
      hasCompletedSetup: true
    };
    await saveUserProfile(updatedProfile);
  };

  const updatePreferences = async (prefs: Partial<UserPreferences>) => {
    const updatedPreferences: UserPreferences = {
      ...userPreferences,
      ...prefs
    };
    await saveUserPreferences(updatedPreferences);
  };

  const value: AppContextType = {
    userProfile,
    setUserProfile: saveUserProfile,
    userPreferences,
    setUserPreferences: saveUserPreferences,
    login,
    connectWallet,
    logout,
    completeSetup,
    updatePreferences,
    isLoading
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}