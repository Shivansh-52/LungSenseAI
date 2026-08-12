import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys
const KEYS = {
  WATER: '@water_logs',
  WEIGHT: '@weight_logs',
  LUNG_HISTORY: '@lung_history',
};

// Generic save
export const saveData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.error('Error saving data to local storage', e);
  }
};

// Generic load
export const loadData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error loading data from local storage', e);
    return null;
  }
};

// Specific helpers
export const saveLungHistory = async (historyArray) => {
  await saveData(KEYS.LUNG_HISTORY, historyArray);
};

export const loadLungHistory = async () => {
  const data = await loadData(KEYS.LUNG_HISTORY);
  return data || [];
};

export const addWaterLog = async (amountInLiters) => {
  // In a real app, you'd store by date. Here we just keep a running total or simple log.
  // For the prototype, we'll let the screens handle the logic and just use saveData/loadData.
};
