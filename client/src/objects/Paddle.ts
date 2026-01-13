import Phaser from 'phaser';
import { PADDLE_WIDTH, PADDLE_HEIGHT, PADDLE_SPEED } from '../config/constants';

export default class Paddle extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, color: number) {
        // Create the paddle as a rectangle
        const graphics = scene.add.graphics();
        graphics.fillStyle(color, 1);
        graphics.fillRect(0, 0, PADDLE_WIDTH, PADDLE_HEIGHT);
        
        // Generate texture from graphics
        const paddleKey = `paddle-${color}`;
        graphics.generateTexture(paddleKey, PADDLE_WIDTH, PADDLE_HEIGHT);
        graphics.destroy();

        // Create sprite with physics
        super(scene, x, y, paddleKey);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Set physics properties
        this.setCollideWorldBounds(true);
        this.setImmovable(true);
        if (this.body instanceof Phaser.Physics.Arcade.Body) {
            this.body.allowGravity = false;
        }
    }

    moveUp() {
        this.setVelocityY(-PADDLE_SPEED);
    }

    moveDown() {
        this.setVelocityY(PADDLE_SPEED);
    }

    stopMovement() {
        this.setVelocityY(0);
    }

    update() {
        // World bounds are enforced via setCollideWorldBounds(true) in the constructor.
        // No additional per-frame paddle logic is required here at the moment.
    }
}
