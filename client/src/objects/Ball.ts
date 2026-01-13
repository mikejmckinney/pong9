import Phaser from 'phaser';
import { BALL_SIZE, BALL_SPEED } from '../config/constants';

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
        this.setCollideWorldBounds(true);
        this.setBounce(1, 1);
        if (this.body instanceof Phaser.Physics.Arcade.Body) {
            this.body.allowGravity = false;
            this.body.onWorldBounds = true;
        }
    }

    launch() {
        // Random direction (left or right)
        const direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
        // Random angle between -45 and 45 degrees
        const angle = Phaser.Math.Between(-45, 45);
        
        const velocity = this.scene.physics.velocityFromAngle(angle, BALL_SPEED);
        this.setVelocity(velocity.x * direction, velocity.y);
    }

    reverseX() {
        const body = this.body;
        if (!(body instanceof Phaser.Physics.Arcade.Body)) {
            return;
        }

        // Reverse horizontal direction and add slight vertical variation
        this.setVelocityX(-body.velocity.x);
        
        // Add small random vertical component to make gameplay more interesting
        const verticalVariation = Phaser.Math.Between(-50, 50);
        this.setVelocityY(body.velocity.y + verticalVariation);
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
