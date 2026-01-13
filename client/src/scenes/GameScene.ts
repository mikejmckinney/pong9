import Phaser from 'phaser';
import { 
    COLORS, 
    GRID_PERSPECTIVE_SPACING, 
    GRID_HORIZONTAL_SPACING,
    GRID_HORIZON_RATIO,
    CENTER_LINE_DASH_LENGTH, 
    CENTER_LINE_GAP_LENGTH,
    BALL_LAUNCH_DELAY_MS,
    MAX_BOUNCE_ANGLE_SPEED,
    BLOOM_STRENGTH,
    BLOOM_BLUR_STRENGTH,
    PADDLE_HEIGHT
} from '../config/constants';
import Paddle from '../objects/Paddle';
import Ball from '../objects/Ball';
import { Client, Room } from 'colyseus.js';
import { MESSAGE_TYPES, ROOM_NAME, type GamePhase, type InputDirection, type PlayerSide } from '@shared/messages';
import type { GameState } from '@shared/GameState';
import { getPlayerBySide } from '@shared/playerUtils';

const NETWORK_POSITION_EPSILON = 0.5;

export default class GameScene extends Phaser.Scene {
    private gridGraphics!: Phaser.GameObjects.Graphics;
    private paddle1!: Paddle;
    private paddle2!: Paddle;
    private ball!: Ball;
    private score1Text!: Phaser.GameObjects.Text;
    private score2Text!: Phaser.GameObjects.Text;
    private score1: number = 0;
    private score2: number = 0;
    
    // Flag to prevent duplicate scoring during ball reset
    private isResettingBall: boolean = false;
    
    // Touch zones for mobile controls
    private leftZone!: Phaser.GameObjects.Zone;
    private rightZone!: Phaser.GameObjects.Zone;
    private networkStatusText?: Phaser.GameObjects.Text;
    private networkClient?: Client;
    private networkRoom?: Room<GameState>;
    private pingTimer?: Phaser.Time.TimerEvent;
    private localSide?: PlayerSide;
    private lastInputDirection?: InputDirection;
    private useNetworkBall: boolean = false;
    private localLaunchTimer?: Phaser.Time.TimerEvent;

    constructor() {
        super('GameScene');
    }

    create() {
        const { width, height } = this.scale;

        // Set solid background color
        this.cameras.main.setBackgroundColor(COLORS.BG);

        // Add Bloom PostFX for synthwave glow effect
        const bloom = this.cameras.main.postFX.addBloom();
        bloom.strength = BLOOM_STRENGTH;
        bloom.blurStrength = BLOOM_BLUR_STRENGTH;

        // Create procedural grid
        this.createProceduralGrid(width, height);

        // Create center line
        this.createCenterLine(width, height);

        // Create paddles
        this.paddle1 = new Paddle(this, 50, height / 2, COLORS.P1);
        this.paddle2 = new Paddle(this, width - 50, height / 2, COLORS.P2);

        // Create ball
        this.ball = new Ball(this, width / 2, height / 2, COLORS.BALL);

        // Create score displays
        this.score1Text = this.add.text(width / 4, 50, '0', {
            fontFamily: 'Press Start 2P',
            fontSize: '48px',
            color: '#04c4ca'
        }).setOrigin(0.5);

        this.score2Text = this.add.text((width * 3) / 4, 50, '0', {
            fontFamily: 'Press Start 2P',
            fontSize: '48px',
            color: '#ff2975'
        }).setOrigin(0.5);

        // Setup touch controls for mobile
        this.setupTouchControls(width, height);

        // Setup ball collisions
        this.setupCollisions();

        // Reset ball to start
        this.isResettingBall = true;
        this.localLaunchTimer = this.time.delayedCall(BALL_LAUNCH_DELAY_MS, () => {
            if (this.useNetworkBall) {
                return;
            }
            this.ball.launch();
            this.isResettingBall = false;
        });

        // Attempt to connect to the Colyseus server without blocking gameplay
        void this.connectToServer();
    }

    update() {
        if (this.useNetworkBall) {
            this.paddle1.update();
            this.paddle2.update();
            return;
        }

        // Update ball (handles top/bottom wall bouncing)
        this.ball.update();

        // Check if ball went off screen (scoring) - only if not already resetting
        if (!this.isResettingBall) {
            if (this.ball.x < 0) {
                // Player 2 scores
                this.score2++;
                this.score2Text.setText(this.score2.toString());
                this.resetBall();
            } else if (this.ball.x > this.scale.width) {
                // Player 1 scores
                this.score1++;
                this.score1Text.setText(this.score1.toString());
                this.resetBall();
            }
        }

        // Keep paddles within bounds
        this.paddle1.update();
        this.paddle2.update();
    }

