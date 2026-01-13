import { Room, Client } from 'colyseus';
import { GameState, Player } from '../schemas/index.js';
import { PlayerInput, GamePhase, PingMessage, PongMessage } from '@pong9/shared/interfaces';
import { 
  PADDLE_SPEED, 
  SERVER_TICK_RATE, 
  BALL_SPEED,
  GAME_WIDTH,
  GAME_HEIGHT,
  BALL_SIZE,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  WINNING_SCORE
} from '@pong9/shared/constants';

/**
 * GameRoom handles multiplayer Pong game sessions
 * Per domain_net.md: Server runs physics at 60Hz, client sends intent not position
 */
export class GameRoom extends Room<GameState> {
  // Map of session IDs to player numbers (1 or 2)
  private playerNumbers = new Map<string, 1 | 2>();
  // Map of session IDs to their current input
  private playerInputs = new Map<string, PlayerInput>();
  // Simulation interval handle
  private simulationInterval: ReturnType<typeof setTimeout> | null = null;
  // Last tick timestamp for delta calculation
  private lastTickTime: number = 0;
  // Expected tick interval in ms (for drift compensation)
  private readonly tickIntervalMs: number = 1000 / SERVER_TICK_RATE;
  // Accumulated time for drift compensation
  private accumulatedDrift: number = 0;

  onCreate(): void {
    this.setState(new GameState());
    this.maxClients = 2;

    // Register message handlers
    this.onMessage('input', this.handleInput.bind(this));
    this.onMessage('ping', this.handlePing.bind(this));

    console.log(`[GameRoom] Room ${this.roomId} created`);
  }

  onJoin(client: Client): void {
    console.log(`[GameRoom] Player ${client.sessionId} joined room ${this.roomId}`);

    // Determine player number (first player is P1, second is P2)
    const playerNumber = this.playerNumbers.size === 0 ? 1 : 2;
    this.playerNumbers.set(client.sessionId, playerNumber as 1 | 2);

    // Create player schema with explicit player number
    const player = new Player(playerNumber === 1, playerNumber as 1 | 2);
    player.sessionId = client.sessionId;
    this.state.players.set(client.sessionId, player);

    // Initialize input state
    this.playerInputs.set(client.sessionId, { input: 'NONE', timestamp: Date.now() });

    // Check if we have both players to start the game
    if (this.playerNumbers.size === 2) {
      this.startGame();
    } else {
      // Notify that we're waiting for another player
      client.send('status', { message: 'Waiting for opponent...' });
    }
  }

  onLeave(client: Client, consented: boolean): void {
    console.log(`[GameRoom] Player ${client.sessionId} left room ${this.roomId} (consented: ${consented})`);

    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.connected = false;
    }

    this.playerNumbers.delete(client.sessionId);
    this.playerInputs.delete(client.sessionId);

