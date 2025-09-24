import { useAuth } from '../hooks/useAuth';
import { AnalyticsDashboard } from '../components/Analytics/AnalyticsDashboard';
import { BackButton } from '../components/BackButton';

export function AnalyticsPage() {
  const { user } = useAuth();

  // Check if user is admin
  const isAdmin = user?.email === 'admin@mangues.com' || user?.email === 'vtr17.on@gmail.com';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar o painel de analytics.</p>
          <div className="mt-6">
            <BackButton to="/" label="Voltar ao Início" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <BackButton to="/" label="Voltar ao Início" />
        </div>
        
        <AnalyticsDashboard />
      </div>
    </div>
  );
}