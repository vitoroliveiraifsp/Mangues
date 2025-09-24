import { useState, useEffect, useCallback } from 'react';
import { useApi } from '../hooks/useApi';
import { useGame } from '../context/GameContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { BackButton } from '../components/BackButton';
import { audioFeedback } from '../utils/audioFeedback';
import { RotateCcw, Trophy, Clock, Target, Star, Settings } from 'lucide-react';

interface CartaJogo {
  id: number;
  nome: string;
  imagem: string;
  categoria: string;
}

interface CartaMemoria extends CartaJogo {
  uniqueId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

type Dificuldade = 'facil' | 'medio' | 'dificil';

interface ConfigDificuldade {
  nome: string;
  pares: number;
  multiplicadorPontos: number;
  tempoBonus: number;
  emoji: string;
}

const dificuldades: Record<Dificuldade, ConfigDificuldade> = {
  facil: { nome: 'Fácil', pares: 6, multiplicadorPontos: 1, tempoBonus: 0, emoji: '😊' },
  medio: { nome: 'Médio', pares: 10, multiplicadorPontos: 1.5, tempoBonus: 50, emoji: '🤔' },
  dificil: { nome: 'Difícil', pares: 12, multiplicadorPontos: 2, tempoBonus: 100, emoji: '😤' }
};

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function JogoDaMemoria() {
  const { data: cartasOriginal, loading, error } = useApi<CartaJogo[]>('/api/jogo-memoria');
  const { state, dispatch } = useGame();
  
  const [cartas, setCartas] = useState<CartaMemoria[]>([]);
  const [cartasViradas, setCartasViradas] = useState<CartaMemoria[]>([]);
  const [podeClicar, setPodeClicar] = useState(true);
  const [jogoCompleto, setJogoCompleto] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [dificuldade, setDificuldade] = useState<Dificuldade>('facil');
  const [mostrarSelecaoDificuldade, setMostrarSelecaoDificuldade] = useState(true);
  const [, setJogoIniciado] = useState(false);

  // Initialize game
  const iniciarJogo = useCallback(() => {
    if (!cartasOriginal) return;
    
    const config = dificuldades[dificuldade];
    const cartasParaUsar = cartasOriginal.slice(0, config.pares);
    
    // Create pairs and add unique IDs
    const cartasPares = cartasParaUsar.flatMap(carta => [
      { ...carta, uniqueId: `${carta.id}-1`, isFlipped: false, isMatched: false },
      { ...carta, uniqueId: `${carta.id}-2`, isFlipped: false, isMatched: false }
    ]);
    
    // Shuffle using Fisher-Yates
    const cartasEmbaralhadas = shuffleArray(cartasPares);
    
    setCartas(cartasEmbaralhadas);
    setCartasViradas([]);
    setPodeClicar(true);
    setJogoCompleto(false);
    setMostrarModal(false);
    setJogoIniciado(true);
    setMostrarSelecaoDificuldade(false);
    
    dispatch({ type: 'START_GAME' });
  }, [cartasOriginal, dispatch, dificuldade]);

  // Timer effect
  useEffect(() => {
    if (!state.isPlaying || jogoCompleto) return;
    
    const timer = setInterval(() => {
      dispatch({ type: 'UPDATE_TIME' });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [state.isPlaying, jogoCompleto, dispatch]);

  // Handle card flip
  const virarCarta = (carta: CartaMemoria) => {
    if (!podeClicar || carta.isFlipped || carta.isMatched || cartasViradas.length >= 2) {
      return;
    }

    // Som de clique ao virar carta
    audioFeedback.playClick();

    const novasCartas = cartas.map(c => 
      c.uniqueId === carta.uniqueId ? { ...c, isFlipped: true } : c
    );
    setCartas(novasCartas);

    const novasCartasViradas = [...cartasViradas, { ...carta, isFlipped: true }];
    setCartasViradas(novasCartasViradas);

    if (novasCartasViradas.length === 2) {
      setPodeClicar(false);
      dispatch({ type: 'INCREMENT_ATTEMPTS' });

      setTimeout(() => {
        verificarPar(novasCartasViradas);
      }, 1000);
    }
  };

  // Check for match
  const verificarPar = (cartasParaVerificar: CartaMemoria[]) => {
    const [carta1, carta2] = cartasParaVerificar;
    const ehPar = carta1.id === carta2.id;

    if (ehPar) {
      // Match found
      audioFeedback.playMatch();
      
      const novasCartas = cartas.map(c => 
        c.id === carta1.id ? { ...c, isMatched: true } : c
      );
      setCartas(novasCartas);
      dispatch({ type: 'MATCH_PAIR' });

      // Check if game is complete
      const config = dificuldades[dificuldade];
      const totalPares = config.pares;
      if (state.matchedPairs + 1 === totalPares) {
        setJogoCompleto(true);
        setMostrarModal(true);
        dispatch({ type: 'END_GAME' });
        
        // Som de vitória quando o jogo é completado
        setTimeout(() => audioFeedback.playVictory(), 500);
      }
    } else {
      // No match - flip cards back
      audioFeedback.playError();
      
      const novasCartas = cartas.map(c => 
        c.uniqueId === carta1.uniqueId || c.uniqueId === carta2.uniqueId 
          ? { ...c, isFlipped: false } 
          : c
      );
      setCartas(novasCartas);
    }

    setCartasViradas([]);
    setPodeClicar(true);
  };

  // Reset game
  const reiniciarJogo = () => {
    dispatch({ type: 'RESET_GAME' });
    setJogoIniciado(false);
    setMostrarSelecaoDificuldade(true);
  };

  // Calculate score with difficulty multiplier
  const calcularPontuacao = () => {
    const config = dificuldades[dificuldade];
    const pontuacaoBase = Math.max(0, 1000 - state.attempts * 10);
    const bonusTempo = Math.max(0, config.tempoBonus - state.timeElapsed);
    return Math.round((pontuacaoBase + bonusTempo) * config.multiplicadorPontos);
  };

  // Format time
  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  // Difficulty Selection Screen
  if (mostrarSelecaoDificuldade) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              🎮 Jogo da Memória do Mangue
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Escolha o nível de dificuldade e teste sua memória!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Object.entries(dificuldades).map(([key, config]) => (
              <div
                key={key}
                onClick={() => setDificuldade(key as Dificuldade)}
                className={`bg-white rounded-3xl p-8 shadow-lg cursor-pointer transition-all duration-300 
                           transform hover:scale-105 hover:shadow-2xl ${
                  dificuldade === key 
                    ? 'ring-4 ring-purple-400 bg-purple-50' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">{config.emoji}</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    {config.nome}
                  </h3>
                  <div className="space-y-2 text-gray-600">
                    <p className="flex items-center justify-center">
                      <Star className="h-4 w-4 mr-2 text-yellow-500" />
                      {config.pares} pares ({config.pares * 2} cartas)
                    </p>
                    <p className="flex items-center justify-center">
                      <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
                      Multiplicador: {config.multiplicadorPontos}x
                    </p>
                    {config.tempoBonus > 0 && (
                      <p className="flex items-center justify-center">
                        <Clock className="h-4 w-4 mr-2 text-green-500" />
                        Bônus de tempo: +{config.tempoBonus}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={iniciarJogo}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-8 
                       rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 
                       shadow-lg hover:shadow-xl transform hover:scale-105 text-xl"
            >
              🚀 Começar Jogo ({dificuldades[dificuldade].nome})
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-12 bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              📋 Como Jogar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">👆</div>
                <h3 className="font-bold text-lg mb-2">1. Clique nas Cartas</h3>
                <p className="text-gray-600">Clique em duas cartas para virá-las e ver o que tem embaixo.</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="font-bold text-lg mb-2">2. Encontre os Pares</h3>
                <p className="text-gray-600">Se as duas cartas forem iguais, você encontrou um par!</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="font-bold text-lg mb-2">3. Complete o Jogo</h3>
                <p className="text-gray-600">Encontre todos os pares para ganhar e ver sua pontuação!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Botão de voltar */}
        <div className="mb-6">
          <BackButton to="/" label="Voltar ao Início" />
        </div>
        
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-800">
              🎮 Jogo da Memória
            </h1>
            <div className="ml-4 bg-purple-100 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-purple-700">
                {dificuldades[dificuldade].nome} {dificuldades[dificuldade].emoji}
              </span>
            </div>
          </div>
          <p className="text-base md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Teste sua memória encontrando os pares dos animais e plantas do mangue! 
            Quanto mais rápido você for, maior será sua pontuação!
          </p>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
              <span className="font-bold text-gray-600 text-sm md:text-base">Pontuação</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-yellow-600">
              {jogoCompleto ? calcularPontuacao() : state.score}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-6 w-6 text-blue-500 mr-2" />
              <span className="font-bold text-gray-600 text-sm md:text-base">Tentativas</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-blue-600">{state.attempts}</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-green-500 mr-2" />
              <span className="font-bold text-gray-600 text-sm md:text-base">Tempo</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-green-600">
              {formatarTempo(state.timeElapsed)}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-6 w-6 text-purple-500 mr-2" />
              <span className="font-bold text-gray-600 text-sm md:text-base">Pares</span>
            </div>
            <div className="text-2xl md:text-3xl font-bold text-purple-600">
              {state.matchedPairs}/{dificuldades[dificuldade].pares}
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className={`grid gap-3 md:gap-4 mb-6 md:mb-8 ${
          dificuldade === 'facil' ? 'grid-cols-4 md:grid-cols-6' :
          dificuldade === 'medio' ? 'grid-cols-4 md:grid-cols-5' :
          'grid-cols-4 md:grid-cols-6'
        }`}>
          {cartas.map((carta) => (
            <div
              key={carta.uniqueId}
              onClick={() => virarCarta(carta)}
              className={`aspect-square relative cursor-pointer transform transition-all duration-300 ${
                podeClicar && !carta.isFlipped && !carta.isMatched
                  ? 'hover:scale-105 hover:shadow-lg' 
                  : ''
              }`}
            >
              <div className={`w-full h-full rounded-xl shadow-lg transition-transform duration-500 preserve-3d ${
                carta.isFlipped || carta.isMatched ? 'rotate-y-180' : ''
              }`}>
                {/* Card Back */}
                <div className={`absolute inset-0 w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 
                               rounded-xl flex items-center justify-center backface-hidden ${
                               carta.isMatched ? 'opacity-50' : ''
                             }`}>
                  <div className="text-white text-2xl md:text-4xl">🌿</div>
                </div>
                
                {/* Card Front */}
                <div className={`absolute inset-0 w-full h-full bg-white rounded-xl flex flex-col items-center 
                               justify-center rotate-y-180 backface-hidden border-4 shadow-lg ${
                               carta.isMatched 
                                 ? 'border-green-400 bg-green-50' 
                                 : 'border-gray-200'
                             }`}>
                  <div className="text-3xl md:text-5xl mb-1 md:mb-2">{carta.imagem}</div>
                  <div className="text-xs font-medium text-gray-600 text-center px-1 leading-tight">
                    {carta.nome}
                  </div>
                  {carta.isMatched && (
                    <div className="absolute top-1 right-1 bg-green-400 rounded-full p-1">
                      <div className="text-white text-xs">✓</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={reiniciarJogo}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 px-6 
                     rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 
                     shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
          >
            <Settings className="h-5 w-5 mr-2" />
            Mudar Dificuldade
          </button>
          <button
            onClick={iniciarJogo}
            className="bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-3 px-6 
                     rounded-2xl hover:from-green-600 hover:to-teal-600 transition-all duration-300 
                     shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Reiniciar
          </button>
        </div>

        {/* Victory Modal */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                Parabéns, Campeão!
              </h2>
              <p className="text-base md:text-lg text-gray-700 mb-6">
                Você completou o nível {dificuldades[dificuldade].nome}!
              </p>
              
              <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-lg mb-4">📊 Suas Estatísticas</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{calcularPontuacao()}</div>
                    <div className="text-sm text-gray-600">Pontos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{state.attempts}</div>
                    <div className="text-sm text-gray-600">Tentativas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatarTempo(state.timeElapsed)}
                    </div>
                    <div className="text-sm text-gray-600">Tempo</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{dificuldades[dificuldade].emoji}</div>
                    <div className="text-sm text-gray-600">{dificuldades[dificuldade].nome}</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={iniciarJogo}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 px-6 
                           rounded-xl hover:from-green-600 hover:to-blue-600 transition-colors"
                >
                  🎮 Jogar Novamente
                </button>
                <button
                  onClick={reiniciarJogo}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 
                           rounded-xl hover:from-purple-600 hover:to-pink-600 transition-colors"
                >
                  🎯 Mudar Dificuldade
                </button>
                <button
                  onClick={() => setMostrarModal(false)}
                  className="w-full bg-gray-100 text-gray-700 font-bold py-3 px-6 rounded-xl 
                           hover:bg-gray-200 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}