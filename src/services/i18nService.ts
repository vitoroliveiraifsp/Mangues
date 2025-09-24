// Internationalization service for multi-language support
interface Translation {
  [key: string]: string | Translation;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

class I18nService {
  private currentLanguage = 'pt-BR';
  private translations: Map<string, Translation> = new Map();
  private listeners: ((language: string) => void)[] = [];
  
  private supportedLanguages: Language[] = [
    { code: 'pt-BR', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
    { code: 'en-US', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es-ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  ];

  constructor() {
    this.loadSavedLanguage();
    this.loadTranslations();
  }

  private loadSavedLanguage() {
    const saved = localStorage.getItem('mangues_language');
    if (saved && this.supportedLanguages.some(lang => lang.code === saved)) {
      this.currentLanguage = saved;
    } else {
      // Detect browser language
      const browserLang = navigator.language;
      const supported = this.supportedLanguages.find(lang => 
        browserLang.startsWith(lang.code.split('-')[0])
      );
      this.currentLanguage = supported?.code || 'pt-BR';
    }
  }

  private async loadTranslations() {
    // Load translations for current language
    try {
      const translations = await this.fetchTranslations(this.currentLanguage);
      this.translations.set(this.currentLanguage, translations);
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback to Portuguese if loading fails
      if (this.currentLanguage !== 'pt-BR') {
        this.currentLanguage = 'pt-BR';
        await this.loadTranslations();
      }
    }
  }

  private async fetchTranslations(languageCode: string): Promise<Translation> {
    // In a real implementation, this would fetch from your backend or CDN
    // For now, we'll return predefined translations
    const translationsMap: { [key: string]: Translation } = {
      'pt-BR': {
        common: {
          loading: 'Carregando',
          error: 'Erro',
          retry: 'Tentar Novamente',
          back: 'Voltar',
          next: 'Próximo',
          previous: 'Anterior',
          save: 'Salvar',
          cancel: 'Cancelar',
          confirm: 'Confirmar',
          close: 'Fechar'
        },
        navigation: {
          home: 'Início',
          biodiversity: 'Vida no Mangue',
          structure: 'Como Funciona',
          threats: 'Vamos Cuidar',
          games: 'Jogos',
          memory: 'Jogo da Memória',
          connections: 'Conecte Superpoderes',
          quiz: 'Quiz Interativo',
          ranking: 'Ranking',
          contact: 'Equipe'
        },
        games: {
          score: 'Pontuação',
          attempts: 'Tentativas',
          time: 'Tempo',
          pairs: 'Pares',
          correct: 'Corretas',
          difficulty: 'Dificuldade',
          easy: 'Fácil',
          medium: 'Médio',
          hard: 'Difícil'
        },
        multiplayer: {
          createRoom: 'Criar Sala',
          joinRoom: 'Entrar na Sala',
          waitingPlayers: 'Aguardando jogadores',
          ready: 'Pronto',
          start: 'Iniciar',
          roomCode: 'Código da Sala',
          players: 'Jogadores'
        }
      },
      'en-US': {
        common: {
          loading: 'Loading',
          error: 'Error',
          retry: 'Try Again',
          back: 'Back',
          next: 'Next',
          previous: 'Previous',
          save: 'Save',
          cancel: 'Cancel',
          confirm: 'Confirm',
          close: 'Close'
        },
        navigation: {
          home: 'Home',
          biodiversity: 'Mangrove Life',
          structure: 'How It Works',
          threats: 'Let\'s Care',
          games: 'Games',
          memory: 'Memory Game',
          connections: 'Connect Superpowers',
          quiz: 'Interactive Quiz',
          ranking: 'Ranking',
          contact: 'Team'
        },
        games: {
          score: 'Score',
          attempts: 'Attempts',
          time: 'Time',
          pairs: 'Pairs',
          correct: 'Correct',
          difficulty: 'Difficulty',
          easy: 'Easy',
          medium: 'Medium',
          hard: 'Hard'
        },
        multiplayer: {
          createRoom: 'Create Room',
          joinRoom: 'Join Room',
          waitingPlayers: 'Waiting for players',
          ready: 'Ready',
          start: 'Start',
          roomCode: 'Room Code',
          players: 'Players'
        }
      },
      'es-ES': {
        common: {
          loading: 'Cargando',
          error: 'Error',
          retry: 'Intentar de Nuevo',
          back: 'Volver',
          next: 'Siguiente',
          previous: 'Anterior',
          save: 'Guardar',
          cancel: 'Cancelar',
          confirm: 'Confirmar',
          close: 'Cerrar'
        },
        navigation: {
          home: 'Inicio',
          biodiversity: 'Vida del Manglar',
          structure: 'Cómo Funciona',
          threats: 'Vamos a Cuidar',
          games: 'Juegos',
          memory: 'Juego de Memoria',
          connections: 'Conectar Superpoderes',
          quiz: 'Quiz Interactivo',
          ranking: 'Ranking',
          contact: 'Equipo'
        },
        games: {
          score: 'Puntuación',
          attempts: 'Intentos',
          time: 'Tiempo',
          pairs: 'Pares',
          correct: 'Correctas',
          difficulty: 'Dificultad',
          easy: 'Fácil',
          medium: 'Medio',
          hard: 'Difícil'
        },
        multiplayer: {
          createRoom: 'Crear Sala',
          joinRoom: 'Unirse a Sala',
          waitingPlayers: 'Esperando jugadores',
          ready: 'Listo',
          start: 'Iniciar',
          roomCode: 'Código de Sala',
          players: 'Jugadores'
        }
      },
      'fr-FR': {
        common: {
          loading: 'Chargement',
          error: 'Erreur',
          retry: 'Réessayer',
          back: 'Retour',
          next: 'Suivant',
          previous: 'Précédent',
          save: 'Sauvegarder',
          cancel: 'Annuler',
          confirm: 'Confirmer',
          close: 'Fermer'
        },
        navigation: {
          home: 'Accueil',
          biodiversity: 'Vie de la Mangrove',
          structure: 'Comment ça Marche',
          threats: 'Prenons Soin',
          games: 'Jeux',
          memory: 'Jeu de Mémoire',
          connections: 'Connecter les Superpouvoirs',
          quiz: 'Quiz Interactif',
          ranking: 'Classement',
          contact: 'Équipe'
        },
        games: {
          score: 'Score',
          attempts: 'Tentatives',
          time: 'Temps',
          pairs: 'Paires',
          correct: 'Correctes',
          difficulty: 'Difficulté',
          easy: 'Facile',
          medium: 'Moyen',
          hard: 'Difficile'
        },
        multiplayer: {
          createRoom: 'Créer une Salle',
          joinRoom: 'Rejoindre la Salle',
          waitingPlayers: 'En attente de joueurs',
          ready: 'Prêt',
          start: 'Commencer',
          roomCode: 'Code de Salle',
          players: 'Joueurs'
        }
      }
    };

    return translationsMap[languageCode] || translationsMap['pt-BR'];
  }

  // Get translation by key path
  t(keyPath: string, params?: { [key: string]: string | number }): string {
    const translation = this.translations.get(this.currentLanguage);
    if (!translation) return keyPath;

    const keys = keyPath.split('.');
    let value: any = translation;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return keyPath; // Return key if translation not found
      }
    }

    if (typeof value !== 'string') {
      return keyPath;
    }

    // Replace parameters if provided
    if (params) {
      return Object.entries(params).reduce((text, [key, val]) => {
        return text.replace(new RegExp(`{{${key}}}`, 'g'), String(val));
      }, value);
    }

    return value;
  }

