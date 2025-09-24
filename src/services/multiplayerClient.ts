import { io, Socket } from 'socket.io-client';

export interface Player {
  id: string;
  name: string;
  score: number;
  isReady: boolean;
  isHost: boolean;
  position: number;
}

export interface Room {
  code: string;
  host: string;
  gameType: string;
  status: 'waiting' | 'playing' | 'finished';
  players: Player[];
  settings: {
    maxPlayers: number;
    timePerQuestion: number;
    totalQuestions: number;
  };
  createdAt: string;
}

export interface Question {
  id: number;
  pergunta: string;
  opcoes: string[];
  numero: number;
  total: number;
}

export interface GameState {
  currentQuestion: number;
  totalQuestions: number;
  startTime: number;
}

export interface Ranking {
  position: number;
  playerId: string;
  name: string;
  score: number;
  totalAnswers: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: string;
}

export interface AnswerResult {
  questionId: number;
  answer: number;
  isCorrect: boolean;
  points: number;
  timeToAnswer: number;
  correctAnswer: number;
  explanation: string;
}

export interface GameResults {
  rankings: Ranking[];
  totalQuestions: number;
  duration: number;
  players: Array<{
    id: string;
    name: string;
    score: number;
    answers: any[];
    correctAnswers: number;
  }>;
}

class MultiplayerClient {
  private socket: Socket | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  connect(serverUrl: string = ''): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = serverUrl || (
          process.env.NODE_ENV === 'production' 
            ? window.location.origin 
            : 'http://localhost:3001'
        );

        this.socket = io(url, {
          transports: ['websocket', 'polling'],
          upgrade: true,
          rememberUpgrade: true
        });

        this.socket.on('connect', () => {
          console.log('🎮 Connected to multiplayer server');
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('🎮 Connection error:', error);
          reject(error);
        });

        this.setupEventListeners();
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners.clear();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Room events
    this.socket.on('room-created', (data) => this.emit('room-created', data));
    this.socket.on('room-joined', (data) => this.emit('room-joined', data));
    this.socket.on('join-error', (data) => this.emit('join-error', data));
    this.socket.on('player-joined', (data) => this.emit('player-joined', data));
    this.socket.on('player-left', (data) => this.emit('player-left', data));
    this.socket.on('player-ready-changed', (data) => this.emit('player-ready-changed', data));
    this.socket.on('room-reset', () => this.emit('room-reset'));

    // Game events
    this.socket.on('game-started', (data) => this.emit('game-started', data));
    this.socket.on('new-question', (data) => this.emit('new-question', data));
    this.socket.on('answer-result', (data) => this.emit('answer-result', data));
    this.socket.on('question-results', (data) => this.emit('question-results', data));
    this.socket.on('rankings-updated', (data) => this.emit('rankings-updated', data));
    this.socket.on('game-ended', (data) => this.emit('game-ended', data));

    // Chat events
    this.socket.on('chat-message', (data) => this.emit('chat-message', data));

    // Error handling
    this.socket.on('error', (error) => this.emit('error', error));
  }

  // Room management
  createRoom(playerName: string, gameType: string = 'quiz'): void {
    if (!this.socket) return;
    this.socket.emit('create-room', { playerName, gameType });
  }

  joinRoom(roomCode: string, playerName: string): void {
    if (!this.socket) return;
    this.socket.emit('join-room', { roomCode, playerName });
  }

  leaveRoom(): void {
    if (!this.socket) return;
    this.socket.emit('leave-room');
  }

  setPlayerReady(isReady: boolean): void {
    if (!this.socket) return;
    this.socket.emit('player-ready', isReady);
  }

  // Game actions
  submitAnswer(questionId: number, answer: number, timeToAnswer: number): void {
    if (!this.socket) return;
    this.socket.emit('quiz-answer', { questionId, answer, timeToAnswer });
  }

  // Chat
  sendChatMessage(message: string): void {
    if (!this.socket) return;
    this.socket.emit('chat-message', message);
  }

  // Event handling
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!this.eventListeners.has(event)) return;
    
    if (callback) {
      const listeners = this.eventListeners.get(event)!;
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.eventListeners.set(event, []);
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Utility
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | null {
    return this.socket?.id || null;
  }
}

export default new MultiplayerClient();