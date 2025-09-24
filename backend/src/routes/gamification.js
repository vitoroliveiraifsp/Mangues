import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Mock data for gamification features
const achievementTemplates = [
  {
    id: 'first_steps',
    title: 'Primeiros Passos',
    description: 'Completou seu primeiro jogo!',
    icon: '👶',
    category: 'learning',
    rarity: 'common',
    requirements: ['Complete 1 game']
  },
  {
    id: 'quiz_novice',
    title: 'Novato do Quiz',
    description: 'Respondeu 50 perguntas corretamente',
    icon: '🧠',
    category: 'learning',
    rarity: 'common',
    requirements: ['Answer 50 questions correctly']
  },
  {
    id: 'memory_master',
    title: 'Mestre da Memória',
    description: 'Completou 10 jogos de memória sem erros',
    icon: '🧩',
    category: 'performance',
    rarity: 'rare',
    requirements: ['Complete 10 memory games with perfect score']
  },
  {
    id: 'speed_demon',
    title: 'Demônio da Velocidade',
    description: 'Completou um quiz em menos de 30 segundos',
    icon: '⚡',
    category: 'performance',
    rarity: 'epic',
    requirements: ['Complete quiz in under 30 seconds']
  },
  {
    id: 'eco_warrior',
    title: 'Guerreiro Ecológico',
    description: 'Completou todas as categorias educativas',
    icon: '🌿',
    category: 'learning',
    rarity: 'epic',
    requirements: ['Complete all educational categories']
  },
  {
    id: 'social_butterfly',
    title: 'Borboleta Social',
    description: 'Jogou 20 partidas multiplayer',
    icon: '🦋',
    category: 'social',
    rarity: 'rare',
    requirements: ['Play 20 multiplayer games']
  },
  {
    id: 'streak_legend',
    title: 'Lenda da Sequência',
    description: 'Manteve uma sequência de 30 dias',
    icon: '🔥',
    category: 'dedication',
    rarity: 'legendary',
    requirements: ['Maintain 30-day streak']
  }
];

const missionTemplates = [
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
        description: 'Jogar 3 jogos'
      }
    ],
    rewards: [
      {
        type: 'points',
        value: 100,
        description: '100 pontos de XP'
      }
    ]
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
        description: 'Acumular 5000 pontos'
      }
    ],
    rewards: [
      {
        type: 'badge',
        value: 'weekly_champion',
        description: 'Distintivo de Campeão Semanal'
      }
    ]
  }
];

// GET /api/gamification/achievements/:userId - Get user achievements
router.get('/achievements/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Try database first
    try {
      const result = await query(`
        SELECT achievement_id, unlocked_at, progress
        FROM user_achievements 
        WHERE user_id = $1
      `, [userId]);

      const userAchievements = achievementTemplates.map(template => {
        const userProgress = result.rows.find(row => row.achievement_id === template.id);
        return {
          ...template,
          progress: userProgress?.progress || 0,
          unlockedAt: userProgress?.unlocked_at || null
        };
      });

      res.json(userAchievements);
    } catch (dbError) {
      // Fallback to mock data
      const mockAchievements = achievementTemplates.map(template => ({
        ...template,
        progress: Math.random() * 0.8, // Random progress for demo
        unlockedAt: Math.random() > 0.7 ? new Date().toISOString() : null
      }));

      res.json(mockAchievements);
    }
  } catch (error) {
    console.error('Error getting achievements:', error);
    res.status(500).json({ error: 'Erro ao buscar conquistas' });
  }
});

// GET /api/gamification/missions/:userId - Get user missions
router.get('/missions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Create missions with current progress
    const now = new Date();
    const userMissions = missionTemplates.map(template => {
      const mission = {
        ...template,
        id: `${template.id}_${now.toISOString().split('T')[0]}`,
        startDate: now.toISOString(),
        endDate: template.category === 'daily' 
          ? new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
          : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        progress: Math.random() * 0.6, // Random progress for demo
        completed: false,
        requirements: template.requirements.map(req => ({
          ...req,
          current: Math.floor(Math.random() * req.target * 0.8)
        }))
      };

      // Check if completed
      mission.completed = mission.requirements.every(req => req.current >= req.target);
      if (mission.completed) {
        mission.progress = 1;
        mission.completedAt = now.toISOString();
      }

      return mission;
    });

    res.json(userMissions);
  } catch (error) {
    console.error('Error getting missions:', error);
    res.status(500).json({ error: 'Erro ao buscar missões' });
  }
});

// GET /api/gamification/level/:userId - Get user level
router.get('/level/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Try database first
    try {
      const result = await query(`
        SELECT level, xp, total_xp
        FROM user_levels 
        WHERE user_id = $1
      `, [userId]);

      if (result.rows.length > 0) {
        const userData = result.rows[0];
        const level = userData.level;
        const xpToNext = calculateXPForLevel(level + 1) - calculateXPForLevel(level);
        
        res.json({
          level,
          title: getLevelTitle(level),
          xp: userData.xp,
          xpToNext: xpToNext - userData.xp,
          totalXp: userData.total_xp,
          benefits: getLevelBenefits(level)
        });
      } else {
        // Create default level
        res.json({
          level: 1,
          title: 'Explorador Iniciante',
          xp: 0,
          xpToNext: 100,
          totalXp: 0,
          benefits: ['Acesso aos jogos básicos']
        });
      }
    } catch (dbError) {
      // Fallback to mock data
      const mockLevel = {
        level: 5,
        title: 'Especialista Ecológico',
        xp: 250,
        xpToNext: 350,
        totalXp: 1250,
        benefits: ['Acesso a conteúdo avançado', 'Certificados digitais', 'Modo multiplayer']
      };

      res.json(mockLevel);
    }
  } catch (error) {
    console.error('Error getting user level:', error);
    res.status(500).json({ error: 'Erro ao buscar nível do usuário' });
  }
});

// POST /api/gamification/update-progress - Update user progress
router.post('/update-progress', async (req, res) => {
  try {
    const { userId, activity } = req.body;

    if (!userId || !activity) {
      return res.status(400).json({ 
        error: 'userId e activity são obrigatórios' 
      });
    }

    // Calculate XP gained
    const xpGained = calculateXP(activity);

    // Mock response for demo
    const response = {
      xpGained,
      levelUp: Math.random() > 0.8, // 20% chance of level up
      newAchievements: Math.random() > 0.7 ? [achievementTemplates[0]] : [],
      completedMissions: Math.random() > 0.6 ? [missionTemplates[0]] : []
    };

    res.json(response);
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Erro ao atualizar progresso' });
  }
});

// Helper functions
function calculateXP(activity) {
  const baseXP = {
    game_completed: 50,
    video_watched: 30,
    quiz_answered: 10,
    multiplayer_played: 75
  };

  let xp = baseXP[activity.type] || 0;

  // Bonus multipliers
  if (activity.data?.score > 800) xp *= 1.5;
  if (activity.data?.difficulty === 'hard') xp *= 1.3;
  if (activity.data?.perfect) xp *= 2;

  return Math.round(xp);
}

function calculateXPForLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

function getLevelTitle(level) {
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

function getLevelBenefits(level) {
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

export default router;