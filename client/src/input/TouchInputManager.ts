import Phaser from 'phaser';
import { Paddle } from '../objects/Paddle.ts';

/**
 * TouchInputManager handles split-screen touch controls for mobile play
 * Per domain_ui.md Mobile Engineering Constraints:
 * - Left 50% of screen controls Player 1 paddle
 * - Right 50% of screen controls Player 2 paddle
 * - Supports multi-touch for simultaneous control of both paddles
 */
export class TouchInputManager {
  private scene: Phaser.Scene;
  private paddle1: Paddle;
  private paddle2: Paddle;
  private paddleSpeed: number;
  private activePointers: Map<number, { side: 'left' | 'right'; startY: number }> = new Map();

  constructor(scene: Phaser.Scene, paddle1: Paddle, paddle2: Paddle, paddleSpeed: number) {
    this.scene = scene;
    this.paddle1 = paddle1;
    this.paddle2 = paddle2;
    this.paddleSpeed = paddleSpeed;

    this.setupTouchHandlers();
  }

  private setupTouchHandlers(): void {
    // Enable multi-touch
    this.scene.input.addPointer(1); // Allow at least 2 pointers

    // Handle pointer down
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const { width } = this.scene.scale;
      const side: 'left' | 'right' = pointer.x < width / 2 ? 'left' : 'right';
      
      this.activePointers.set(pointer.id, {
        side,
        startY: pointer.y,
      });
    });

    // Handle pointer up
    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      this.activePointers.delete(pointer.id);
    });

    // Handle pointer move
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const pointerData = this.activePointers.get(pointer.id);
      if (!pointerData) return;

      // Update which side the pointer is on (in case they drag across)
      const { width } = this.scene.scale;
      pointerData.side = pointer.x < width / 2 ? 'left' : 'right';
    });
  }

  update(): void {
    const { height } = this.scene.scale;
    const delta = this.scene.game.loop.delta;

    // Process each active pointer
    for (const [pointerId, pointerData] of this.activePointers) {
      const pointer = this.scene.input.manager.pointers.find(p => p.id === pointerId);
      if (!pointer || !pointer.isDown) {
        this.activePointers.delete(pointerId);
        continue;
      }

      const paddle = pointerData.side === 'left' ? this.paddle1 : this.paddle2;
      
      // Move paddle based on touch position relative to screen center
      // Upper half = move up, lower half = move down
      const screenCenterY = height / 2;
      
      if (pointer.y < screenCenterY) {
        // Touch in upper half - move paddle up
        paddle.moveUp(delta, this.paddleSpeed);
      } else {
        // Touch in lower half - move paddle down
        paddle.moveDown(delta, this.paddleSpeed, height);
      }
    }
  }

  /**
   * Alternative control method: Direct paddle positioning
   * Move paddle directly to touch Y position (more responsive feel)
   */
  updateDirectControl(): void {
    const { height } = this.scene.scale;

    for (const [pointerId, pointerData] of this.activePointers) {
      const pointer = this.scene.input.manager.pointers.find(p => p.id === pointerId);
      if (!pointer || !pointer.isDown) {
        this.activePointers.delete(pointerId);
        continue;
      }

      const paddle = pointerData.side === 'left' ? this.paddle1 : this.paddle2;
      
      // Lerp paddle Y position towards touch Y position
      const targetY = Phaser.Math.Clamp(
        pointer.y,
        paddle.getSprite().displayHeight / 2,
        height - paddle.getSprite().displayHeight / 2
      );
      
      const currentY = paddle.getSprite().y;
      const newY = Phaser.Math.Linear(currentY, targetY, 0.2);
      paddle.setY(newY);
    }
  }
}
