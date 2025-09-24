// Advanced gamification service with missions and achievements
interface Mission {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'special' | 'achievement';
  difficulty: 'easy' | 'medium' | 'hard';
  requirements: MissionRequirement[];
  rewards: MissionReward[];
  startDate: string;
  endDate?: string;
  isActive: boolean;
  progress: number; // 0-1
  completed: boolean;
  completedAt?: string;
}

interface MissionRequirement {
  type: 'play_games' | 'score_points' | 'complete_category' | 'watch_videos' | 'streak_days' | 'help_others';
  target: number;
  current: number;
  description: string;
}

interface MissionReward {
  type: 'points' | 'badge' | 'certificate' | 'unlock_content' | 'special_title';
  value: number | string;
  description: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'social' | 'performance' | 'dedication' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: string[];
  unlockedAt?: string;
  progress: number; // 0-1
}

interface UserLevel {
  level: number;
  title: string;
  xp: number;
  xpToNext: number;
  totalXp: number;
  benefits: string[];
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  level: number;
  totalXp: number;
  achievements: number;
  rank: number;
  avatar?: string;
}

class GamificationService {
  private userMissions: Map<string, Mission[]> = new Map();
  private userAchievements: Map<string, Achievement[]> = new Map();
  private userLevels: Map<string, UserLevel> = new Map();
  private globalMissions: Mission[] = [];
  private achievementTemplates: Achievement[] = [];

  async initialize() {
    this.initializeAchievements();
    this.initializeGlobalMissions();
    await this.loadUserData();
    console.log('🎮 Gamification service initialized');
  }

  private initializeAchievements() {
    this.achievementTemplates = [
      {
        id: 'first_steps',
        title: 'Primeiros Passos',
        description: 'Completou seu primeiro jogo!',
        icon: '👶',
        category: 'learning',
        rarity: 'common',
        requirements: ['Complete 1 game'],
        progress: 0
      },
      {
        id: 'quiz_novice',
        title: 'Novato do Quiz',
        description: 'Respondeu 50 perguntas corretamente',
        icon: '🧠',
        category: 'learning',
        rarity: 'common',
        requirements: ['Answer 50 questions correctly'],
        progress: 0
      },
      {
        id: 'memory_master',
        title: 'Mestre da Memória',
        description: 'Completou 10 jogos de memória sem erros',
        icon: '🧩',
        category: 'performance',
        rarity: 'rare',
        requirements: ['Complete 10 memory games with perfect score'],
        progress: 0
      },
      {
        id: 'speed_demon',
        title: 'Demônio da Velocidade',
        description: 'Completou um quiz em menos de 30 segundos',
        icon: '⚡',
        category: 'performance',
        rarity: 'epic',
        requirements: ['Complete quiz in under 30 seconds'],
        progress: 0
      },
      {
        id: 'eco_warrior',
        title: 'Guerreiro Ecológico',
        description: 'Completou todas as categorias educativas',
        icon: '🌿',
        category: 'learning',
        rarity: 'epic',
        requirements: ['Complete all educational categories'],
        progress: 0
      },
      {
        id: 'social_butterfly',
        title: 'Borboleta Social',
        description: 'Jogou 20 partidas multiplayer',
        icon: '🦋',
        category: 'social',
        rarity: 'rare',
        requirements: ['Play 20 multiplayer games'],
        progress: 0
      },
      {
        id: 'streak_legend',
        title: 'Lenda da Sequência',
        description: 'Manteve uma sequência de 30 dias',
        icon: '🔥',
        category: 'dedication',
        rarity: 'legendary',
        requirements: ['Maintain 30-day streak'],
        progress: 0
      },
      {
        id: 'perfect_score',
        title: 'Pontuação Perfeita',
        description: 'Alcançou pontuação máxima em um quiz',
        icon: '💯',
        category: 'performance',
        rarity: 'epic',
        requirements: ['Achieve perfect score in quiz'],
        progress: 0
      },
      {
        id: 'video_scholar',
        title: 'Estudioso dos Vídeos',
        description: 'Assistiu todos os vídeos educativos',
        icon: '📺',
        category: 'learning',
        rarity: 'rare',
        requirements: ['Watch all educational videos'],
        progress: 0
      },
      {
        id: 'mangue_guardian',
        title: 'Guardião dos Mangues',
        description: 'Completou 100 ações de conservação',
        icon: '🛡️',
        category: 'special',
        rarity: 'legendary',
        requirements: ['Complete 100 conservation actions'],
        progress: 0
      }
    ];
  }

