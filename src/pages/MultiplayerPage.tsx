import { useState } from 'react';
import { Users, Play, Trophy, Clock } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { MultiplayerLobby } from '../components/Multiplayer/MultiplayerLobby';
import { useI18n } from '../hooks/useI18n';

interface MultiplayerRoom {
  id: string;
  name: string;
  players: any[];
  gameType: 'quiz' | 'memoria' | 'conexoes';
  status: 'waiting' | 'playing' | 'finished';
}

export function MultiplayerPage() {
  const [showLobby, setShowLobby] = useState(false);
  const [currentGame, setCurrentGame] = useState<MultiplayerRoom | null>(null);
  const { t } = useI18n();

  const handleGameStart = (room: MultiplayerRoom) => {
    setCurrentGame(room);
    setShowLobby(false);
  };

  const handleGameEnd = () => {
    setCurrentGame(null);
  };

  if (currentGame) {
    // Render the actual multiplayer game
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              🎮 Jogo Multiplayer em Andamento
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Sala: {currentGame.name} • Tipo: {currentGame.gameType}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {currentGame.players.map((player, index) => (
                <div key={player.id} className="bg-gray-50 rounded-2xl p-6">
                  <div className="text-4xl mb-2">👤</div>
                  <h3 className="font-bold text-lg">{player.name}</h3>
                  <div className="text-2xl font-bold text-blue-600">{player.score || 0}</div>
                  <div className="text-sm text-gray-500">pontos</div>
                </div>
              ))}
            </div>

            <button
              onClick={handleGameEnd}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-3 px-8 
                       rounded-2xl hover:from-red-600 hover:to-pink-600 transition-colors"
            >
              Sair do Jogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <BackButton to="/" label="Voltar ao Início" />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            👥 Modo Multiplayer
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Jogue com seus amigos em tempo real! Crie uma sala ou entre em uma existente 
            para competir e aprender juntos sobre os mangues.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Jogue com Amigos</h3>
            <p className="text-gray-600">
              Até 6 jogadores podem participar da mesma sala e competir em tempo real.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Play className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Tempo Real</h3>
            <p className="text-gray-600">
              Veja as respostas dos outros jogadores instantaneamente e acompanhe o placar ao vivo.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Competição Amigável</h3>
            <p className="text-gray-600">
              Sistema de pontuação justo que premia tanto velocidade quanto conhecimento.
            </p>
          </div>
        </div>

        {/* Game Types */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
            🎮 Jogos Disponíveis
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="font-bold text-lg mb-2 text-blue-700">Quiz Multiplayer</h3>
              <p className="text-gray-600 text-sm">
                Respondam às mesmas perguntas e vejam quem sabe mais sobre os mangues!
              </p>
            </div>

            <div className="bg-purple-50 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="font-bold text-lg mb-2 text-purple-700">Memória Cooperativa</h3>
              <p className="text-gray-600 text-sm">
                Trabalhem juntos para encontrar todos os pares no menor tempo possível!
              </p>
            </div>

            <div className="bg-indigo-50 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="font-bold text-lg mb-2 text-indigo-700">Conexões em Equipe</h3>
              <p className="text-gray-600 text-sm">
                Conectem os superpoderes dos animais trabalhando em equipe!
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <button
            onClick={() => setShowLobby(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-8 
                     rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 
                     shadow-lg hover:shadow-xl transform hover:scale-105 text-xl flex items-center 
                     justify-center space-x-3 mx-auto"
          >
            <Users className="h-6 w-6" />
            <span>🚀 Começar Multiplayer</span>
          </button>
        </div>

        {/* How to Play */}
        <div className="mt-16 bg-gradient-to-r from-green-100 to-blue-100 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
            📋 Como Jogar Multiplayer
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 font-bold text-blue-600">
                1
              </div>
              <h4 className="font-bold mb-2">Criar ou Entrar</h4>
              <p className="text-sm text-gray-600">
                Crie uma nova sala ou use um código para entrar em uma existente.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 font-bold text-green-600">
                2
              </div>
              <h4 className="font-bold mb-2">Aguardar Jogadores</h4>
              <p className="text-sm text-gray-600">
                Compartilhe o código da sala e aguarde seus amigos entrarem.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 font-bold text-purple-600">
                3
              </div>
              <h4 className="font-bold mb-2">Todos Prontos</h4>
              <p className="text-sm text-gray-600">
                Marquem como "Pronto" e o host pode iniciar o jogo.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 font-bold text-yellow-600">
                4
              </div>
              <h4 className="font-bold mb-2">Jogar e Competir</h4>
              <p className="text-sm text-gray-600">
                Respondam às perguntas e vejam o placar em tempo real!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Multiplayer Lobby Modal */}
      {showLobby && (
        <MultiplayerLobby
          onGameStart={handleGameStart}
          onClose={() => setShowLobby(false)}
        />
      )}
    </div>
  );
}