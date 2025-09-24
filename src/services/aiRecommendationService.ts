// AI-powered recommendation service for personalized learning
interface UserProfile {
  id: string;
  preferences: {
    favoriteCategories: string[];
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
    gamePreferences: string[];
  };
  performance: {
    averageScore: number;
    strongCategories: string[];
    weakCategories: string[];
    playTime: number;
    completionRate: number;
  };
  engagement: {
    sessionFrequency: number;
    averageSessionLength: number;
    lastActivity: string;
    streakDays: number;
  };
}

interface Recommendation {
  id: string;
  type: 'content' | 'game' | 'challenge' | 'review';
  title: string;
  description: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  estimatedTime: number; // in minutes
  difficulty: string;
  action: {
    type: 'navigate' | 'start_game' | 'watch_video' | 'read_content';
    target: string;
    params?: any;
  };
  metadata: {
    confidence: number; // 0-1
    tags: string[];
    prerequisites?: string[];
  };
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  totalSteps: number;
  completedSteps: number;
  estimatedDuration: number; // in minutes
  difficulty: string;
  steps: LearningStep[];
}

interface LearningStep {
  id: string;
  title: string;
  type: 'content' | 'quiz' | 'game' | 'video';
  isCompleted: boolean;
  unlocked: boolean;
  requirements?: string[];
}

class AIRecommendationService {
  private userProfiles: Map<string, UserProfile> = new Map();
  private recommendations: Map<string, Recommendation[]> = new Map();
  private learningPaths: Map<string, LearningPath> = new Map();

  async initialize() {
    await this.loadUserData();
    this.initializeLearningPaths();
    console.log('🤖 AI Recommendation service initialized');
  }

  private async loadUserData() {
    try {
      const stored = localStorage.getItem('mangues_ai_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.userProfiles = new Map(data.profiles || []);
        this.recommendations = new Map(data.recommendations || []);
        this.learningPaths = new Map(data.learningPaths || []);
      }
    } catch (error) {
      console.error('Error loading AI data:', error);
    }
  }

  private saveData() {
    try {
      const data = {
        profiles: Array.from(this.userProfiles.entries()),
        recommendations: Array.from(this.recommendations.entries()),
        learningPaths: Array.from(this.learningPaths.entries()),
        lastUpdate: Date.now()
      };
      localStorage.setItem('mangues_ai_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving AI data:', error);
    }
  }

  private initializeLearningPaths() {
    const paths: LearningPath[] = [
      {
        id: 'beginner_explorer',
        title: 'Explorador Iniciante dos Mangues',
        description: 'Jornada perfeita para quem está começando a descobrir o mundo dos mangues',
        totalSteps: 8,
        completedSteps: 0,
        estimatedDuration: 45,
        difficulty: 'Fácil',
        steps: [
          { id: 'intro_video', title: 'Vídeo: O que são Mangues?', type: 'video', isCompleted: false, unlocked: true },
          { id: 'biodiversity_content', title: 'Conhecer os Animais', type: 'content', isCompleted: false, unlocked: false },
          { id: 'easy_quiz', title: 'Quiz Fácil: Vida no Mangue', type: 'quiz', isCompleted: false, unlocked: false },
          { id: 'memory_easy', title: 'Jogo da Memória Fácil', type: 'game', isCompleted: false, unlocked: false },
          { id: 'structure_content', title: 'Como o Mangue Funciona', type: 'content', isCompleted: false, unlocked: false },
          { id: 'connections_intro', title: 'Primeiras Conexões', type: 'game', isCompleted: false, unlocked: false },
          { id: 'threats_content', title: 'Aprender sobre Ameaças', type: 'content', isCompleted: false, unlocked: false },
          { id: 'final_challenge', title: 'Desafio Final do Explorador', type: 'quiz', isCompleted: false, unlocked: false }
        ]
      },
      {
        id: 'eco_champion',
        title: 'Campeão Ecológico',
        description: 'Para quem quer se tornar um verdadeiro defensor dos mangues',
        totalSteps: 12,
        completedSteps: 0,
        estimatedDuration: 90,
        difficulty: 'Médio',
        steps: [
          { id: 'advanced_biodiversity', title: 'Biodiversidade Avançada', type: 'content', isCompleted: false, unlocked: true },
          { id: 'ecosystem_video', title: 'Vídeo: Ecossistemas Complexos', type: 'video', isCompleted: false, unlocked: false },
          { id: 'medium_quiz', title: 'Quiz Médio: Estrutura', type: 'quiz', isCompleted: false, unlocked: false },
          { id: 'memory_medium', title: 'Memória Nível Médio', type: 'game', isCompleted: false, unlocked: false },
          { id: 'conservation_deep', title: 'Conservação Profunda', type: 'content', isCompleted: false, unlocked: false },
          { id: 'connections_advanced', title: 'Conexões Avançadas', type: 'game', isCompleted: false, unlocked: false },
          { id: 'climate_impact', title: 'Impacto Climático', type: 'content', isCompleted: false, unlocked: false },
          { id: 'restoration_video', title: 'Vídeo: Restauração de Mangues', type: 'video', isCompleted: false, unlocked: false },
          { id: 'hard_quiz', title: 'Quiz Difícil: Conservação', type: 'quiz', isCompleted: false, unlocked: false },
          { id: 'multiplayer_challenge', title: 'Desafio Multiplayer', type: 'game', isCompleted: false, unlocked: false },
          { id: 'research_project', title: 'Projeto de Pesquisa', type: 'content', isCompleted: false, unlocked: false },
          { id: 'champion_certification', title: 'Certificação de Campeão', type: 'quiz', isCompleted: false, unlocked: false }
        ]
      }
    ];

    paths.forEach(path => this.learningPaths.set(path.id, path));
  }

