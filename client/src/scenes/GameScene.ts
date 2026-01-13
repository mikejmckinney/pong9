import Phaser from 'phaser';
import { Paddle } from '../objects/Paddle.ts';
import { Ball } from '../objects/Ball.ts';
import { TouchInputManager } from '../input/TouchInputManager.ts';
import { NetworkManager, GameStateSnapshot } from '../network/NetworkManager.ts';
import { PADDLE_SPEED, BALL_SPEED, WINNING_SCORE } from '@pong9/shared/constants';

// Palette Constants (match values in domain_ui.md)
export const COLORS = {
  BG: 0x1b2853,     // Deep Indigo
  GRID: 0x2b2b2b,   // Dark gray grid lines
  P1: 0x04c4ca,     // Neon Cyan
  P2: 0xff2975,     // Hot Pink
  BALL: 0xffffff,   // White
};

// Reconciliation threshold per domain_net.md
// "Reconcile with server state only if deviation > 5px"
const RECONCILIATION_THRESHOLD = 5;

// Scene data interface for type safety
interface GameSceneData {
  networkManager?: NetworkManager;
}

export class GameScene extends Phaser.Scene {
  private gridGraphics!: Phaser.GameObjects.Graphics;
  private paddle1!: Paddle;
  private paddle2!: Paddle;
  private ball!: Ball;
  private scoreText1!: Phaser.GameObjects.Text;
  private scoreText2!: Phaser.GameObjects.Text;
  private score1 = 0;
  private score2 = 0;
  private touchInput!: TouchInputManager;
  private gameOver = false;
  private winnerText?: Phaser.GameObjects.Text;
  private restartText?: Phaser.GameObjects.Text;
  private restartHandler?: () => void;
  private keyboardKeys?: {
    p1Up: Phaser.Input.Keyboard.Key;
    p1Down: Phaser.Input.Keyboard.Key;
    p2Up: Phaser.Input.Keyboard.Key;
    p2Down: Phaser.Input.Keyboard.Key;
    restart: Phaser.Input.Keyboard.Key;
  };
  // Network support (Phase 2+3)
  private networkManager?: NetworkManager;
  private isNetworked = false;
  private latencyText?: Phaser.GameObjects.Text;

  // Interpolation state for networked play (Phase 3)
  // Store target positions for smooth lerping
  private targetBallX = 0;
  private targetBallY = 0;
  private targetPaddle1Y = 0;
  private targetPaddle2Y = 0;
  // Ball velocity for extrapolation between server updates
  private serverBallVelX = 0;
  private serverBallVelY = 0;
  // Interpolation factor (0 = instant, higher = smoother but more lag)
  private readonly INTERPOLATION_SPEED = 0.3;

  constructor() {
    super('GameScene');
  }

  init(data: GameSceneData): void {
    // Receive network manager from LobbyScene if in multiplayer mode
    this.networkManager = data.networkManager;
    this.isNetworked = !!this.networkManager;
  }

  create(): void {
    const { width, height } = this.scale;

    // Set background color
    this.cameras.main.setBackgroundColor(COLORS.BG);

    // Add Bloom effect for Synthwave glow (per visual_blueprint.md)
    const bloom = this.cameras.main.postFX.addBloom();
    bloom.strength = 1.5;
    bloom.blurStrength = 2;

    // Create procedural grid
    this.createProceduralGrid(width, height);

    // Create paddles
    this.paddle1 = new Paddle(this, 50, height / 2, COLORS.P1);
    this.paddle2 = new Paddle(this, width - 50, height / 2, COLORS.P2);

    // Create ball
    this.ball = new Ball(this, width / 2, height / 2);

    // Setup physics collisions
    this.setupPhysics();

    // Create score display
    this.createScoreDisplay(width);

    // Create center line
    this.createCenterLine(width, height);

    // Setup touch input (per domain_ui.md mobile engineering constraints)
    this.touchInput = new TouchInputManager(this, this.paddle1, this.paddle2, PADDLE_SPEED);

    // Setup keyboard controls for testing on desktop
    this.setupKeyboardControls();

    // Setup network mode if available
    if (this.isNetworked) {
      this.setupNetworkMode(width);
      // In networked mode, disable local ball physics - server is authoritative
      this.disableLocalBallPhysics();
      // Initialize interpolation targets
      this.targetBallX = width / 2;
      this.targetBallY = height / 2;
      this.targetPaddle1Y = height / 2;
      this.targetPaddle2Y = height / 2;
    } else {
      // Start the ball moving after a short delay (local mode only)
      this.time.delayedCall(1000, () => this.launchBall());
    }
  }

