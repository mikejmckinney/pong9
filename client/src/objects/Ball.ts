import Phaser from 'phaser';
import { BALL_SIZE, BALL_SPEED, GAME_HEIGHT, SERVE_ANGLE_HALF_RANGE_DEG, SERVE_DIRECTION_THRESHOLD } from '../config/constants';

export default class Ball extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, color: number) {
        // Create the ball as a rectangle/square
        const graphics = scene.add.graphics();
        graphics.fillStyle(color, 1);
        graphics.fillRect(0, 0, BALL_SIZE, BALL_SIZE);
        
        // Generate texture from graphics
        const ballKey = `ball-${color}`;
        graphics.generateTexture(ballKey, BALL_SIZE, BALL_SIZE);
        graphics.destroy();

        // Create sprite with physics
        super(scene, x, y, ballKey);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Set physics properties
        // Note: We don't use setCollideWorldBounds(true) because we need the ball
        // to pass through left/right edges for scoring. Top/bottom bounce is handled manually.
        if (this.body instanceof Phaser.Physics.Arcade.Body) {
            this.body.allowGravity = false;
        }
    }

    update() {
        // Handle top/bottom wall bouncing manually (ball should bounce off top/bottom but pass through left/right)
        const body = this.body;
        if (!(body instanceof Phaser.Physics.Arcade.Body)) {
            return;
        }

        // Bounce off top wall
        if (body.y <= 0) {
            body.y = 0;
            body.velocity.y = Math.abs(body.velocity.y);
        }
        // Bounce off bottom wall
        if (body.y + body.height >= GAME_HEIGHT) {
            body.y = GAME_HEIGHT - body.height;
            body.velocity.y = -Math.abs(body.velocity.y);
        }
    }

    launch() {
        // Random direction (left or right)
        const direction = Phaser.Math.FloatBetween(0, 1) < SERVE_DIRECTION_THRESHOLD ? -1 : 1;
        // Random angle between -45 and 45 degrees
        const angle = Phaser.Math.FloatBetween(-SERVE_ANGLE_HALF_RANGE_DEG, SERVE_ANGLE_HALF_RANGE_DEG);
        
        const velocity = this.scene.physics.velocityFromAngle(angle, BALL_SPEED);
        this.setVelocity(velocity.x * direction, velocity.y);
    }

    reset() {
        // Reset position to center
        this.setPosition(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2
        );
        this.setVelocity(0, 0);
    }
}
