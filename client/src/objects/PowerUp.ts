import Phaser from 'phaser';
import { PowerUpType } from '@pong9/shared/interfaces';
import { POWERUP_SIZE } from '@pong9/shared/constants';

// Power-up colors matching synthwave aesthetic
const POWERUP_COLORS: Record<PowerUpType, number> = {
  [PowerUpType.BIG_PADDLE]: 0x00ff00,     // Green - positive for player
  [PowerUpType.SHRINK_OPPONENT]: 0xff0000, // Red - negative for opponent
  [PowerUpType.SPEED_UP]: 0xffff00,        // Yellow - caution
  [PowerUpType.SLOW_DOWN]: 0x00ffff,       // Cyan - cool/slow
};

// Power-up symbols
const POWERUP_SYMBOLS: Record<PowerUpType, string> = {
  [PowerUpType.BIG_PADDLE]: '+',
  [PowerUpType.SHRINK_OPPONENT]: '-',
  [PowerUpType.SPEED_UP]: '>>',
  [PowerUpType.SLOW_DOWN]: '<<',
};

export class PowerUpObject {
  private sprite: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;
  private glowTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
    const color = POWERUP_COLORS[type] ?? 0xffffff;
    const symbol = POWERUP_SYMBOLS[type] ?? '?';

    // Create glowing rectangle
    this.sprite = scene.add.rectangle(x, y, POWERUP_SIZE, POWERUP_SIZE, color, 0.8);
    this.sprite.setStrokeStyle(2, 0xffffff);

    // Add symbol text
    this.text = scene.add.text(x, y, symbol, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Pulsing glow animation
    this.glowTween = scene.tweens.add({
      targets: this.sprite,
      alpha: { from: 0.5, to: 1 },
      scaleX: { from: 1, to: 1.1 },
      scaleY: { from: 1, to: 1.1 },
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
  }

  setPosition(x: number, y: number): void {
    this.sprite.setPosition(x, y);
    this.text.setPosition(x, y);
  }

  destroy(): void {
    if (this.glowTween) {
      this.glowTween.destroy();
    }
    this.sprite.destroy();
    this.text.destroy();
  }
}
