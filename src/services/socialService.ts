// Social media integration service
interface SocialPlatform {
  name: string;
  clientId: string;
  redirectUri: string;
  scope: string[];
}

interface ShareData {
  title: string;
  description: string;
  url: string;
  image?: string;
  hashtags?: string[];
}

interface SocialUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  platform: string;
}

class SocialService {
  private platforms: Map<string, SocialPlatform> = new Map();

  constructor() {
    this.initializePlatforms();
  }

  private initializePlatforms() {
    // Configure social platforms (in production, these would come from environment variables)
    this.platforms.set('google', {
      name: 'Google',
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'demo-client-id',
      redirectUri: `${window.location.origin}/auth/google/callback`,
      scope: ['openid', 'profile', 'email']
    });

    this.platforms.set('facebook', {
      name: 'Facebook',
      clientId: import.meta.env.VITE_FACEBOOK_APP_ID || 'demo-app-id',
      redirectUri: `${window.location.origin}/auth/facebook/callback`,
      scope: ['public_profile', 'email']
    });

    this.platforms.set('twitter', {
      name: 'Twitter',
      clientId: import.meta.env.VITE_TWITTER_CLIENT_ID || 'demo-client-id',
      redirectUri: `${window.location.origin}/auth/twitter/callback`,
      scope: ['tweet.read', 'users.read']
    });
  }

  // OAuth login
  async loginWithSocial(platform: string): Promise<SocialUser> {
    const platformConfig = this.platforms.get(platform);
    if (!platformConfig) {
      throw new Error(`Plataforma ${platform} não suportada`);
    }

    return new Promise((resolve, reject) => {
      const authUrl = this.buildAuthUrl(platform, platformConfig);
      
      // Open popup window for OAuth
      const popup = window.open(
        authUrl,
        'social-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        reject(new Error('Popup bloqueado. Permita popups para fazer login.'));
        return;
      }

      // Listen for popup messages
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'social-auth-success') {
          window.removeEventListener('message', messageListener);
          popup.close();
          resolve(event.data.user);
        } else if (event.data.type === 'social-auth-error') {
          window.removeEventListener('message', messageListener);
          popup.close();
          reject(new Error(event.data.error));
        }
      };

      window.addEventListener('message', messageListener);

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          reject(new Error('Login cancelado pelo usuário'));
        }
      }, 1000);
    });
  }

  private buildAuthUrl(platform: string, config: SocialPlatform): string {
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scope.join(' '),
      response_type: 'code',
      state: this.generateState()
    });

    const baseUrls = {
      google: 'https://accounts.google.com/oauth/authorize',
      facebook: 'https://www.facebook.com/v18.0/dialog/oauth',
      twitter: 'https://twitter.com/i/oauth2/authorize'
    };

    const baseUrl = baseUrls[platform as keyof typeof baseUrls];
    return `${baseUrl}?${params.toString()}`;
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Share functionality
  async shareScore(scoreData: {
    game: string;
    score: number;
    category?: string;
    difficulty?: string;
  }): Promise<void> {
    const shareData: ShareData = {
      title: `🏆 Consegui ${scoreData.score} pontos no Mundo dos Mangues!`,
      description: `Acabei de jogar ${this.getGameDisplayName(scoreData.game)} e aprendi muito sobre os mangues! 🌿`,
      url: window.location.href,
      hashtags: ['MundoDosMangues', 'EducacaoAmbiental', 'Sustentabilidade', 'Mangues']
    };

    if (navigator.share) {
      // Use native sharing if available
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.description,
          url: shareData.url
        });
      } catch (error) {
        console.log('Compartilhamento cancelado ou falhou:', error);
      }
    } else {
      // Fallback to social media links
      this.showShareModal(shareData);
    }
  }

  private getGameDisplayName(game: string): string {
    const gameNames = {
      quiz: 'Quiz Interativo',
      memoria: 'Jogo da Memória',
      conexoes: 'Jogo das Conexões'
    };
    return gameNames[game as keyof typeof gameNames] || game;
  }

  private showShareModal(shareData: ShareData) {
    // Create and show share modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
    
    modal.innerHTML = `
      <div class="bg-white rounded-3xl max-w-md w-full p-8">
        <h3 class="text-2xl font-bold text-center mb-6">📤 Compartilhar Resultado</h3>
        <div class="space-y-4">
          <button onclick="window.socialService.shareToTwitter('${encodeURIComponent(JSON.stringify(shareData))}')" 
                  class="w-full bg-blue-500 text-white p-4 rounded-xl font-bold hover:bg-blue-600 transition-colors">
            🐦 Compartilhar no Twitter
          </button>
          <button onclick="window.socialService.shareToFacebook('${encodeURIComponent(JSON.stringify(shareData))}')" 
                  class="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            📘 Compartilhar no Facebook
          </button>
          <button onclick="window.socialService.copyToClipboard('${shareData.url}')" 
                  class="w-full bg-gray-500 text-white p-4 rounded-xl font-bold hover:bg-gray-600 transition-colors">
            📋 Copiar Link
          </button>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                  class="w-full bg-gray-200 text-gray-700 p-4 rounded-xl font-bold hover:bg-gray-300 transition-colors">
            Fechar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Remove modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  shareToTwitter(shareDataJson: string) {
    const shareData: ShareData = JSON.parse(decodeURIComponent(shareDataJson));
    const text = `${shareData.title} ${shareData.description} ${shareData.hashtags?.map(h => `#${h}`).join(' ')}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareData.url)}`;
    window.open(url, '_blank');
  }

  shareToFacebook(shareDataJson: string) {
    const shareData: ShareData = JSON.parse(decodeURIComponent(shareDataJson));
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(shareData.title)}`;
    window.open(url, '_blank');
  }

  async copyToClipboard(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copiado para a área de transferência! 📋');
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      alert('Erro ao copiar link');
    }
  }

  // Get user's social connections
  async getSocialConnections(): Promise<SocialUser[]> {
    // In a real implementation, this would fetch from your backend
    const connections = localStorage.getItem('social_connections');
    return connections ? JSON.parse(connections) : [];
  }

  // Save social connection
  async saveSocialConnection(user: SocialUser): Promise<void> {
    const connections = await this.getSocialConnections();
    const existingIndex = connections.findIndex(c => c.id === user.id && c.platform === user.platform);
    
    if (existingIndex > -1) {
      connections[existingIndex] = user;
    } else {
      connections.push(user);
    }
    
    localStorage.setItem('social_connections', JSON.stringify(connections));
  }

  // Remove social connection
  async removeSocialConnection(platform: string): Promise<void> {
    const connections = await this.getSocialConnections();
    const filtered = connections.filter(c => c.platform !== platform);
    localStorage.setItem('social_connections', JSON.stringify(filtered));
  }
}

// Make service available globally for modal buttons
declare global {
  interface Window {
    socialService: SocialService;
  }
}

export const socialService = new SocialService();
window.socialService = socialService;