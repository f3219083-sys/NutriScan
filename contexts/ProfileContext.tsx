// Powered by OnSpace.AI
import React, { createContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  name: string;
  age: number;
  goal: string;
  onboardingComplete: boolean;
}

export interface FoodEntry {
  id: string;
  foodKey: string;
  mealType: string;
  timestamp: number;
  date: string;
}

interface ProfileContextType {
  profile: UserProfile | null;
  foodHistory: FoodEntry[];
  setProfile: (p: UserProfile) => void;
  addFoodEntry: (entry: FoodEntry) => void;
  clearHistory: () => void;
  isLoading: boolean;
}

export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [foodHistory, setFoodHistory] = useState<FoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileStr, historyStr] = await Promise.all([
        AsyncStorage.getItem('user_profile'),
        AsyncStorage.getItem('food_history'),
      ]);
      if (profileStr) setProfileState(JSON.parse(profileStr));
      if (historyStr) setFoodHistory(JSON.parse(historyStr));
    } catch (e) {
      console.log('Load error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const setProfile = async (p: UserProfile) => {
    setProfileState(p);
    await AsyncStorage.setItem('user_profile', JSON.stringify(p));
  };

  const addFoodEntry = async (entry: FoodEntry) => {
    const updated = [entry, ...foodHistory];
    setFoodHistory(updated);
    await AsyncStorage.setItem('food_history', JSON.stringify(updated));
  };

  const clearHistory = async () => {
    setFoodHistory([]);
    await AsyncStorage.removeItem('food_history');
  };

  return (
    <ProfileContext.Provider value={{ profile, foodHistory, setProfile, addFoodEntry, clearHistory, isLoading }}>
      {children}
    </ProfileContext.Provider>
  );
}
