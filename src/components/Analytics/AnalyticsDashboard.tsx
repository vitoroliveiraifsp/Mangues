import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Clock, 
  Target, 
  Gamepad2,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { graphqlClient } from '../../services/graphqlClient';
import { useI18n } from '../../hooks/useI18n';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  gamesPlayed: number;
  averageScore: number;
  popularCategories: Array<{
    categoria: string;
    count: number;
    percentage: number;
  }>;
  userEngagement: Array<{
    date: string;
    users: number;
    games: number;
    avgSessionTime: number;
  }>;
  performanceMetrics: {
    avgLoadTime: number;
    errorRate: number;
    cacheHitRate: number;
  };
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }>;
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState<'overview' | 'engagement' | 'performance'>('overview');
  const { t, formatNumber, formatDate } = useI18n();

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await graphqlClient.getAnalytics(timeRange);
      setAnalytics(data.analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar analytics');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    if (!analytics) return;

    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        timeRange,
        analytics
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mangues-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const renderChart = (data: ChartData, type: 'bar' | 'line' = 'bar') => {
    // Simple SVG chart implementation
    const maxValue = Math.max(...data.datasets[0].data);
    const chartHeight = 200;
    const chartWidth = 400;
    const barWidth = chartWidth / data.labels.length - 10;

    return (
      <div className="bg-white p-6 rounded-2xl">
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          {data.datasets[0].data.map((value, index) => {
            const barHeight = (value / maxValue) * (chartHeight - 40);
            const x = index * (barWidth + 10) + 5;
            const y = chartHeight - barHeight - 20;

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={data.datasets[0].backgroundColor}
                  rx="4"
                />
                <text
                  x={x + barWidth / 2}
                  y={chartHeight - 5}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#666"
                >
                  {data.labels[index]}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={y - 5}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#333"
                  fontWeight="bold"
                >
                  {formatNumber(value)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="text-red-500 text-6xl mb-4">📊</div>
        <h3 className="text-xl font-bold text-red-700 mb-2">Erro ao Carregar Analytics</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadAnalytics}
          className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  const tabs = [
    { id: 'overview' as const, label: 'Visão Geral', icon: BarChart3 },
    { id: 'engagement' as const, label: 'Engajamento', icon: Users },
    { id: 'performance' as const, label: 'Performance', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-800">📊 Analytics Dashboard</h2>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          >
            <option value="1d">Último dia</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>
          
          <button
            onClick={loadAnalytics}
            className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          
          <button
            onClick={exportData}
            className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
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

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <Users className="h-8 w-8 text-blue-500 mr-3" />
                <h3 className="font-bold text-gray-700">Usuários Totais</h3>
              </div>
              <div className="text-3xl font-bold text-blue-600">{formatNumber(analytics.totalUsers)}</div>
              <p className="text-sm text-gray-500">Registrados na plataforma</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
                <h3 className="font-bold text-gray-700">Usuários Ativos</h3>
              </div>
              <div className="text-3xl font-bold text-green-600">{formatNumber(analytics.activeUsers)}</div>
              <p className="text-sm text-gray-500">Últimos {timeRange}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <Gamepad2 className="h-8 w-8 text-purple-500 mr-3" />
                <h3 className="font-bold text-gray-700">Jogos Jogados</h3>
              </div>
              <div className="text-3xl font-bold text-purple-600">{formatNumber(analytics.gamesPlayed)}</div>
              <p className="text-sm text-gray-500">Total no período</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <Target className="h-8 w-8 text-yellow-500 mr-3" />
                <h3 className="font-bold text-gray-700">Pontuação Média</h3>
              </div>
              <div className="text-3xl font-bold text-yellow-600">{formatNumber(analytics.averageScore)}</div>
              <p className="text-sm text-gray-500">Todos os jogos</p>
            </div>
          </div>

          {/* Popular Categories Chart */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">📈 Categorias Mais Populares</h3>
            {analytics.popularCategories.length > 0 ? (
              renderChart({
                labels: analytics.popularCategories.map(cat => cat.categoria),
                datasets: [{
                  label: 'Jogos',
                  data: analytics.popularCategories.map(cat => cat.count),
                  backgroundColor: '#3b82f6',
                  borderColor: '#1d4ed8'
                }]
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhum dado disponível para o período selecionado
              </div>
            )}
          </div>
        </div>
      )}

      {/* Engagement Tab */}
      {activeTab === 'engagement' && (
        <div className="space-y-6">
          {/* User Engagement Chart */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">👥 Engajamento de Usuários</h3>
            {analytics.userEngagement.length > 0 ? (
              renderChart({
                labels: analytics.userEngagement.map(item => formatDate(item.date)),
                datasets: [{
                  label: 'Usuários Ativos',
                  data: analytics.userEngagement.map(item => item.users),
                  backgroundColor: '#10b981',
                  borderColor: '#059669'
                }]
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                Dados de engajamento não disponíveis
              </div>
            )}
          </div>

          {/* Engagement Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <Clock className="h-8 w-8 text-blue-500 mr-3" />
                <h3 className="font-bold text-gray-700">Tempo Médio de Sessão</h3>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {analytics.userEngagement.length > 0 
                  ? `${Math.round(analytics.userEngagement.reduce((acc, item) => acc + item.avgSessionTime, 0) / analytics.userEngagement.length)}min`
                  : '0min'
                }
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <Gamepad2 className="h-8 w-8 text-green-500 mr-3" />
                <h3 className="font-bold text-gray-700">Jogos por Usuário</h3>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {analytics.activeUsers > 0 
                  ? formatNumber(Math.round(analytics.gamesPlayed / analytics.activeUsers))
                  : '0'
                }
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
                <h3 className="font-bold text-gray-700">Taxa de Retenção</h3>
              </div>
              <div className="text-3xl font-bold text-purple-600">
                {analytics.totalUsers > 0 
                  ? `${Math.round((analytics.activeUsers / analytics.totalUsers) * 100)}%`
                  : '0%'
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <Clock className="h-8 w-8 text-blue-500 mr-3" />
                <h3 className="font-bold text-gray-700">Tempo de Carregamento</h3>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {analytics.performanceMetrics.avgLoadTime.toFixed(1)}s
              </div>
              <div className={`text-sm ${
                analytics.performanceMetrics.avgLoadTime < 3 ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {analytics.performanceMetrics.avgLoadTime < 3 ? '✅ Excelente' : '⚠️ Pode melhorar'}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <Target className="h-8 w-8 text-red-500 mr-3" />
                <h3 className="font-bold text-gray-700">Taxa de Erro</h3>
              </div>
              <div className="text-3xl font-bold text-red-600">
                {(analytics.performanceMetrics.errorRate * 100).toFixed(1)}%
              </div>
              <div className={`text-sm ${
                analytics.performanceMetrics.errorRate < 0.05 ? 'text-green-600' : 'text-red-600'
              }`}>
                {analytics.performanceMetrics.errorRate < 0.05 ? '✅ Baixa' : '❌ Alta'}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-8 w-8 text-green-500 mr-3" />
                <h3 className="font-bold text-gray-700">Cache Hit Rate</h3>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {(analytics.performanceMetrics.cacheHitRate * 100).toFixed(1)}%
              </div>
              <div className={`text-sm ${
                analytics.performanceMetrics.cacheHitRate > 0.8 ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {analytics.performanceMetrics.cacheHitRate > 0.8 ? '✅ Eficiente' : '⚠️ Pode otimizar'}
              </div>
            </div>
          </div>

          {/* Performance Recommendations */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">💡 Recomendações de Performance</h3>
            
            <div className="space-y-4">
              {analytics.performanceMetrics.avgLoadTime > 3 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <h4 className="font-bold text-yellow-800 mb-2">⚠️ Tempo de Carregamento Alto</h4>
                  <p className="text-yellow-700 text-sm">
                    Considere implementar lazy loading e otimização de imagens.
                  </p>
                </div>
              )}
              
              {analytics.performanceMetrics.errorRate > 0.05 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <h4 className="font-bold text-red-800 mb-2">❌ Taxa de Erro Elevada</h4>
                  <p className="text-red-700 text-sm">
                    Revisar logs de erro e implementar melhor tratamento de exceções.
                  </p>
                </div>
              )}
              
              {analytics.performanceMetrics.cacheHitRate < 0.8 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h4 className="font-bold text-blue-800 mb-2">📦 Cache Pode Ser Otimizado</h4>
                  <p className="text-blue-700 text-sm">
                    Ajustar estratégias de cache para melhorar performance.
                  </p>
                </div>
              )}
              
              {analytics.performanceMetrics.avgLoadTime <= 3 && 
               analytics.performanceMetrics.errorRate <= 0.05 && 
               analytics.performanceMetrics.cacheHitRate >= 0.8 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                  <h4 className="font-bold text-green-800 mb-2">🎉 Performance Excelente!</h4>
                  <p className="text-green-700 text-sm">
                    Todos os indicadores estão dentro dos parâmetros ideais.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}