  private initializeGlobalMissions() {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    this.globalMissions = [
      {
        id: 'daily_explorer',
        title: 'Explorador Diário',
        description: 'Complete 3 jogos hoje',
        category: 'daily',
        difficulty: 'easy',
        requirements: [
          {
            type: 'play_games',
            target: 3,
            current: 0,
            description: 'Jogar 3 jogos'
          }
        ],
        rewards: [
          {
            type: 'points',
            value: 100,
            description: '100 pontos de XP'
          }
        ],
        startDate: now.toISOString(),
        endDate: tomorrow.toISOString(),
        isActive: true,
        progress: 0,
        completed: false
      },
      {
        id: 'weekly_champion',
        title: 'Campeão Semanal',
        description: 'Alcance 5000 pontos esta semana',
        category: 'weekly',
        difficulty: 'medium',
        requirements: [
          {
            type: 'score_points',
            target: 5000,
            current: 0,
            description: 'Acumular 5000 pontos'
          }
        ],
        rewards: [
          {
            type: 'badge',
            value: 'weekly_champion',
            description: 'Distintivo de Campeão Semanal'
          },
          {
            type: 'points',
            value: 500,
            description: '500 pontos de bônus'
          }
        ],
        startDate: now.toISOString(),
        endDate: nextWeek.toISOString(),
        isActive: true,
        progress: 0,
        completed: false
      },
      {
        id: 'knowledge_seeker',
        title: 'Buscador de Conhecimento',
        description: 'Assista 5 vídeos educativos',
        category: 'special',
        difficulty: 'easy',
        requirements: [
          {
            type: 'watch_videos',
            target: 5,
            current: 0,
            description: 'Assistir 5 vídeos completos'
          }
        ],
        rewards: [
          {
            type: 'unlock_content',
            value: 'advanced_videos',
            description: 'Desbloqueio de vídeos avançados'
          }
        ],
        startDate: now.toISOString(),
        isActive: true,
        progress: 0,
        completed: false
      }
    ];
  }

  async updateUserProgress(userId: string, activity: {
    type: 'game_completed' | 'video_watched' | 'quiz_answered' | 'multiplayer_played';
    data: any;
  }): Promise<{
    xpGained: number;
    levelUp: boolean;
    newAchievements: Achievement[];
    completedMissions: Mission[];
  }> {
    let xpGained = 0;
    let levelUp = false;
    const newAchievements: Achievement[] = [];
    const completedMissions: Mission[] = [];

    // Calculate XP based on activity
    xpGained = this.calculateXP(activity);

    // Update user level
    const currentLevel = this.userLevels.get(userId) || this.createDefaultLevel();
    const updatedLevel = this.updateLevel(currentLevel, xpGained);
    levelUp = updatedLevel.level > currentLevel.level;
    this.userLevels.set(userId, updatedLevel);

    // Check achievements
    const achievements = await this.checkAchievements(userId, activity);
    newAchievements.push(...achievements);

    // Update missions
    const missions = await this.updateMissions(userId, activity);
    completedMissions.push(...missions);

    this.saveUserData();

    return {
      xpGained,
      levelUp,
      newAchievements,
      completedMissions
    };
  }

  private calculateXP(activity: any): number {
    const baseXP = {
      game_completed: 50,
      video_watched: 30,
      quiz_answered: 10,
      multiplayer_played: 75
    };

    let xp = baseXP[activity.type as keyof typeof baseXP] || 0;

    // Bonus multipliers
    if (activity.data.score > 800) xp *= 1.5; // High score bonus
    if (activity.data.difficulty === 'hard') xp *= 1.3; // Difficulty bonus
    if (activity.data.perfect) xp *= 2; // Perfect score bonus
    if (activity.data.firstTime) xp *= 1.2; // First time bonus

    return Math.round(xp);
  }

