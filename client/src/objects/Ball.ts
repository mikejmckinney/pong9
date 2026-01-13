import Phaser from 'phaser';
import { COLORS } from '../scenes/GameScene.ts';

const BALL_SIZE = 20;

export class Ball {
  private sprite: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Create ball using Canvas API for procedural generation (no external assets per _master.md)
    const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
    
    // Draw the ball shape
    graphics.fillStyle(COLORS.BALL, 1);
    graphics.fillRect(0, 0, BALL_SIZE, BALL_SIZE);
    
    // Add glow effect
    graphics.fillStyle(COLORS.BALL, 0.3);
    graphics.fillRect(-2, -2, BALL_SIZE + 4, BALL_SIZE + 4);
    
    // Generate texture from graphics
    graphics.generateTexture('ball_texture', BALL_SIZE + 4, BALL_SIZE + 4);
    graphics.destroy();

    // Create rectangle sprite for physics (square ball like classic Pong)
    this.sprite = scene.add.rectangle(x, y, BALL_SIZE, BALL_SIZE, COLORS.BALL);
  }

  getSprite(): Phaser.GameObjects.Rectangle {
    return this.sprite;
  }

  setPosition(x: number, y: number): void {
    this.sprite.setPosition(x, y);
  }
}