  // Change language
  async changeLanguage(languageCode: string): Promise<void> {
    if (!this.supportedLanguages.some(lang => lang.code === languageCode)) {
      throw new Error(`Language ${languageCode} not supported`);
    }

    this.currentLanguage = languageCode;
    localStorage.setItem('mangues_language', languageCode);

    // Load translations if not already loaded
    if (!this.translations.has(languageCode)) {
      const translations = await this.fetchTranslations(languageCode);
      this.translations.set(languageCode, translations);
    }

    // Update document language
    document.documentElement.lang = languageCode;

    // Notify listeners
    this.listeners.forEach(listener => listener(languageCode));
  }

  // Get current language
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  // Get supported languages
  getSupportedLanguages(): Language[] {
    return this.supportedLanguages;
  }

  // Add language change listener
  addLanguageListener(listener: (language: string) => void) {
    this.listeners.push(listener);
  }

  // Remove language change listener
  removeLanguageListener(listener: (language: string) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // Format numbers according to locale
  formatNumber(number: number): string {
    return new Intl.NumberFormat(this.currentLanguage).format(number);
  }

  // Format dates according to locale
  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(this.currentLanguage, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(dateObj);
  }

  // Format relative time
  formatRelativeTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const rtf = new Intl.RelativeTimeFormat(this.currentLanguage, { numeric: 'auto' });
    
    const now = new Date();
    const diffInSeconds = Math.floor((dateObj.getTime() - now.getTime()) / 1000);
    
    if (Math.abs(diffInSeconds) < 60) {
      return rtf.format(diffInSeconds, 'second');
    } else if (Math.abs(diffInSeconds) < 3600) {
      return rtf.format(Math.floor(diffInSeconds / 60), 'minute');
    } else if (Math.abs(diffInSeconds) < 86400) {
      return rtf.format(Math.floor(diffInSeconds / 3600), 'hour');
    } else {
      return rtf.format(Math.floor(diffInSeconds / 86400), 'day');
    }
  }
}

export const i18nService = new I18nService();