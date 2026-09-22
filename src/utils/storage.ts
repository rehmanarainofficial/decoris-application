import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryStorage = new Map<string, string>();

export const SafeStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const val = await AsyncStorage.getItem(key);
      return val ?? memoryStorage.get(key) ?? null;
    } catch (e) {
      return memoryStorage.get(key) ?? null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    memoryStorage.set(key, value);
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      // Ignored if native module is missing until next build
    }
  },

  async removeItem(key: string): Promise<void> {
    memoryStorage.delete(key);
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      // Ignored if native module is missing
    }
  },

  async clear(): Promise<void> {
    memoryStorage.clear();
    try {
      await AsyncStorage.clear();
    } catch (e) {
      // Ignored
    }
  },
};
