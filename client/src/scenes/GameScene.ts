import Phaser from 'phaser';
import { Paddle } from '../objects/Paddle.ts';
import { Ball } from '../objects/Ball.ts';
import { TouchInputManager } from '../input/TouchInputManager.ts';
import { NetworkManager, GameStateSnapshot } from '../network/NetworkManager.ts';

// Palette Constants (match values in domain_ui.md)
export const COLORS = {
  BG: 0x1b2853,     // Deep Indigo
  GRID: 0x2b2b2b,   // Dark gray grid lines
  P1: 0x04c4ca,     // Neon Cyan
  P2: 0xff2975,     // Hot Pink
  BALL: 0xffffff,   // White
};

// Game Constants
const PADDLE_SPEED = 500;
const BALL_SPEED = 400;
const WINNING_SCORE = 5;

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
  // Network support (Phase 2)
  private networkManager?: NetworkManager;
  private isNetworked = false;
  private latencyText?: Phaser.GameObjects.Text;

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
    }

    // Start the ball moving after a short delay
    this.time.delayedCall(1000, () => this.launchBall());
  }

  /**
   * Setup network mode UI and callbacks (Phase 2)
   * Full physics sync will be implemented in Phase 3
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
   * Handle state changes from server (Phase 2 - basic sync)
   * Full authoritative physics in Phase 3
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

    // In Phase 3, we'll also sync paddle positions and ball state
    // For Phase 2, local physics still controls the game
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
    
    // Update touch input
    this.touchInput.update();

    // Handle keyboard input for desktop testing (use stored keys from create)
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

    // Send input to server if in networked mode
    if (this.isNetworked && this.networkManager) {
      this.sendNetworkInput();
    }
  }

  /**
   * Send player input to server (Phase 2)
   * Per domain_net.md: Client sends intent (UP/DOWN), NOT position
   */
  private sendNetworkInput(): void {
    if (!this.networkManager) return;

    const playerNumber = this.networkManager.getPlayerNumber();
    
    // Determine input based on touch or keyboard
    let input: 'UP' | 'DOWN' | 'NONE' = 'NONE';
    
    // Check keyboard input for the appropriate player
    if (this.keyboardKeys) {
      if (playerNumber === 1) {
        if (this.keyboardKeys.p1Up.isDown) input = 'UP';
        else if (this.keyboardKeys.p1Down.isDown) input = 'DOWN';
      } else {
        if (this.keyboardKeys.p2Up.isDown) input = 'UP';
        else if (this.keyboardKeys.p2Down.isDown) input = 'DOWN';
      }
    }

    // Touch input handled by TouchInputManager, we just need to send the intent
    // In Phase 3, we'll refactor to separate touch intent capture
    
    this.networkManager.sendInput(input);
  }
}
