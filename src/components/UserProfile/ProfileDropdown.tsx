import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, Trophy, BookOpen, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 transform hover:scale-105 bg-green-800 text-white shadow-lg ring-2 ring-green-400"
      >
        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <User className="h-4 w-4" />
        </div>
        <span className="hidden sm:inline">{user.nome.split(' ')[0]}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
          {/* User Info */}
          <div className="p-4 bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{user.nome}</h3>
                <p className="text-sm opacity-90 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                // Navigate to profile page when implemented
              }}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
            >
              <Settings className="h-5 w-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-800">Configurações</div>
                <div className="text-xs text-gray-500">Editar perfil e preferências</div>
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                // Navigate to achievements when implemented
              }}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
            >
              <Trophy className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="font-medium text-gray-800">Conquistas</div>
                <div className="text-xs text-gray-500">Veja suas medalhas e certificados</div>
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                // Navigate to progress when implemented
              }}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
            >
              <BookOpen className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-800">Meu Progresso</div>
                <div className="text-xs text-gray-500">Acompanhe seu aprendizado</div>
              </div>
            </button>

            <hr className="my-2" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-50 transition-colors text-left text-red-600"
            >
              <LogOut className="h-5 w-5" />
              <div>
                <div className="font-medium">Sair</div>
                <div className="text-xs text-red-500">Fazer logout da conta</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}