  async generateRecommendations(userId: string): Promise<Recommendation[]> {
    const profile = await this.getUserProfile(userId);
    if (!profile) return [];

    const recommendations: Recommendation[] = [];

    // Content-based recommendations
    recommendations.push(...this.getContentRecommendations(profile));
    
    // Performance-based recommendations
    recommendations.push(...this.getPerformanceRecommendations(profile));
    
    // Engagement-based recommendations
    recommendations.push(...this.getEngagementRecommendations(profile));
    
    // Difficulty progression recommendations
    recommendations.push(...this.getDifficultyRecommendations(profile));

    // Sort by priority and confidence
    const sortedRecommendations = recommendations
      .sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.metadata.confidence - a.metadata.confidence;
      })
      .slice(0, 10); // Limit to top 10

    this.recommendations.set(userId, sortedRecommendations);
    this.saveData();

    return sortedRecommendations;
  }

  private getContentRecommendations(profile: UserProfile): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Recommend weak categories for improvement
    profile.performance.weakCategories.forEach(category => {
      recommendations.push({
        id: `content_${category}_${Date.now()}`,
        type: 'content',
        title: `Revisar: ${this.getCategoryDisplayName(category)}`,
        description: `Melhore seus conhecimentos em ${category} com conteúdo personalizado`,
        reason: 'Área identificada para melhoria baseada no seu desempenho',
        priority: 'high',
        category,
        estimatedTime: 15,
        difficulty: profile.preferences.difficultyLevel,
        action: {
          type: 'navigate',
          target: `/${category}`
        },
        metadata: {
          confidence: 0.9,
          tags: ['improvement', 'content', category]
        }
      });
    });

    // Recommend favorite categories for reinforcement
    profile.preferences.favoriteCategories.forEach(category => {
      recommendations.push({
        id: `advanced_${category}_${Date.now()}`,
        type: 'content',
        title: `Aprofundar: ${this.getCategoryDisplayName(category)}`,
        description: `Explore conteúdo avançado em sua categoria favorita`,
        reason: 'Baseado nas suas preferências e bom desempenho',
        priority: 'medium',
        category,
        estimatedTime: 20,
        difficulty: 'advanced',
        action: {
          type: 'navigate',
          target: `/${category}`,
          params: { level: 'advanced' }
        },
        metadata: {
          confidence: 0.8,
          tags: ['favorite', 'advanced', category]
        }
      });
    });

    return recommendations;
  }

  private getPerformanceRecommendations(profile: UserProfile): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Recommend easier content if struggling
    if (profile.performance.averageScore < 500) {
      recommendations.push({
        id: `easier_content_${Date.now()}`,
        type: 'game',
        title: 'Jogo da Memória Fácil',
        description: 'Pratique com um jogo mais simples para ganhar confiança',
        reason: 'Recomendado para construir uma base sólida de conhecimento',
        priority: 'high',
        category: 'memoria',
        estimatedTime: 10,
        difficulty: 'easy',
        action: {
          type: 'start_game',
          target: '/jogo-da-memoria',
          params: { difficulty: 'facil' }
        },
        metadata: {
          confidence: 0.95,
          tags: ['confidence-building', 'easy', 'practice']
        }
      });
    }

    // Recommend challenge if performing well
    if (profile.performance.averageScore > 800) {
      recommendations.push({
        id: `challenge_${Date.now()}`,
        type: 'challenge',
        title: 'Desafio Avançado dos Mangues',
        description: 'Teste seus conhecimentos com nosso desafio mais difícil',
        reason: 'Seu excelente desempenho indica que você está pronto para desafios maiores',
        priority: 'medium',
        category: 'quiz',
        estimatedTime: 25,
        difficulty: 'hard',
        action: {
          type: 'start_game',
          target: '/quiz',
          params: { difficulty: 'dificil', questions: 15 }
        },
        metadata: {
          confidence: 0.85,
          tags: ['challenge', 'advanced', 'achievement']
        }
      });
    }

    return recommendations;
  }

  private getEngagementRecommendations(profile: UserProfile): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Re-engagement for inactive users
    const daysSinceLastActivity = Math.floor(
      (Date.now() - new Date(profile.engagement.lastActivity).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastActivity > 3) {
      recommendations.push({
        id: `reengage_${Date.now()}`,
        type: 'game',
        title: 'Que saudades! Vamos jogar?',
        description: 'Volte e continue sua jornada de aprendizado sobre os mangues',
        reason: `Você não joga há ${daysSinceLastActivity} dias. Que tal retomar?`,
        priority: 'high',
        category: 'engagement',
        estimatedTime: 10,
        difficulty: profile.preferences.difficultyLevel,
        action: {
          type: 'navigate',
          target: '/jogo-da-memoria'
        },
        metadata: {
          confidence: 0.7,
          tags: ['re-engagement', 'return', 'motivation']
        }
      });
    }

    // Streak building
    if (profile.engagement.streakDays < 7) {
      recommendations.push({
        id: `streak_${Date.now()}`,
        type: 'challenge',
        title: 'Construa sua Sequência!',
        description: 'Jogue por 7 dias seguidos e ganhe uma conquista especial',
        reason: 'Manter uma rotina de aprendizado melhora a retenção',
        priority: 'medium',
        category: 'engagement',
        estimatedTime: 5,
        difficulty: 'easy',
        action: {
          type: 'start_game',
          target: '/quiz',
          params: { daily: true }
        },
        metadata: {
          confidence: 0.8,
          tags: ['streak', 'daily', 'habit']
        }
      });
    }

    return recommendations;
  }

  private getDifficultyRecommendations(profile: UserProfile): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Suggest difficulty progression
    if (profile.performance.completionRate > 0.8 && profile.preferences.difficultyLevel === 'beginner') {
      recommendations.push({
        id: `difficulty_up_${Date.now()}`,
        type: 'challenge',
        title: 'Pronto para o Próximo Nível?',
        description: 'Seu desempenho indica que você pode tentar o nível intermediário',
        reason: 'Taxa de conclusão alta sugere que você dominou o nível atual',
        priority: 'medium',
        category: 'progression',
        estimatedTime: 15,
        difficulty: 'intermediate',
        action: {
          type: 'start_game',
          target: '/quiz',
          params: { difficulty: 'medio' }
        },
        metadata: {
          confidence: 0.85,
          tags: ['progression', 'difficulty', 'growth']
        }
      });
    }

    return recommendations;
  }

  async updateUserProfile(userId: string, gameData: any): Promise<void> {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = this.createDefaultProfile(userId);
    }

    // Update performance metrics
    this.updatePerformanceMetrics(profile, gameData);
    
    // Update preferences based on behavior
    this.updatePreferences(profile, gameData);
    
    // Update engagement metrics
    this.updateEngagementMetrics(profile);

    this.userProfiles.set(userId, profile);
    this.saveData();

    // Generate new recommendations
    await this.generateRecommendations(userId);
  }

  private createDefaultProfile(userId: string): UserProfile {
    return {
      id: userId,
      preferences: {
        favoriteCategories: [],
        difficultyLevel: 'beginner',
        learningStyle: 'mixed',
        gamePreferences: []
      },
      performance: {
        averageScore: 0,
        strongCategories: [],
        weakCategories: [],
        playTime: 0,
        completionRate: 0
      },
      engagement: {
        sessionFrequency: 0,
        averageSessionLength: 0,
        lastActivity: new Date().toISOString(),
        streakDays: 0
      }
    };
  }

  private updatePerformanceMetrics(profile: UserProfile, gameData: any) {
    // Update average score
    const currentAvg = profile.performance.averageScore;
    const newScore = gameData.score || 0;
    profile.performance.averageScore = (currentAvg + newScore) / 2;

    // Update category performance
    if (gameData.category) {
      const categoryScore = gameData.score || 0;
      const categoryAccuracy = gameData.accuracy || 0;

      if (categoryAccuracy > 0.8) {
        if (!profile.performance.strongCategories.includes(gameData.category)) {
          profile.performance.strongCategories.push(gameData.category);
        }
        // Remove from weak if it was there
        profile.performance.weakCategories = profile.performance.weakCategories
          .filter(cat => cat !== gameData.category);
      } else if (categoryAccuracy < 0.6) {
        if (!profile.performance.weakCategories.includes(gameData.category)) {
          profile.performance.weakCategories.push(gameData.category);
        }
      }
    }

    // Update play time
    profile.performance.playTime += gameData.duration || 0;

    // Update completion rate
    if (gameData.completed !== undefined) {
      const currentRate = profile.performance.completionRate;
      const newRate = gameData.completed ? 1 : 0;
      profile.performance.completionRate = (currentRate + newRate) / 2;
    }
  }

  private updatePreferences(profile: UserProfile, gameData: any) {
    // Update favorite categories based on frequency and performance
    if (gameData.category && gameData.score > profile.performance.averageScore) {
      if (!profile.preferences.favoriteCategories.includes(gameData.category)) {
        profile.preferences.favoriteCategories.push(gameData.category);
      }
    }

    // Update game preferences
    if (gameData.gameType && gameData.enjoyment > 0.7) {
      if (!profile.preferences.gamePreferences.includes(gameData.gameType)) {
        profile.preferences.gamePreferences.push(gameData.gameType);
      }
    }

    // Adjust difficulty level based on performance
    if (profile.performance.averageScore > 800 && profile.preferences.difficultyLevel === 'beginner') {
      profile.preferences.difficultyLevel = 'intermediate';
    } else if (profile.performance.averageScore > 1200 && profile.preferences.difficultyLevel === 'intermediate') {
      profile.preferences.difficultyLevel = 'advanced';
    }
  }

  private updateEngagementMetrics(profile: UserProfile) {
    const now = new Date();
    const lastActivity = new Date(profile.engagement.lastActivity);
    const daysDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    // Update streak
    if (daysDiff === 1) {
      profile.engagement.streakDays += 1;
    } else if (daysDiff > 1) {
      profile.engagement.streakDays = 1; // Reset streak
    }

    profile.engagement.lastActivity = now.toISOString();
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return this.userProfiles.get(userId) || null;
  }

  async getUserRecommendations(userId: string): Promise<Recommendation[]> {
    return this.recommendations.get(userId) || [];
  }

  async getUserLearningPath(userId: string): Promise<LearningPath | null> {
    // For now, assign based on performance level
    const profile = await this.getUserProfile(userId);
    if (!profile) return null;

    const pathId = profile.preferences.difficultyLevel === 'beginner' 
      ? 'beginner_explorer' 
      : 'eco_champion';

    return this.learningPaths.get(pathId) || null;
  }

  async completeStep(userId: string, stepId: string): Promise<void> {
    const path = await this.getUserLearningPath(userId);
    if (!path) return;

    const step = path.steps.find(s => s.id === stepId);
    if (step) {
      step.isCompleted = true;
      path.completedSteps += 1;

      // Unlock next step
      const currentIndex = path.steps.indexOf(step);
      if (currentIndex < path.steps.length - 1) {
        path.steps[currentIndex + 1].unlocked = true;
      }

      this.learningPaths.set(path.id, path);
      this.saveData();
    }
  }

  private getCategoryDisplayName(category: string): string {
    const names = {
      biodiversidade: 'Vida no Mangue',
      estrutura: 'Como Funciona',
      conservacao: 'Vamos Cuidar',
      ameacas: 'Ameaças e Soluções'
    };
    return names[category as keyof typeof names] || category;
  }

  // Export user data for analysis
  async exportUserData(userId: string): Promise<void> {
    const profile = await this.getUserProfile(userId);
    const recommendations = await this.getUserRecommendations(userId);
    const learningPath = await this.getUserLearningPath(userId);

    const exportData = {
      userId,
      profile,
      recommendations,
      learningPath,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mangues-ai-profile-${userId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const aiRecommendationService = new AIRecommendationService();