    private createProceduralGrid(width: number, height: number) {
        this.gridGraphics = this.add.graphics();
        this.gridGraphics.lineStyle(2, COLORS.GRID, 0.5);

        const horizonY = height * GRID_HORIZON_RATIO;
        const centerX = width / 2;

        // Draw perspective lines
        for (let i = -width; i < width * 2; i += GRID_PERSPECTIVE_SPACING) {
            this.gridGraphics.moveTo(centerX, horizonY);
            this.gridGraphics.lineTo(i, height);
        }

        // Draw horizontal lines
        for (let y = horizonY; y < height; y += GRID_HORIZONTAL_SPACING) {
            this.gridGraphics.moveTo(0, y);
            this.gridGraphics.lineTo(width, y);
        }

        // Single strokePath() call for all grid lines (performance optimization)
        this.gridGraphics.strokePath();
    }

    private createCenterLine(width: number, height: number) {
        const graphics = this.add.graphics();
        graphics.lineStyle(4, COLORS.GRID, 0.8);
        
        // Dashed center line
        for (let y = 0; y < height; y += CENTER_LINE_DASH_LENGTH + CENTER_LINE_GAP_LENGTH) {
            graphics.moveTo(width / 2, y);
            graphics.lineTo(width / 2, Math.min(y + CENTER_LINE_DASH_LENGTH, height));
        }
        graphics.strokePath();
    }

    private setupTouchControls(width: number, height: number) {
        // Left half of screen controls paddle 1
        this.leftZone = this.add.zone(0, 0, width / 2, height).setOrigin(0, 0);
        this.leftZone.setInteractive();

        // Right half of screen controls paddle 2
        this.rightZone = this.add.zone(width / 2, 0, width / 2, height).setOrigin(0, 0);
        this.rightZone.setInteractive();

        // Setup touch controls for each zone using helper method (DRY principle)
        this.setupZoneTouchControls(this.leftZone, this.paddle1, height);
        this.setupZoneTouchControls(this.rightZone, this.paddle2, height);
    }

