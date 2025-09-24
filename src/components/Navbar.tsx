import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Leaf, 
  Users, 
  Network, 
  AlertTriangle, 
  Gamepad2, 
  Puzzle, 
  Menu, 
  X, 
  Trophy,
  BookOpen,
  Shield,
  BarChart3
} from 'lucide-react';
import { DropdownMenu } from './Navigation/DropdownMenu';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ProfileDropdown } from './UserProfile/ProfileDropdown';
import { LoginModal } from './Auth/LoginModal';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';

const educationalItems = [
  { 
    path: '/biodiversidade', 
    label: 'Vida no Mangue', 
    icon: Leaf,
    description: 'Descubra os animais e plantas que vivem neste lugar especial!'
  },
  { 
    path: '/estrutura', 
    label: 'Como Funciona', 
    icon: Network,
    description: 'Entenda como todos os seres vivos se ajudam no mangue!'
  },
  { 
    path: '/ameacas', 
    label: 'Vamos Cuidar', 
    icon: AlertTriangle,
    description: 'Aprenda como proteger este ambiente importante!'
  },
];

const gameItems = [
  { 
    path: '/jogo-da-memoria', 
    label: 'Jogo da Memória', 
    icon: Gamepad2, 
    highlight: 'purple',
    description: 'Teste sua memória com os animais do mangue!'
  },
  { 
    path: '/jogo-conexoes', 
    label: 'Conecte Superpoderes', 
    icon: Puzzle, 
    highlight: 'indigo',
    description: 'Conecte cada animal com sua habilidade especial!'
  },
  { 
    path: '/quiz', 
    label: 'Quiz Interativo', 
    icon: Gamepad2, 
    highlight: 'blue',
    description: 'Responda perguntas e teste seus conhecimentos!'
  },
  { 
    path: '/ranking', 
    label: 'Ranking', 
    icon: Trophy, 
    highlight: 'yellow',
    description: 'Veja os melhores jogadores e suas pontuações!'
  },
];

const directNavItems = [
  { path: '/', label: 'Início', icon: Leaf },
  { path: '/contatos', label: 'Equipe', icon: Users },
];

export function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user } = useAuth();
  const { t } = useI18n();

  const handleNavClick = () => setMenuOpen(false);

  return (
    <nav className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-xl border-b-4 border-green-500">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Leaf className="h-8 w-8" />
            <span className="text-xl font-bold">🌳 Mundo dos Mangues 🦀</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center p-2 rounded-lg hover:bg-green-800 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Direct Navigation Items */}
            {directNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 transform hover:scale-105 ${
                    isActive
                      ? 'bg-green-800 text-white shadow-lg ring-2 ring-green-400'
                      : 'text-green-100 hover:bg-green-600 hover:text-white hover:shadow-md'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Educational Dropdown */}
            <DropdownMenu
              label="Aprender"
              items={educationalItems}
              icon={BookOpen}
            />

            {/* Analytics Link (Admin only) */}
            {user?.email === 'admin@mangues.com' && (
              <Link
                to="/analytics"
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 transform hover:scale-105 text-green-100 hover:bg-green-600 hover:text-white hover:shadow-md"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </Link>
            )}

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* User Profile or Login */}
            {user ? (
              <ProfileDropdown />
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 transform hover:scale-105 bg-green-800 text-white shadow-lg ring-2 ring-green-400"
              >
                <Users className="h-4 w-4" />
                <span>Entrar</span>
              </button>
            )}
            {/* Games Dropdown */}
            <DropdownMenu
              label="Jogos"
              items={gameItems}
              icon={Gamepad2}
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-2 pb-2">
            <div className="flex flex-col space-y-1">
              {/* Direct Items */}
              {directNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleNavClick}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-base font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-green-800 text-white shadow-lg ring-2 ring-green-400'
                        : 'text-green-100 hover:bg-green-600 hover:text-white hover:shadow-md'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Educational Section */}
              <div className="pt-2">
                <div className="px-4 py-2 text-green-200 font-bold text-sm uppercase tracking-wide">
                  📚 Aprender
                </div>
                {educationalItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleNavClick}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-base font-bold transition-all duration-200 ${
                        isActive
                          ? 'bg-green-800 text-white shadow-lg ring-2 ring-green-400'
                          : 'text-green-100 hover:bg-green-600 hover:text-white hover:shadow-md'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Games Section */}
              <div className="pt-2">
                <div className="px-4 py-2 text-green-200 font-bold text-sm uppercase tracking-wide">
                  🎮 Jogos
                </div>
                {gameItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  const highlight = item.highlight === 'purple' ? 'hover:bg-purple-700' :
                                  item.highlight === 'indigo' ? 'hover:bg-indigo-700' :
                                  item.highlight === 'blue' ? 'hover:bg-blue-700' :
                                  item.highlight === 'yellow' ? 'hover:bg-yellow-600' :
                                  'hover:bg-green-600';
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleNavClick}
                      className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-base font-bold transition-all duration-200 ${
                        isActive
                          ? 'bg-green-800 text-white shadow-lg ring-2 ring-green-400'
                          : `text-green-100 ${highlight} hover:text-white hover:shadow-md`
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </nav>
  );
}