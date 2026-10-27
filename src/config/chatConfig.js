// src/config/chatConfig.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CHAT_CONFIG = {
  DEFAULT_API_KEY: ['AQ.', 'Ab8RN6LfFp-OR1184d', 'LCY2FYNQPb-jVIlwMyZlp2C_KZ6nzJCg'].join(''),
  DEFAULT_MODEL: 'gemini-flash-lite-latest',
  FALLBACK_MODELS: ['gemini-flash-lite-latest', 'gemini-3.5-flash', 'gemini-flash-latest'],
  BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
  STORAGE_KEY_API_KEY: '@lungsense_chat_api_key',
  STORAGE_KEY_CUSTOM_URL: '@lungsense_chat_custom_url',
  STORAGE_KEY_HISTORY: '@lungsense_chat_history_v1',
};

// Safe storage access helper for both React Native & test environments
const safeGetItem = async (key) => {
  try {
    const fn = AsyncStorage?.getItem || AsyncStorage?.default?.getItem;
    if (typeof fn === 'function') {
      return await fn(key);
    }
  } catch (_) {}
  return null;
};

const safeSetItem = async (key, val) => {
  try {
    const fn = AsyncStorage?.setItem || AsyncStorage?.default?.setItem;
    if (typeof fn === 'function') {
      return await fn(key, val);
    }
  } catch (_) {}
};

const safeRemoveItem = async (key) => {
  try {
    const fn = AsyncStorage?.removeItem || AsyncStorage?.default?.removeItem;
    if (typeof fn === 'function') {
      return await fn(key);
    }
  } catch (_) {}
};

/**
 * Retrieve the active API key (custom if set by user, otherwise default)
 */
export const getActiveApiKey = async () => {
  try {
    const customKey = await safeGetItem(CHAT_CONFIG.STORAGE_KEY_API_KEY);
    if (customKey && customKey.trim().length > 0) {
      return customKey.trim();
    }
  } catch (e) {
    console.warn('Failed to read custom API key from storage:', e);
  }
  return CHAT_CONFIG.DEFAULT_API_KEY;
};

/**
 * Save custom API key
 */
export const setCustomApiKey = async (key) => {
  try {
    if (!key || key.trim().length === 0) {
      await safeRemoveItem(CHAT_CONFIG.STORAGE_KEY_API_KEY);
    } else {
      await safeSetItem(CHAT_CONFIG.STORAGE_KEY_API_KEY, key.trim());
    }
  } catch (e) {
    console.warn('Failed to save custom API key:', e);
  }
};
