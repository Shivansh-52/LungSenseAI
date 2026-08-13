import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys
const KEYS = {
  WATER: '@water_logs',
  WEIGHT: '@weight_logs',
  LUNG_HISTORY: '@lung_history',
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
  PENDING_EXAM: '@pending_examination',
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

// ── Lung history helpers (preserved) ─────────────────────────────────────────

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

// ── Auth token storage ───────────────────────────────────────────────────────

export const saveAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
  } catch (e) {
    console.error('Error saving auth token', e);
  }
};

export const loadAuthToken = async () => {
  try {
    return await AsyncStorage.getItem(KEYS.AUTH_TOKEN);
  } catch (e) {
    console.error('Error loading auth token', e);
    return null;
  }
};

export const clearAuthToken = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
  } catch (e) {
    console.error('Error clearing auth token', e);
  }
};

// ── User data storage ────────────────────────────────────────────────────────

export const saveUserData = async (userData) => {
  await saveData(KEYS.USER_DATA, userData);
};

export const loadUserData = async () => {
  return await loadData(KEYS.USER_DATA);
};

// ── Pending examination (for guest → login save flow) ────────────────────────

export const savePendingExamination = async (examData) => {
  await saveData(KEYS.PENDING_EXAM, examData);
};

export const loadPendingExamination = async () => {
  return await loadData(KEYS.PENDING_EXAM);
};

export const clearPendingExamination = async () => {
  try {
    await AsyncStorage.removeItem(KEYS.PENDING_EXAM);
  } catch (e) {
    console.error('Error clearing pending examination', e);
  }
};

// ── Clear all auth data (for logout) ─────────────────────────────────────────

export const clearAllAuthData = async () => {
  try {
    await AsyncStorage.multiRemove([KEYS.AUTH_TOKEN, KEYS.USER_DATA, KEYS.PENDING_EXAM]);
  } catch (e) {
    console.error('Error clearing auth data', e);
  }
};
