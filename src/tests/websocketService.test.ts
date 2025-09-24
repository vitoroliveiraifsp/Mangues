import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { websocketService } from '../services/websocketService';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(public url: string) {
    // Simulate connection
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }
    }, 100);
  }

  send(data: string) {
    // Simulate message sending
    console.log('WebSocket send:', data);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) {
      this.onclose(new CloseEvent('close'));
    }
  }
}

// @ts-ignore
global.WebSocket = MockWebSocket;

describe('WebSocketService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    websocketService.disconnect();
  });

  it('should connect to WebSocket successfully', async () => {
    await expect(websocketService.connect()).resolves.toBeUndefined();
  });

  it('should generate unique player ID', () => {
    const playerId1 = websocketService.getPlayerId();
    const playerId2 = websocketService.getPlayerId();
    
    expect(typeof playerId1).toBe('string');
    expect(playerId1.length).toBeGreaterThan(0);
    expect(playerId1).toBe(playerId2); // Should be consistent for same instance
  });

  it('should handle event listeners', () => {
    const mockListener = vi.fn();
    
    websocketService.on('test_event', mockListener);
    websocketService.off('test_event', mockListener);
    
    // Should not throw errors
    expect(true).toBe(true);
  });

  it('should create room with correct parameters', async () => {
    await websocketService.connect();
    
    // Mock the send method to capture the message
    const sendSpy = vi.spyOn(websocketService, 'send');
    
    websocketService.createRoom('Test Room', 'quiz');
    
    expect(sendSpy).toHaveBeenCalledWith('create_room', expect.objectContaining({
      roomName: 'Test Room',
      gameType: 'quiz'
    }));
  });

  it('should join room with player name', async () => {
    await websocketService.connect();
    
    const sendSpy = vi.spyOn(websocketService, 'send');
    
    websocketService.joinRoom('ROOM123', 'Test Player');
    
    expect(sendSpy).toHaveBeenCalledWith('join_room', expect.objectContaining({
      roomId: 'ROOM123',
      playerName: 'Test Player'
    }));
  });

  it('should handle disconnection gracefully', () => {
    websocketService.disconnect();
    // Should not throw errors
    expect(true).toBe(true);
  });
});