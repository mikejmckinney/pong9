import { Client, Room } from 'colyseus.js';
import { GamePhase, PlayerInput, PongMessage, PowerUpType } from '@pong9/shared/interfaces';

/**
 * Callback types for network events
 */
export interface NetworkCallbacks {
  onConnected?: (playerNumber: 1 | 2) => void;
  onWaiting?: () => void;
  onGameStart?: () => void;
  onGameEnd?: (reason: string) => void;
  onStateChange?: (state: GameStateSnapshot) => void;
  onPong?: (latency: number) => void;
  onError?: (error: Error) => void;
}

/**
 * Snapshot of game state from server
 */
export interface GameStateSnapshot {
  players: Map<string, PlayerSnapshot>;
  ballX: number;
  ballY: number;
  ballVelX: number;
  ballVelY: number;
  score1: number;
  score2: number;
  phase: string;
  winner: number;
  // Power-ups (Phase 4)
  powerUps: Map<string, PowerUpSnapshot>;
  activeEffects: ActiveEffectSnapshot[];
}

export interface PlayerSnapshot {
  x: number;
  y: number;
  sessionId: string;
  connected: boolean;
  playerNumber: 1 | 2;
  paddleScale: number; // Power-up: paddle size multiplier
}

export interface PowerUpSnapshot {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  active: boolean;
}

export interface ActiveEffectSnapshot {
  type: PowerUpType;
  playerId: string;
  expiresAt: number;
}

/**
 * NetworkManager handles Colyseus client connection and state synchronization
 * Per domain_net.md: Client sends intent (UP/DOWN), NOT position
 */
export class NetworkManager {
  private client: Client;
  private room: Room | null = null;
  private callbacks: NetworkCallbacks = {};
  private sessionId: string = '';
  private playerNumber: 1 | 2 = 1;
  private lastPingTime: number = 0;
  private latency: number = 0;
  private pingIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(serverUrl: string = 'ws://localhost:2567') {
    this.client = new Client(serverUrl);
  }

