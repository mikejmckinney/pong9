import Phaser from 'phaser';
import { COLORS } from '../scenes/GameScene.ts';

const BALL_SIZE = 20;

export class Ball {
  private sprite: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number) {
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
