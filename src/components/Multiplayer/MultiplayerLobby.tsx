import { useState, useEffect } from 'react';
import { Users, Play, Copy, RefreshCw, Crown, Clock, Gamepad2 } from 'lucide-react';
import { websocketService } from '../../services/websocketService';
import { useI18n } from '../../hooks/useI18n';

interface MultiplayerRoom {
  id: string;
  name: string;
  players: Player[];
  gameType: 'quiz' | 'memoria' | 'conexoes';
  status: 'waiting' | 'playing' | 'finished';
  maxPlayers: number;
  createdAt: number;
}

interface Player {
  id: string;
  name: string;
  avatar: string;
  isReady: boolean;
  isHost: boolean;
  score: number;
  lastActivity: number;
}

interface MultiplayerLobbyProps {
  onGameStart: (room: MultiplayerRoom) => void;
  onClose: () => void;
}

export function MultiplayerLobby({ onGameStart, onClose }: MultiplayerLobbyProps) {
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'room'>('menu');
  const [currentRoom, setCurrentRoom] = useState<MultiplayerRoom | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [gameType, setGameType] = useState<'quiz' | 'memoria' | 'conexoes'>('quiz');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    // Connect to WebSocket
    const connectWebSocket = async () => {
      try {
        setIsConnecting(true);
        await websocketService.connect();
        
        // Set up event listeners
        websocketService.on('room_update', handleRoomUpdate);
        websocketService.on('game_start', handleGameStart);
        websocketService.on('player_ready', handlePlayerReady);
        
      } catch (error) {
        setError('Erro ao conectar ao servidor multiplayer');
        console.error('WebSocket connection error:', error);
      } finally {
        setIsConnecting(false);
      }
    };

    connectWebSocket();

    return () => {
      websocketService.off('room_update', handleRoomUpdate);
      websocketService.off('game_start', handleGameStart);
      websocketService.off('player_ready', handlePlayerReady);
    };
  }, []);

  const handleRoomUpdate = (room: MultiplayerRoom) => {
    setCurrentRoom(room);
    if (room.status === 'waiting') {
      setMode('room');
    }
  };

  const handleGameStart = (gameData: any) => {
    if (currentRoom) {
      onGameStart({ ...currentRoom, ...gameData });
    }
  };

  const handlePlayerReady = (data: any) => {
    console.log('Player ready:', data);
  };

  const createRoom = () => {
    if (!playerName.trim()) {
      setError('Por favor, digite seu nome');
      return;
    }

    setError(null);
    websocketService.createRoom(`Sala de ${playerName}`, gameType);
  };

  const joinRoom = () => {
    if (!playerName.trim() || !roomCode.trim()) {
      setError('Por favor, digite seu nome e o código da sala');
      return;
    }

    setError(null);
    websocketService.joinRoom(roomCode.toUpperCase(), playerName);
  };

  const toggleReady = () => {
    if (currentRoom) {
      const currentPlayer = currentRoom.players.find(p => p.id === websocketService.getPlayerId());
      websocketService.setPlayerReady(!currentPlayer?.isReady);
    }
  };

  const startGame = () => {
    websocketService.startGame();
  };

  const leaveRoom = () => {
    websocketService.leaveRoom();
    setCurrentRoom(null);
    setMode('menu');
  };

  const copyRoomCode = async () => {
    if (currentRoom) {
      try {
        await navigator.clipboard.writeText(currentRoom.id);
        alert('Código da sala copiado! 📋');
      } catch (error) {
        console.error('Error copying room code:', error);
      }
    }
  };

  const getGameTypeInfo = (type: string) => {
    const gameTypes = {
      quiz: { name: t('navigation.quiz'), emoji: '🧠', color: 'blue' },
      memoria: { name: t('navigation.memory'), emoji: '🎮', color: 'purple' },
      conexoes: { name: t('navigation.connections'), emoji: '🔗', color: 'indigo' }
    };
    return gameTypes[type as keyof typeof gameTypes] || gameTypes.quiz;
  };

  if (isConnecting) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Conectando...</h2>
          <p className="text-gray-600">Preparando o modo multiplayer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8" />
              <h2 className="text-2xl font-bold">Modo Multiplayer</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          )}

          {/* Main Menu */}
          {mode === 'menu' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  🎮 Jogar com Amigos
                </h3>
                <p className="text-gray-600">
                  Crie uma sala ou entre em uma existente para jogar junto!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('create')}
                  className="p-6 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl 
                           hover:from-green-600 hover:to-blue-600 transition-colors text-center"
                >
                  <div className="text-4xl mb-3">🏠</div>
                  <h4 className="font-bold text-lg mb-2">Criar Sala</h4>
                  <p className="text-sm opacity-90">Seja o host e convide amigos</p>
                </button>

                <button
                  onClick={() => setMode('join')}
                  className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl 
                           hover:from-purple-600 hover:to-pink-600 transition-colors text-center"
                >
                  <div className="text-4xl mb-3">🚪</div>
                  <h4 className="font-bold text-lg mb-2">Entrar na Sala</h4>
                  <p className="text-sm opacity-90">Use um código para entrar</p>
                </button>
              </div>
            </div>
          )}

          {/* Create Room */}
          {mode === 'create' && (
            <div className="space-y-6">
              <button
                onClick={() => setMode('menu')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Voltar
              </button>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">🏠 Criar Nova Sala</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Seu Nome
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Digite seu nome"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={20}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Tipo de Jogo
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['quiz', 'memoria', 'conexoes'] as const).map((type) => {
                      const gameInfo = getGameTypeInfo(type);
                      return (
                        <button
                          key={type}
                          onClick={() => setGameType(type)}
                          className={`p-4 rounded-xl border-2 transition-colors text-center ${
                            gameType === type
                              ? 'border-blue-400 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <div className="text-2xl mb-1">{gameInfo.emoji}</div>
                          <div className="text-sm font-medium">{gameInfo.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={createRoom}
                  disabled={!playerName.trim()}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 px-6 
                           rounded-2xl hover:from-green-600 hover:to-blue-600 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🚀 Criar Sala
                </button>
              </div>
            </div>
          )}

          {/* Join Room */}
          {mode === 'join' && (
            <div className="space-y-6">
              <button
                onClick={() => setMode('menu')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Voltar
              </button>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">🚪 Entrar na Sala</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Seu Nome
                  </label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Digite seu nome"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    maxLength={20}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Código da Sala
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Digite o código da sala"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center font-mono text-lg"
                    maxLength={6}
                  />
                </div>

                <button
                  onClick={joinRoom}
                  disabled={!playerName.trim() || !roomCode.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-6 
                           rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🎯 Entrar na Sala
                </button>
              </div>
            </div>
          )}

          {/* Room Lobby */}
          {mode === 'room' && currentRoom && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={leaveRoom}
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  ← Sair da Sala
                </button>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={copyRoomCode}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 
                             rounded-xl transition-colors text-sm font-medium"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Código: {currentRoom.id}</span>
                  </button>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{currentRoom.name}</h3>
                <div className="flex items-center justify-center space-x-2 text-gray-600">
                  <Gamepad2 className="h-5 w-5" />
                  <span>{getGameTypeInfo(currentRoom.gameType).name}</span>
                </div>
              </div>

              {/* Players List */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h4 className="font-bold text-lg mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Jogadores ({currentRoom.players.length}/{currentRoom.maxPlayers})
                </h4>
                
                <div className="space-y-3">
                  {currentRoom.players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-4 bg-white rounded-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-400 
                                      rounded-full flex items-center justify-center text-white font-bold">
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{player.name}</span>
                            {player.isHost && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Pontuação: {player.score}
                          </div>
                        </div>
                      </div>
                      
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        player.isReady 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {player.isReady ? '✅ Pronto' : '⏳ Aguardando'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Controls */}
              <div className="space-y-4">
                <button
                  onClick={toggleReady}
                  className={`w-full font-bold py-4 px-6 rounded-2xl transition-colors ${
                    currentRoom.players.find(p => p.id === websocketService.getPlayerId())?.isReady
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {currentRoom.players.find(p => p.id === websocketService.getPlayerId())?.isReady
                    ? '⏳ Cancelar Pronto'
                    : '✅ Estou Pronto!'
                  }
                </button>

                {/* Start Game (Host only) */}
                {currentRoom.players.find(p => p.id === websocketService.getPlayerId())?.isHost && (
                  <button
                    onClick={startGame}
                    disabled={!currentRoom.players.every(p => p.isReady) || currentRoom.players.length < 2}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 px-6 
                             rounded-2xl hover:from-green-600 hover:to-blue-600 transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Play className="h-5 w-5" />
                    <span>🚀 Iniciar Jogo</span>
                  </button>
                )}
              </div>

              {/* Game Info */}
              <div className="bg-blue-50 rounded-2xl p-6 text-center">
                <h4 className="font-bold text-blue-800 mb-2">ℹ️ Informações do Jogo</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Todos os jogadores respondem às mesmas perguntas</p>
                  <p>• Pontuação baseada em velocidade e precisão</p>
                  <p>• Resultados em tempo real</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}