  /**
   * Disable local ball physics for networked mode
   * Server is authoritative, client just renders
   */
  private disableLocalBallPhysics(): void {
    const ballBody = this.ball.getSprite().body as Phaser.Physics.Arcade.Body;
    // Disable world bounds collision - server handles this
    ballBody.setCollideWorldBounds(false);
    ballBody.onWorldBounds = false;
    // Stop any existing velocity
    ballBody.setVelocity(0, 0);
  }

  /**
   * Setup network mode UI and callbacks (Phase 3)
   * Server is authoritative, client interpolates state
   */
  private setupNetworkMode(width: number): void {
    if (!this.networkManager) return;

    // Show connection status
    const playerNumber = this.networkManager.getPlayerNumber();
    const playerColor = playerNumber === 1 ? '#04c4ca' : '#ff2975';
    
    this.add.text(width / 2, 90, `PLAYER ${playerNumber}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: playerColor,
    }).setOrigin(0.5);

    // Latency display
    this.latencyText = this.add.text(width - 10, 10, 'PING: --ms', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#04c4ca',
    }).setOrigin(1, 0);

    // Setup network callbacks
    this.networkManager.setCallbacks({
      onStateChange: (state) => this.onNetworkStateChange(state),
      onPong: (latency) => {
        if (this.latencyText) {
          this.latencyText.setText(`PING: ${Math.round(latency)}ms`);
        }
      },
      onGameEnd: (reason) => {
        this.showGameOver(0); // 0 indicates disconnection
        if (this.winnerText) {
          this.winnerText.setText(`DISCONNECTED: ${reason}`);
        }
      },
    });
  }

  /**
   * Handle state changes from server (Phase 3 - authoritative physics)
   * Update target positions for interpolation
   */
  private onNetworkStateChange(state: GameStateSnapshot): void {
    // Update scores from server
    if (state.score1 !== this.score1) {
      this.score1 = state.score1;
      this.scoreText1.setText(this.score1.toString());
    }
    if (state.score2 !== this.score2) {
      this.score2 = state.score2;
      this.scoreText2.setText(this.score2.toString());
    }

    // Update ball target position and velocity
    this.targetBallX = state.ballX;
    this.targetBallY = state.ballY;
    this.serverBallVelX = state.ballVelX;
    this.serverBallVelY = state.ballVelY;

    // Update paddle target positions from players in state
    const mySessionId = this.networkManager?.getSessionId();
    for (const player of state.players.values()) {
      if (player.playerNumber === 1) {
        // For local player, we apply prediction so only update target for remote
        if (player.sessionId !== mySessionId) {
          this.targetPaddle1Y = player.y;
        } else {
          // Local player - still set target but we'll apply prediction
          this.targetPaddle1Y = player.y;
        }
      } else if (player.playerNumber === 2) {
        if (player.sessionId !== mySessionId) {
          this.targetPaddle2Y = player.y;
        } else {
          this.targetPaddle2Y = player.y;
        }
      }
    }

    // Check for game over from server
    if (state.winner > 0 && !this.gameOver) {
      this.showGameOver(state.winner);
    }
  }

  private createProceduralGrid(width: number, height: number): void {
    this.gridGraphics = this.add.graphics();
    this.gridGraphics.lineStyle(2, COLORS.GRID, 0.5);

    const horizonY = height * 0.4;
    const centerX = width / 2;

    // Draw perspective lines (fan out from horizon center)
    for (let i = -width; i < width * 2; i += 100) {
      this.gridGraphics.moveTo(centerX, horizonY);
      this.gridGraphics.lineTo(i, height);
    }
    this.gridGraphics.strokePath();

    // Draw horizontal floor lines
    for (let y = horizonY; y < height; y += 40) {
      this.gridGraphics.moveTo(0, y);
      this.gridGraphics.lineTo(width, y);
    }
    this.gridGraphics.strokePath();
  }

  private createCenterLine(width: number, height: number): void {
    const centerLine = this.add.graphics();
    centerLine.lineStyle(4, COLORS.GRID, 0.8);
    
    // Dashed center line
    const dashLength = 20;
    const gapLength = 15;
    for (let y = 0; y < height; y += dashLength + gapLength) {
      centerLine.moveTo(width / 2, y);
      centerLine.lineTo(width / 2, Math.min(y + dashLength, height));
    }
    centerLine.strokePath();
  }

  private createScoreDisplay(width: number): void {
    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '48px',
      color: '#ffffff',
    };

    this.scoreText1 = this.add.text(width / 4, 50, '0', textStyle)
      .setOrigin(0.5)
      .setTint(COLORS.P1);

    this.scoreText2 = this.add.text((width / 4) * 3, 50, '0', textStyle)
      .setOrigin(0.5)
      .setTint(COLORS.P2);
  }

  private setupPhysics(): void {
    // Enable physics bodies
    this.physics.add.existing(this.paddle1.getSprite());
    this.physics.add.existing(this.paddle2.getSprite());
    this.physics.add.existing(this.ball.getSprite());

    const paddle1Body = this.paddle1.getSprite().body as Phaser.Physics.Arcade.Body;
    const paddle2Body = this.paddle2.getSprite().body as Phaser.Physics.Arcade.Body;
    const ballBody = this.ball.getSprite().body as Phaser.Physics.Arcade.Body;

    // Set paddle bodies as immovable
    paddle1Body.setImmovable(true);
    paddle2Body.setImmovable(true);

    // Set ball properties
    ballBody.setCollideWorldBounds(true);
    ballBody.setBounce(1, 1);
    ballBody.onWorldBounds = true;

    // Handle world bounds collision for scoring
    this.physics.world.on('worldbounds', (_body: Phaser.Physics.Arcade.Body, _up: boolean, _down: boolean, left: boolean, right: boolean) => {
      if (left) {
        this.score(2);
      } else if (right) {
        this.score(1);
      }
    });

    // Paddle-ball collisions
    this.physics.add.collider(this.ball.getSprite(), this.paddle1.getSprite(), () => this.onPaddleHit(this.paddle1));
    this.physics.add.collider(this.ball.getSprite(), this.paddle2.getSprite(), () => this.onPaddleHit(this.paddle2));
  }

  private setupKeyboardControls(): void {
    // Desktop keyboard controls for testing - store as instance variable
    this.keyboardKeys = this.input.keyboard?.addKeys({
      p1Up: Phaser.Input.Keyboard.KeyCodes.W,
      p1Down: Phaser.Input.Keyboard.KeyCodes.S,
      p2Up: Phaser.Input.Keyboard.KeyCodes.UP,
      p2Down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      restart: Phaser.Input.Keyboard.KeyCodes.SPACE,
    }) as {
      p1Up: Phaser.Input.Keyboard.Key;
      p1Down: Phaser.Input.Keyboard.Key;
      p2Up: Phaser.Input.Keyboard.Key;
      p2Down: Phaser.Input.Keyboard.Key;
      restart: Phaser.Input.Keyboard.Key;
    };

    if (this.keyboardKeys) {
      this.keyboardKeys.restart.on('down', () => {
        if (this.gameOver) {
          this.restartGame();
        }
      });
    }
  }

  private launchBall(): void {
    if (this.gameOver) return;
    
    // Random direction
    const direction = Math.random() > 0.5 ? 1 : -1;
    const angle = Phaser.Math.Between(-30, 30);
    const velocity = new Phaser.Math.Vector2(direction * BALL_SPEED, 0);
    velocity.rotate(Phaser.Math.DegToRad(angle));

    const ballBody = this.ball.getSprite().body as Phaser.Physics.Arcade.Body;
    ballBody.setVelocity(velocity.x, velocity.y);
  }

  private onPaddleHit(paddle: Paddle): void {
    const ballBody = this.ball.getSprite().body as Phaser.Physics.Arcade.Body;
    const paddleY = paddle.getSprite().y;
    const ballY = this.ball.getSprite().y;
    
    // Calculate angle based on where ball hits paddle
    const relativeIntersect = (paddleY - ballY) / (paddle.getSprite().displayHeight / 2);
    const bounceAngle = relativeIntersect * 60; // Max 60 degree deflection
    
    // Determine direction based on which paddle was hit
    const direction = paddle === this.paddle1 ? 1 : -1;
    
    // Apply new velocity
    const speed = ballBody.velocity.length() * 1.05; // Slight speed increase using proper velocity magnitude
    const clampedSpeed = Math.min(speed, BALL_SPEED * 2); // Cap max speed
    
    const velocity = new Phaser.Math.Vector2(direction * clampedSpeed, 0);
    velocity.rotate(Phaser.Math.DegToRad(-bounceAngle));
    ballBody.setVelocity(velocity.x, velocity.y);

    // Play hit sound (procedural audio per domain_ui.md)
    this.playHitSound('paddle');
  }

  private score(player: number): void {
    if (this.gameOver) return;

    if (player === 1) {
      this.score1++;
      this.scoreText1.setText(this.score1.toString());
    } else {
      this.score2++;
      this.scoreText2.setText(this.score2.toString());
    }

    // Play wall hit sound
    this.playHitSound('wall');

    // Check for winner
    if (this.score1 >= WINNING_SCORE || this.score2 >= WINNING_SCORE) {
      this.showGameOver(player);
      return;
    }

    // Reset ball position
    this.resetBall();
  }

  private resetBall(): void {
    const { width, height } = this.scale;
    
    this.ball.getSprite().setPosition(width / 2, height / 2);
    const ballBody = this.ball.getSprite().body as Phaser.Physics.Arcade.Body;
    ballBody.setVelocity(0, 0);

    // Launch ball after delay
    this.time.delayedCall(1000, () => this.launchBall());
  }

  private showGameOver(winner: number): void {
    this.gameOver = true;
    const { width, height } = this.scale;

    // Stop the ball
    const ballBody = this.ball.getSprite().body as Phaser.Physics.Arcade.Body;
    ballBody.setVelocity(0, 0);

    // Show winner text
    const winnerColor = winner === 1 ? '#04c4ca' : '#ff2975';
    this.winnerText = this.add.text(width / 2, height / 2 - 50, `PLAYER ${winner} WINS!`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '32px',
      color: winnerColor,
    }).setOrigin(0.5);

    this.restartText = this.add.text(width / 2, height / 2 + 30, 'TAP OR PRESS SPACE TO RESTART', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Enable tap to restart - store handler so it can be removed if keyboard restart is used
    this.restartHandler = () => this.restartGame();
    this.input.once('pointerdown', this.restartHandler);
  }

  private restartGame(): void {
    this.score1 = 0;
    this.score2 = 0;
    this.scoreText1.setText('0');
    this.scoreText2.setText('0');
    this.gameOver = false;

    // Remove any pending restart listener to prevent stale handler from triggering mid-game
    if (this.restartHandler) {
      this.input.off('pointerdown', this.restartHandler);
      this.restartHandler = undefined;
    }

    if (this.winnerText) {
      this.winnerText.destroy();
      this.winnerText = undefined;
    }
    if (this.restartText) {
      this.restartText.destroy();
      this.restartText = undefined;
    }

    this.resetBall();
  }

  private playHitSound(type: 'paddle' | 'wall'): void {
    // Procedural audio using Web Audio API (per domain_ui.md)
    try {
      const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager;
      const audioContext = soundManager.context;
      if (!audioContext || audioContext.state !== 'running') return;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (type === 'paddle') {
        // Square wave for paddle hits (aggressive)
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      } else {
        // Triangle wave for wall hits (soft)
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      }

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch {
      // Silently fail if audio context is not available
    }
  }

  update(_time: number, delta: number): void {
    if (this.gameOver) return;

    const { height } = this.scale;
    
    // Handle networked mode (Phase 3 - server authoritative)
    if (this.isNetworked && this.networkManager) {
      this.updateNetworkedMode(delta, height);
      this.sendNetworkInput();
      return;
    }

    // Local mode - handle input directly
    this.updateLocalMode(delta, height);
  }

  /**
   * Update for networked multiplayer mode (Phase 3)
   * Uses interpolation for smooth rendering of server state
   */
  private updateNetworkedMode(delta: number, height: number): void {
    const playerNumber = this.networkManager?.getPlayerNumber();
    
    // Get current input for local paddle prediction
    const currentInput = this.getCurrentInput();
    
    // Local paddle prediction - move immediately on input
    // Per domain_net.md: Local Prediction moves local paddle immediately
    if (playerNumber === 1) {
      // Apply local input immediately for responsive feel
      if (currentInput === 'UP') {
        this.paddle1.moveUp(delta, PADDLE_SPEED);
      } else if (currentInput === 'DOWN') {
        this.paddle1.moveDown(delta, PADDLE_SPEED, height);
      }
      this.paddle1.clampPosition(height);
      
      // Per domain_net.md: "Reconcile with server state only if deviation > 5px"
      // Snap to server position if local prediction drifted too far
      const paddle1Y = this.paddle1.getSprite().y;
      if (Math.abs(paddle1Y - this.targetPaddle1Y) > RECONCILIATION_THRESHOLD) {
        this.paddle1.getSprite().y = this.targetPaddle1Y;
      }
      
      // Interpolate remote paddle (P2) to server position
      const paddle2Sprite = this.paddle2.getSprite();
      paddle2Sprite.y = Phaser.Math.Linear(
        paddle2Sprite.y, 
        this.targetPaddle2Y, 
        this.INTERPOLATION_SPEED
      );
      this.paddle2.clampPosition(height);
    } else {
      // Apply local input immediately for responsive feel
      if (currentInput === 'UP') {
        this.paddle2.moveUp(delta, PADDLE_SPEED);
      } else if (currentInput === 'DOWN') {
        this.paddle2.moveDown(delta, PADDLE_SPEED, height);
      }
      this.paddle2.clampPosition(height);
      
      // Per domain_net.md: "Reconcile with server state only if deviation > 5px"
      // Snap to server position if local prediction drifted too far
      const paddle2Y = this.paddle2.getSprite().y;
      if (Math.abs(paddle2Y - this.targetPaddle2Y) > RECONCILIATION_THRESHOLD) {
        this.paddle2.getSprite().y = this.targetPaddle2Y;
      }
      
      // Interpolate remote paddle (P1) to server position
      const paddle1Sprite = this.paddle1.getSprite();
      paddle1Sprite.y = Phaser.Math.Linear(
        paddle1Sprite.y, 
        this.targetPaddle1Y, 
        this.INTERPOLATION_SPEED
      );
      this.paddle1.clampPosition(height);
    }

    // Interpolate ball position to server state
    // Use velocity for extrapolation to reduce perceived lag
    const ballSprite = this.ball.getSprite();
    const deltaSeconds = delta / 1000;
    
    // Extrapolate target position using velocity
    const extrapolatedX = this.targetBallX + this.serverBallVelX * deltaSeconds;
    const extrapolatedY = this.targetBallY + this.serverBallVelY * deltaSeconds;
    
    // Smooth interpolation towards extrapolated position
    ballSprite.x = Phaser.Math.Linear(ballSprite.x, extrapolatedX, this.INTERPOLATION_SPEED);
    ballSprite.y = Phaser.Math.Linear(ballSprite.y, extrapolatedY, this.INTERPOLATION_SPEED);

    // Update touch input
    this.touchInput.update();
  }

  /**
   * Get current input from keyboard or touch
   */
  private getCurrentInput(): 'UP' | 'DOWN' | 'NONE' {
    const playerNumber = this.networkManager?.getPlayerNumber() ?? 1;
    
    // Check keyboard input for the appropriate player
    if (this.keyboardKeys) {
      if (playerNumber === 1) {
        if (this.keyboardKeys.p1Up.isDown) return 'UP';
        if (this.keyboardKeys.p1Down.isDown) return 'DOWN';
      } else {
        if (this.keyboardKeys.p2Up.isDown) return 'UP';
        if (this.keyboardKeys.p2Down.isDown) return 'DOWN';
      }
    }

    // Check for touch input for the current player
    const playerSide = playerNumber === 1 ? 'left' : 'right';
    const screenSplitX = this.scale.width / 2;
    const screenCenterY = this.scale.height / 2;

    for (const pointer of this.input.manager.pointers) {
      if (!pointer.isDown) continue;

      const currentSide = pointer.x < screenSplitX ? 'left' : 'right';
      if (currentSide === playerSide) {
        return pointer.y < screenCenterY ? 'UP' : 'DOWN';
      }
    }

    return 'NONE';
  }

  /**
   * Update for local single-device mode
   * Both paddles controlled locally with physics handled client-side
   */
  private updateLocalMode(delta: number, height: number): void {
    // Update touch input
    this.touchInput.update();

    // Handle keyboard input for desktop testing
    if (this.keyboardKeys) {
      // Player 1 keyboard controls
      if (this.keyboardKeys.p1Up.isDown) {
        this.paddle1.moveUp(delta, PADDLE_SPEED);
      } else if (this.keyboardKeys.p1Down.isDown) {
        this.paddle1.moveDown(delta, PADDLE_SPEED, height);
      }

      // Player 2 keyboard controls
      if (this.keyboardKeys.p2Up.isDown) {
        this.paddle2.moveUp(delta, PADDLE_SPEED);
      } else if (this.keyboardKeys.p2Down.isDown) {
        this.paddle2.moveDown(delta, PADDLE_SPEED, height);
      }
    }

    // Keep paddles in bounds
    this.paddle1.clampPosition(height);
    this.paddle2.clampPosition(height);
  }

  /**
   * Send player input to server
   * Per domain_net.md: Client sends intent (UP/DOWN), NOT position
   */
  private sendNetworkInput(): void {
    if (!this.networkManager) return;
    this.networkManager.sendInput(this.getCurrentInput());
  }
}
