import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { BackButton } from '../components/BackButton';
import { audioFeedback } from '../utils/audioFeedback';
import { Shuffle, RotateCcw, CheckCircle, XCircle, Trophy, Target } from 'lucide-react';

interface Animal {
  id: number;
  nome: string;
  superpoder: string;
  imagem: string;
  categoria: string;
}

interface Conexao {
  animalId: number;
  superpoderId: number;
  isCorrect: boolean;
}

export function JogoConexoes() {
  const { data: animais, loading, error } = useApi<Animal[]>('/api/conexoes');
  
  const [animaisEmbaralhados, setAnimaisEmbaralhados] = useState<Animal[]>([]);
  const [superpoderesEmbaralhados, setSuperpoderesEmbaralhados] = useState<string[]>([]);
  const [conexoes, setConexoes] = useState<Conexao[]>([]);
  const [animalSelecionado, setAnimalSelecionado] = useState<number | null>(null);
  const [superpoderSelecionado, setSuperpoderSelecionado] = useState<number | null>(null);
  const [jogoCompleto, setJogoCompleto] = useState(false);
  const [pontuacao, setPontuacao] = useState(0);
  const [tentativas, setTentativas] = useState(0);

  // Embaralhar arrays
  const embaralhar = <T,>(array: T[]): T[] => {
    const embaralhado = [...array];
    for (let i = embaralhado.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [embaralhado[i], embaralhado[j]] = [embaralhado[j], embaralhado[i]];
    }
    return embaralhado;
  };

  // Inicializar jogo
  useEffect(() => {
    if (animais && animais.length > 0) {
      const animaisParaJogo = animais.slice(0, 6); // Usar apenas 6 animais
      const superpoderes = animaisParaJogo.map(animal => animal.superpoder);
      
      setAnimaisEmbaralhados(embaralhar(animaisParaJogo));
      setSuperpoderesEmbaralhados(embaralhar(superpoderes));
      setConexoes([]);
      setJogoCompleto(false);
      setPontuacao(0);
      setTentativas(0);
    }
  }, [animais]);

  // Verificar se o jogo está completo
  useEffect(() => {
    if (conexoes.length === animaisEmbaralhados.length && animaisEmbaralhados.length > 0) {
      const conexoesCorretas = conexoes.filter(c => c.isCorrect).length;
      setJogoCompleto(true);
      setPontuacao(Math.max(0, conexoesCorretas * 100 - tentativas * 10));
      
      // Som de vitória quando o jogo é completado
      setTimeout(() => audioFeedback.playVictory(), 500);
    }
  }, [conexoes, animaisEmbaralhados.length, tentativas]);

  // Fazer conexão
  const fazerConexao = () => {
    if (animalSelecionado === null || superpoderSelecionado === null) return;

    const animal = animaisEmbaralhados.find(a => a.id === animalSelecionado);
    const superpoder = superpoderesEmbaralhados[superpoderSelecionado];

    if (!animal) return;

    const isCorrect = animal.superpoder === superpoder;
    
    // Feedback sonoro baseado no resultado
    if (isCorrect) {
      audioFeedback.playMatch();
    } else {
      audioFeedback.playError();
    }
    
    const novaConexao: Conexao = {
      animalId: animalSelecionado,
      superpoderId: superpoderSelecionado,
      isCorrect
    };

    setConexoes(prev => [...prev, novaConexao]);
    setTentativas(prev => prev + 1);
    setAnimalSelecionado(null);
    setSuperpoderSelecionado(null);
  };

  // Reiniciar jogo
  const reiniciarJogo = () => {
    if (animais && animais.length > 0) {
      const animaisParaJogo = animais.slice(0, 6);
      const superpoderes = animaisParaJogo.map(animal => animal.superpoder);
      
      setAnimaisEmbaralhados(embaralhar(animaisParaJogo));
      setSuperpoderesEmbaralhados(embaralhar(superpoderes));
      setConexoes([]);
      setAnimalSelecionado(null);
      setSuperpoderSelecionado(null);
      setJogoCompleto(false);
      setPontuacao(0);
      setTentativas(0);
    }
  };

  // Verificar se item já foi conectado
  const jaConectado = (tipo: 'animal' | 'superpoder', index: number, id?: number) => {
    if (tipo === 'animal' && id) {
      return conexoes.some(c => c.animalId === id);
    }
    if (tipo === 'superpoder') {
      return conexoes.some(c => c.superpoderId === index);
    }
    return false;
  };

  // Obter status da conexão
  const obterStatusConexao = (tipo: 'animal' | 'superpoder', index: number, id?: number) => {
    let conexao;
    if (tipo === 'animal' && id) {
      conexao = conexoes.find(c => c.animalId === id);
    } else if (tipo === 'superpoder') {
      conexao = conexoes.find(c => c.superpoderId === index);
    }
    
    if (!conexao) return null;
    return conexao.isCorrect ? 'correct' : 'incorrect';
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Botão de voltar */}
        <div className="mb-6">
          <BackButton to="/" label="Voltar ao Início" />
        </div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            🔗 Conecte os Superpoderes
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Cada animal do mangue tem uma habilidade especial! Conecte cada animal com seu superpoder!
          </p>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-6 w-6 text-yellow-500 mr-2" />
              <span className="font-bold text-gray-600">Pontuação</span>
            </div>
            <div className="text-3xl font-bold text-yellow-600">{pontuacao}</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-6 w-6 text-blue-500 mr-2" />
              <span className="font-bold text-gray-600">Tentativas</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">{tentativas}</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
              <span className="font-bold text-gray-600">Corretas</span>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {conexoes.filter(c => c.isCorrect).length}/{animaisEmbaralhados.length}
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Animals Column */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              🦀 Animais do Mangue
            </h2>
            <div className="space-y-4">
              {animaisEmbaralhados.map((animal) => {
                const jaConectadoStatus = jaConectado('animal', 0, animal.id);
                const status = obterStatusConexao('animal', 0, animal.id);
                const isSelected = animalSelecionado === animal.id;
                
                return (
                  <div
                    key={animal.id}
                    onClick={() => {
                      if (!jaConectadoStatus) {
                        audioFeedback.playClick();
                        setAnimalSelecionado(animal.id);
                      }
                    }}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      jaConectadoStatus
                        ? status === 'correct'
                          ? 'bg-green-100 border-2 border-green-400'
                          : 'bg-red-100 border-2 border-red-400'
                        : isSelected
                        ? 'bg-blue-100 border-2 border-blue-400'
                        : 'bg-gray-50 border-2 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{animal.imagem}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800">{animal.nome}</h3>
                        <p className="text-sm text-gray-600">Categoria: {animal.categoria}</p>
                      </div>
                      {jaConectadoStatus && (
                        <div className="flex-shrink-0">
                          {status === 'correct' ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Superpowers Column */}
          <div className="bg-white rounded-3xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              ⚡ Superpoderes
            </h2>
            <div className="space-y-4">
              {superpoderesEmbaralhados.map((superpoder, index) => {
                const jaConectadoStatus = jaConectado('superpoder', index);
                const status = obterStatusConexao('superpoder', index);
                const isSelected = superpoderSelecionado === index;
                
                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (!jaConectadoStatus) {
                        audioFeedback.playClick();
                        setSuperpoderSelecionado(index);
                      }
                    }}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      jaConectadoStatus
                        ? status === 'correct'
                          ? 'bg-green-100 border-2 border-green-400'
                          : 'bg-red-100 border-2 border-red-400'
                        : isSelected
                        ? 'bg-purple-100 border-2 border-purple-400'
                        : 'bg-gray-50 border-2 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">⚡</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{superpoder}</p>
                      </div>
                      {jaConectadoStatus && (
                        <div className="flex-shrink-0">
                          {status === 'correct' ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          ) : (
                            <XCircle className="h-6 w-6 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Connect Button */}
        {animalSelecionado !== null && superpoderSelecionado !== null && (
          <div className="text-center mb-8">
            <button
              onClick={fazerConexao}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 px-8 
                       rounded-2xl hover:from-green-600 hover:to-blue-600 transition-all duration-300 
                       shadow-lg hover:shadow-xl transform hover:scale-105 text-xl"
            >
              🔗 Fazer Conexão
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            📋 Como Jogar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">👆</div>
              <h3 className="font-bold text-lg mb-2">1. Selecione um Animal</h3>
              <p className="text-gray-600">Clique em um animal da coluna esquerda.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-bold text-lg mb-2">2. Escolha o Superpoder</h3>
              <p className="text-gray-600">Clique no superpoder que você acha que pertence ao animal.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🔗</div>
              <h3 className="font-bold text-lg mb-2">3. Faça a Conexão</h3>
              <p className="text-gray-600">Clique no botão "Fazer Conexão" para confirmar!</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={reiniciarJogo}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 
                     rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 
                     shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Reiniciar
          </button>
          <button
            onClick={() => {
              if (animais) {
                const animaisParaJogo = animais.slice(0, 6);
                const superpoderes = animaisParaJogo.map(animal => animal.superpoder);
                setAnimaisEmbaralhados(embaralhar(animaisParaJogo));
                setSuperpoderesEmbaralhados(embaralhar(superpoderes));
              }
            }}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 px-6 
                     rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 
                     shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center"
          >
            <Shuffle className="h-5 w-5 mr-2" />
            Embaralhar
          </button>
        </div>

        {/* Victory Message */}
        {jogoCompleto && (
          <div className="bg-gradient-to-r from-green-400 to-blue-400 rounded-3xl p-8 text-white text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-4">Parabéns!</h2>
            <p className="text-xl mb-4">
              Você conectou {conexoes.filter(c => c.isCorrect).length} de {animaisEmbaralhados.length} superpoderes corretamente!
            </p>
            <p className="text-lg">
              Sua pontuação final: <span className="font-bold text-2xl">{pontuacao}</span> pontos!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}