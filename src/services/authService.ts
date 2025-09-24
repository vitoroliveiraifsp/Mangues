// Authentication service for user management
interface User {
  id: string;
  nome: string;
  email: string;
  created_at: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  nome: string;
  email: string;
  password: string;
}

class AuthService {
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  constructor() {
    // Check for existing session on initialization
    this.checkExistingSession();
  }

  private checkExistingSession() {
    const userData = localStorage.getItem('mangues_user');
    if (userData) {
      try {
        this.currentUser = JSON.parse(userData);
        this.notifyListeners();
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('mangues_user');
      }
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  private getApiUrl() {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    if (hostname.includes('replit') || hostname.includes('.app')) {
      return '/api-proxy';
    } else if (port === '8080') {
      return '';
    } else {
      return 'http://localhost:3001';
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await fetch(`${this.getApiUrl()}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao fazer login');
      }

      const { user, token } = await response.json();
      
      // Store user data and token
      localStorage.setItem('mangues_user', JSON.stringify(user));
      localStorage.setItem('mangues_token', token);
      
      this.currentUser = user;
      this.notifyListeners();
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterData): Promise<User> {
    try {
      const response = await fetch(`${this.getApiUrl()}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar conta');
      }

      const { user, token } = await response.json();
      
      // Store user data and token
      localStorage.setItem('mangues_user', JSON.stringify(user));
      localStorage.setItem('mangues_token', token);
      
      this.currentUser = user;
      this.notifyListeners();
      
      return user;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('mangues_user');
    localStorage.removeItem('mangues_token');
    this.currentUser = null;
    this.notifyListeners();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  getToken(): string | null {
    return localStorage.getItem('mangues_token');
  }

  // Add listener for auth state changes
  addAuthListener(listener: (user: User | null) => void) {
    this.listeners.push(listener);
    // Immediately notify with current state
    listener(this.currentUser);
  }

  // Remove auth listener
  removeAuthListener(listener: (user: User | null) => void) {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await fetch(`${this.getApiUrl()}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar perfil');
      }

      const updatedUser = await response.json();
      
      localStorage.setItem('mangues_user', JSON.stringify(updatedUser));
      this.currentUser = updatedUser;
      this.notifyListeners();
      
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }
}

// Singleton instance
export const authService = new AuthService();