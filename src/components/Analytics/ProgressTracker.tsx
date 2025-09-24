import { useState, useEffect } from 'react';
import { Trophy, Target, Clock, TrendingUp, Star, Award } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface UserProgress {
  totalGames: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  timeSpent: number; // in minutes
  achievements: Achievement[];
  gameStats: {
    memoria: { played: number; bestScore: number; averageTime: number };
    quiz: { played: number; bestScore: number; correctAnswers: number };
    conexoes: { played: number; bestScore: number; correctConnections: number };
  };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'score' | 'games' | 'time' | 'learning';
}

export function ProgressTracker() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserProgress();
    }
  }, [user]);

  const loadUserProgress = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would fetch from API
      // For now, we'll simulate with localStorage data
      const mockProgress: UserProgress = {
        totalGames: 15,
        totalScore: 12450,
        averageScore: 830,
        bestScore: 1850,
        timeSpent: 180, // 3 hours
        achievements: [
          {
            id: 'first-game',
            title: 'Primeiro Passo',
            description: 'Jogou seu primeiro jogo!',
            icon: '🎮',
            unlockedAt: new Date().toISOString(),
            category: 'games'
          },
          {
            id: 'memory-master',
            title: 'Mestre da Memória',
            description: 'Completou 5 jogos de memória!',
            icon: '🧠',
            unlockedAt: new Date().toISOString(),
            category: 'games'
          },
          {
            id: 'quiz-expert',
            title: 'Expert em Quiz',
            description: 'Acertou 90% das perguntas em um quiz!',
            icon: '🎯',
            unlockedAt: new Date().toISOString(),
            category: 'learning'
          }
        ],
        gameStats: {
          memoria: { played: 8, bestScore: 1200, averageTime: 45 },
          quiz: { played: 4, bestScore: 950, correctAnswers: 38 },
          conexoes: { played: 3, bestScore: 780, correctConnections: 18 }
        }
      };

      setProgress(mockProgress);
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getAchievementColor = (category: Achievement['category']) => {
    switch (category) {
      case 'score': return 'from-yellow-400 to-orange-400';
      case 'games': return 'from-purple-400 to-pink-400';
      case 'time': return 'from-blue-400 to-cyan-400';
      case 'learning': return 'from-green-400 to-teal-400';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  if (!user) return null;
  if (loading) return <div className="animate-pulse bg-gray-200 rounded-xl h-64"></div>;
  if (!progress) return null;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-yellow-600">{progress.totalScore.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Pontos Total</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600">{progress.totalGames}</div>
          <div className="text-sm text-gray-600">Jogos Jogados</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">{progress.averageScore}</div>
          <div className="text-sm text-gray-600">Média de Pontos</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <Clock className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600">{formatTime(progress.timeSpent)}</div>
          <div className="text-sm text-gray-600">Tempo Jogando</div>
        </div>
      </div>

      {/* Game Statistics */}
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Star className="h-6 w-6 text-yellow-500 mr-2" />
          Estatísticas por Jogo
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-purple-50 rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <div className="text-3xl mr-3">🧠</div>
              <h4 className="font-bold text-lg text-purple-700">Jogo da Memória</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Jogos:</span>
                <span className="font-bold">{progress.gameStats.memoria.played}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Melhor Pontuação:</span>
                <span className="font-bold text-purple-600">{progress.gameStats.memoria.bestScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tempo Médio:</span>
                <span className="font-bold">{progress.gameStats.memoria.averageTime}s</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <div className="text-3xl mr-3">🧠</div>
              <h4 className="font-bold text-lg text-blue-700">Quiz</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Jogos:</span>
                <span className="font-bold">{progress.gameStats.quiz.played}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Melhor Pontuação:</span>
                <span className="font-bold text-blue-600">{progress.gameStats.quiz.bestScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Respostas Corretas:</span>
                <span className="font-bold">{progress.gameStats.quiz.correctAnswers}</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <div className="text-3xl mr-3">🔗</div>
              <h4 className="font-bold text-lg text-indigo-700">Conexões</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Jogos:</span>
                <span className="font-bold">{progress.gameStats.conexoes.played}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Melhor Pontuação:</span>
                <span className="font-bold text-indigo-600">{progress.gameStats.conexoes.bestScore}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Conexões Corretas:</span>
                <span className="font-bold">{progress.gameStats.conexoes.correctConnections}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Award className="h-6 w-6 text-yellow-500 mr-2" />
          Conquistas Recentes
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {progress.achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`bg-gradient-to-r ${getAchievementColor(achievement.category)} rounded-2xl p-6 text-white`}
            >
              <div className="text-4xl mb-3">{achievement.icon}</div>
              <h4 className="font-bold text-lg mb-2">{achievement.title}</h4>
              <p className="text-sm opacity-90 mb-3">{achievement.description}</p>
              <div className="text-xs opacity-75">
                Desbloqueado em {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}