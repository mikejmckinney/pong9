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
    BLOOM_BLUR_STRENGTH
} from '../config/constants';
import Paddle from '../objects/Paddle';
import Ball from '../objects/Ball';

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
        this.time.delayedCall(BALL_LAUNCH_DELAY_MS, () => {
            this.ball.launch();
            this.isResettingBall = false;
        });
    }

    update() {
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
                paddle.moveUp();
            } else {
                paddle.moveDown();
            }
        });

        zone.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (pointer.isDown) {
                const localY = pointer.y;
                if (localY < height / 2) {
                    paddle.moveUp();
                } else {
                    paddle.moveDown();
                }
            }
        });

        zone.on('pointerup', () => {
            paddle.stopMovement();
        });

        // Stop paddle when pointer leaves the zone (prevents paddle moving indefinitely)
        zone.on('pointerout', () => {
            paddle.stopMovement();
        });

        // Stop paddle when touch is cancelled (e.g., incoming call on mobile)
        zone.on('pointercancel', () => {
            paddle.stopMovement();
        });
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
        this.time.delayedCall(BALL_LAUNCH_DELAY_MS, () => {
            this.ball.launch();
            this.isResettingBall = false;
        });
    }
}
