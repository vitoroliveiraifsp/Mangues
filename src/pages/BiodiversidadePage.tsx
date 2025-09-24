import { useState } from 'react';
import { useOfflineApi } from '../hooks/useOfflineApi';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { BackButton } from '../components/BackButton';
import { ImageGallery, useImageGallery } from '../components/ImageGallery';
import { galleryImages, getImagesByCategory } from '../data/galleryImages';
import { X, MapPin, Zap, Info, Lightbulb } from 'lucide-react';

interface Especie {
  id: number;
  nome: string;
  descricao: string;
  habitat: string;
  imagem: string;
  adaptacoes: string[];
}

export function BiodiversidadePage() {
  const { data, loading, error } = useOfflineApi<Especie[]>('/api/especies', 
    { enableOfflineFirst: true });
  // Garante que especies é sempre um array puro
  const especies: Especie[] = Array.isArray(data) ? data : [];

  const [activeTab, setActiveTab] = useState<'especies' | 'adaptacoes'>('especies');
  const [selectedEspecie, setSelectedEspecie] = useState<Especie | null>(null);
  const [selectedAdaptacao, setSelectedAdaptacao] = useState<{
    adaptacao: string;
    especie: string;
    emoji: string;
    explicacao: string;
    curiosidades: string[];
  } | null>(null);

  // Hook para galeria de imagens
  const { isOpen, images, initialIndex, openGallery, closeGallery } = useImageGallery();

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  const tabs = [
    { id: 'especies' as const, label: '🐾 Animais e Plantas', count: especies.length },
    { 
      id: 'adaptacoes' as const, 
      label: '⚡ Super Poderes', 
      count: especies.reduce((acc, esp) => acc + esp.adaptacoes.length, 0)
    }
  ];

  const getAdaptacaosByType = () => {
    if (!Array.isArray(especies)) return [];
    
    const adaptacoes: { especie: string; adaptacao: string; emoji: string }[] = [];
    especies.forEach(especie => {
      especie.adaptacoes.forEach(adaptacao => {
        adaptacoes.push({
          especie: especie.nome,
          adaptacao,
          emoji: especie.imagem
        });
      });
    });
    return adaptacoes;
  };

  const getAdaptacaoDetalhes = (adaptacao: string, _especie: string) => {
    const detalhes: { [key: string]: { explicacao: string; curiosidades: string[] } } = {
      'Brânquias modificadas para respirar fora da água': {
        explicacao: 'Os caranguejos desenvolveram brânquias especiais que funcionam como pulmões primitivos, permitindo que respirem ar atmosférico por longos períodos.',
        curiosidades: [
          'Podem ficar até 6 horas fora da água sem problemas',
          'Suas brânquias mantêm uma película de água para funcionar no ar',
          'Este superpoder permite que explorem áreas secas em busca de comida'
        ]
      },
      'Garras fortes para cavar buracos profundos': {
        explicacao: 'As garras dos caranguejos são verdadeiras escavadeiras biológicas, capazes de mover até 15 vezes seu próprio peso em lama.',
        curiosidades: [
          'Podem cavar buracos de até 2 metros de profundidade',
          'Suas tocas ajudam a oxigenar o solo do mangue',
          'Usam técnicas de engenharia para evitar desmoronamentos'
        ]
      },
      'Bico longo e pontiagudo para pescar': {
        explicacao: 'O bico das garças é uma ferramenta de precisão, funcionando como uma lança subaquática para capturar presas rapidamente.',
        curiosidades: [
          'Podem pescar em águas de até 60cm de profundidade',
          'Seu reflexo de ataque é mais rápido que um piscar de olhos',
          'O formato do bico reduz a resistência da água em 40%'
        ]
      },
      'Pernas longas para andar na água rasa': {
        explicacao: 'As pernas das garças funcionam como palafitas naturais, permitindo que caminhem em águas rasas sem molhar o corpo.',
        curiosidades: [
          'Suas pernas podem ter até 3 vezes o tamanho do corpo',
          'Possuem articulações especiais que travam para economizar energia',
          'Podem ficar imóveis por horas esperando a presa perfeita'
        ]
      },
      'Raízes aéreas para sustentação no solo mole': {
        explicacao: 'As raízes do mangue-vermelho formam uma rede de suporte que funciona como pilares de uma ponte, distribuindo o peso da árvore.',
        curiosidades: [
          'Uma única árvore pode ter centenas de raízes aéreas',
          'Essas raízes crescem até 4 metros de altura',
          'Funcionam como filtros naturais, limpando a água'
        ]
      },
      'Folhas especiais que eliminam excesso de sal': {
        explicacao: 'As folhas do mangue possuem glândulas microscópicas que expelem cristais de sal, funcionando como rins vegetais.',
        curiosidades: [
          'Podem eliminar até 90% do sal absorvido pelas raízes',
          'Os cristais de sal nas folhas brilham ao sol',
          'Este processo economiza energia que seria gasta filtrando internamente'
        ]
      }
    };

    return detalhes[adaptacao] || {
      explicacao: 'Esta é uma adaptação incrível que permite ao animal ou planta sobreviver no ambiente único do mangue.',
      curiosidades: [
        'Cada adaptação é resultado de milhões de anos de evolução',
        'Essas características tornam cada espécie única e especial',
        'A natureza é cheia de soluções criativas para desafios ambientais'
      ]
    };
  };

  const abrirModalAdaptacao = (adaptacao: string, especie: string, emoji: string) => {
    const detalhes = getAdaptacaoDetalhes(adaptacao, especie);
    setSelectedAdaptacao({
      adaptacao,
      especie,
      emoji,
      ...detalhes
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Botão de voltar */}
        <div className="mb-6">
          <BackButton to="/" label="Voltar ao Início" />
        </div>
        
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
            🌿 Vida no Mangue
          </h1>
          <p className="text-base md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            O mangue é como uma cidade muito especial onde cada animal e planta tem seu lugar e seu trabalho. 
            Vamos conhecer os moradores desta cidade aquática! 
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-6 md:mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold text-sm md:text-lg transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-green-500 text-white shadow-md transform scale-105'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-green-600'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>{tab.label}</span>
                    <span className="bg-white bg-opacity-30 px-2 py-1 rounded-full text-xs md:text-sm">
                      {tab.count}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {/* Galeria de Imagens */}
        <div className="mb-8">
          <button
            onClick={() => openGallery(getImagesByCategory('fauna').concat(getImagesByCategory('flora')))}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 px-6 
                     rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 
                     shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <span>📸 Ver Galeria de Fotos Reais</span>
          </button>
        </div>

        {activeTab === 'especies' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {especies.map((especie) => (
              <div
                key={especie.id}
                onClick={() => setSelectedEspecie(especie)}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 
                         cursor-pointer transform hover:scale-105 overflow-hidden"
              >
                <div className="p-4 md:p-6">
                  <div className="text-center mb-4">
                    <div className="text-4xl md:text-6xl mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                      {especie.imagem}
                    </div>
                    <h3 className="text-lg md:text-2xl font-bold text-gray-800 mb-2">
                      {especie.nome}
                    </h3>
                  </div>
                  
                  <p className="text-gray-700 text-sm md:text-lg leading-relaxed mb-4 line-clamp-3">
                    {especie.descricao}
                  </p>
                  
                  <div className="flex items-center text-green-600 mb-4">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span className="font-medium text-sm md:text-base">Vive em: {especie.habitat}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-purple-600">
                      <Zap className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">
                        {especie.adaptacoes.length} super poderes
                      </span>
                    </div>
                    <button className="text-blue-500 hover:text-blue-700 font-medium text-sm group-hover:underline">
                      Ver detalhes →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {getAdaptacaosByType().map((item, index) => (
              <div
                key={index}
                onClick={() => abrirModalAdaptacao(item.adaptacao, item.especie, item.emoji)}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 
                         border-l-4 border-purple-400 cursor-pointer group hover:scale-105"
              >
                <div className="flex items-start space-x-4">
                  <div className="text-3xl md:text-4xl group-hover:scale-110 transition-transform duration-300">
                    {item.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base md:text-lg text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                      {item.adaptacao}
                    </h3>
                    <p className="text-gray-600 text-sm md:text-base">
                      <span className="font-medium text-purple-600">{item.especie}</span> 
                      {' '}tem este super poder!
                    </p>
                    <div className="mt-3 flex items-center text-blue-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      <Info className="h-4 w-4 mr-1" />
                      Clique para saber mais
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Species Detail Modal */}
        {selectedEspecie && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="text-center flex-1">
                    <div className="text-6xl md:text-8xl mb-4">{selectedEspecie.imagem}</div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                      {selectedEspecie.nome}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedEspecie(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-2xl p-6">
                    <h3 className="font-bold text-lg md:text-xl mb-3 text-blue-700">📖 Sobre mim</h3>
                    <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                      {selectedEspecie.descricao}
                    </p>
                  </div>
                  
                  <div className="bg-green-50 rounded-2xl p-6">
                    <h3 className="font-bold text-lg md:text-xl mb-3 text-green-700 flex items-center">
                      <MapPin className="h-6 w-6 mr-2" />
                      Onde vivo
                    </h3>
                    <p className="text-gray-700 text-base md:text-lg">
                      {selectedEspecie.habitat}
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-2xl p-6">
                    <h3 className="font-bold text-lg md:text-xl mb-4 text-purple-700 flex items-center">
                      <Zap className="h-6 w-6 mr-2" />
                      Meus Super Poderes
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedEspecie.adaptacoes.map((adaptacao, index) => (
                        <div 
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirModalAdaptacao(adaptacao, selectedEspecie.nome, selectedEspecie.imagem);
                          }}
                          className="bg-white rounded-xl p-4 flex items-center space-x-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow group"
                        >
                          <div className="bg-purple-100 rounded-full p-2">
                            <Zap className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <span className="text-gray-700 font-medium text-sm md:text-base">{adaptacao}</span>
                            <div className="text-xs text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                              Clique para descobrir mais!
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setSelectedEspecie(null)}
                    className="bg-green-500 text-white px-6 md:px-8 py-3 rounded-2xl font-bold text-base md:text-lg 
                             hover:bg-green-600 transition-colors shadow-lg"
                  >
                    Entendi! 🎉
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Superpowers Detail Modal */}
        {selectedAdaptacao && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="text-center flex-1">
                    <div className="text-6xl md:text-8xl mb-4">{selectedAdaptacao.emoji}</div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                      Super Poder: {selectedAdaptacao.adaptacao}
                    </h2>
                    <p className="text-base md:text-lg text-purple-600 font-medium">
                      {selectedAdaptacao.especie}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedAdaptacao(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
                    <h3 className="font-bold text-lg md:text-xl mb-4 text-blue-700 flex items-center">
                      <Lightbulb className="h-6 w-6 mr-2" />
                      Por que é um Super Poder?
                    </h3>
                    <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                      {selectedAdaptacao.explicacao}
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6">
                    <h3 className="font-bold text-lg md:text-xl mb-4 text-orange-700">
                      🤯 Curiosidades Incríveis!
                    </h3>
                    <div className="space-y-3">
                      {selectedAdaptacao.curiosidades.map((curiosidade, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="bg-orange-200 rounded-full p-1 mt-1">
                            <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                          </div>
                          <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                            {curiosidade}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 text-center">
                    <h3 className="font-bold text-lg mb-3 text-green-700">
                      🌟 Incrível, não é?
                    </h3>
                    <p className="text-gray-700 text-sm md:text-base">
                      A natureza desenvolveu soluções fantásticas ao longo de milhões de anos. 
                      Cada adaptação é uma obra-prima da evolução!
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setSelectedAdaptacao(null)}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 md:px-8 py-3 
                             rounded-2xl font-bold text-base md:text-lg hover:from-purple-600 hover:to-blue-600 
                             transition-colors shadow-lg"
                  >
                    Que Demais! 🚀
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Galeria de Imagens */}
        <ImageGallery
          images={images}
          isOpen={isOpen}
          onClose={closeGallery}
          initialIndex={initialIndex}
        />

        {/* Educational Note */}
        <div className="mt-12 md:mt-16 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-3xl p-6 md:p-8 text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">
            🌟 Dica Especial para Exploradores!
          </h2>
          <p className="text-base md:text-lg text-gray-700 max-w-3xl mx-auto">
            Cada animal e planta do mangue tem características especiais para viver neste lugar único. 
            Eles são como super-heróis da natureza, cada um com seus próprios poderes! 
            Que tal descobrir quais adaptações você gostaria de ter?
          </p>
        </div>
      </div>
    </div>
  );
}