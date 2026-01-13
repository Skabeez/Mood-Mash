import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_TOKEN: '@app_user_token',
  USER_PREFERENCES: '@app_user_preferences',
  CACHE_DATA: '@app_cache_data',
};

export const storageService = {
  async getItem<T>(key: string, defaultValue?: T): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error(`Error reading from storage - ${key}:`, error);
      return defaultValue || null;
    }
  },

  async setItem<T>(key: string, value: T): Promise<boolean> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to storage - ${key}:`, error);
      return false;
    }
  },

  async removeItem(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from storage - ${key}:`, error);
      return false;
    }
  },

  async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  },
};

export const userStorage = {
  async getToken(): Promise<string | null> {
    return storageService.getItem<string>(STORAGE_KEYS.USER_TOKEN);
  },

  async setToken(token: string): Promise<boolean> {
    return storageService.setItem(STORAGE_KEYS.USER_TOKEN, token);
  },

  async clearToken(): Promise<boolean> {
    return storageService.removeItem(STORAGE_KEYS.USER_TOKEN);
  },
};

export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    return storageService.getItem<T>(`cache_${key}`);
  },

  async set<T>(key: string, value: T, ttlMinutes?: number): Promise<boolean> {
    const cacheData = {
      value,
      timestamp: Date.now(),
      ttl: ttlMinutes ? ttlMinutes * 60 * 1000 : null,
    };
    return storageService.setItem(`cache_${key}`, cacheData);
  },

  async isExpired(key: string): Promise<boolean> {
    const cacheData = await storageService.getItem<any>(`cache_${key}`);
    if (!cacheData) return true;
    if (!cacheData.ttl) return false;
    return Date.now() - cacheData.timestamp > cacheData.ttl;
  },

  async clear(key: string): Promise<boolean> {
    return storageService.removeItem(`cache_${key}`);
  },
};
