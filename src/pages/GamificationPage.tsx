import { useState } from 'react';
import { Trophy, Target, Award, Star } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { MissionPanel } from '../components/Gamification/MissionPanel';
import { AchievementShowcase } from '../components/Gamification/AchievementShowcase';
import { useAuth } from '../hooks/useAuth';

export function GamificationPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'missions' | 'achievements' | 'leaderboard'>('missions');

  const tabs = [
    { id: 'missions' as const, label: 'Missões', icon: Target, color: 'purple' },
    { id: 'achievements' as const, label: 'Conquistas', icon: Trophy, color: 'yellow' },
    { id: 'leaderboard' as const, label: 'Ranking XP', icon: Award, color: 'blue' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <BackButton to="/" label="Voltar ao Início" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            🎮 Centro de Gamificação
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Acompanhe suas missões, conquistas e progresso no ranking! 
            Cada jogo e atividade te aproxima de novas recompensas.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg">
            <div className="flex space-x-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                      activeTab === tab.id
                        ? `bg-${tab.color}-500 text-white shadow-md transform scale-105`
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
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
        <div className="space-y-8">
          {activeTab === 'missions' && <MissionPanel />}
          {activeTab === 'achievements' && <AchievementShowcase />}
          {activeTab === 'leaderboard' && (
            <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ranking XP</h2>
              <p className="text-gray-600 mb-6">
                Funcionalidade em desenvolvimento. Em breve você poderá ver sua posição no ranking global de XP!
              </p>
              <div className="bg-blue-50 rounded-2xl p-6">
                <h3 className="font-bold text-blue-800 mb-2">🚀 Próximas Funcionalidades</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Ranking global de XP em tempo real</li>
                  <li>• Comparação com amigos</li>
                  <li>• Ligas competitivas por nível</li>
                  <li>• Recompensas semanais para top players</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {user && (
          <div className="mt-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-3xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">📊 Seu Resumo de Atividade</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/20 rounded-xl p-4">
                <div className="text-3xl mb-2">🎮</div>
                <div className="text-2xl font-bold">42</div>
                <div className="text-sm opacity-90">Jogos Jogados</div>
              </div>
              <div className="bg-white/20 rounded-xl p-4">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm opacity-90">Conquistas</div>
              </div>
              <div className="bg-white/20 rounded-xl p-4">
                <div className="text-3xl mb-2">⭐</div>
                <div className="text-2xl font-bold">1,250</div>
                <div className="text-sm opacity-90">XP Total</div>
              </div>
              <div className="bg-white/20 rounded-xl p-4">
                <div className="text-3xl mb-2">🔥</div>
                <div className="text-2xl font-bold">7</div>
                <div className="text-sm opacity-90">Dias de Sequência</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}