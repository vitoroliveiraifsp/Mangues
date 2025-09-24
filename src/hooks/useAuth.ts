import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface User {
  id: string;
  nome: string;
  email: string;
  created_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthChange = (newUser: User | null) => {
      setUser(newUser);
    };

    authService.addAuthListener(handleAuthChange);

    return () => {
      authService.removeAuthListener(handleAuthChange);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await authService.login({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (nome: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await authService.register({ nome, email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      await authService.updateProfile(updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: authService.isAuthenticated(),
  };
}