import { useState, useEffect } from 'react';
import { 
  Target, 
  Trophy, 
  Clock, 
  Star, 
  CheckCircle, 
  Gift,
  Calendar,
  Zap,
  Award
} from 'lucide-react';
import { gamificationService } from '../../services/gamificationService';
import { useAuth } from '../../hooks/useAuth';

interface Mission {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'special' | 'achievement';
  difficulty: 'easy' | 'medium' | 'hard';
  requirements: Array<{
    type: string;
    target: number;
    current: number;
    description: string;
  }>;
  rewards: Array<{
    type: string;
    value: number | string;
    description: string;
  }>;
  progress: number;
  completed: boolean;
  endDate?: string;
}

export function MissionPanel() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'daily' | 'weekly' | 'special'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMissions();
    }
  }, [user]);

  const loadMissions = async () => {
    try {
      setLoading(true);
      const userMissions = await gamificationService.getUserMissions(user!.id);
      setMissions(userMissions);
    } catch (error) {
      console.error('Error loading missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMissions = missions.filter(mission => 
    selectedCategory === 'all' || mission.category === selectedCategory
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'daily': return <Calendar className="h-5 w-5" />;
      case 'weekly': return <Clock className="h-5 w-5" />;
      case 'special': return <Star className="h-5 w-5" />;
      case 'achievement': return <Trophy className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'points': return '⭐';
      case 'badge': return '🏆';
      case 'certificate': return '📜';
      case 'unlock_content': return '🔓';
      case 'special_title': return '👑';
      default: return '🎁';
    }
  };

  const formatTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirado';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d restantes`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m restantes`;
    } else {
      return `${minutes}m restantes`;
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
        <div className="text-4xl mb-4">🎮</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Faça Login para Ver Missões</h3>
        <p className="text-gray-600">Entre na sua conta para acompanhar suas missões e conquistas!</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Target className="h-8 w-8" />
            <h2 className="text-2xl font-bold">Missões Ativas</h2>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Missões Ativas</div>
            <div className="text-2xl font-bold">
              {missions.filter(m => !m.completed).length}
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'Todas', icon: Target },
            { id: 'daily', label: 'Diárias', icon: Calendar },
            { id: 'weekly', label: 'Semanais', icon: Clock },
            { id: 'special', label: 'Especiais', icon: Star }
          ].map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Missions List */}
      <div className="p-6">
        {filteredMissions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-bold text-gray-600 mb-2">Nenhuma missão encontrada</h3>
            <p className="text-gray-500">Continue jogando para desbloquear novas missões!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMissions.map(mission => (
              <div
                key={mission.id}
                className={`border-2 rounded-2xl p-6 transition-all duration-300 ${
                  mission.completed
                    ? 'border-green-200 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-full ${
                      mission.completed ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {mission.completed ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        getCategoryIcon(mission.category)
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className={`text-lg font-bold ${
                          mission.completed ? 'text-green-700' : 'text-gray-800'
                        }`}>
                          {mission.title}
                        </h3>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getDifficultyColor(mission.difficulty)
                        }`}>
                          {mission.difficulty}
                        </span>
                      </div>
                      
                      <p className={`text-sm mb-3 ${
                        mission.completed ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {mission.description}
                      </p>

                      {/* Requirements */}
                      <div className="space-y-2">
                        {mission.requirements.map((req, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{req.description}</span>
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-medium">
                                {req.current}/{req.target}
                              </div>
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    req.current >= req.target ? 'bg-green-500' : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${Math.min((req.current / req.target) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Time Remaining */}
                  {mission.endDate && !mission.completed && (
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">Tempo restante</div>
                      <div className="text-sm font-medium text-orange-600">
                        {formatTimeRemaining(mission.endDate)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Progresso Geral</span>
                    <span>{Math.round(mission.progress * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        mission.completed ? 'bg-green-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}
                      style={{ width: `${mission.progress * 100}%` }}
                    />
                  </div>
                </div>

                {/* Rewards */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                    <Gift className="h-4 w-4 mr-2" />
                    Recompensas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {mission.rewards.map((reward, index) => (
                      <div
                        key={index}
                        className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                          mission.completed 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <span>{getRewardIcon(reward.type)}</span>
                        <span>{reward.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Completion Status */}
                {mission.completed && mission.completedAt && (
                  <div className="mt-4 p-3 bg-green-100 rounded-xl">
                    <div className="flex items-center space-x-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">
                        Missão completada em {new Date(mission.completedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}