  /**
   * Set callback handlers for network events
   */
  setCallbacks(callbacks: NetworkCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Connect to a game room
   */
  async connect(): Promise<void> {
    try {
      // Join or create a game room
      this.room = await this.client.joinOrCreate('game');
      this.sessionId = this.room.sessionId;

      console.log(`[NetworkManager] Connected to room: ${this.room.roomId}, sessionId: ${this.sessionId}`);

      // Setup message handlers
      this.setupMessageHandlers();

      // Setup state change handler
      this.setupStateHandler();

      // Start ping loop for latency measurement
      this.startPingLoop();

    } catch (error) {
      console.error('[NetworkManager] Connection failed:', error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Disconnect from the room
   */
  disconnect(): void {
    // Clear ping interval to prevent memory leak
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
    
    if (this.room) {
      this.room.leave();
      this.room = null;
    }
  }

  /**
   * Send player input to server
   * Per domain_net.md: Client sends intent (UP/DOWN), NOT position
   */
  sendInput(input: PlayerInput['input']): void {
    if (!this.room) return;
    
    const message: PlayerInput = {
      input,
      timestamp: Date.now(),
    };
    this.room.send('input', message);
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get assigned player number
   */
  getPlayerNumber(): 1 | 2 {
    return this.playerNumber;
  }

  /**
   * Get current latency in ms
   */
  getLatency(): number {
    return this.latency;
  }

  /**
   * Check if connected to a room
   */
  isConnected(): boolean {
    return this.room !== null;
  }

  private setupMessageHandlers(): void {
    if (!this.room) return;

    // Status message (waiting for opponent)
    this.room.onMessage('status', (message: { message: string }) => {
      console.log('[NetworkManager] Status:', message.message);
      if (message.message.includes('Waiting')) {
        this.callbacks.onWaiting?.();
      }
    });

    // Game start
    this.room.onMessage('gameStart', () => {
      console.log('[NetworkManager] Game starting!');
      this.callbacks.onGameStart?.();
    });

    // Game end
    this.room.onMessage('gameEnd', (message: { reason: string }) => {
      console.log('[NetworkManager] Game ended:', message.reason);
      this.callbacks.onGameEnd?.(message.reason);
    });

    // Pong (latency response)
    this.room.onMessage('pong', (message: PongMessage) => {
      this.latency = (Date.now() - message.clientTime) / 2;
      this.callbacks.onPong?.(this.latency);
    });

    // Handle disconnection
    this.room.onLeave((code) => {
      console.log('[NetworkManager] Left room with code:', code);
    });
  }

  private setupStateHandler(): void {
    if (!this.room) return;

    // Track whether we've already notified the player number
    let hasNotifiedPlayerNumber = false;

    // Track state changes
    this.room.onStateChange((state) => {
      // Determine player number from the player's state object (more robust than map order)
      const player = state.players.get(this.sessionId);
      if (player?.playerNumber && this.playerNumber !== player.playerNumber) {
        this.playerNumber = player.playerNumber as 1 | 2;
      }

      // First connection - notify player number (only once)
      if (!hasNotifiedPlayerNumber && player?.playerNumber) {
        if (state.phase === GamePhase.WAITING || state.phase === GamePhase.PLAYING) {
          hasNotifiedPlayerNumber = true;
          this.callbacks.onConnected?.(this.playerNumber);
        }
      }

      // Convert to snapshot
      const snapshot = this.stateToSnapshot(state);
      this.callbacks.onStateChange?.(snapshot);
    });
  }

  private stateToSnapshot(state: unknown): GameStateSnapshot {
    // Type assertion for Colyseus state
    const s = state as {
      players: Map<string, { x: number; y: number; sessionId: string; connected: boolean; playerNumber: 1 | 2; paddleScale: number }>;
      ballX: number;
      ballY: number;
      ballVelX: number;
      ballVelY: number;
      score1: number;
      score2: number;
      phase: string;
      winner: number;
      powerUps: Map<string, { id: string; powerUpType: string; x: number; y: number; active: boolean }>;
      activeEffects: Array<{ effectType: string; playerId: string; expiresAt: number }>;
    };

    const playersSnapshot = new Map<string, PlayerSnapshot>();
    s.players.forEach((player, key) => {
      playersSnapshot.set(key, {
        x: player.x,
        y: player.y,
        sessionId: player.sessionId,
        connected: player.connected,
        playerNumber: player.playerNumber,
        paddleScale: player.paddleScale ?? 1,
      });
    });

    // Convert power-ups
    const powerUpsSnapshot = new Map<string, PowerUpSnapshot>();
    s.powerUps?.forEach((powerUp, key) => {
      powerUpsSnapshot.set(key, {
        id: powerUp.id,
        type: powerUp.powerUpType as PowerUpType,
        x: powerUp.x,
        y: powerUp.y,
        active: powerUp.active,
      });
    });

    // Convert active effects
    const activeEffectsSnapshot: ActiveEffectSnapshot[] = [];
    s.activeEffects?.forEach((effect) => {
      activeEffectsSnapshot.push({
        type: effect.effectType as PowerUpType,
        playerId: effect.playerId,
        expiresAt: effect.expiresAt,
      });
    });

    return {
      players: playersSnapshot,
      ballX: s.ballX,
      ballY: s.ballY,
      ballVelX: s.ballVelX,
      ballVelY: s.ballVelY,
      score1: s.score1,
      score2: s.score2,
      phase: s.phase,
      winner: s.winner,
      powerUps: powerUpsSnapshot,
      activeEffects: activeEffectsSnapshot,
    };
  }

  private startPingLoop(): void {
    // Send ping every 2 seconds for latency measurement
    this.pingIntervalId = setInterval(() => {
      if (this.room) {
        this.lastPingTime = Date.now();
        this.room.send('ping', { clientTime: this.lastPingTime });
      }
    }, 2000);
  }
}
