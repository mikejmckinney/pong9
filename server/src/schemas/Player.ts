import { Schema, type } from '@colyseus/schema';
import { GAME_HEIGHT, PADDLE_HEIGHT, PADDLE_OFFSET, GAME_WIDTH } from '@pong9/shared/constants';

/**
 * Player schema for Colyseus state synchronization
 * Per domain_net.md: Use strict @type() decorators to prevent state sync issues
 */
export class Player extends Schema {
  @type('number') x: number;
  @type('number') y: number;
  @type('string') sessionId: string = '';
  @type('boolean') connected: boolean = true;
  @type('uint8') playerNumber: 1 | 2;

  constructor(isPlayer1: boolean, playerNumber: 1 | 2) {
    super();
    // Position paddles at opposite sides
    this.x = isPlayer1 ? PADDLE_OFFSET : GAME_WIDTH - PADDLE_OFFSET;
    this.y = GAME_HEIGHT / 2;
    this.playerNumber = playerNumber;
  }

  /**
   * Apply vertical movement with bounds checking
   */
  moveUp(speed: number, deltaSeconds: number): void {
    const halfHeight = PADDLE_HEIGHT / 2;
    this.y = Math.max(halfHeight, this.y - speed * deltaSeconds);
  }

  moveDown(speed: number, deltaSeconds: number): void {
    const halfHeight = PADDLE_HEIGHT / 2;
    this.y = Math.min(GAME_HEIGHT - halfHeight, this.y + speed * deltaSeconds);
  }
}
