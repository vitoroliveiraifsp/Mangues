import { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { Heart, Users, Lightbulb, CheckCircle } from 'lucide-react';

interface Ameaca {
  id: number;
  titulo: string;
  descricao: string;
  impacto: string;
  solucoes: string[];
  imagem: string;
}

export function AmeacasPage() {
  const { data: ameacas, loading, error } = useApi<Ameaca[]>('/api/ameacas');
  const [selectedAmeaca, setSelectedAmeaca] = useState<Ameaca | null>(null);
  const [completedActions, setCompletedActions] = useState<string[]>([]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const toggleAction = (action: string) => {
    setCompletedActions(prev => 
      prev.includes(action) 
        ? prev.filter(a => a !== action)
        : [...prev, action]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🌍 Vamos Cuidar do Mangue
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
            Todo super-herói da natureza precisa saber sobre os desafios para poder ajudar! 
            Vamos aprender como podemos proteger os mangues juntos.
          </p>
          
          <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-2xl p-6 inline-block">
            <div className="flex items-center justify-center space-x-4 text-lg font-medium">
              <Heart className="h-6 w-6" />
              <span>Juntos somos mais fortes!</span>
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Threats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {ameacas?.map((ameaca) => (
            <div
              key={ameaca.id}
              className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
            >
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {ameaca.imagem}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">
                    {ameaca.titulo}
                  </h2>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-orange-50 rounded-xl p-4 border-l-4 border-orange-400">
                    <h3 className="font-bold text-orange-700 mb-2">⚠️ O Problema</h3>
                    <p className="text-gray-700">{ameaca.descricao}</p>
                  </div>

                  <div className="bg-red-50 rounded-xl p-4 border-l-4 border-red-400">
                    <h3 className="font-bold text-red-700 mb-2">😢 O que Acontece</h3>
                    <p className="text-gray-700">{ameaca.impacto}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAmeaca(ameaca)}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 px-6 
                           rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-300 
                           shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Ver Como Ajudar! 🦸‍♂️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Hero Action Center */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl p-8 text-white text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">🦸‍♀️ Centro de Ação dos Heróis</h2>
          <p className="text-xl mb-6 opacity-90">
            Cada pequena ação faz diferença! Quantas ações heroicas você já fez?
          </p>
          
          <div className="bg-white bg-opacity-20 rounded-2xl p-6 inline-block">
            <div className="text-4xl font-bold mb-2">
              {completedActions.length}
            </div>
            <div className="text-lg">Ações Heroicas Completas!</div>
          </div>
        </div>

        {/* Solutions Modal */}
        {selectedAmeaca && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="text-8xl mb-4">{selectedAmeaca.imagem}</div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Como Combater: {selectedAmeaca.titulo}
                  </h2>
                  <div className="bg-green-100 rounded-2xl p-6">
                    <div className="flex items-center justify-center mb-4">
                      <Lightbulb className="h-8 w-8 text-yellow-500 mr-3" />
                      <h3 className="text-2xl font-bold text-green-700">Plano de Ação Heroico!</h3>
                    </div>
                    <p className="text-green-800 text-lg">
                      Todo problema tem solução quando trabalhamos juntos! 
                      Aqui estão as missões que você pode cumprir:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {selectedAmeaca.solucoes.map((solucao, index) => {
                    const actionKey = `${selectedAmeaca.id}-${index}`;
                    const isCompleted = completedActions.includes(actionKey);
                    
                    return (
                      <div
                        key={index}
                        className={`border-2 rounded-2xl p-6 transition-all duration-300 cursor-pointer ${
                          isCompleted 
                            ? 'border-green-400 bg-green-50' 
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                        }`}
                        onClick={() => toggleAction(actionKey)}
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`mt-1 ${isCompleted ? 'text-green-500' : 'text-gray-400'}`}>
                            <CheckCircle className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-bold text-lg mb-2 ${
                              isCompleted ? 'text-green-700' : 'text-gray-800'
                            }`}>
                              Missão {index + 1}
                            </h4>
                            <p className={`${
                              isCompleted ? 'text-green-700' : 'text-gray-700'
                            }`}>
                              {solucao}
                            </p>
                            {isCompleted && (
                              <div className="mt-3 text-green-600 font-medium">
                                ✅ Missão Completa! Você é incrível! 🎉
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Age-appropriate motivation */}
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6 mb-8 text-center">
                  <h3 className="text-2xl font-bold mb-4 text-orange-700">
                    🌟 Dica Especial para Pequenos Heróis!
                  </h3>
                  <p className="text-lg text-gray-700">
                    Você não precisa fazer tudo sozinho! Peça ajuda aos adultos, converse com seus amigos, 
                    e lembre-se: até os menores gestos podem salvar um mangue inteiro! 💚
                  </p>
                </div>

                <div className="text-center space-y-4">
                  <button
                    onClick={() => setSelectedAmeaca(null)}
                    className="bg-blue-500 text-white px-8 py-3 rounded-2xl font-bold text-lg 
                             hover:bg-blue-600 transition-colors shadow-lg mr-4"
                  >
                    Entendi! Vou Ajudar! 🚀
                  </button>
                  
                  <div className="text-gray-600">
                    Clique nas missões acima para marcá-las como completas!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress Celebration */}
        {completedActions.length > 0 && (
          <div className="bg-gradient-to-r from-green-400 to-blue-400 rounded-3xl p-8 text-white text-center">
            <div className="text-6xl mb-4">🎊</div>
            <h2 className="text-3xl font-bold mb-4">
              Parabéns, Herói da Natureza!
            </h2>
            <p className="text-xl mb-6">
              Você já completou {completedActions.length} ações heroicas! 
              Cada uma delas ajuda a proteger os mangues e todos os animais que vivem lá.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="bg-white bg-opacity-20 rounded-xl p-4">
                <div className="text-3xl mb-2">🌱</div>
                <div className="font-bold">Ajudou Plantas</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl p-4">
                <div className="text-3xl mb-2">🐟</div>
                <div className="font-bold">Protegeu Animais</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl p-4">
                <div className="text-3xl mb-2">🌊</div>
                <div className="font-bold">Limpou Águas</div>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            🤝 Seja Parte da Solução!
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
            Lembre-se: você não está sozinho nessa missão! Peça ajuda aos seus pais, professores e amigos. 
            Juntos, podemos fazer a diferença para os mangues e toda a vida marinha!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { emoji: '👨‍👩‍👧‍👦', text: 'Converse com a família' },
              { emoji: '👩‍🏫', text: 'Pergunte na escola' },
              { emoji: '👫', text: 'Ensine seus amigos' },
              { emoji: '🌍', text: 'Cuide do planeta' }
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-4xl mb-2">{item.emoji}</div>
                <div className="font-medium text-gray-700">{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}