import React, { useState } from 'react';
import { ArrowRight, ArrowDown, Waves, Sun, Users, Recycle } from 'lucide-react';
import { BackButton } from '../components/BackButton';

const sections = [
  { id: 'cadeia', title: '🍽️ Cadeia Alimentar', icon: Users },
  { id: 'ciclos', title: '🔄 Ciclos da Natureza', icon: Recycle },
  { id: 'mares', title: '🌊 Importância das Marés', icon: Waves },
];

export function EstruturaPage() {
  const [activeSection, setActiveSection] = useState('cadeia');

  const CadeiaAlimentar = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl p-8 shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🍽️ Quem Come Quem no Mangue?
        </h2>
        <p className="text-lg text-gray-700 text-center mb-12 max-w-3xl mx-auto">
          No mangue, todos os seres vivos estão conectados como uma grande família. 
          Vamos ver como a comida passa de um para o outro!
        </p>

        {/* Food Chain Visualization */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            {/* Level 1: Producers */}
            <div className="text-center">
              <div className="bg-green-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4 text-4xl">
                🌿
              </div>
              <h3 className="font-bold text-green-700">Produtores</h3>
              <p className="text-sm text-gray-600">Algas e plantas fazem seu próprio alimento</p>
            </div>

            <ArrowRight className="h-8 w-8 text-gray-400 mx-auto hidden md:block" />

            {/* Level 2: Primary Consumers */}
            <div className="text-center">
              <div className="bg-blue-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4 text-4xl">
                🦐
              </div>
              <h3 className="font-bold text-blue-700">Herbívoros</h3>
              <p className="text-sm text-gray-600">Camarões comem plantas</p>
            </div>

            <ArrowRight className="h-8 w-8 text-gray-400 mx-auto hidden md:block" />

            {/* Level 3: Secondary Consumers */}
            <div className="text-center">
              <div className="bg-orange-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4 text-4xl">
                🐟
              </div>
              <h3 className="font-bold text-orange-700">Carnívoros</h3>
              <p className="text-sm text-gray-600">Peixes comem camarões</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <ArrowDown className="h-8 w-8 text-gray-400 mx-auto mb-4" />
            <div className="bg-purple-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4 text-4xl">
              🦩
            </div>
            <h3 className="font-bold text-purple-700">Super Carnívoros</h3>
            <p className="text-sm text-gray-600">Aves comem peixes</p>
          </div>
        </div>

        {/* Interactive Food Web */}
        <div className="mt-12 bg-gray-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-center mb-6">🕸️ Teia Alimentar</h3>
          <p className="text-center text-gray-700 mb-8">
            Na verdade, no mangue todos estão conectados de várias formas!
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { emoji: '🌿', name: 'Algas', connections: ['Alimenta camarões', 'Produz oxigênio'] },
              { emoji: '🦀', name: 'Caranguejo', connections: ['Come folhas', 'Alimento de aves'] },
              { emoji: '🦐', name: 'Camarão', connections: ['Come algas', 'Alimento de peixes'] },
              { emoji: '🦢', name: 'Garça', connections: ['Come peixes', 'Come caranguejos'] }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl text-center mb-3">{item.emoji}</div>
                <h4 className="font-bold text-center mb-2">{item.name}</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {item.connections.map((connection, i) => (
                    <li key={i} className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      {connection}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const CiclosNaturais = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl p-8 shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🔄 Os Ciclos Mágicos do Mangue
        </h2>
        <p className="text-lg text-gray-700 text-center mb-12 max-w-3xl mx-auto">
          A natureza é muito inteligente! No mangue, tudo se recicla e nada se perde. 
          Vamos descobrir como isso funciona!
        </p>

        {/* Water Cycle */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-6 text-blue-600">
            💧 Ciclo da Água
          </h3>
          <div className="bg-gradient-to-r from-blue-50 to-white rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: 1, title: 'Evaporação', emoji: '☀️', desc: 'O sol esquenta a água e ela vira vapor' },
                { step: 2, title: 'Condensação', emoji: '☁️', desc: 'O vapor vira gotinhas nas nuvens' },
                { step: 3, title: 'Precipitação', emoji: '🌧️', desc: 'A chuva cai e molha o mangue' },
                { step: 4, title: 'Infiltração', emoji: '🌊', desc: 'A água volta para o mar e rios' }
              ].map((phase) => (
                <div key={phase.step} className="text-center">
                  <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 text-3xl">
                    {phase.emoji}
                  </div>
                  <h4 className="font-bold text-blue-700 mb-2">{phase.step}. {phase.title}</h4>
                  <p className="text-sm text-gray-600">{phase.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nutrient Cycle */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-6 text-green-600">
            🍃 Ciclo dos Nutrientes
          </h3>
          <div className="bg-gradient-to-r from-green-50 to-white rounded-2xl p-8">
            <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="text-center">
                <div className="bg-green-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4 text-4xl">
                  🌳
                </div>
                <h4 className="font-bold text-green-700">Árvores</h4>
                <p className="text-sm text-gray-600">Folhas caem na água</p>
              </div>
              
              <ArrowRight className="h-6 w-6 text-gray-400 transform rotate-90 md:rotate-0" />
              
              <div className="text-center">
                <div className="bg-brown-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4 text-4xl" style={{backgroundColor: '#D2B48C'}}>
                  🍂
                </div>
                <h4 className="font-bold text-amber-700">Decomposição</h4>
                <p className="text-sm text-gray-600">Folhas viram adubo</p>
              </div>
              
              <ArrowRight className="h-6 w-6 text-gray-400 transform rotate-90 md:rotate-0" />
              
              <div className="text-center">
                <div className="bg-green-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4 text-4xl">
                  🌱
                </div>
                <h4 className="font-bold text-green-700">Crescimento</h4>
                <p className="text-sm text-gray-600">Plantas usam o adubo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Oxygen Cycle */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-6 text-cyan-600">
            🫁 Ciclo do Oxigênio
          </h3>
          <div className="bg-gradient-to-r from-cyan-50 to-white rounded-2xl p-8 text-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="text-6xl">🌿</div>
                <h4 className="text-xl font-bold text-green-600">Plantas Produzem</h4>
                <p className="text-gray-700">
                  As plantas do mangue fazem fotossíntese e liberam oxigênio puro no ar e na água!
                </p>
              </div>
              <div className="space-y-4">
                <div className="text-6xl">🐟</div>
                <h4 className="text-xl font-bold text-blue-600">Animais Respiram</h4>
                <p className="text-gray-700">
                  Peixes, caranguejos e aves respiram esse oxigênio e liberam gás carbônico.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ImportanciaMares = () => (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl p-8 shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
          🌊 As Marés: O Coração do Mangue
        </h2>
        <p className="text-lg text-gray-700 text-center mb-12 max-w-3xl mx-auto">
          As marés são como a respiração do mangue. Duas vezes por dia, a água sobe e desce, 
          trazendo vida e nutrientes para todos os moradores!
        </p>

        {/* Tidal Cycle */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8 text-blue-600">
            🔄 Como Funcionam as Marés
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* High Tide */}
            <div className="bg-gradient-to-b from-blue-100 to-blue-50 rounded-2xl p-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🌊</div>
                <h4 className="text-2xl font-bold text-blue-700">Maré Alta</h4>
                <p className="text-gray-600">A água cobre quase tudo</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4">
                  <h5 className="font-bold text-blue-600 mb-2 flex items-center">
                    🐟 <span className="ml-2">Para os Peixes</span>
                  </h5>
                  <p className="text-gray-700 text-sm">
                    Podem nadar em todas as partes do mangue e procurar comida em lugares novos!
                  </p>
                </div>
                
                <div className="bg-white rounded-xl p-4">
                  <h5 className="font-bold text-blue-600 mb-2 flex items-center">
                    🦀 <span className="ml-2">Para os Caranguejos</span>
                  </h5>
                  <p className="text-gray-700 text-sm">
                    Ficam nos seus buracos esperando a água baixar para sair e comer.
                  </p>
                </div>
              </div>
            </div>

            {/* Low Tide */}
            <div className="bg-gradient-to-b from-amber-100 to-amber-50 rounded-2xl p-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🏖️</div>
                <h4 className="text-2xl font-bold text-amber-700">Maré Baixa</h4>
                <p className="text-gray-600">A lama aparece</p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4">
                  <h5 className="font-bold text-amber-600 mb-2 flex items-center">
                    🦀 <span className="ml-2">Para os Caranguejos</span>
                  </h5>
                  <p className="text-gray-700 text-sm">
                    Hora da festa! Saem dos buracos para procurar comida na lama.
                  </p>
                </div>
                
                <div className="bg-white rounded-xl p-4">
                  <h5 className="font-bold text-amber-600 mb-2 flex items-center">
                    🦢 <span className="ml-2">Para as Aves</span>
                  </h5>
                  <p className="text-gray-700 text-sm">
                    Conseguem andar na lama e pescar caranguejos e camarões!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits of Tides */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-center mb-8 text-teal-700">
            ✨ Por que as Marés são Importantes?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center bg-white rounded-xl p-6">
              <div className="text-4xl mb-4">🍽️</div>
              <h4 className="font-bold text-teal-600 mb-2">Trazem Comida</h4>
              <p className="text-gray-700 text-sm">
                A água traz pequenos animais e plantas que servem de alimento.
              </p>
            </div>
            
            <div className="text-center bg-white rounded-xl p-6">
              <div className="text-4xl mb-4">🧹</div>
              <h4 className="font-bold text-teal-600 mb-2">Limpam o Mangue</h4>
              <p className="text-gray-700 text-sm">
                Levam embora o lixo e trazem água limpa e oxigênio.
              </p>
            </div>
            
            <div className="text-center bg-white rounded-xl p-6">
              <div className="text-4xl mb-4">🌱</div>
              <h4 className="font-bold text-teal-600 mb-2">Ajudam Plantas</h4>
              <p className="text-gray-700 text-sm">
                As sementes viajam na água e encontram novos lugares para crescer.
              </p>
            </div>
          </div>
        </div>

        {/* Fun Fact */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4 text-purple-700">
            🌟 Curiosidade Incrível!
          </h3>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            As marés acontecem por causa da Lua! 🌙 A gravidade da Lua puxa a água dos oceanos, 
            fazendo ela subir e descer. É como se a Lua fosse uma amiga que brinca de puxa-puxa com o mar!
          </p>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'cadeia': return <CadeiaAlimentar />;
      case 'ciclos': return <CiclosNaturais />;
      case 'mares': return <ImportanciaMares />;
      default: return <CadeiaAlimentar />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton to="/" label="Voltar ao Início" />
        </div>
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🏗️ Como o Mangue Funciona
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            O mangue é como uma máquina perfeita da natureza! 
            Vamos descobrir como tudo funciona em harmonia neste lugar incrível.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg">
            <div className="flex flex-wrap justify-center gap-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 ${
                      activeSection === section.id
                        ? 'bg-blue-500 text-white shadow-md transform scale-105'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{section.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        {renderContent()}

        {/* Educational Summary */}
        <div className="mt-16 bg-gradient-to-r from-green-200 to-blue-200 rounded-3xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">
            🎓 O que Aprendemos Hoje?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-80 rounded-xl p-6">
              <div className="text-4xl mb-3">🔗</div>
              <h3 className="font-bold text-lg mb-2">Tudo Conectado</h3>
              <p className="text-gray-700">
                No mangue, todos os seres vivos dependem uns dos outros!
              </p>
            </div>
            <div className="bg-white bg-opacity-80 rounded-xl p-6">
              <div className="text-4xl mb-3">♻️</div>
              <h3 className="font-bold text-lg mb-2">Nada se Perde</h3>
              <p className="text-gray-700">
                A natureza recicla tudo: água, nutrientes e energia!
              </p>
            </div>
            <div className="bg-white bg-opacity-80 rounded-xl p-6">
              <div className="text-4xl mb-3">⚖️</div>
              <h3 className="font-bold text-lg mb-2">Equilíbrio Perfeito</h3>
              <p className="text-gray-700">
                As marés e os ciclos mantêm tudo funcionando perfeitamente!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}