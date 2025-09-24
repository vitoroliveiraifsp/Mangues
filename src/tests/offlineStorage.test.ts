import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { offlineStorage } from '../utils/offlineStorage';

// Mock IndexedDB for testing
const mockIDBKeyRange = {
  only: (value: any) => ({ only: value }),
  upperBound: (value: any) => ({ upperBound: value }),
  lowerBound: (value: any) => ({ lowerBound: value }),
  bound: (lower: any, upper: any) => ({ bound: [lower, upper] })
};

// @ts-ignore
global.IDBKeyRange = mockIDBKeyRange;

describe('OfflineStorage', () => {
  beforeEach(async () => {
    // Initialize storage before each test
    await offlineStorage.init();
  });

  afterEach(() => {
    // Clean up after each test
    if ('indexedDB' in window) {
      indexedDB.deleteDatabase('ManguesQuizDB');
    }
  });

  it('should store and retrieve offline data', async () => {
    const testData = { test: 'data', score: 100 };
    
    await offlineStorage.storeOfflineData('/api/test', testData, 'pontuacao');
    const unsyncedData = await offlineStorage.getUnsyncedData();
    
    expect(Array.isArray(unsyncedData)).toBe(true);
    expect(unsyncedData.length).toBeGreaterThan(0);
    
    const storedItem = unsyncedData.find(item => item.url === '/api/test');
    expect(storedItem).toBeDefined();
    expect(storedItem?.data).toEqual(testData);
    expect(storedItem?.synced).toBe(false);
  });

  it('should mark data as synced', async () => {
    const testData = { test: 'data' };
    
    await offlineStorage.storeOfflineData('/api/test', testData, 'pontuacao');
    let unsyncedData = await offlineStorage.getUnsyncedData();
    
    const itemId = unsyncedData[0].id;
    expect(itemId).toBeDefined();
    
    await offlineStorage.markAsSynced(itemId!);
    unsyncedData = await offlineStorage.getUnsyncedData();
    
    const syncedItem = unsyncedData.find(item => item.id === itemId);
    expect(syncedItem).toBeUndefined(); // Should not be in unsynced data anymore
  });

  it('should cache and retrieve API data', async () => {
    const testData = { especies: ['caranguejo', 'garça'] };
    
    await offlineStorage.cacheApiData('/api/especies', testData, 3600000);
    const cachedData = await offlineStorage.getCachedApiData('/api/especies');
    
    expect(cachedData).toEqual(testData);
  });

  it('should handle expired cache data', async () => {
    const testData = { test: 'expired' };
    
    // Cache with very short TTL
    await offlineStorage.cacheApiData('/api/test', testData, 1);
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const cachedData = await offlineStorage.getCachedApiData('/api/test');
    expect(cachedData).toBeNull();
  });

  it('should store and retrieve user settings', async () => {
    const settings = {
      language: 'en-US',
      theme: 'dark',
      notifications: true
    };
    
    await offlineStorage.storeUserSettings(settings);
    const retrievedSettings = await offlineStorage.getUserSettings();
    
    expect(retrievedSettings).toEqual(settings);
  });
});