    // If game was in progress and a player leaves, end the game
    if (this.state.phase === GamePhase.PLAYING) {
      this.endGame();
    }
  }

  onDispose(): void {
    console.log(`[GameRoom] Room ${this.roomId} disposed`);
    this.stopSimulation();
  }

  /**
   * Handle player input messages
   * Per domain_net.md: Client sends intent (UP/DOWN), NOT position
   */
  private handleInput(client: Client, message: PlayerInput): void {
    this.playerInputs.set(client.sessionId, message);
  }

  /**
   * Handle ping messages for latency measurement
   */
  private handlePing(client: Client, message: PingMessage): void {
    const response: PongMessage = {
      clientTime: message.clientTime,
      serverTime: Date.now(),
    };
    client.send('pong', response);
  }

  /**
   * Start the game when both players are ready
   */
  private startGame(): void {
    console.log(`[GameRoom] Starting game in room ${this.roomId}`);
    this.state.phase = GamePhase.PLAYING;
    
    // Broadcast game start to all clients
    this.broadcast('gameStart', { message: 'Game starting!' });

    // Start the simulation loop at 60Hz using setTimeout with drift compensation
    // This prevents timer drift that can occur with setInterval
    this.lastTickTime = Date.now();
    this.accumulatedDrift = 0;
    this.scheduleNextTick();

    // Launch ball after a short delay (1 second)
    setTimeout(() => this.launchBall(), 1000);
  }

  /**
   * Schedule the next tick with drift compensation
   * Uses setTimeout instead of setInterval to prevent accumulated drift
   */
  private scheduleNextTick(): void {
    if (this.state.phase !== GamePhase.PLAYING) return;

    const now = Date.now();
    const elapsed = now - this.lastTickTime;
    
    // Calculate drift: how much we're off from the expected interval
    const drift = elapsed - this.tickIntervalMs;
    this.accumulatedDrift += drift;

    // Compensate for drift in the next tick timing
    const nextTickDelay = Math.max(1, this.tickIntervalMs - this.accumulatedDrift);
    
    // Reset accumulated drift if it's been compensated
    if (this.accumulatedDrift > 0) {
      this.accumulatedDrift = Math.max(0, this.accumulatedDrift - (this.tickIntervalMs - nextTickDelay));
    }

    this.simulationInterval = setTimeout(() => this.tick(), nextTickDelay);
  }

  /**
   * Server simulation tick - runs at 60Hz
   * Per domain_net.md: Server runs the physics loop at 60Hz
   */
  private tick(): void {
    if (this.state.phase !== GamePhase.PLAYING) return;

    const now = Date.now();
    const deltaSeconds = (now - this.lastTickTime) / 1000;
    this.lastTickTime = now;

    // Process player inputs (moves paddles)
    this.processInputs(deltaSeconds);

    // Update ball physics (movement, collisions, scoring)
    this.updateBallPhysics(deltaSeconds);

    // Schedule the next tick with drift compensation
    this.scheduleNextTick();
  }

  /**
   * Update ball physics - movement, collisions, and scoring
   * This is the authoritative physics simulation (Phase 3)
   */
  private updateBallPhysics(deltaSeconds: number): void {
    // Only update if ball has velocity
    if (this.state.ballVelX === 0 && this.state.ballVelY === 0) return;

    const halfBall = BALL_SIZE / 2;
    
    // Calculate new position
    let newX = this.state.ballX + this.state.ballVelX * deltaSeconds;
    let newY = this.state.ballY + this.state.ballVelY * deltaSeconds;

    // Top/bottom wall collision (bounce)
    if (newY - halfBall <= 0) {
      newY = halfBall;
      this.state.ballVelY = Math.abs(this.state.ballVelY);
    } else if (newY + halfBall >= GAME_HEIGHT) {
      newY = GAME_HEIGHT - halfBall;
      this.state.ballVelY = -Math.abs(this.state.ballVelY);
    }

    // Check for paddle collisions
    const paddleCollision = this.checkPaddleCollision(newX, newY);
    if (paddleCollision) {
      const { newVelX, newVelY, adjustedX } = paddleCollision;
      this.state.ballVelX = newVelX;
      this.state.ballVelY = newVelY;
      newX = adjustedX;
    }

    // Left/right wall collision (scoring)
    if (newX - halfBall <= 0) {
      // Player 2 scores
      this.handleScore(2);
      return;
    } else if (newX + halfBall >= GAME_WIDTH) {
      // Player 1 scores
      this.handleScore(1);
      return;
    }

    // Update ball position
    this.state.ballX = newX;
    this.state.ballY = newY;
  }

  /**
   * Check for paddle collisions and return new velocity if collision occurred
   */
  private checkPaddleCollision(
    ballX: number, 
    ballY: number
  ): { newVelX: number; newVelY: number; adjustedX: number } | null {
    const halfBall = BALL_SIZE / 2;
    const halfPaddleHeight = PADDLE_HEIGHT / 2;
    const halfPaddleWidth = PADDLE_WIDTH / 2;

    // Get player paddles
    let player1: Player | undefined;
    let player2: Player | undefined;

    for (const player of this.state.players.values()) {
      if (player.playerNumber === 1) player1 = player;
      else if (player.playerNumber === 2) player2 = player;
    }

    // Check Player 1 paddle (left side)
    if (player1 && this.state.ballVelX < 0) {
      const paddleLeft = player1.x - halfPaddleWidth;
      const paddleRight = player1.x + halfPaddleWidth;
      const paddleTop = player1.y - halfPaddleHeight;
      const paddleBottom = player1.y + halfPaddleHeight;

      if (ballX - halfBall <= paddleRight && 
          ballX + halfBall >= paddleLeft &&
          ballY + halfBall >= paddleTop && 
          ballY - halfBall <= paddleBottom) {
        return this.calculateBounce(player1, ballY, 1);
      }
    }

    // Check Player 2 paddle (right side)
    if (player2 && this.state.ballVelX > 0) {
      const paddleLeft = player2.x - halfPaddleWidth;
      const paddleRight = player2.x + halfPaddleWidth;
      const paddleTop = player2.y - halfPaddleHeight;
      const paddleBottom = player2.y + halfPaddleHeight;

      if (ballX + halfBall >= paddleLeft && 
          ballX - halfBall <= paddleRight &&
          ballY + halfBall >= paddleTop && 
          ballY - halfBall <= paddleBottom) {
        return this.calculateBounce(player2, ballY, -1);
      }
    }

    return null;
  }

  /**
   * Calculate ball bounce off paddle based on where it hits
   * Physics: Ball deflects based on relative hit position
   * - Hit top of paddle (ballY < paddle.y) → ball deflects upward (negative Y velocity)
   * - Hit bottom of paddle (ballY > paddle.y) → ball deflects downward (positive Y velocity)
   */
  private calculateBounce(
    paddle: Player, 
    ballY: number, 
    direction: 1 | -1
  ): { newVelX: number; newVelY: number; adjustedX: number } {
    const halfPaddleHeight = PADDLE_HEIGHT / 2;
    const halfPaddleWidth = PADDLE_WIDTH / 2;
    const halfBall = BALL_SIZE / 2;

    // Calculate relative intersection (-1 to 1)
    // Positive = ball hit top of paddle, Negative = ball hit bottom
    const relativeIntersect = (paddle.y - ballY) / halfPaddleHeight;
    
    // Calculate bounce angle (max 60 degrees)
    const maxBounceAngle = Math.PI / 3; // 60 degrees
    const bounceAngle = relativeIntersect * maxBounceAngle;

    // Current speed with 5% increase per hit (capped at 2x base speed)
    // Speed increase makes rallies more exciting as they progress
    let currentSpeed = Math.sqrt(
      this.state.ballVelX * this.state.ballVelX + 
      this.state.ballVelY * this.state.ballVelY
    );
    // Guard against zero speed (defensive coding to prevent NaN)
    if (currentSpeed === 0) {
      currentSpeed = BALL_SPEED;
    }
    const newSpeed = Math.min(currentSpeed * 1.05, BALL_SPEED * 2);

    // Calculate new velocities
    // X velocity: direction determines left/right movement
    // Y velocity: negative sin because positive angle should deflect upward (negative Y in screen coords)
    const newVelX = direction * newSpeed * Math.cos(bounceAngle);
    const newVelY = -newSpeed * Math.sin(bounceAngle);

    // Adjust X position to avoid ball getting stuck in paddle
    const adjustedX = direction === 1 
      ? paddle.x + halfPaddleWidth + halfBall + 1
      : paddle.x - halfPaddleWidth - halfBall - 1;

    return { newVelX, newVelY, adjustedX };
  }

  /**
   * Handle scoring - update score and reset ball or end game
   */
  private handleScore(player: 1 | 2): void {
    if (player === 1) {
      this.state.score1++;
      console.log(`[GameRoom] Player 1 scores! Score: ${this.state.score1}-${this.state.score2}`);
    } else {
      this.state.score2++;
      console.log(`[GameRoom] Player 2 scores! Score: ${this.state.score1}-${this.state.score2}`);
    }

    // Check for winner
    if (this.state.score1 >= WINNING_SCORE) {
      this.state.winner = 1;
      this.endGame('Player 1 wins!');
      return;
    } else if (this.state.score2 >= WINNING_SCORE) {
      this.state.winner = 2;
      this.endGame('Player 2 wins!');
      return;
    }

    // Reset ball to center and launch after delay
    this.state.resetBall();
    setTimeout(() => this.launchBall(), 1000);
  }

  /**
   * Process pending player inputs
   */
  private processInputs(deltaSeconds: number): void {
    for (const [sessionId, input] of this.playerInputs) {
      const player = this.state.players.get(sessionId);
      if (!player || !player.connected) continue;

      switch (input.input) {
        case 'UP':
          player.moveUp(PADDLE_SPEED, deltaSeconds);
          break;
        case 'DOWN':
          player.moveDown(PADDLE_SPEED, deltaSeconds);
          break;
        case 'NONE':
        default:
          // No movement
          break;
      }
    }
  }

  /**
   * Launch the ball with a random direction
   */
  private launchBall(): void {
    if (this.state.phase !== GamePhase.PLAYING) return;
    
    // Random direction: -30 to +30 degrees
    const direction = Math.random() > 0.5 ? 1 : -1;
    const angle = (Math.random() - 0.5) * Math.PI / 3;
    
    this.state.ballVelX = direction * BALL_SPEED * Math.cos(angle);
    this.state.ballVelY = BALL_SPEED * Math.sin(angle);

    console.log(`[GameRoom] Ball launched with velocity (${this.state.ballVelX.toFixed(2)}, ${this.state.ballVelY.toFixed(2)})`);
  }

  /**
   * End the game (player disconnection, winner, or other reason)
   */
  private endGame(reason: string = 'Player disconnected'): void {
    console.log(`[GameRoom] Ending game in room ${this.roomId}: ${reason}`);
    this.state.phase = GamePhase.FINISHED;
    this.stopSimulation();
    this.broadcast('gameEnd', { reason });
  }

  /**
   * Stop the simulation loop
   */
  private stopSimulation(): void {
    if (this.simulationInterval) {
      clearTimeout(this.simulationInterval);
      this.simulationInterval = null;
    }
  }
}
