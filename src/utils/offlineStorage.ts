// Sistema de armazenamento offline usando IndexedDB - Version 2.1
interface OfflineData {
  id?: number;
  url: string;
  data: any;
  timestamp: number;
  synced: boolean;
  type: 'pontuacao' | 'quiz_resultado' | 'ranking';
}

interface QuizData {
  categorias: any[];
  questoes: { [categoria: string]: any[] };
  ranking: any[];
  estatisticas: any;
}

class OfflineStorage {
  private dbName = 'ManguesQuizDB';
  private version = 2; // Incremented for new features
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store para dados offline não sincronizados
        if (!db.objectStoreNames.contains('offlineData')) {
          const offlineStore = db.createObjectStore('offlineData', {
            keyPath: 'id',
            autoIncrement: true
          });
          offlineStore.createIndex('synced', 'synced', { unique: false });
          offlineStore.createIndex('type', 'type', { unique: false });
          offlineStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store para cache de dados da API
        if (!db.objectStoreNames.contains('apiCache')) {
          const apiStore = db.createObjectStore('apiCache', { keyPath: 'url' });
          apiStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store para dados do quiz offline
        if (!db.objectStoreNames.contains('quizData')) {
          db.createObjectStore('quizData', { keyPath: 'key' });
        }

        // Store para imagens em cache
        if (!db.objectStoreNames.contains('imageCache')) {
          const imageStore = db.createObjectStore('imageCache', { keyPath: 'url' });
          imageStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // NEW: Store para dados de multiplayer
        if (!db.objectStoreNames.contains('multiplayerCache')) {
          const multiplayerStore = db.createObjectStore('multiplayerCache', { keyPath: 'roomId' });
          multiplayerStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // NEW: Store para configurações de usuário
        if (!db.objectStoreNames.contains('userSettings')) {
          db.createObjectStore('userSettings', { keyPath: 'key' });
        }
      };
    });
  }

  // FIXED: Armazenar dados offline para sincronização posterior
  async storeOfflineData(url: string, data: any, type: OfflineData['type']): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');

      const offlineData: OfflineData = {
        url,
        data,
        timestamp: Date.now(),
        synced: false,
        type
      };

      const request = store.add(offlineData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // FIXED: Recuperar dados offline não sincronizados
  async getUnsyncedData(): Promise<OfflineData[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');

      // CORREÇÃO: Iterar por todos os registros e filtrar por synced = false
      const unsyncedItems: OfflineData[] = [];
      const request = store.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const record = cursor.value as OfflineData;
          // Filtrar apenas registros não sincronizados
          if (record.synced === false) {
            unsyncedItems.push(record);
          }
          cursor.continue();
        } else {
          // Cursor terminou, retornar resultados
          resolve(unsyncedItems);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // FIXED: Marcar dados como sincronizados
  async markAsSynced(id: number): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');

      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.synced = true;
          const putRequest = store.put(data);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Cache de dados da API
  async cacheApiData(url: string, data: any, ttl: number = 3600000): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiCache'], 'readwrite');
      const store = transaction.objectStore('apiCache');

      const cacheData = {
        url,
        data,
        timestamp: Date.now(),
        ttl
      };

      const request = store.put(cacheData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Recuperar dados da API do cache
  async getCachedApiData(url: string): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiCache'], 'readonly');
      const store = transaction.objectStore('apiCache');

      const request = store.get(url);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          const now = Date.now();
          if (now - result.timestamp < result.ttl) {
            resolve(result.data);
          } else {
            // Cache expirado
            this.deleteCachedApiData(url);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Deletar dados da API do cache
  async deleteCachedApiData(url: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiCache'], 'readwrite');
      const store = transaction.objectStore('apiCache');

      const request = store.delete(url);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // NEW: Store multiplayer room data
  async storeMultiplayerRoom(roomId: string, roomData: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['multiplayerCache'], 'readwrite');
      const store = transaction.objectStore('multiplayerCache');

      const data = {
        roomId,
        ...roomData,
        timestamp: Date.now()
      };

      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // NEW: Get multiplayer room data
  async getMultiplayerRoom(roomId: string): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['multiplayerCache'], 'readonly');
      const store = transaction.objectStore('multiplayerCache');

      const request = store.get(roomId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // NEW: Store user settings
  async storeUserSettings(settings: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userSettings'], 'readwrite');
      const store = transaction.objectStore('userSettings');

      const data = {
        key: 'userSettings',
        ...settings,
        timestamp: Date.now()
      };

      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // NEW: Get user settings
  async getUserSettings(): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userSettings'], 'readonly');
      const store = transaction.objectStore('userSettings');

      const request = store.get('userSettings');
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          const { key, timestamp, ...settings } = result;
          resolve(settings);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Armazenar dados do quiz para modo offline
  async storeQuizData(data: QuizData): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['quizData'], 'readwrite');
      const store = transaction.objectStore('quizData');

      const request = store.put({ key: 'quizData', ...data, timestamp: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Recuperar dados do quiz offline
  async getQuizData(): Promise<QuizData | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['quizData'], 'readonly');
      const store = transaction.objectStore('quizData');

      const request = store.get('quizData');
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { key, timestamp, ...data } = result;
          resolve(data as QuizData);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Cache de imagens
  async cacheImage(url: string, blob: Blob): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['imageCache'], 'readwrite');
      const store = transaction.objectStore('imageCache');

      const imageData = {
        url,
        blob,
        timestamp: Date.now()
      };

      const request = store.put(imageData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Recuperar imagem do cache
  async getCachedImage(url: string): Promise<Blob | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['imageCache'], 'readonly');
      const store = transaction.objectStore('imageCache');

      const request = store.get(url);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.blob : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Limpar cache antigo
  async clearOldCache(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) await this.init();

    const cutoff = Date.now() - maxAge;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiCache', 'imageCache'], 'readwrite');

      // Limpar cache da API
      const apiStore = transaction.objectStore('apiCache');
      const apiIndex = apiStore.index('timestamp');
      const apiRequest = apiIndex.openCursor(IDBKeyRange.upperBound(cutoff));

      apiRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      // Limpar cache de imagens
      const imageStore = transaction.objectStore('imageCache');
      const imageIndex = imageStore.index('timestamp');
      const imageRequest = imageIndex.openCursor(IDBKeyRange.upperBound(cutoff));

      imageRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // NOVA FUNÇÃO: Limpar dados sincronizados antigos
  async cleanupSyncedData(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) await this.init();

    const cutoff = Date.now() - maxAge;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const timestampIndex = store.index('timestamp');

      const request = timestampIndex.openCursor(IDBKeyRange.upperBound(cutoff));

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const record = cursor.value;
          // Remover apenas registros que já foram sincronizados
          if (record.synced) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }
}

// Instância singleton
export const offlineStorage = new OfflineStorage();

// Inicializar automaticamente
offlineStorage.init().catch(console.error);