import { useState, useEffect } from 'react';
import { useOfflineApi } from '../hooks/useOfflineApi';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { BackButton } from '../components/BackButton';
import { Trophy, Medal, Star, Clock, Target, TrendingUp, Users, Gamepad2 } from 'lucide-react';

interface Pontuacao {
  id: number;
  nomeJogador: string;
  jogo: string;
  pontuacao: number;
  dificuldade?: string;
  categoria?: string;
  data: string;
  detalhes: any;
  posicao?: number;
}

interface Estatisticas {
  totalJogos: number;
  jogosPorTipo: { [key: string]: number };
  pontuacaoMedia: { [key: string]: number };
  melhorPontuacao: number;
  jogadorMaisAtivo: { nome: string; jogos: number } | null;
}

type FiltroJogo = 'todos' | 'memoria' | 'quiz' | 'conexoes';

export function RankingPage() {
  const [filtroJogo, setFiltroJogo] = useState<FiltroJogo>('todos');
  
  const { data: ranking, loading: loadingRanking, error: errorRanking, refetch: refetchRanking } = 
    useOfflineApi<Pontuacao[]>(
      filtroJogo === 'todos' ? '/api/ranking?limite=20' : `/api/ranking?jogo=${filtroJogo}&limite=20`,
      { enableOfflineFirst: true, fallbackData: [] }
    );
    
  const { data: estatisticas, loading: loadingStats, error: errorStats } = 
    useOfflineApi<Estatisticas>('/api/estatisticas', { 
      enableOfflineFirst: true,
      fallbackData: {
        totalJogos: 0,
        jogosPorTipo: {},
        pontuacaoMedia: {},
        melhorPontuacao: 0,
        jogadorMaisAtivo: null
      }
    });

  // Recarregar quando filtro mudar
  useEffect(() => {
    refetchRanking();
  }, [filtroJogo]);

  const loading = loadingRanking || loadingStats;
  const error = errorRanking || errorStats;

  const getJogoInfo = (jogo: string) => {
    switch (jogo) {
      case 'memoria': return { nome: 'Jogo da Memória', emoji: '🧠', cor: 'purple' };
      case 'quiz': return { nome: 'Quiz', emoji: '🧠', cor: 'blue' };
      case 'conexoes': return { nome: 'Conexões', emoji: '🔗', cor: 'indigo' };
      default: return { nome: jogo, emoji: '🎮', cor: 'gray' };
    }
  };

  const getMedalhaEmoji = (posicao: number) => {
    switch (posicao) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Botão de voltar */}
        <div className="mb-6">
          <BackButton to="/" label="Voltar ao Início" />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            🏆 Ranking dos Campeões
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Veja quem são os melhores jogadores do Mundo dos Mangues! 
            Será que você consegue chegar ao topo?
          </p>
        </div>

        {/* Estatísticas Gerais */}
        {estatisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="flex items-center justify-center mb-3">
                <Gamepad2 className="h-8 w-8 text-blue-500 mr-2" />
                <span className="font-bold text-gray-600">Total de Jogos</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">{estatisticas.totalJogos}</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="flex items-center justify-center mb-3">
                <Trophy className="h-8 w-8 text-yellow-500 mr-2" />
                <span className="font-bold text-gray-600">Melhor Pontuação</span>
              </div>
              <div className="text-3xl font-bold text-yellow-600">{estatisticas.melhorPontuacao}</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="flex items-center justify-center mb-3">
                <Users className="h-8 w-8 text-green-500 mr-2" />
                <span className="font-bold text-gray-600">Jogador Mais Ativo</span>
              </div>
              <div className="text-lg font-bold text-green-600">
                {estatisticas.jogadorMaisAtivo?.nome || 'Nenhum'}
              </div>
              {estatisticas.jogadorMaisAtivo && (
                <div className="text-sm text-gray-500">
                  {estatisticas.jogadorMaisAtivo.jogos} jogos
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="flex items-center justify-center mb-3">
                <TrendingUp className="h-8 w-8 text-purple-500 mr-2" />
                <span className="font-bold text-gray-600">Jogo Favorito</span>
              </div>
              <div className="text-lg font-bold text-purple-600">
                {estatisticas && Object.entries(estatisticas.jogosPorTipo).length > 0 
                  ? getJogoInfo(Object.entries(estatisticas.jogosPorTipo)
                      .sort(([,a], [,b]) => b - a)[0][0]).nome
                  : 'Nenhum'
                }
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'todos' as const, label: '🎮 Todos os Jogos' },
                { id: 'memoria' as const, label: '🧠 Memória' },
                { id: 'quiz' as const, label: '🧠 Quiz' },
                { id: 'conexoes' as const, label: '🔗 Conexões' }
              ].map((filtro) => (
                <button
                  key={filtro.id}
                  onClick={() => setFiltroJogo(filtro.id)}
                  className={`px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 ${
                    filtroJogo === filtro.id
                      ? 'bg-yellow-500 text-white shadow-md transform scale-105'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-yellow-600'
                  }`}
                >
                  {filtro.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pódio (Top 3) */}
        {ranking && ranking.length >= 3 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
              🏆 Pódio dos Campeões
            </h2>
            
            <div className="flex justify-center items-end space-x-4 mb-8">
              {/* 2º Lugar */}
              <div className="bg-white rounded-3xl p-6 shadow-xl text-center transform hover:scale-105 transition-transform">
                <div className="text-6xl mb-4">🥈</div>
                <div className="text-2xl font-bold text-gray-800 mb-2">{ranking[1].nomeJogador}</div>
                <div className="text-3xl font-bold text-gray-600 mb-2">{ranking[1].pontuacao}</div>
                <div className="text-sm text-gray-500">
                  {getJogoInfo(ranking[1].jogo).emoji} {getJogoInfo(ranking[1].jogo).nome}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {formatarData(ranking[1].data)}
                </div>
              </div>

              {/* 1º Lugar */}
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-8 shadow-2xl text-center text-white transform hover:scale-105 transition-transform relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-yellow-500 rounded-full p-2">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-8xl mb-4">👑</div>
                <div className="text-3xl font-bold mb-2">{ranking[0].nomeJogador}</div>
                <div className="text-4xl font-bold mb-2">{ranking[0].pontuacao}</div>
                <div className="text-lg opacity-90">
                  {getJogoInfo(ranking[0].jogo).emoji} {getJogoInfo(ranking[0].jogo).nome}
                </div>
                <div className="text-sm opacity-75 mt-2">
                  {formatarData(ranking[0].data)}
                </div>
              </div>

              {/* 3º Lugar */}
              <div className="bg-white rounded-3xl p-6 shadow-xl text-center transform hover:scale-105 transition-transform">
                <div className="text-6xl mb-4">🥉</div>
                <div className="text-2xl font-bold text-gray-800 mb-2">{ranking[2].nomeJogador}</div>
                <div className="text-3xl font-bold text-orange-600 mb-2">{ranking[2].pontuacao}</div>
                <div className="text-sm text-gray-500">
                  {getJogoInfo(ranking[2].jogo).emoji} {getJogoInfo(ranking[2].jogo).nome}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {formatarData(ranking[2].data)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ranking Completo */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
            <h2 className="text-2xl font-bold text-center">
              📊 Ranking Completo
            </h2>
          </div>

          <div className="p-6">
            {!ranking || ranking.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-2xl font-bold text-gray-600 mb-2">
                  Nenhuma pontuação encontrada
                </h3>
                <p className="text-gray-500">
                  Seja o primeiro a jogar e aparecer no ranking!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {ranking.map((pontuacao, index) => {
                  const jogoInfo = getJogoInfo(pontuacao.jogo);
                  const isTop3 = index < 3;
                  
                  return (
                    <div
                      key={pontuacao.id}
                      className={`flex items-center p-4 rounded-2xl transition-all duration-300 hover:shadow-lg ${
                        isTop3 
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {/* Posição */}
                      <div className="flex-shrink-0 w-16 text-center">
                        <div className="text-3xl">{getMedalhaEmoji(pontuacao.posicao || index + 1)}</div>
                        <div className="text-sm font-bold text-gray-600">
                          #{pontuacao.posicao || index + 1}
                        </div>
                      </div>

                      {/* Informações do jogador */}
                      <div className="flex-1 ml-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">
                            {pontuacao.nomeJogador}
                          </h3>
                          <span className="text-2xl">{jogoInfo.emoji}</span>
                          <span className="bg-gray-200 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                            {jogoInfo.nome}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatarData(pontuacao.data)}
                          </div>
                          
                          {pontuacao.dificuldade && (
                            <div className="flex items-center">
                              <Target className="h-4 w-4 mr-1" />
                              {pontuacao.dificuldade}
                            </div>
                          )}
                          
                          {pontuacao.categoria && (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 mr-1" />
                              {pontuacao.categoria}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pontuação */}
                      <div className="flex-shrink-0 text-right">
                        <div className={`text-3xl font-bold ${
                          isTop3 ? 'text-yellow-600' : 'text-gray-700'
                        }`}>
                          {pontuacao.pontuacao}
                        </div>
                        <div className="text-sm text-gray-500">pontos</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-3xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">🚀 Quer Aparecer no Ranking?</h2>
          <p className="text-xl mb-6 opacity-90">
            Jogue nossos jogos educativos e mostre seus conhecimentos sobre os mangues!
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/jogo-da-memoria"
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-2xl 
                       font-bold transition-all duration-300 transform hover:scale-105"
            >
              🧠 Jogo da Memória
            </a>
            <a
              href="/quiz"
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-2xl 
                       font-bold transition-all duration-300 transform hover:scale-105"
            >
              🧠 Quiz Interativo
            </a>
            <a
              href="/jogo-conexoes"
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-3 rounded-2xl 
                       font-bold transition-all duration-300 transform hover:scale-105"
            >
              🔗 Jogo das Conexões
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}