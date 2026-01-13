import Phaser from 'phaser';

const PADDLE_WIDTH = 20;
const PADDLE_HEIGHT = 100;

export class Paddle {
  private sprite: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, color: number) {
    // Create rectangle sprite for physics (simpler and more reliable for collisions)
    this.sprite = scene.add.rectangle(x, y, PADDLE_WIDTH, PADDLE_HEIGHT, color);
  }

  getSprite(): Phaser.GameObjects.Rectangle {
    return this.sprite;
  }

  moveUp(delta: number, speed: number): void {
    const movement = (speed * delta) / 1000;
    this.sprite.y = Math.max(this.sprite.y - movement, this.sprite.displayHeight / 2);
  }

  moveDown(delta: number, speed: number, maxHeight: number): void {
    const movement = (speed * delta) / 1000;
    this.sprite.y = Math.min(this.sprite.y + movement, maxHeight - this.sprite.displayHeight / 2);
  }

  setY(y: number): void {
    this.sprite.y = y;
  }

  clampPosition(maxHeight: number): void {
    const halfHeight = this.sprite.displayHeight / 2;
    this.sprite.y = Phaser.Math.Clamp(this.sprite.y, halfHeight, maxHeight - halfHeight);
  }
}