    /**
     * Helper method to setup touch controls for a zone.
     * Handles pointerdown, pointermove, pointerup, pointerout, and pointercancel events.
     */
    private setupZoneTouchControls(
        zone: Phaser.GameObjects.Zone,
        paddle: Paddle,
        height: number
    ): void {
        zone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const localY = pointer.y;
            if (localY < height / 2) {
                this.handleDirectionalInput(paddle, 'up');
            } else {
                this.handleDirectionalInput(paddle, 'down');
            }
        });

        zone.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (pointer.isDown) {
                const localY = pointer.y;
                if (localY < height / 2) {
                    this.handleDirectionalInput(paddle, 'up');
                } else {
                    this.handleDirectionalInput(paddle, 'down');
                }
            }
        });

        zone.on('pointerup', () => {
            this.handleStopInput(paddle);
        });

        // Stop paddle when pointer leaves the zone (prevents paddle moving indefinitely)
        zone.on('pointerout', () => {
            this.handleStopInput(paddle);
        });

        // Stop paddle when touch is cancelled (e.g., incoming call on mobile)
        zone.on('pointercancel', () => {
            this.handleStopInput(paddle);
        });
    }

    private handleDirectionalInput(paddle: Paddle, direction: InputDirection) {
        if (!this.canHandleInput(paddle)) {
            return;
        }

        if (this.isNetworkControlledPaddle(paddle)) {
            this.sendNetworkInput(direction);
            this.applyLocalMovement(paddle, direction);
            return;
        }

        this.applyLocalMovement(paddle, direction);
    }

    private handleStopInput(paddle: Paddle) {
        // Always stop the paddle to prevent velocity persistence when network mode changes
        // (e.g., transitioning from offline to online mode mid-touch)
        this.applyLocalMovement(paddle, 'stop');

        if (!this.canHandleInput(paddle)) {
            return;
        }

        if (this.isNetworkControlledPaddle(paddle)) {
            this.sendNetworkInput('stop');
        }
    }

    private applyLocalMovement(paddle: Paddle, direction: InputDirection) {
        if (direction === 'up') {
            paddle.moveUp();
        } else if (direction === 'down') {
            paddle.moveDown();
        } else {
            paddle.stopMovement();
        }
    }

    /**
     * Helper method to get a paddle by player side.
     * Centralizes the mapping from PlayerSide to Paddle instance.
     */
    private getPaddleBySide(side: PlayerSide): Paddle {
        return side === 'left' ? this.paddle1 : this.paddle2;
    }

    private isLocalPaddle(paddle: Paddle): boolean {
        if (!this.localSide) {
            return false;
        }

        return paddle === this.getPaddleBySide(this.localSide);
    }

    private canHandleInput(paddle: Paddle): boolean {
        if (!this.networkRoom) {
            return true;
        }

        if (!this.localSide) {
            return false;
        }

        return this.isLocalPaddle(paddle);
    }

    private isNetworkControlledPaddle(paddle: Paddle): boolean {
        return Boolean(this.networkRoom && this.localSide && this.isLocalPaddle(paddle));
    }

    private setupCollisions() {
        // Ball collides with paddles - adjust angle based on hit position
        this.physics.add.collider(this.ball, this.paddle1, (ballObj, paddleObj) => {
            this.handlePaddleCollision(ballObj as Ball, paddleObj as Paddle);
        });

        this.physics.add.collider(this.ball, this.paddle2, (ballObj, paddleObj) => {
            this.handlePaddleCollision(ballObj as Ball, paddleObj as Paddle);
        });
    }

    /**
     * Handle ball-paddle collision with position-based angle variation.
     * Hitting different parts of the paddle produces different bounce angles.
     */
    private handlePaddleCollision(ball: Ball, paddle: Paddle): void {
        const ballBody = ball.body as Phaser.Physics.Arcade.Body;
        const paddleBody = paddle.body as Phaser.Physics.Arcade.Body;

        const paddleCenterY = paddleBody.y + paddleBody.height / 2;
        const ballCenterY = ballBody.y + ballBody.height / 2;
        let offset = (ballCenterY - paddleCenterY) / (paddleBody.height / 2);

        // Clamp offset to [-1, 1] to avoid extreme angles
        offset = Phaser.Math.Clamp(offset, -1, 1);

        ballBody.velocity.y = offset * MAX_BOUNCE_ANGLE_SPEED;

        // Reverse horizontal direction to bounce the ball back
        // (No setBounce on ball, so we handle this manually)
        ballBody.velocity.x = -ballBody.velocity.x;
    }

    private resetBall() {
        this.isResettingBall = true;
        this.ball.reset();
        this.localLaunchTimer?.remove();
        this.localLaunchTimer = this.time.delayedCall(BALL_LAUNCH_DELAY_MS, () => {
            if (this.useNetworkBall) {
                return;
            }
            this.ball.launch();
            this.isResettingBall = false;
        });
    }

    /**
     * Establish a Colyseus connection and surface connection / waiting status in-game.
     * Gameplay continues locally even if the connection fails.
     */
    private async connectToServer() {
        const { width, height } = this.scale;
        this.networkStatusText = this.add.text(width / 2, height - 40, 'Connecting…', {
            fontFamily: 'Press Start 2P',
            fontSize: '16px',
            color: '#04c4ca'
        }).setOrigin(0.5);

        // Track pending connection to handle cleanup if scene is destroyed during connect
        let pendingConnection = true;

        // Register cleanup handler BEFORE the await to prevent resource leak
        // if scene is destroyed while connection is pending
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            pendingConnection = false;
            this.pingTimer?.remove();
            void this.networkRoom?.leave();
        });

        try {
            const endpoint = this.getServerEndpoint();
            this.networkClient = new Client(endpoint);
            this.networkRoom = await this.networkClient.joinOrCreate<GameState>(ROOM_NAME);

            // If scene was destroyed during await, clean up and exit
            if (!pendingConnection) {
                void this.networkRoom.leave();
                return;
            }

            // Initialize localSide immediately from initial room state to prevent
            // input unresponsiveness while waiting for first onStateChange
            const localPlayer = this.networkRoom.state.players.get(this.networkRoom.sessionId);
            if (localPlayer) {
                this.localSide = localPlayer.side;
            }

            this.setNetworkBallMode(true);

            // Simplified state change handler - state is guaranteed by Colyseus
            this.networkRoom.onStateChange((state) => {
                this.syncNetworkState(state);
                this.updateNetworkStatus(state.phase);
            });

            this.networkRoom.onMessage(MESSAGE_TYPES.PONG, () => {
                const phase = this.networkRoom?.state.phase ?? 'waiting';
                this.updateNetworkStatus(phase);
            });

            // Handle disconnection to prevent stale status display
            this.networkRoom.onLeave(() => {
                this.networkRoom = undefined;
                this.localSide = undefined;
                this.lastInputDirection = undefined;
                this.pingTimer?.remove();
                this.pingTimer = undefined;
                this.setNetworkBallMode(false);
                this.score1 = 0;
                this.score2 = 0;
                this.score1Text.setText('0');
                this.score2Text.setText('0');
                if (this.networkStatusText) {
                    this.networkStatusText.setText('Disconnected: local play');
                }
            });

            this.updateNetworkStatus(this.networkRoom.state.phase);
            this.sendPing();
            this.pingTimer = this.time.addEvent({
                delay: 10000,
                loop: true,
                callback: () => this.sendPing()
            });
        } catch (error) {
            console.warn('Colyseus connection failed; continuing with local play only.', error);
            if (this.networkStatusText) {
                this.networkStatusText.setText('Offline: local play');
            }
        }
    }

    private getServerEndpoint(): string {
        const configured = import.meta.env.VITE_COLYSEUS_ENDPOINT;
        if (configured) {
            return configured;
        }

        const isSecure = window.location.protocol === 'https:';
        const host = window.location.hostname || 'localhost';
        const port = isSecure ? 443 : 2567;
        return `${isSecure ? 'wss' : 'ws'}://${host}:${port}`;
    }

    private updateNetworkStatus(phase: GamePhase = 'waiting') {
        if (!this.networkStatusText) {
            return;
        }

        if (!this.networkRoom) {
            this.networkStatusText.setText('Offline: local play');
            return;
        }

        if (phase === 'playing') {
            this.networkStatusText.setText('Online: match ready');
        } else {
            this.networkStatusText.setText('Connected: waiting for player');
        }
    }

    private syncNetworkState(state: GameState) {
        // Guard against race condition if room disconnects during state update
        if (!this.networkRoom) {
            return;
        }

        state.players.forEach((player, sessionId) => {
            const isLocalPlayer = sessionId === this.networkRoom!.sessionId;
            if (isLocalPlayer) {
                if (!this.localSide) {
                    this.localSide = player.side;
                }
                // Skip syncing local player position - use client-side prediction
                // Phase 3 will add reconciliation when deviation exceeds threshold
                return;
            }

            // Convert server's top-edge Y to Phaser's center-based Y coordinate
            // Server stores paddle position as top edge (clamped to [0, GAME_HEIGHT - PADDLE_HEIGHT])
            // Phaser sprites use center-based coordinates
            const centerY = player.y + PADDLE_HEIGHT / 2;
            const paddle = this.getPaddleBySide(player.side);
            if (paddle) {
                paddle.setY(centerY);
            }
        });

        if (this.useNetworkBall) {
            const dx = this.ball.x - state.ball.x;
            const dy = this.ball.y - state.ball.y;
            const positionChanged = dx * dx + dy * dy > NETWORK_POSITION_EPSILON * NETWORK_POSITION_EPSILON;
            if (positionChanged) {
                this.ball.setPosition(state.ball.x, state.ball.y);
            }
            this.updateScoresFromState(state);
        }
    }

    private sendNetworkInput(direction: InputDirection) {
        if (!this.networkRoom) {
            return;
        }

        if (this.lastInputDirection === direction) {
            return;
        }

        this.lastInputDirection = direction;
        this.networkRoom.send(MESSAGE_TYPES.INPUT, { direction });
    }

    private setNetworkBallMode(enabled: boolean) {
        if (this.useNetworkBall === enabled) {
            return;
        }

        this.useNetworkBall = enabled;
        const body = this.ball.body as Phaser.Physics.Arcade.Body | null;

        if (enabled) {
            this.localLaunchTimer?.remove();
            this.localLaunchTimer = undefined;
            this.isResettingBall = false;
            this.ball.reset();
            if (body) {
                body.setVelocity(0, 0);
                body.moves = false;
                body.setImmovable(true);
            }
            return;
        }

        if (body) {
            body.moves = true;
            body.setImmovable(false);
            body.setVelocity(0, 0);
        }
        this.resetBall();
    }

    private updateScoresFromState(state: GameState) {
        const leftPlayer = getPlayerBySide(state.players, 'left');
        const rightPlayer = getPlayerBySide(state.players, 'right');

        // Left player maps to P1 (cyan) score1; right player maps to P2 (pink) score2
        const nextScore1 = leftPlayer?.score ?? 0;
        const nextScore2 = rightPlayer?.score ?? 0;

        if (nextScore1 !== this.score1) {
            this.score1 = nextScore1;
            this.score1Text.setText(this.score1.toString());
        }

        if (nextScore2 !== this.score2) {
            this.score2 = nextScore2;
            this.score2Text.setText(this.score2.toString());
        }
    }

    private sendPing() {
        if (this.networkRoom) {
            this.networkRoom.send(MESSAGE_TYPES.PING, { timestamp: Date.now() });
        }
    }
}
