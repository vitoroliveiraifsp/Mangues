import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for rooms (in production, use Redis or database)
const rooms = new Map();
const playerConnections = new Map();

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ 
    server,
    path: '/ws'
  });

  wss.on('connection', (ws, req) => {
    console.log('🔗 Nova conexão WebSocket');
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleMessage(ws, message);
      } catch (error) {
        console.error('Erro ao processar mensagem WebSocket:', error);
        ws.send(JSON.stringify({
          type: 'error',
          payload: { message: 'Mensagem inválida' }
        }));
      }
    });

    ws.on('close', () => {
      console.log('🔌 Conexão WebSocket fechada');
      handlePlayerDisconnect(ws);
    });

    ws.on('error', (error) => {
      console.error('❌ Erro WebSocket:', error);
    });
  });

  return wss;
}

function handleMessage(ws, message) {
  const { type, payload, playerId } = message;

  switch (type) {
    case 'create_room':
      handleCreateRoom(ws, payload, playerId);
      break;
    case 'join_room':
      handleJoinRoom(ws, payload, playerId);
      break;
    case 'leave_room':
      handleLeaveRoom(ws, payload, playerId);
      break;
    case 'player_ready':
      handlePlayerReady(ws, payload, playerId);
      break;
    case 'game_start':
      handleGameStart(ws, payload, playerId);
      break;
    case 'answer_submit':
      handleAnswerSubmit(ws, payload, playerId);
      break;
    default:
      console.warn('Tipo de mensagem desconhecido:', type);
  }
}

function handleCreateRoom(ws, payload, playerId) {
  const { roomName, gameType, hostId } = payload;
  
  const roomId = generateRoomCode();
  const room = {
    id: roomId,
    name: roomName,
    gameType,
    status: 'waiting',
    maxPlayers: 6,
    players: [{
      id: hostId,
      name: roomName.replace('Sala de ', ''),
      avatar: '👤',
      isReady: false,
      isHost: true,
      score: 0,
      lastActivity: Date.now()
    }],
    scores: {},
    createdAt: Date.now(),
    currentQuestion: 0
  };

  rooms.set(roomId, room);
  playerConnections.set(playerId, { ws, roomId });

  ws.send(JSON.stringify({
    type: 'room_update',
    payload: room
  }));
}

function handleJoinRoom(ws, payload, playerId) {
  const { roomId, playerName } = payload;
  
  const room = rooms.get(roomId);
  if (!room) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Sala não encontrada' }
    }));
    return;
  }

  if (room.players.length >= room.maxPlayers) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Sala lotada' }
    }));
    return;
  }

  if (room.status !== 'waiting') {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Jogo já iniciado' }
    }));
    return;
  }

  // Add player to room
  const newPlayer = {
    id: playerId,
    name: playerName,
    avatar: '👤',
    isReady: false,
    isHost: false,
    score: 0,
    lastActivity: Date.now()
  };

  room.players.push(newPlayer);
  playerConnections.set(playerId, { ws, roomId });

  // Notify all players in room
  broadcastToRoom(roomId, {
    type: 'room_update',
    payload: room
  });
}

function handleLeaveRoom(ws, payload, playerId) {
  const { roomId } = payload;
  const room = rooms.get(roomId);
  
  if (!room) return;

  // Remove player from room
  room.players = room.players.filter(p => p.id !== playerId);
  playerConnections.delete(playerId);

  if (room.players.length === 0) {
    // Delete empty room
    rooms.delete(roomId);
  } else {
    // If host left, assign new host
    if (!room.players.some(p => p.isHost)) {
      room.players[0].isHost = true;
    }

    // Notify remaining players
    broadcastToRoom(roomId, {
      type: 'room_update',
      payload: room
    });
  }
}

function handlePlayerReady(ws, payload, playerId) {
  const { roomId, isReady } = payload;
  const room = rooms.get(roomId);
  
  if (!room) return;

  const player = room.players.find(p => p.id === playerId);
  if (player) {
    player.isReady = isReady;
    player.lastActivity = Date.now();

    broadcastToRoom(roomId, {
      type: 'room_update',
      payload: room
    });
  }
}

function handleGameStart(ws, payload, playerId) {
  const { roomId } = payload;
  const room = rooms.get(roomId);
  
  if (!room) return;

  const player = room.players.find(p => p.id === playerId);
  if (!player || !player.isHost) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Apenas o host pode iniciar o jogo' }
    }));
    return;
  }

  if (!room.players.every(p => p.isReady)) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Nem todos os jogadores estão prontos' }
    }));
    return;
  }

  room.status = 'playing';
  room.currentQuestion = 0;

  broadcastToRoom(roomId, {
    type: 'game_start',
    payload: {
      gameType: room.gameType,
      startTime: Date.now()
    }
  });
}

function handleAnswerSubmit(ws, payload, playerId) {
  const { roomId, questionId, answer, timestamp } = payload;
  const room = rooms.get(roomId);
  
  if (!room) return;

  const player = room.players.find(p => p.id === playerId);
  if (!player) return;

  // Process answer and update score
  // This would involve checking against correct answers
  // For now, we'll simulate scoring
  const points = Math.floor(Math.random() * 100) + 50;
  player.score += points;

  broadcastToRoom(roomId, {
    type: 'answer_submit',
    payload: {
      playerId,
      playerName: player.name,
      points,
      totalScore: player.score,
      timestamp
    }
  });
}

function handlePlayerDisconnect(ws) {
  // Find and remove disconnected player
  for (const [playerId, connection] of playerConnections.entries()) {
    if (connection.ws === ws) {
      const roomId = connection.roomId;
      const room = rooms.get(roomId);
      
      if (room) {
        room.players = room.players.filter(p => p.id !== playerId);
        
        if (room.players.length === 0) {
          rooms.delete(roomId);
        } else {
          // Assign new host if needed
          if (!room.players.some(p => p.isHost)) {
            room.players[0].isHost = true;
          }
          
          broadcastToRoom(roomId, {
            type: 'room_update',
            payload: room
          });
        }
      }
      
      playerConnections.delete(playerId);
      break;
    }
  }
}

function broadcastToRoom(roomId, message) {
  const room = rooms.get(roomId);
  if (!room) return;

  room.players.forEach(player => {
    const connection = playerConnections.get(player.id);
    if (connection && connection.ws.readyState === 1) { // WebSocket.OPEN
      connection.ws.send(JSON.stringify(message));
    }
  });
}

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}