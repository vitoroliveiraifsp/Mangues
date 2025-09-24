import { useState, useEffect } from 'react';
import { syncManager } from '../utils/syncManager';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: number | null;
  pendingItems: number;
}

export function SyncStatus() {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: null,
    pendingItems: 0
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const handleStatusChange = (newStatus: SyncStatus) => {
      setStatus(newStatus);
    };

    syncManager.addStatusListener(handleStatusChange);

    return () => {
      syncManager.removeStatusListener(handleStatusChange);
    };
  }, []);

  const handleForceSync = async () => {
    if (status.isOnline && !status.isSyncing) {
      try {
        await syncManager.forcSync();
      } catch (error) {
        console.error('Erro na sincronização forçada:', error);
      }
    }
  };

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Nunca';
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}min atrás`;
    return 'Agora mesmo';
  };

  const getStatusIcon = () => {
    if (status.isSyncing) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    }
    
    if (!status.isOnline) {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }
    
    if (status.pendingItems > 0) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
    
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (status.isSyncing) return 'Sincronizando...';
    if (!status.isOnline) return 'Offline';
    if (status.pendingItems > 0) return `${status.pendingItems} pendente(s)`;
    return 'Sincronizado';
  };

  const getStatusColor = () => {
    if (status.isSyncing) return 'bg-blue-50 border-blue-200';
    if (!status.isOnline) return 'bg-red-50 border-red-200';
    if (status.pendingItems > 0) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  return (
    <div className="fixed top-4 right-4 z-40">
      <div
        className={`flex items-center space-x-2 px-3 py-2 rounded-full border-2 cursor-pointer 
                   transition-all duration-300 hover:shadow-md ${getStatusColor()}`}
        onClick={() => setShowDetails(!showDetails)}
      >
        {getStatusIcon()}
        <span className="text-sm font-medium text-gray-700">
          {getStatusText()}
        </span>
        {status.isOnline && (
          <Wifi className="h-4 w-4 text-green-500" />
        )}
      </div>

      {/* Detalhes expandidos */}
      {showDetails && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 min-w-64">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Status de Sincronização</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Conexão:</span>
                <div className="flex items-center space-x-1">
                  {status.isOnline ? (
                    <>
                      <Wifi className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 font-medium">Online</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 text-red-500" />
                      <span className="text-red-600 font-medium">Offline</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Itens pendentes:</span>
                <span className={`font-medium ${
                  status.pendingItems > 0 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {status.pendingItems}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Última sync:</span>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-700">
                    {formatLastSync(status.lastSync)}
                  </span>
                </div>
              </div>
            </div>

            {status.isOnline && !status.isSyncing && (
              <button
                onClick={handleForceSync}
                className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 
                         text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 
                         transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Sincronizar Agora</span>
              </button>
            )}

            {!status.isOnline && (
              <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-700 leading-relaxed">
                  💡 Seus dados estão sendo salvos localmente e serão sincronizados 
                  automaticamente quando a conexão for restaurada.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}