import { useState, useEffect } from 'react';
import { Trophy, Star, Award, Lock, Calendar, Target } from 'lucide-react';
import { gamificationService } from '../../services/gamificationService';
import { useAuth } from '../../hooks/useAuth';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'social' | 'performance' | 'dedication' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: string[];
  unlockedAt?: string;
  progress: number;
}

export function AchievementShowcase() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | Achievement['category']>('all');
  const [selectedRarity, setSelectedRarity] = useState<'all' | Achievement['rarity']>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAchievements();
    }
  }, [user]);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const userAchievements = await gamificationService.getUserAchievements(user!.id);
      setAchievements(userAchievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;
    const rarityMatch = selectedRarity === 'all' || achievement.rarity === selectedRarity;
    return categoryMatch && rarityMatch;
  });

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-500';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getCategoryColor = (category: Achievement['category']) => {
    switch (category) {
      case 'learning': return 'text-green-600 bg-green-100';
      case 'social': return 'text-blue-600 bg-blue-100';
      case 'performance': return 'text-purple-600 bg-purple-100';
      case 'dedication': return 'text-orange-600 bg-orange-100';
      case 'special': return 'text-pink-600 bg-pink-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStats = () => {
    const unlocked = achievements.filter(a => a.unlockedAt).length;
    const total = achievements.length;
    const inProgress = achievements.filter(a => a.progress > 0 && !a.unlockedAt).length;
    
    return { unlocked, total, inProgress };
  };

  if (!user) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
        <div className="text-4xl mb-4">🏆</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Faça Login para Ver Conquistas</h3>
        <p className="text-gray-600">Entre na sua conta para acompanhar suas conquistas!</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Trophy className="h-8 w-8" />
            <h2 className="text-2xl font-bold">Galeria de Conquistas</h2>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Desbloqueadas</div>
            <div className="text-2xl font-bold">
              {stats.unlocked}/{stats.total}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.unlocked}</div>
            <div className="text-sm text-gray-600">Desbloqueadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-600">Em Progresso</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{stats.total - stats.unlocked}</div>
            <div className="text-sm text-gray-600">Bloqueadas</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Categoria</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'learning', 'social', 'performance', 'dedication', 'special'].map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category as any)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'Todas' : category}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Raridade</label>
            <div className="flex flex-wrap gap-2">
              {['all', 'common', 'rare', 'epic', 'legendary'].map(rarity => (
                <button
                  key={rarity}
                  onClick={() => setSelectedRarity(rarity as any)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedRarity === rarity
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {rarity === 'all' ? 'Todas' : rarity}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map(achievement => (
            <div
              key={achievement.id}
              className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 ${
                achievement.unlockedAt
                  ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)} text-white shadow-lg`
                  : 'bg-gray-100 text-gray-500 border-2 border-dashed border-gray-300'
              }`}
            >
              {/* Rarity Indicator */}
              <div className="absolute top-2 right-2">
                <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                  achievement.unlockedAt ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {achievement.rarity}
                </div>
              </div>

              {/* Icon */}
              <div className="text-center mb-4">
                <div className={`text-6xl mb-2 ${
                  achievement.unlockedAt ? '' : 'grayscale opacity-50'
                }`}>
                  {achievement.unlockedAt ? achievement.icon : '🔒'}
                </div>
                
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  achievement.unlockedAt ? 'bg-white/20' : getCategoryColor(achievement.category)
                }`}>
                  {achievement.category}
                </div>
              </div>

              {/* Content */}
              <div className="text-center">
                <h3 className={`font-bold text-lg mb-2 ${
                  achievement.unlockedAt ? 'text-white' : 'text-gray-700'
                }`}>
                  {achievement.title}
                </h3>
                
                <p className={`text-sm mb-4 ${
                  achievement.unlockedAt ? 'text-white/90' : 'text-gray-600'
                }`}>
                  {achievement.description}
                </p>

                {/* Progress */}
                {!achievement.unlockedAt && achievement.progress > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1">
                      Progresso: {Math.round(achievement.progress * 100)}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${achievement.progress * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Unlock Date */}
                {achievement.unlockedAt && (
                  <div className="flex items-center justify-center space-x-2 text-xs text-white/80">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Desbloqueado em {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}

                {/* Requirements (for locked achievements) */}
                {!achievement.unlockedAt && (
                  <div className="text-xs text-gray-500">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Lock className="h-3 w-3" />
                      <span>Requisitos:</span>
                    </div>
                    <ul className="space-y-1">
                      {achievement.requirements.map((req, index) => (
                        <li key={index} className="flex items-center justify-center">
                          <Target className="h-3 w-3 mr-1" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-lg font-bold text-gray-600 mb-2">Nenhuma conquista encontrada</h3>
            <p className="text-gray-500">Ajuste os filtros ou continue jogando para desbloquear conquistas!</p>
          </div>
        )}
      </div>
    </div>
  );
}