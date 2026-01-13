import Phaser from 'phaser';
import { COLORS } from '../config/constants';
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
        bloom.strength = 1.5;
        bloom.blurStrength = 2;

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
        this.time.delayedCall(1000, () => {
            this.ball.launch();
        });
    }

    update() {
        // Check if ball went off screen (scoring)
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

        // Keep paddles within bounds
        this.paddle1.update();
        this.paddle2.update();
    }

    private createProceduralGrid(width: number, height: number) {
        this.gridGraphics = this.add.graphics();
        this.gridGraphics.lineStyle(2, COLORS.GRID, 0.5);

        const horizonY = height * 0.4;
        const centerX = width / 2;

        // Draw perspective lines
        for (let i = -width; i < width * 2; i += 100) {
            this.gridGraphics.moveTo(centerX, horizonY);
            this.gridGraphics.lineTo(i, height);
        }
        this.gridGraphics.strokePath();

        // Draw horizontal lines
        for (let y = horizonY; y < height; y += 40) {
            this.gridGraphics.moveTo(0, y);
            this.gridGraphics.lineTo(width, y);
        }
        this.gridGraphics.strokePath();
    }

    private createCenterLine(width: number, height: number) {
        const graphics = this.add.graphics();
        graphics.lineStyle(4, COLORS.GRID, 0.8);
        
        // Dashed center line
        const dashLength = 20;
        const gapLength = 20;
        for (let y = 0; y < height; y += dashLength + gapLength) {
            graphics.moveTo(width / 2, y);
            graphics.lineTo(width / 2, Math.min(y + dashLength, height));
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

        // Handle touch/pointer down on left zone
        this.leftZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const localY = pointer.y;
            if (localY < height / 2) {
                this.paddle1.moveUp();
            } else {
                this.paddle1.moveDown();
            }
        });

        this.leftZone.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (pointer.isDown) {
                const localY = pointer.y;
                if (localY < height / 2) {
                    this.paddle1.moveUp();
                } else {
                    this.paddle1.moveDown();
                }
            }
        });

        this.leftZone.on('pointerup', () => {
            this.paddle1.stopMovement();
        });

        // Handle touch/pointer down on right zone
        this.rightZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const localY = pointer.y;
            if (localY < height / 2) {
                this.paddle2.moveUp();
            } else {
                this.paddle2.moveDown();
            }
        });

        this.rightZone.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (pointer.isDown) {
                const localY = pointer.y;
                if (localY < height / 2) {
                    this.paddle2.moveUp();
                } else {
                    this.paddle2.moveDown();
                }
            }
        });

        this.rightZone.on('pointerup', () => {
            this.paddle2.stopMovement();
        });
    }

    private setupCollisions() {
        // Ball collides with paddles
        this.physics.add.collider(this.ball, this.paddle1, () => {
            this.ball.reverseX();
        });

        this.physics.add.collider(this.ball, this.paddle2, () => {
            this.ball.reverseX();
        });
    }

    private resetBall() {
        this.ball.reset();
        this.time.delayedCall(1000, () => {
            this.ball.launch();
        });
    }
}
