import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalysisResult } from '../types';

const HISTORY_KEY = '@news_detector_history';

export interface HistoryItem {
  id: string;
  message: string;
  result: AnalysisResult;
  timestamp: number;
}

export const saveToHistory = async (message: string, result: AnalysisResult) => {
  try {
    const existing = await getHistory();
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      message,
      result,
      timestamp: Date.now(),
    };
    const updated = [newItem, ...existing].slice(0, 20); // Keep last 20
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save history', e);
  }
};

export const getHistory = async (): Promise<HistoryItem[]> => {
  try {
    const data = await AsyncStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

export const clearHistory = async () => {
  await AsyncStorage.removeItem(HISTORY_KEY);
};
