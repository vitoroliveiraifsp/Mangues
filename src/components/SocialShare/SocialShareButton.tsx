import { useState } from 'react';
import { Share2, Twitter, Facebook, Link, MessageCircle } from 'lucide-react';
import { socialService } from '../../services/socialService';
import { useI18n } from '../../hooks/useI18n';

interface SocialShareButtonProps {
  scoreData: {
    game: string;
    score: number;
    category?: string;
    difficulty?: string;
  };
  className?: string;
}

export function SocialShareButton({ scoreData, className = "" }: SocialShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const { t } = useI18n();

  const handleShare = async (platform?: string) => {
    try {
      setIsSharing(true);
      
      if (platform) {
        await shareToSpecificPlatform(platform);
      } else {
        await socialService.shareScore(scoreData);
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Share error:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const shareToSpecificPlatform = async (platform: string) => {
    const shareData = {
      title: `🏆 Consegui ${scoreData.score} pontos no Mundo dos Mangues!`,
      description: `Acabei de jogar ${getGameDisplayName(scoreData.game)} e aprendi muito sobre os mangues! 🌿`,
      url: window.location.href,
      hashtags: ['MundoDosMangues', 'EducacaoAmbiental', 'Sustentabilidade']
    };

    switch (platform) {
      case 'twitter':
        socialService.shareToTwitter(encodeURIComponent(JSON.stringify(shareData)));
        break;
      case 'facebook':
        socialService.shareToFacebook(encodeURIComponent(JSON.stringify(shareData)));
        break;
      case 'whatsapp':
        const whatsappText = `${shareData.title}\n\n${shareData.description}\n\n${shareData.url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank');
        break;
      case 'copy':
        await socialService.copyToClipboard(shareData.url);
        break;
    }
  };

  const getGameDisplayName = (game: string): string => {
    const gameNames = {
      quiz: t('navigation.quiz'),
      memoria: t('navigation.memory'),
      conexoes: t('navigation.connections')
    };
    return gameNames[game as keyof typeof gameNames] || game;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSharing}
        className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 
                   text-white rounded-xl font-bold hover:from-blue-600 hover:to-purple-600 
                   transition-colors disabled:opacity-50 ${className}`}
      >
        <Share2 className="h-5 w-5" />
        <span>{isSharing ? 'Compartilhando...' : 'Compartilhar'}</span>
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 min-w-64">
          <h4 className="font-bold text-gray-800 mb-4 text-center">📤 Compartilhar Resultado</h4>
          
          <div className="space-y-2">
            <button
              onClick={() => handleShare('twitter')}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-blue-50 transition-colors text-left"
            >
              <div className="bg-blue-500 p-2 rounded-full">
                <Twitter className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-800">Twitter</div>
                <div className="text-xs text-gray-500">Compartilhar no Twitter</div>
              </div>
            </button>

            <button
              onClick={() => handleShare('facebook')}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-blue-50 transition-colors text-left"
            >
              <div className="bg-blue-600 p-2 rounded-full">
                <Facebook className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-800">Facebook</div>
                <div className="text-xs text-gray-500">Compartilhar no Facebook</div>
              </div>
            </button>

            <button
              onClick={() => handleShare('whatsapp')}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-green-50 transition-colors text-left"
            >
              <div className="bg-green-500 p-2 rounded-full">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-800">WhatsApp</div>
                <div className="text-xs text-gray-500">Enviar pelo WhatsApp</div>
              </div>
            </button>

            <button
              onClick={() => handleShare('copy')}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
            >
              <div className="bg-gray-500 p-2 rounded-full">
                <Link className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-gray-800">Copiar Link</div>
                <div className="text-xs text-gray-500">Copiar para área de transferência</div>
              </div>
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}