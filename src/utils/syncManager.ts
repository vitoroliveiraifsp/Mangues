// Gerenciador de sincronização online/offline
import { offlineStorage } from './offlineStorage';

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: number | null;
  pendingItems: number;
}

class SyncManager {
  private listeners: ((status: SyncStatus) => void)[] = [];
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: null,
    pendingItems: 0
  };

  constructor() {
    this.init();
  }

  private init() {
    // Escutar mudanças de conectividade
    window.addEventListener('online', () => {
      this.updateOnlineStatus(true);
      this.syncWhenOnline();
    });

    window.addEventListener('offline', () => {
      this.updateOnlineStatus(false);
    });

    // Verificar dados pendentes na inicialização
    this.updatePendingCount();

    // Sincronizar periodicamente quando online
    setInterval(() => {
      if (this.syncStatus.isOnline && !this.syncStatus.isSyncing) {
        this.syncWhenOnline();
      }
    }, 30000); // A cada 30 segundos
  }

  private updateOnlineStatus(isOnline: boolean) {
    this.syncStatus.isOnline = isOnline;
    this.notifyListeners();
  }

  private async updatePendingCount() {
    try {
      const unsyncedData = await offlineStorage.getUnsyncedData();
      this.syncStatus.pendingItems = unsyncedData.length;
      this.notifyListeners();
    } catch (error) {
      console.error('Erro ao atualizar contagem de itens pendentes:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.syncStatus));
  }

  // Adicionar listener para mudanças de status
  addStatusListener(listener: (status: SyncStatus) => void) {
    this.listeners.push(listener);
    // Notificar imediatamente com o status atual
    listener(this.syncStatus);
  }

  // Remover listener
  removeStatusListener(listener: (status: SyncStatus) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // Sincronizar dados quando online
  async syncWhenOnline(): Promise<boolean> {
    if (!this.syncStatus.isOnline || this.syncStatus.isSyncing) {
      return false;
    }

    this.syncStatus.isSyncing = true;
    this.notifyListeners();

    try {
      const unsyncedData = await offlineStorage.getUnsyncedData();
      let successCount = 0;

      for (const item of unsyncedData) {
        try {
          const success = await this.syncItem(item);
          if (success) {
            await offlineStorage.markAsSynced(item.id!);
            successCount++;
          }
        } catch (error) {
          console.error('Erro ao sincronizar item:', error);
        }
      }

      this.syncStatus.lastSync = Date.now();
      await this.updatePendingCount();

      console.log(`Sincronização concluída: ${successCount}/${unsyncedData.length} itens`);
      return successCount === unsyncedData.length;

    } catch (error) {
      console.error('Erro na sincronização:', error);
      return false;
    } finally {
      this.syncStatus.isSyncing = false;
      this.notifyListeners();
    }
  }

  // Sincronizar um item específico
  private async syncItem(item: any): Promise<boolean> {
    try {
      const response = await fetch(item.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item.data)
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao sincronizar item:', error);
      return false;
    }
  }

  // Forçar sincronização manual
  async forcSync(): Promise<boolean> {
    if (!this.syncStatus.isOnline) {
      throw new Error('Não é possível sincronizar offline');
    }

    return this.syncWhenOnline();
  }

  // Obter status atual
  getStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // Verificar se há dados pendentes
  hasPendingData(): boolean {
    return this.syncStatus.pendingItems > 0;
  }

  // Armazenar dados para sincronização posterior
  async storeForSync(url: string, data: any, type: 'pontuacao' | 'quiz_resultado' | 'ranking'): Promise<void> {
    await offlineStorage.storeOfflineData(url, data, type);
    await this.updatePendingCount();
  }
}

// Instância singleton
export const syncManager = new SyncManager();