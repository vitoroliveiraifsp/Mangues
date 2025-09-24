import { useState, useEffect } from 'react';
import { 
  Users, 
  BarChart3, 
  Settings, 
  Database, 
  FileText, 
  Shield,
  Plus,
  Edit,
  Trash2,
  Download
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AdminStats {
  totalUsers: number;
  totalGames: number;
  totalQuestions: number;
  averageScore: number;
  popularGame: string;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: 'user_registered' | 'game_played' | 'question_added';
  description: string;
  timestamp: string;
  user?: string;
}

interface Question {
  id: string;
  categoria: string;
  pergunta: string;
  opcoes: string[];
  respostaCorreta: number;
  explicacao: string;
  dificuldade: string;
  pontos: number;
  ativo: boolean;
}

export function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'content' | 'settings'>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user is admin (in real app, this would be a role check)
  const isAdmin = user?.email === 'admin@mangues.com' || user?.email === 'vtr17.on@gmail.com';

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Mock data - in real implementation, fetch from API
      const mockStats: AdminStats = {
        totalUsers: 156,
        totalGames: 1247,
        totalQuestions: 45,
        averageScore: 750,
        popularGame: 'Jogo da Memória',
        recentActivity: [
          {
            id: '1',
            type: 'user_registered',
            description: 'Novo usuário: Maria Silva',
            timestamp: new Date().toISOString(),
            user: 'Maria Silva'
          },
          {
            id: '2',
            type: 'game_played',
            description: 'Quiz completado com 850 pontos',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            user: 'João Santos'
          }
        ]
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (type: 'users' | 'scores' | 'questions') => {
    try {
      // Mock export functionality
      const data = { type, exported_at: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `mangues_${type}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar o painel administrativo.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: BarChart3 },
    { id: 'users' as const, label: 'Usuários', icon: Users },
    { id: 'content' as const, label: 'Conteúdo', icon: FileText },
    { id: 'settings' as const, label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Painel Administrativo</h1>
          </div>
          <p className="text-lg text-gray-600">
            Gerencie usuários, conteúdo e monitore o desempenho da plataforma
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg">
            <div className="flex space-x-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-blue-500 text-white shadow-md transform scale-105'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <Users className="h-8 w-8 text-blue-500 mr-3" />
                  <h3 className="font-bold text-gray-700">Usuários</h3>
                </div>
                <div className="text-3xl font-bold text-blue-600">{stats.totalUsers}</div>
                <p className="text-sm text-gray-500">Total registrados</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <BarChart3 className="h-8 w-8 text-green-500 mr-3" />
                  <h3 className="font-bold text-gray-700">Jogos</h3>
                </div>
                <div className="text-3xl font-bold text-green-600">{stats.totalGames}</div>
                <p className="text-sm text-gray-500">Total jogados</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <FileText className="h-8 w-8 text-purple-500 mr-3" />
                  <h3 className="font-bold text-gray-700">Questões</h3>
                </div>
                <div className="text-3xl font-bold text-purple-600">{stats.totalQuestions}</div>
                <p className="text-sm text-gray-500">No banco de dados</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
                  <h3 className="font-bold text-gray-700">Pontuação</h3>
                </div>
                <div className="text-3xl font-bold text-yellow-600">{stats.averageScore}</div>
                <p className="text-sm text-gray-500">Média geral</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Atividade Recente</h3>
              <div className="space-y-4">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{activity.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-8">
            {/* Content Management */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Gerenciar Questões</h3>
                <button className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-blue-600 transition-colors flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Nova Questão</span>
                </button>
              </div>

              <div className="space-y-4">
                {/* This would be populated with actual questions */}
                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">Qual animal consegue respirar fora da água?</h4>
                      <p className="text-sm text-gray-600">Categoria: Biodiversidade • Dificuldade: Fácil</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Exportar Dados</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => exportData('users')}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
                >
                  <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-bold text-gray-800">Usuários</h4>
                  <p className="text-sm text-gray-600">Exportar lista de usuários</p>
                </button>

                <button
                  onClick={() => exportData('scores')}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-colors text-center"
                >
                  <BarChart3 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-bold text-gray-800">Pontuações</h4>
                  <p className="text-sm text-gray-600">Exportar dados de jogos</p>
                </button>

                <button
                  onClick={() => exportData('questions')}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-colors text-center"
                >
                  <FileText className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <h4 className="font-bold text-gray-800">Questões</h4>
                  <p className="text-sm text-gray-600">Exportar banco de questões</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs would be implemented similarly */}
      </div>
    </div>
  );
}