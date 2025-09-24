// WebSocket service for real-time multiplayer functionality
interface MultiplayerRoom {
  id: string;
  name: string;
  players: Player[];
  gameType: 'quiz' | 'memoria' | 'conexoes';
  status: 'waiting' | 'playing' | 'finished';
  currentQuestion?: number;
  scores: { [playerId: string]: number };
  createdAt: number;
}

interface Player {
  id: string;
  name: string;
  avatar: string;
  isReady: boolean;
  isHost: boolean;
  score: number;
  lastActivity: number;
}

interface WebSocketMessage {
  type: 'join_room' | 'leave_room' | 'player_ready' | 'game_start' | 'answer_submit' | 'game_end' | 'room_update';
  payload: any;
  timestamp: number;
  playerId: string;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();
  private currentRoom: MultiplayerRoom | null = null;
  private playerId: string;

  constructor() {
    this.playerId = this.generatePlayerId();
  }

  private generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    
    if (window.location.hostname.includes('replit') || window.location.hostname.includes('.app')) {
      return `${protocol}//${host}/ws`;
    } else if (window.location.port === '8080') {
      return `${protocol}//${window.location.hostname}:3001/ws`;
    } else {
      return `${protocol}//localhost:3001/ws`;
    }
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = this.getWebSocketUrl();
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('🔗 WebSocket conectado');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Erro ao processar mensagem WebSocket:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('🔌 WebSocket desconectado');
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('❌ Erro no WebSocket:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      setTimeout(() => {
        this.connect().catch(console.error);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const { type, payload } = message;
    
    switch (type) {
      case 'room_update':
        this.currentRoom = payload;
        this.emit('room_update', payload);
        break;
      case 'player_ready':
        this.emit('player_ready', payload);
        break;
      case 'game_start':
        this.emit('game_start', payload);
        break;
      case 'answer_submit':
        this.emit('answer_submit', payload);
        break;
      case 'game_end':
        this.emit('game_end', payload);
        break;
      default:
        console.warn('Tipo de mensagem desconhecido:', type);
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event) || [];
    eventListeners.forEach(listener => listener(data));
  }

  // Public methods
  on(event: string, listener: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off(event: string, listener: (data: any) => void) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  send(type: string, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: type as any,
        payload,
        timestamp: Date.now(),
        playerId: this.playerId
      };
      
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket não está conectado');
    }
  }

  // Room management
  createRoom(roomName: string, gameType: 'quiz' | 'memoria' | 'conexoes'): void {
    this.send('create_room', {
      roomName,
      gameType,
      hostId: this.playerId
    });
  }

  joinRoom(roomId: string, playerName: string): void {
    this.send('join_room', {
      roomId,
      playerName,
      playerId: this.playerId
    });
  }

  leaveRoom(): void {
    if (this.currentRoom) {
      this.send('leave_room', {
        roomId: this.currentRoom.id,
        playerId: this.playerId
      });
      this.currentRoom = null;
    }
  }

  setPlayerReady(isReady: boolean): void {
    if (this.currentRoom) {
      this.send('player_ready', {
        roomId: this.currentRoom.id,
        playerId: this.playerId,
        isReady
      });
    }
  }

  startGame(): void {
    if (this.currentRoom) {
      this.send('game_start', {
        roomId: this.currentRoom.id,
        hostId: this.playerId
      });
    }
  }

  submitAnswer(questionId: string, answer: any): void {
    if (this.currentRoom) {
      this.send('answer_submit', {
        roomId: this.currentRoom.id,
        playerId: this.playerId,
        questionId,
        answer,
        timestamp: Date.now()
      });
    }
  }

  getCurrentRoom(): MultiplayerRoom | null {
    return this.currentRoom;
  }

  getPlayerId(): string {
    return this.playerId;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const websocketService = new WebSocketService();