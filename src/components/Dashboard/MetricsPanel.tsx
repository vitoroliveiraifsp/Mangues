import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Trophy, 
  Target,
  Gamepad2,
  BookOpen,
  Star,
  Award,
  RefreshCw,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { gamificationService } from '../../services/gamificationService';

interface DashboardMetrics {
  userLevel: {
    level: number;
    title: string;
    xp: number;
    xpToNext: number;
    totalXp: number;
  };
  gameStats: {
    totalGames: number;
    averageScore: number;
    bestScore: number;
    timeSpent: number; // in minutes
    favoriteGame: string;
  };
  achievements: {
    unlocked: number;
    total: number;
    recent: Array<{
      title: string;
      icon: string;
      unlockedAt: string;
    }>;
  };
  missions: {
    active: number;
    completed: number;
    completionRate: number;
  };
  learning: {
    categoriesCompleted: number;
    totalCategories: number;
    videosWatched: number;
    streakDays: number;
  };
}

export function MetricsPanel() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (user) {
      loadMetrics();
      
      if (autoRefresh) {
        const interval = setInterval(loadMetrics, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
      }
    }
  }, [user, autoRefresh]);

  const loadMetrics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load data from gamification service
      const [userLevel, userAchievements, userMissions] = await Promise.all([
        gamificationService.getUserLevel(user.id),
        gamificationService.getUserAchievements(user.id),
        gamificationService.getUserMissions(user.id)
      ]);

      // Mock game stats (in real app, this would come from analytics)
      const gameStats = {
        totalGames: 42,
        averageScore: 756,
        bestScore: 1850,
        timeSpent: 180, // 3 hours
        favoriteGame: 'Quiz'
      };

      const unlockedAchievements = userAchievements.filter(a => a.unlockedAt);
      const activeMissions = userMissions.filter(m => !m.completed);
      const completedMissions = userMissions.filter(m => m.completed);

      const dashboardMetrics: DashboardMetrics = {
        userLevel,
        gameStats,
        achievements: {
          unlocked: unlockedAchievements.length,
          total: userAchievements.length,
          recent: unlockedAchievements
            .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
            .slice(0, 3)
            .map(a => ({
              title: a.title,
              icon: a.icon,
              unlockedAt: a.unlockedAt!
            }))
        },
        missions: {
          active: activeMissions.length,
          completed: completedMissions.length,
          completionRate: userMissions.length > 0 ? completedMissions.length / userMissions.length : 0
        },
        learning: {
          categoriesCompleted: 2, // Mock data
          totalCategories: 3,
          videosWatched: 5,
          streakDays: 7
        }
      };

      setMetrics(dashboardMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportMetrics = () => {
    if (!metrics) return;

    const exportData = {
      userId: user?.id,
      userName: user?.nome,
      metrics,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mangues-metrics-${user?.id}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-white rounded-2xl shadow-xl p-4 w-80">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className={`fixed bottom-4 right-4 bg-white rounded-2xl shadow-xl transition-all duration-300 z-30 ${
      isMinimized ? 'w-16 h-16' : 'w-80 max-h-96 overflow-y-auto'
    }`}>
      {isMinimized ? (
        // Minimized View
        <button
          onClick={() => setIsMinimized(false)}
          className="w-full h-full flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-2xl transition-colors"
        >
          <BarChart3 className="h-8 w-8" />
        </button>
      ) : (
        // Full View
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <h3 className="font-bold text-gray-800">Painel de Métricas</h3>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={loadMetrics}
                disabled={loading}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Atualizar"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={exportMetrics}
                className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                title="Exportar dados"
              >
                <Download className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-1 transition-colors ${
                  autoRefresh ? 'text-green-600' : 'text-gray-400'
                }`}
                title={autoRefresh ? 'Desativar atualização automática' : 'Ativar atualização automática'}
              >
                {autoRefresh ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Minimizar"
              >
                ×
              </button>
            </div>
          </div>

          {/* User Level */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span className="font-bold">Nível {metrics.userLevel.level}</span>
              </div>
              <span className="text-sm opacity-90">{metrics.userLevel.title}</span>
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>XP: {metrics.userLevel.xp}</span>
                <span>Próximo: {metrics.userLevel.xpToNext}</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(metrics.userLevel.xp / (metrics.userLevel.xp + metrics.userLevel.xpToNext)) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <Gamepad2 className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-blue-600">{metrics.gameStats.totalGames}</div>
              <div className="text-xs text-gray-600">Jogos</div>
            </div>
            
            <div className="bg-yellow-50 rounded-xl p-3 text-center">
              <Trophy className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-yellow-600">{metrics.gameStats.bestScore}</div>
              <div className="text-xs text-gray-600">Melhor</div>
            </div>
            
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <Star className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-green-600">{metrics.achievements.unlocked}</div>
              <div className="text-xs text-gray-600">Conquistas</div>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <Target className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <div className="text-lg font-bold text-purple-600">{metrics.missions.active}</div>
              <div className="text-xs text-gray-600">Missões</div>
            </div>
          </div>

          {/* Recent Achievements */}
          {metrics.achievements.recent.length > 0 && (
            <div className="mb-4">
              <h4 className="font-bold text-sm text-gray-700 mb-2 flex items-center">
                <Award className="h-4 w-4 mr-1" />
                Conquistas Recentes
              </h4>
              <div className="space-y-2">
                {metrics.achievements.recent.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-800 truncate">
                        {achievement.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Progress */}
          <div className="mb-4">
            <h4 className="font-bold text-sm text-gray-700 mb-2 flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              Progresso de Aprendizado
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Categorias</span>
                <span className="font-medium">
                  {metrics.learning.categoriesCompleted}/{metrics.learning.totalCategories}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Vídeos assistidos</span>
                <span className="font-medium">{metrics.learning.videosWatched}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Sequência atual</span>
                <span className="font-medium flex items-center">
                  🔥 {metrics.learning.streakDays} dias
                </span>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-gray-50 rounded-xl p-3">
            <h4 className="font-bold text-sm text-gray-700 mb-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              Resumo de Performance
            </h4>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <div className="font-bold text-blue-600">{metrics.gameStats.averageScore}</div>
                <div className="text-gray-500">Média</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-600">{formatTime(metrics.gameStats.timeSpent)}</div>
                <div className="text-gray-500">Tempo</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => window.location.href = '/ranking'}
                className="flex items-center justify-center space-x-1 p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors text-sm font-medium text-blue-700"
              >
                <Trophy className="h-4 w-4" />
                <span>Ranking</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/quiz'}
                className="flex items-center justify-center space-x-1 p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors text-sm font-medium text-green-700"
              >
                <Gamepad2 className="h-4 w-4" />
                <span>Jogar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}