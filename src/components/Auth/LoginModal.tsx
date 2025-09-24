import { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export function LoginModal({ isOpen, onClose, initialMode = 'login' }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  const { login, register, loading, error } = useAuth();

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (!formData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (mode === 'register') {
      if (!formData.nome.trim()) {
        errors.nome = 'Nome é obrigatório';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Senhas não coincidem';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await register(formData.nome, formData.email, formData.password);
      }
      
      resetForm();
      onClose();
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌿</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {mode === 'login' ? 'Entrar na Conta' : 'Criar Conta'}
          </h2>
          <p className="text-gray-600">
            {mode === 'login' 
              ? 'Acesse sua conta para salvar seu progresso!' 
              : 'Crie sua conta e acompanhe seu aprendizado!'
            }
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name (Register only) */}
          {mode === 'register' && (
            <div>
              <label htmlFor="nome" className="block text-sm font-bold text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Nome Completo
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  formErrors.nome ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Digite seu nome completo"
              />
              {formErrors.nome && (
                <p className="mt-1 text-sm text-red-600">{formErrors.nome}</p>
              )}
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
              <Mail className="h-4 w-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                formErrors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="seu.email@exemplo.com"
            />
            {formErrors.email && (
              <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
              <Lock className="h-4 w-4 inline mr-2" />
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  formErrors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Digite sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {formErrors.password && (
              <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
            )}
          </div>

          {/* Confirm Password (Register only) */}
          {mode === 'register' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-2">
                <Lock className="h-4 w-4 inline mr-2" />
                Confirmar Senha
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  formErrors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Confirme sua senha"
              />
              {formErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white transform hover:scale-105 shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processando...</span>
              </div>
            ) : (
              mode === 'login' ? 'Entrar' : 'Criar Conta'
            )}
          </button>
        </form>

        {/* Switch Mode */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
          </p>
          <button
            onClick={switchMode}
            className="text-green-600 hover:text-green-700 font-bold transition-colors"
          >
            {mode === 'login' ? 'Criar conta gratuita' : 'Fazer login'}
          </button>
        </div>

        {/* Benefits */}
        <div className="mt-8 bg-green-50 rounded-2xl p-6">
          <h3 className="font-bold text-green-800 mb-3 text-center">
            🌟 Benefícios da Conta
          </h3>
          <ul className="space-y-2 text-sm text-green-700">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Salvar seu progresso nos jogos
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Aparecer no ranking global
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Acompanhar seu aprendizado
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Ganhar certificados digitais
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}