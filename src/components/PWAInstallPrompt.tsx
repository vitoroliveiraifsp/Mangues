import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    checkInstalled();

    // Escutar evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar prompt após um delay (melhor UX)
      setTimeout(() => {
        if (!isInstalled) {
          setShowPrompt(true);
        }
      }, 3000);
    };

    // Escutar quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      
      // Mostrar notificação de sucesso
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification('Mundo dos Mangues Instalado!', {
            body: 'Agora você pode acessar o app mesmo offline!',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: 'pwa-installed'
          });
        });
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA instalado pelo usuário');
      } else {
        console.log('Usuário recusou a instalação');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Erro ao instalar PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Não mostrar novamente nesta sessão
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Não mostrar se já está instalado ou foi dispensado
  if (isInstalled || !showPrompt || sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 transform transition-all duration-300 animate-slide-up">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Download className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Instalar App</h3>
              <p className="text-sm text-gray-600">Mundo dos Mangues</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-gray-700 text-sm mb-4 leading-relaxed">
          Instale nosso app para ter acesso rápido e funcionar mesmo offline!
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div className="flex items-center space-x-2 text-gray-600">
            <Smartphone className="h-4 w-4 text-blue-500" />
            <span>Funciona offline</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Monitor className="h-4 w-4 text-green-500" />
            <span>Acesso rápido</span>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-xl font-medium 
                     hover:bg-gray-200 transition-colors text-sm"
          >
            Agora não
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 
                     text-white rounded-xl font-medium hover:from-green-600 hover:to-blue-600 
                     transition-colors text-sm flex items-center justify-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Instalar</span>
          </button>
        </div>
      </div>
    </div>
  );
}