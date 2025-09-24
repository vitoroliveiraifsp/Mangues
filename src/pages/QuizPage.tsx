import { useState, useEffect } from 'react';
import { useOfflineApi, useOfflinePost } from '../hooks/useOfflineApi';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { BackButton } from '../components/BackButton';
import { audioFeedback } from '../utils/audioFeedback';
import { syncManager } from '../utils/syncManager';
import { 
  Clock, 
  Trophy, 
  Target, 
  CheckCircle, 
  XCircle, 
  Star,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Award
} from 'lucide-react';

interface Questao {
  id: number;
  categoria: string;
  pergunta: string;
  opcoes: string[];
  respostaCorreta: number;
  explicacao: string;
  dificuldade: string;
  pontos: number;
}

interface Categoria {
  id: string;
  nome: string;
  questoes: number;
  emoji: string;
}

interface ResultadoQuiz {
  pontuacaoTotal: number;
  acertos: number;
  totalQuestoes: number;
  percentualAcerto: number;
  tempoTotal: number;
  bonusTempo: number;
  medalha: string;
  resultadoDetalhado: any[];
}

type EstadoJogo = 'selecao' | 'jogando' | 'resultado';

export function QuizPage() {
  const { data: categorias, loading: loadingCategorias, error: errorCategorias } = 
    useOfflineApi<Categoria[]>('/api/quiz/categorias', { enableOfflineFirst: true });
  
  const [estadoJogo, setEstadoJogo] = useState<EstadoJogo>('selecao');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('');
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [respostas, setRespostas] = useState<{questaoId: number, respostaSelecionada: number}[]>([]);
  const [respostaSelecionada, setRespostaSelecionada] = useState<number | null>(null);
  const [mostrarExplicacao, setMostrarExplicacao] = useState(false);
  const [tempoInicio, setTempoInicio] = useState<number>(0);
  const [tempoAtual, setTempoAtual] = useState<number>(0);
  const [resultado, setResultado] = useState<ResultadoQuiz | null>(null);
  const [nomeJogador, setNomeJogador] = useState('');
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const { post: postResultado, loading: loadingPost } = useOfflinePost();

  // Timer
  useEffect(() => {
    if (estadoJogo === 'jogando' && tempoInicio > 0) {
      const timer = setInterval(() => {
        setTempoAtual(Date.now());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [estadoJogo, tempoInicio]);

  // Iniciar quiz
  const iniciarQuiz = async (categoria: string) => {
    try {
      setLoadingQuiz(true);
      
      // Usar hook offline para carregar questões
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/quiz?categoria=${categoria}&limite=10`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar questões');
      }
      
      const questoesData = await response.json();
      if (questoesData.length === 0) {
        throw new Error('Nenhuma questão encontrada');
      }
      
      setQuestoes(questoesData);
      setCategoriaSelecionada(categoria);
      setQuestaoAtual(0);
      setRespostas([]);
      setRespostaSelecionada(null);
      setMostrarExplicacao(false);
      setTempoInicio(Date.now());
      setTempoAtual(Date.now());
      setEstadoJogo('jogando');
    } catch (err) {
      // Fallback para dados offline se disponível
      console.error('Erro ao carregar quiz online, tentando offline:', err);
      
      // Aqui você pode implementar dados de fallback ou mostrar erro
      alert('Erro ao carregar quiz. Verifique sua conexão.');
    } finally {
      setLoadingQuiz(false);
    }
  };
  
  const getBackendUrl = () => {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    if (hostname.includes('replit') || hostname.includes('.app')) {
      return '/api-proxy';
    } else if (port === '8080') {
      return '';
    } else {
      return 'http://localhost:3001';
    }
  };

  // Selecionar resposta
  const selecionarResposta = (opcaoIndex: number) => {
    if (mostrarExplicacao) return;
    
    audioFeedback.playClick();
    setRespostaSelecionada(opcaoIndex);
  };

  // Confirmar resposta
  const confirmarResposta = () => {
    if (respostaSelecionada === null) return;
    
    const questao = questoes[questaoAtual];
    const correto = respostaSelecionada === questao.respostaCorreta;
    
    // Feedback sonoro
    if (correto) {
      audioFeedback.playMatch();
    } else {
      audioFeedback.playError();
    }
    
    // Salvar resposta
    setRespostas(prev => [...prev, {
      questaoId: questao.id,
      respostaSelecionada
    }]);
    
    setMostrarExplicacao(true);
  };

  // Próxima questão
  const proximaQuestao = () => {
    if (questaoAtual < questoes.length - 1) {
      setQuestaoAtual(prev => prev + 1);
      setRespostaSelecionada(null);
      setMostrarExplicacao(false);
    } else {
      finalizarQuiz();
    }
  };

  // Finalizar quiz
  const finalizarQuiz = async () => {
    try {
      const tempoTotal = Math.floor((tempoAtual - tempoInicio) / 1000);
      
      const resultadoData = await postResultado('/api/quiz/resultado', {
        respostas,
        tempoTotal,
        categoria: categoriaSelecionada
      }, {
        syncType: 'quiz_resultado',
        showOfflineMessage: true
      });
      
      if (!resultadoData) throw new Error('Erro ao processar resultado');
      
      setResultado(resultadoData);
      setEstadoJogo('resultado');
      
      // Som de vitória
      setTimeout(() => audioFeedback.playVictory(), 500);
    } catch (err) {
      console.error('Erro ao finalizar quiz:', err);
      alert('Erro ao processar resultado. Dados salvos localmente.');
    }
  };

  // Salvar pontuação
  const salvarPontuacao = async () => {
    if (!resultado || !nomeJogador.trim()) return;
    
    try {
      await postResultado('/api/pontuacoes', {
        nomeJogador: nomeJogador.trim(),
        jogo: 'quiz',
        pontuacao: resultado.pontuacaoTotal,
        categoria: categoriaSelecionada,
        detalhes: {
          acertos: resultado.acertos,
          total: resultado.totalQuestoes,
          tempo: resultado.tempoTotal,
          medalha: resultado.medalha
        }
      }, {
        syncType: 'pontuacao',
        showOfflineMessage: true
      });
      
      alert('Pontuação salva com sucesso! 🎉');
    } catch (err) {
      alert('Erro ao salvar pontuação');
    }
  };

  // Reiniciar
  const reiniciar = () => {
    setEstadoJogo('selecao');
    setCategoriaSelecionada('');
    setQuestoes([]);
    setResultado(null);
    setNomeJogador('');
  };

  // Formatação de tempo
  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const loading = loadingCategorias || loadingQuiz || loadingPost;
  if (loading) return <LoadingSpinner />;
  if (errorCategorias) return <ErrorMessage message={errorCategorias} onRetry={() => window.location.reload()} />;

  // Tela de seleção de categoria
  if (estadoJogo === 'selecao') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <BackButton to="/" label="Voltar ao Início" />
          </div>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              🧠 Quiz do Mangue
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Teste seus conhecimentos sobre os mangues! Escolha uma categoria e responda às perguntas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {categorias?.map((categoria) => (
              <div
                key={categoria.id}
                onClick={() => iniciarQuiz(categoria.id)}
                className="bg-white rounded-3xl p-8 shadow-lg cursor-pointer transition-all duration-300 
                         transform hover:scale-105 hover:shadow-2xl group"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {categoria.emoji}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    {categoria.nome}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {categoria.questoes} questões disponíveis
                  </p>
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 
                                rounded-full font-medium group-hover:from-purple-600 group-hover:to-pink-600 
                                transition-colors">
                    Começar Quiz
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Instruções */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              📋 Como Funciona
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="font-bold text-lg mb-2">1. Escolha a Categoria</h3>
                <p className="text-gray-600">Selecione o tema que você quer estudar.</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🤔</div>
                <h3 className="font-bold text-lg mb-2">2. Responda as Perguntas</h3>
                <p className="text-gray-600">Leia com atenção e escolha a melhor resposta.</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="font-bold text-lg mb-2">3. Veja seu Resultado</h3>
                <p className="text-gray-600">Descubra sua pontuação e ganhe medalhas!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tela do jogo
  if (estadoJogo === 'jogando' && questoes.length > 0) {
    const questao = questoes[questaoAtual];
    const tempoDecorrido = Math.floor((tempoAtual - tempoInicio) / 1000);
    const progresso = ((questaoAtual + 1) / questoes.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header com progresso */}
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Questão {questaoAtual + 1} de {questoes.length}
                  </h2>
                  <p className="text-gray-600">
                    {categorias?.find(c => c.id === categoriaSelecionada)?.nome}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span className="font-bold text-green-600">
                    {formatarTempo(tempoDecorrido)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <span className="font-bold text-yellow-600">
                    {questao.pontos} pts
                  </span>
                </div>
              </div>
            </div>
            
            {/* Barra de progresso */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>

          {/* Questão */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center leading-relaxed">
              {questao.pergunta}
            </h1>

            {/* Opções */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {questao.opcoes.map((opcao, index) => {
                let className = "p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 ";
                
                if (mostrarExplicacao) {
                  if (index === questao.respostaCorreta) {
                    className += "border-green-400 bg-green-50 text-green-800";
                  } else if (index === respostaSelecionada && index !== questao.respostaCorreta) {
                    className += "border-red-400 bg-red-50 text-red-800";
                  } else {
                    className += "border-gray-200 bg-gray-50 text-gray-600";
                  }
                } else if (respostaSelecionada === index) {
                  className += "border-blue-400 bg-blue-50 text-blue-800";
                } else {
                  className += "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50";
                }

                return (
                  <div
                    key={index}
                    onClick={() => selecionarResposta(index)}
                    className={className}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div className="flex-1 text-lg font-medium">
                        {opcao}
                      </div>
                      {mostrarExplicacao && index === questao.respostaCorreta && (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      )}
                      {mostrarExplicacao && index === respostaSelecionada && index !== questao.respostaCorreta && (
                        <XCircle className="h-6 w-6 text-red-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explicação */}
            {mostrarExplicacao && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-lg mb-3 text-orange-700 flex items-center">
                  💡 Explicação
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {questao.explicacao}
                </p>
              </div>
            )}

            {/* Botões */}
            <div className="flex justify-between">
              <button
                onClick={() => setQuestaoAtual(Math.max(0, questaoAtual - 1))}
                disabled={questaoAtual === 0}
                className="flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold 
                         bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Anterior</span>
              </button>

              {!mostrarExplicacao ? (
                <button
                  onClick={confirmarResposta}
                  disabled={respostaSelecionada === null}
                  className="flex items-center space-x-2 px-8 py-3 rounded-2xl font-bold 
                           bg-gradient-to-r from-blue-500 to-purple-500 text-white
                           hover:from-blue-600 hover:to-purple-600 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Confirmar</span>
                  <CheckCircle className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={proximaQuestao}
                  className="flex items-center space-x-2 px-8 py-3 rounded-2xl font-bold 
                           bg-gradient-to-r from-green-500 to-blue-500 text-white
                           hover:from-green-600 hover:to-blue-600 transition-colors"
                >
                  <span>{questaoAtual < questoes.length - 1 ? 'Próxima' : 'Finalizar'}</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tela de resultado
  if (estadoJogo === 'resultado' && resultado) {
    const getMedalhaInfo = (medalha: string) => {
      switch (medalha) {
        case 'ouro': return { emoji: '🥇', cor: 'text-yellow-600', nome: 'Ouro' };
        case 'prata': return { emoji: '🥈', cor: 'text-gray-600', nome: 'Prata' };
        case 'bronze': return { emoji: '🥉', cor: 'text-orange-600', nome: 'Bronze' };
        default: return { emoji: '🏅', cor: 'text-purple-600', nome: 'Participação' };
      }
    };

    const medalhaInfo = getMedalhaInfo(resultado.medalha);

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Resultado Principal */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 text-center">
            <div className="text-8xl mb-6">{medalhaInfo.emoji}</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Parabéns! 🎉
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Você conquistou a medalha de {medalhaInfo.nome}!
            </p>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6">
                <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-yellow-600">{resultado.pontuacaoTotal}</div>
                <div className="text-sm text-gray-600">Pontos</div>
              </div>
              
              <div className="bg-gradient-to-r from-green-100 to-teal-100 rounded-2xl p-6">
                <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-green-600">{resultado.acertos}/{resultado.totalQuestoes}</div>
                <div className="text-sm text-gray-600">Acertos</div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-6">
                <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-600">{formatarTempo(resultado.tempoTotal)}</div>
                <div className="text-sm text-gray-600">Tempo</div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6">
                <Star className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-purple-600">{resultado.percentualAcerto}%</div>
                <div className="text-sm text-gray-600">Aproveitamento</div>
              </div>
            </div>

            {/* Salvar pontuação */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">💾 Salvar no Ranking</h3>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={nomeJogador}
                  onChange={(e) => setNomeJogador(e.target.value)}
                  placeholder="Digite seu nome"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={20}
                />
                <button
                  onClick={salvarPontuacao}
                  disabled={!nomeJogador.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white 
                           rounded-xl font-bold hover:from-green-600 hover:to-blue-600 
                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salvar
                </button>
              </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => iniciarQuiz(categoriaSelecionada)}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white 
                         rounded-2xl font-bold hover:from-blue-600 hover:to-purple-600 
                         transition-colors flex items-center justify-center space-x-2"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Jogar Novamente</span>
              </button>
              
              <button
                onClick={reiniciar}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white 
                         rounded-2xl font-bold hover:from-green-600 hover:to-teal-600 
                         transition-colors flex items-center justify-center space-x-2"
              >
                <Award className="h-5 w-5" />
                <span>Escolher Categoria</span>
              </button>
            </div>
          </div>

          {/* Revisão das respostas */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              📝 Revisão das Respostas
            </h2>
            
            <div className="space-y-4">
              {resultado.resultadoDetalhado.map((item, index) => {
                const questao = questoes.find(q => q.id === item.questaoId);
                if (!questao) return null;
                
                return (
                  <div key={item.questaoId} className={`p-6 rounded-2xl border-2 ${
                    item.correto ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        item.correto ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                      }`}>
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{questao.pergunta}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                          <div className={`p-3 rounded-xl ${
                            item.correto ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            <strong>Sua resposta:</strong> {questao.opcoes[item.respostaSelecionada]}
                          </div>
                          {!item.correto && (
                            <div className="p-3 rounded-xl bg-green-100 text-green-800">
                              <strong>Resposta correta:</strong> {questao.opcoes[item.respostaCorreta]}
                            </div>
                          )}
                        </div>
                        <p className="text-gray-700 italic">{questao.explicacao}</p>
                      </div>
                      
                      <div className="flex-shrink-0">
                        {item.correto ? (
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        ) : (
                          <XCircle className="h-8 w-8 text-red-600" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}