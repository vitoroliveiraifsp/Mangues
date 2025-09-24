import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

class MultiplayerService {
  constructor() {
    this.io = null;
    this.rooms = new Map(); // Map<roomCode, RoomData>
    this.players = new Map(); // Map<socketId, PlayerData>
    this.gameStates = new Map(); // Map<roomCode, GameState>
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? ['https://your-production-domain.com']
          : ['http://localhost:5000', 'http://127.0.0.1:5000', 'http://0.0.0.0:5000', `https://${process.env.REPLIT_DEV_DOMAIN}`].filter(Boolean),
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupEventHandlers();
    console.log('🎮 Multiplayer service initialized');
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Player connected: ${socket.id}`);

      // Join room
      socket.on('join-room', (data) => {
        this.handleJoinRoom(socket, data);
      });

      // Create room
      socket.on('create-room', (data) => {
        this.handleCreateRoom(socket, data);
      });

      // Leave room
      socket.on('leave-room', () => {
        this.handleLeaveRoom(socket);
      });

      // Quiz answer
      socket.on('quiz-answer', (data) => {
        this.handleQuizAnswer(socket, data);
      });

      // Ready status
      socket.on('player-ready', (isReady) => {
        this.handlePlayerReady(socket, isReady);
      });

      // Chat message
      socket.on('chat-message', (message) => {
        this.handleChatMessage(socket, message);
      });

      // Disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  handleCreateRoom(socket, { playerName, gameType = 'quiz' }) {
    const roomCode = this.generateRoomCode();
    const playerId = uuidv4();

    const room = {
      code: roomCode,
      host: socket.id,
      gameType,
      status: 'waiting', // waiting, playing, finished
      players: new Map(),
      settings: {
        maxPlayers: 6,
        timePerQuestion: 30,
        totalQuestions: 10
      },
      createdAt: new Date().toISOString()
    };

    const player = {
      id: playerId,
      socketId: socket.id,
      name: playerName,
      score: 0,
      isReady: false,
      isHost: true,
      answers: [],
      position: 1
    };

    room.players.set(socket.id, player);
    this.rooms.set(roomCode, room);
    this.players.set(socket.id, { ...player, roomCode });

    socket.join(roomCode);

    socket.emit('room-created', {
      roomCode,
      room: this.serializeRoom(room),
      player: this.serializePlayer(player)
    });

    console.log(`🎮 Room created: ${roomCode} by ${playerName}`);
  }

  handleJoinRoom(socket, { roomCode, playerName }) {
    const room = this.rooms.get(roomCode);

    if (!room) {
      socket.emit('join-error', { message: 'Sala não encontrada' });
      return;
    }

    if (room.players.size >= room.settings.maxPlayers) {
      socket.emit('join-error', { message: 'Sala lotada' });
      return;
    }

    if (room.status !== 'waiting') {
      socket.emit('join-error', { message: 'Jogo já iniciado' });
      return;
    }

    const playerId = uuidv4();
    const player = {
      id: playerId,
      socketId: socket.id,
      name: playerName,
      score: 0,
      isReady: false,
      isHost: false,
      answers: [],
      position: room.players.size + 1
    };

    room.players.set(socket.id, player);
    this.players.set(socket.id, { ...player, roomCode });

    socket.join(roomCode);

    // Notify everyone in the room
    this.io.to(roomCode).emit('player-joined', {
      player: this.serializePlayer(player),
      room: this.serializeRoom(room)
    });

    socket.emit('room-joined', {
      roomCode,
      room: this.serializeRoom(room),
      player: this.serializePlayer(player)
    });

    console.log(`🎮 ${playerName} joined room ${roomCode}`);
  }

  handleLeaveRoom(socket) {
    const playerData = this.players.get(socket.id);
    if (!playerData) return;

    const { roomCode } = playerData;
    const room = this.rooms.get(roomCode);
    if (!room) return;

    // Remove player from room
    room.players.delete(socket.id);
    this.players.delete(socket.id);

    socket.leave(roomCode);

    // If room is empty, delete it
    if (room.players.size === 0) {
      this.rooms.delete(roomCode);
      this.gameStates.delete(roomCode);
      console.log(`🗑️ Room ${roomCode} deleted (empty)`);
      return;
    }

    // If host left, assign new host
    if (room.host === socket.id) {
      const newHost = Array.from(room.players.values())[0];
      room.host = newHost.socketId;
      newHost.isHost = true;
      this.players.set(newHost.socketId, { ...this.players.get(newHost.socketId), isHost: true });
    }

    // Notify remaining players
    this.io.to(roomCode).emit('player-left', {
      playerId: playerData.id,
      room: this.serializeRoom(room)
    });

    console.log(`🎮 ${playerData.name} left room ${roomCode}`);
  }

  handlePlayerReady(socket, isReady) {
    const playerData = this.players.get(socket.id);
    if (!playerData) return;

    const { roomCode } = playerData;
    const room = this.rooms.get(roomCode);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (!player) return;

    player.isReady = isReady;
    playerData.isReady = isReady;

    // Check if all players are ready
    const allReady = Array.from(room.players.values()).every(p => p.isReady);
    const hasMinPlayers = room.players.size >= 2;

    this.io.to(roomCode).emit('player-ready-changed', {
      playerId: player.id,
      isReady,
      allReady: allReady && hasMinPlayers,
      room: this.serializeRoom(room)
    });

    // Auto-start game if all ready
    if (allReady && hasMinPlayers && room.status === 'waiting') {
      setTimeout(() => {
        this.startGame(roomCode);
      }, 2000);
    }
  }

  startGame(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room || room.status !== 'waiting') return;

    room.status = 'playing';

    // Initialize game state
    const gameState = {
      currentQuestion: 0,
      questions: this.generateQuestions(room.settings.totalQuestions),
      startTime: Date.now(),
      questionStartTime: Date.now(),
      rankings: []
    };

    this.gameStates.set(roomCode, gameState);

    // Reset players for game
    room.players.forEach(player => {
      player.score = 0;
      player.answers = [];
    });

    this.io.to(roomCode).emit('game-started', {
      gameState: this.serializeGameState(gameState),
      room: this.serializeRoom(room)
    });

    // Send first question
    this.sendNextQuestion(roomCode);

    console.log(`🎮 Game started in room ${roomCode}`);
  }

  sendNextQuestion(roomCode) {
    const room = this.rooms.get(roomCode);
    const gameState = this.gameStates.get(roomCode);

    if (!room || !gameState || gameState.currentQuestion >= gameState.questions.length) {
      this.endGame(roomCode);
      return;
    }

    const question = gameState.questions[gameState.currentQuestion];
    gameState.questionStartTime = Date.now();

    this.io.to(roomCode).emit('new-question', {
      question: {
        id: question.id,
        pergunta: question.pergunta,
        opcoes: question.opcoes,
        numero: gameState.currentQuestion + 1,
        total: gameState.questions.length
      },
      timeLimit: room.settings.timePerQuestion
    });

    // Auto advance after time limit
    setTimeout(() => {
      this.advanceQuestion(roomCode);
    }, room.settings.timePerQuestion * 1000);
  }

  handleQuizAnswer(socket, { questionId, answer, timeToAnswer }) {
    const playerData = this.players.get(socket.id);
    if (!playerData) return;

    const { roomCode } = playerData;
    const room = this.rooms.get(roomCode);
    const gameState = this.gameStates.get(roomCode);

    if (!room || !gameState || room.status !== 'playing') return;

    const player = room.players.get(socket.id);
    const question = gameState.questions[gameState.currentQuestion];

    if (!player || !question || question.id !== questionId) return;

    // Check if player already answered this question
    if (player.answers.some(a => a.questionId === questionId)) return;

    const isCorrect = answer === question.resposta_correta;
    const timeBonus = Math.max(0, room.settings.timePerQuestion - timeToAnswer);
    const points = isCorrect ? question.pontos + Math.floor(timeBonus) : 0;

    const answerData = {
      questionId,
      answer,
      isCorrect,
      points,
      timeToAnswer
    };

    player.answers.push(answerData);
    player.score += points;

    // Send immediate feedback to player
    socket.emit('answer-result', {
      ...answerData,
      correctAnswer: question.resposta_correta,
      explanation: question.explicacao
    });

    // Update live rankings
    this.updateRankings(roomCode);

    console.log(`🎮 ${player.name} answered question ${questionId}: ${isCorrect ? 'correct' : 'wrong'} (+${points} pts)`);
  }

  advanceQuestion(roomCode) {
    const gameState = this.gameStates.get(roomCode);
    if (!gameState) return;

    const room = this.rooms.get(roomCode);
    const question = gameState.questions[gameState.currentQuestion];

    // Send question results to all players
    this.io.to(roomCode).emit('question-results', {
      correctAnswer: question.resposta_correta,
      explanation: question.explicacao,
      rankings: this.calculateCurrentRankings(roomCode)
    });

    gameState.currentQuestion++;

    setTimeout(() => {
      this.sendNextQuestion(roomCode);
    }, 3000); // 3 second break between questions
  }

  updateRankings(roomCode) {
    const rankings = this.calculateCurrentRankings(roomCode);
    this.io.to(roomCode).emit('rankings-updated', { rankings });
  }

  calculateCurrentRankings(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room) return [];

    return Array.from(room.players.values())
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        // Tiebreaker: fewer total time
        const aTotalTime = a.answers.reduce((sum, ans) => sum + ans.timeToAnswer, 0);
        const bTotalTime = b.answers.reduce((sum, ans) => sum + ans.timeToAnswer, 0);
        return aTotalTime - bTotalTime;
      })
      .map((player, index) => ({
        position: index + 1,
        playerId: player.id,
        name: player.name,
        score: player.score,
        totalAnswers: player.answers.length
      }));
  }

  endGame(roomCode) {
    const room = this.rooms.get(roomCode);
    const gameState = this.gameStates.get(roomCode);

    if (!room || !gameState) return;

    room.status = 'finished';

    const finalRankings = this.calculateCurrentRankings(roomCode);
    const gameResults = {
      rankings: finalRankings,
      totalQuestions: gameState.questions.length,
      duration: Date.now() - gameState.startTime,
      players: Array.from(room.players.values()).map(player => ({
        id: player.id,
        name: player.name,
        score: player.score,
        answers: player.answers,
        correctAnswers: player.answers.filter(a => a.isCorrect).length
      }))
    };

    this.io.to(roomCode).emit('game-ended', gameResults);

    // Reset room status after 30 seconds
    setTimeout(() => {
      if (this.rooms.has(roomCode)) {
        room.status = 'waiting';
        room.players.forEach(player => {
          player.isReady = false;
          player.score = 0;
          player.answers = [];
        });
        this.io.to(roomCode).emit('room-reset');
      }
    }, 30000);

    console.log(`🎮 Game ended in room ${roomCode}`);
  }

  handleChatMessage(socket, message) {
    const playerData = this.players.get(socket.id);
    if (!playerData) return;

    const { roomCode } = playerData;
    const room = this.rooms.get(roomCode);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (!player) return;

    const chatMessage = {
      id: uuidv4(),
      playerId: player.id,
      playerName: player.name,
      message: message.trim(),
      timestamp: new Date().toISOString()
    };

    this.io.to(roomCode).emit('chat-message', chatMessage);
  }

  handleDisconnect(socket) {
    console.log(`🔌 Player disconnected: ${socket.id}`);
    this.handleLeaveRoom(socket);
  }

  generateQuestions(count) {
    // Mock questions - in production, fetch from database
    const allQuestions = [
      {
        id: 1,
        pergunta: 'Qual animal do mangue consegue respirar fora da água?',
        opcoes: ['Caranguejo-uçá', 'Peixe-boi', 'Garça-branca', 'Camarão-rosa'],
        resposta_correta: 0,
        explicacao: 'O caranguejo-uçá tem brânquias modificadas que funcionam como pulmões primitivos!',
        pontos: 10
      },
      {
        id: 2,
        pergunta: 'Que árvore consegue tirar o sal da água do mar?',
        opcoes: ['Eucalipto', 'Mangue-vermelho', 'Ipê-amarelo', 'Pau-brasil'],
        resposta_correta: 1,
        explicacao: 'O mangue-vermelho possui folhas especiais com glândulas que eliminam o excesso de sal!',
        pontos: 10
      },
      {
        id: 3,
        pergunta: 'O que acontece durante a maré alta no mangue?',
        opcoes: ['Todos os animais saem para comer', 'A água cobre quase tudo', 'Os caranguejos fazem buracos', 'As plantas produzem flores'],
        resposta_correta: 1,
        explicacao: 'Durante a maré alta, a água do mar entra no mangue e cobre quase toda a área!',
        pontos: 15
      },
      {
        id: 4,
        pergunta: 'Por que as marés são importantes para o mangue?',
        opcoes: ['Só para os peixes nadarem', 'Trazem comida, limpam e ajudam plantas', 'Para fazer barulho', 'Apenas para encher de água'],
        resposta_correta: 1,
        explicacao: 'As marés trazem alimento, limpam o mangue e ajudam as sementes das plantas!',
        pontos: 15
      },
      {
        id: 5,
        pergunta: 'O que podemos fazer para proteger os mangues?',
        opcoes: ['Jogar lixo na água', 'Cortar todas as árvores', 'Não jogar lixo e plantar mudas', 'Pescar todos os peixes'],
        resposta_correta: 2,
        explicacao: 'Protegemos os mangues não jogando lixo na natureza e plantando mudas de árvores nativas!',
        pontos: 10
      }
    ];

    // Shuffle and return requested count
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  serializeRoom(room) {
    return {
      code: room.code,
      host: room.host,
      gameType: room.gameType,
      status: room.status,
      players: Array.from(room.players.values()).map(p => this.serializePlayer(p)),
      settings: room.settings,
      createdAt: room.createdAt
    };
  }

  serializePlayer(player) {
    return {
      id: player.id,
      name: player.name,
      score: player.score,
      isReady: player.isReady,
      isHost: player.isHost,
      position: player.position
    };
  }

  serializeGameState(gameState) {
    return {
      currentQuestion: gameState.currentQuestion,
      totalQuestions: gameState.questions.length,
      startTime: gameState.startTime
    };
  }

  // API methods for room management
  getRoomInfo(roomCode) {
    const room = this.rooms.get(roomCode);
    return room ? this.serializeRoom(room) : null;
  }

  getAllRooms() {
    return Array.from(this.rooms.values()).map(room => this.serializeRoom(room));
  }
}

export default new MultiplayerService();