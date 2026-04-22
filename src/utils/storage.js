import AsyncStorage from '@react-native-async-storage/async-storage';

// Sử dụng biến toàn cục để giữ dữ liệu trong phiên làm việc hiện tại
// nếu Native module AsyncStorage bị lỗi (thường do chưa rebuild app)
if (!global.memoryStorage) {
  global.memoryStorage = {};
}

const safeAsyncStorage = {
  getItem: async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) return value;
      return global.memoryStorage[key] || null;
    } catch (e) {
      console.warn('AsyncStorage Native Error (getItem):', e.message);
      return global.memoryStorage[key] || null;
    }
  },
  setItem: async (key, value) => {
    try {
      global.memoryStorage[key] = value;
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn('AsyncStorage Native Error (setItem):', e.message);
      // Vẫn lưu vào memory để app chạy được trong session này
      global.memoryStorage[key] = value;
    }
  },
  removeItem: async (key) => {
    try {
      delete global.memoryStorage[key];
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn('AsyncStorage Native Error (removeItem):', e.message);
      delete global.memoryStorage[key];
    }
  },
  clear: async () => {
    try {
      global.memoryStorage = {};
      await AsyncStorage.clear();
    } catch (e) {
      console.warn('AsyncStorage Native Error (clear):', e.message);
      global.memoryStorage = {};
    }
  }
};

export default safeAsyncStorage;
