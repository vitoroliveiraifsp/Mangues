import { Mail, Github, Linkedin, User } from 'lucide-react';

interface Membro {
  id: number;
  nome: string;
  funcao: string;
  descricao: string;
  foto?: string;
  email?: string;
  github?: string;
  linkedin?: string;
}

const membros: Membro[] = [
  {
    id: 1,
    nome: "Ana Silva Santos",
    funcao: "Desenvolvedora Frontend",
    descricao: "Responsável pela interface do usuário e experiência visual do projeto.",
    email: "ana.silva@email.com",
    github: "anasilva",
    linkedin: "ana-silva-santos"
  },
  {
    id: 2,
    nome: "Carlos Eduardo Lima",
    funcao: "Desenvolvedor Backend",
    descricao: "Criou toda a estrutura de dados e APIs do sistema educativo.",
    email: "carlos.lima@email.com",
    github: "carloslima",
    linkedin: "carlos-eduardo-lima"
  },
  {
    id: 3,
    nome: "Maria Fernanda Costa",
    funcao: "Designer UX/UI",
    descricao: "Desenvolveu o design visual e a experiência do usuário do projeto.",
    email: "maria.costa@email.com",
    github: "mariacosta",
    linkedin: "maria-fernanda-costa"
  },
  {
    id: 4,
    nome: "João Pedro Oliveira",
    funcao: "Pesquisador de Conteúdo",
    descricao: "Responsável pela pesquisa científica e conteúdo educativo sobre mangues.",
    email: "joao.oliveira@email.com",
    github: "joaooliveira",
    linkedin: "joao-pedro-oliveira"
  }
];

export function ContatosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            👥 Nossa Equipe
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Conheça os estudantes que desenvolveram este projeto educativo sobre os mangues. 
            Cada um contribuiu com suas habilidades únicas para criar esta experiência de aprendizado!
          </p>
        </div>

        {/* Team Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
          {membros.map((membro) => (
            <div
              key={membro.id}
              className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 
                         transform hover:scale-105 overflow-hidden"
            >
              <div className="p-6 md:p-8">
                {/* Avatar */}
                <div className="text-center mb-6">
                  <div className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-4 bg-gradient-to-br from-green-400 to-blue-500 
                                rounded-full flex items-center justify-center text-white text-4xl md:text-5xl font-bold">
                    {membro.foto ? (
                      <img 
                        src={membro.foto} 
                        alt={membro.nome}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 md:h-16 md:w-16" />
                    )}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                    {membro.nome}
                  </h3>
                  <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 
                                rounded-full text-sm md:text-base font-medium inline-block">
                    {membro.funcao}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 text-center mb-6 leading-relaxed text-sm md:text-base">
                  {membro.descricao}
                </p>

                {/* Contact Links */}
                <div className="flex justify-center space-x-4">
                  {membro.email && (
                    <a
                      href={`mailto:${membro.email}`}
                      className="bg-gray-100 hover:bg-blue-100 p-3 rounded-full transition-colors 
                               group hover:scale-110 transform duration-200"
                      title="Enviar email"
                    >
                      <Mail className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                    </a>
                  )}
                  {membro.github && (
                    <a
                      href={`https://github.com/${membro.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-100 hover:bg-gray-800 p-3 rounded-full transition-colors 
                               group hover:scale-110 transform duration-200"
                      title="Ver GitHub"
                    >
                      <Github className="h-5 w-5 text-gray-600 group-hover:text-white" />
                    </a>
                  )}
                  {membro.linkedin && (
                    <a
                      href={`https://linkedin.com/in/${membro.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-100 hover:bg-blue-600 p-3 rounded-full transition-colors 
                               group hover:scale-110 transform duration-200"
                      title="Ver LinkedIn"
                    >
                      <Linkedin className="h-5 w-5 text-gray-600 group-hover:text-white" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Project Info */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
            📚 Sobre o Projeto
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-base md:text-lg text-gray-700 mb-6 leading-relaxed">
              Este projeto foi desenvolvido como trabalho integrador escolar, combinando conhecimentos de 
              desenvolvimento web com conteúdo educativo sobre os ecossistemas de mangue. 
              Nosso objetivo é tornar o aprendizado sobre a natureza mais interativo e divertido!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-green-50 rounded-xl p-4 md:p-6">
                <div className="text-3xl md:text-4xl mb-3">🌱</div>
                <h3 className="font-bold text-lg mb-2 text-green-700">Educação</h3>
                <p className="text-gray-700 text-sm md:text-base">
                  Conteúdo científico sobre mangues e biodiversidade
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-4 md:p-6">
                <div className="text-3xl md:text-4xl mb-3">💻</div>
                <h3 className="font-bold text-lg mb-2 text-blue-700">Tecnologia</h3>
                <p className="text-gray-700 text-sm md:text-base">
                  Desenvolvimento web moderno e responsivo
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-4 md:p-6">
                <div className="text-3xl md:text-4xl mb-3">🎮</div>
                <h3 className="font-bold text-lg mb-2 text-purple-700">Interatividade</h3>
                <p className="text-gray-700 text-sm md:text-base">
                  Jogos educativos para fixar o aprendizado
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-6 md:p-12 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            💬 Entre em Contato!
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Gostou do nosso projeto? Tem sugestões ou quer saber mais sobre nosso trabalho? 
            Ficaremos felizes em conversar com você!
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <span className="bg-white bg-opacity-20 px-4 md:px-6 py-2 rounded-full text-base md:text-lg font-medium">
              📧 Email
            </span>
            <span className="bg-white bg-opacity-20 px-4 md:px-6 py-2 rounded-full text-base md:text-lg font-medium">
              💼 LinkedIn
            </span>
            <span className="bg-white bg-opacity-20 px-4 md:px-6 py-2 rounded-full text-base md:text-lg font-medium">
              🐙 GitHub
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}