  private createDefaultLevel(): UserLevel {
    return {
      level: 1,
      title: 'Explorador Iniciante',
      xp: 0,
      xpToNext: 100,
      totalXp: 0,
      benefits: ['Acesso aos jogos básicos']
    };
  }

  private updateLevel(currentLevel: UserLevel, xpGained: number): UserLevel {
    const newTotalXp = currentLevel.totalXp + xpGained;
    let newLevel = currentLevel.level;
    let newXp = currentLevel.xp + xpGained;
    let xpToNext = currentLevel.xpToNext;

    // Check for level up
    while (newXp >= xpToNext) {
      newXp -= xpToNext;
      newLevel++;
      xpToNext = this.calculateXPForLevel(newLevel + 1) - this.calculateXPForLevel(newLevel);
    }

    return {
      level: newLevel,
      title: this.getLevelTitle(newLevel),
      xp: newXp,
      xpToNext: xpToNext - newXp,
      totalXp: newTotalXp,
      benefits: this.getLevelBenefits(newLevel)
    };
  }

  private calculateXPForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  }

  private getLevelTitle(level: number): string {
    const titles = [
      'Explorador Iniciante',
      'Descobridor Curioso',
      'Estudante dos Mangues',
      'Conhecedor da Natureza',
      'Especialista Ecológico',
      'Mestre dos Mangues',
      'Guardião Ambiental',
      'Sábio da Conservação',
      'Lenda dos Mangues',
      'Avatar da Natureza'
    ];
    
    const index = Math.min(level - 1, titles.length - 1);
    return titles[index];
  }

  private getLevelBenefits(level: number): string[] {
    const benefits = [
      ['Acesso aos jogos básicos'],
      ['Desbloqueio do modo difícil'],
      ['Acesso a vídeos educativos'],
      ['Modo multiplayer liberado'],
      ['Conteúdo avançado desbloqueado'],
      ['Certificados digitais disponíveis'],
      ['Acesso a missões especiais'],
      ['Título de especialista'],
      ['Acesso a conteúdo exclusivo'],
      ['Status de lenda da comunidade']
    ];
    
    const index = Math.min(level - 1, benefits.length - 1);
    return benefits[index];
  }

  private async checkAchievements(userId: string, activity: any): Promise<Achievement[]> {
    const userAchievements = this.userAchievements.get(userId) || [];
    const newAchievements: Achievement[] = [];

    for (const template of this.achievementTemplates) {
      const existing = userAchievements.find(a => a.id === template.id);
      if (existing?.unlockedAt) continue; // Already unlocked

      const progress = this.calculateAchievementProgress(template, activity, userId);
      
      if (progress >= 1 && !existing?.unlockedAt) {
        const achievement: Achievement = {
          ...template,
          progress: 1,
          unlockedAt: new Date().toISOString()
        };
        
        newAchievements.push(achievement);
        
        // Update user achievements
        const updatedAchievements = userAchievements.filter(a => a.id !== template.id);
        updatedAchievements.push(achievement);
        this.userAchievements.set(userId, updatedAchievements);
      } else if (existing) {
        existing.progress = progress;
      } else {
        // Create progress entry
        userAchievements.push({
          ...template,
          progress
        });
        this.userAchievements.set(userId, userAchievements);
      }
    }

    return newAchievements;
  }

  private calculateAchievementProgress(achievement: Achievement, activity: any, userId: string): number {
    // This would implement complex logic to calculate achievement progress
    // For demo purposes, we'll use simplified logic
    
    switch (achievement.id) {
      case 'first_steps':
        return activity.type === 'game_completed' ? 1 : 0;
      
      case 'quiz_novice':
        // Would need to track total correct answers from user data
        return Math.min(activity.data.correctAnswers || 0, 50) / 50;
      
      case 'speed_demon':
        return activity.data.duration < 30 ? 1 : 0;
      
      default:
        return 0;
    }
  }

  private async updateMissions(userId: string, activity: any): Promise<Mission[]> {
    const userMissions = this.userMissions.get(userId) || [...this.globalMissions];
    const completedMissions: Mission[] = [];

    for (const mission of userMissions) {
      if (mission.completed) continue;

      let progressMade = false;

      for (const requirement of mission.requirements) {
        const oldCurrent = requirement.current;
        
        switch (requirement.type) {
          case 'play_games':
            if (activity.type === 'game_completed') {
              requirement.current = Math.min(requirement.current + 1, requirement.target);
              progressMade = true;
            }
            break;
          
          case 'score_points':
            if (activity.data.score) {
              requirement.current = Math.min(requirement.current + activity.data.score, requirement.target);
              progressMade = true;
            }
            break;
          
          case 'watch_videos':
            if (activity.type === 'video_watched') {
              requirement.current = Math.min(requirement.current + 1, requirement.target);
              progressMade = true;
            }
            break;
        }

        if (progressMade && requirement.current !== oldCurrent) {
          console.log(`Mission progress: ${mission.title} - ${requirement.description}: ${requirement.current}/${requirement.target}`);
        }
      }

      // Check if mission is completed
      const allRequirementsMet = mission.requirements.every(req => req.current >= req.target);
      if (allRequirementsMet && !mission.completed) {
        mission.completed = true;
        mission.completedAt = new Date().toISOString();
        mission.progress = 1;
        completedMissions.push(mission);
        
        // Award rewards
        await this.awardMissionRewards(userId, mission.rewards);
      } else {
        // Update progress
        const totalProgress = mission.requirements.reduce((sum, req) => 
          sum + (req.current / req.target), 0
        ) / mission.requirements.length;
        mission.progress = Math.min(totalProgress, 1);
      }
    }

    this.userMissions.set(userId, userMissions);
    return completedMissions;
  }

  private async awardMissionRewards(userId: string, rewards: MissionReward[]): Promise<void> {
    for (const reward of rewards) {
      switch (reward.type) {
        case 'points':
          const currentLevel = this.userLevels.get(userId) || this.createDefaultLevel();
          const updatedLevel = this.updateLevel(currentLevel, Number(reward.value));
          this.userLevels.set(userId, updatedLevel);
          break;
        
        case 'badge':
          // Award special badge (could be stored separately)
          console.log(`🏆 Badge awarded: ${reward.value}`);
          break;
        
        case 'certificate':
          // Trigger certificate issuance
          console.log(`📜 Certificate awarded: ${reward.value}`);
          break;
      }
    }
  }

  // Public methods
  async getUserMissions(userId: string): Promise<Mission[]> {
    return this.userMissions.get(userId) || [];
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return this.userAchievements.get(userId) || [];
  }

  async getUserLevel(userId: string): Promise<UserLevel> {
    return this.userLevels.get(userId) || this.createDefaultLevel();
  }

  async getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
    const entries: LeaderboardEntry[] = [];
    
    this.userLevels.forEach((level, userId) => {
      const achievements = this.userAchievements.get(userId) || [];
      const unlockedAchievements = achievements.filter(a => a.unlockedAt).length;
      
      entries.push({
        userId,
        username: this.getUserDisplayName(userId),
        level: level.level,
        totalXp: level.totalXp,
        achievements: unlockedAchievements,
        rank: 0 // Will be set after sorting
      });
    });

    // Sort by total XP and set ranks
    entries.sort((a, b) => b.totalXp - a.totalXp);
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries.slice(0, limit);
  }

  private getUserDisplayName(userId: string): string {
    // Get from user data or generate display name
    const userData = localStorage.getItem('mangues_user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.nome || `Usuário ${userId.slice(-4)}`;
      } catch (error) {
        return `Usuário ${userId.slice(-4)}`;
      }
    }
    return `Usuário ${userId.slice(-4)}`;
  }

  private async loadUserData() {
    try {
      const stored = localStorage.getItem('mangues_gamification');
      if (stored) {
        const data = JSON.parse(stored);
        this.userMissions = new Map(data.missions || []);
        this.userAchievements = new Map(data.achievements || []);
        this.userLevels = new Map(data.levels || []);
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
    }
  }

  private saveUserData() {
    try {
      const data = {
        missions: Array.from(this.userMissions.entries()),
        achievements: Array.from(this.userAchievements.entries()),
        levels: Array.from(this.userLevels.entries()),
        lastUpdate: Date.now()
      };
      localStorage.setItem('mangues_gamification', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving gamification data:', error);
    }
  }
}

export const gamificationService = new GamificationService();