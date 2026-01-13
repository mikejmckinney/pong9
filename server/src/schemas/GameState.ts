import { Schema, type, MapSchema } from '@colyseus/schema';
import { Player } from './Player.js';
import { GAME_WIDTH, GAME_HEIGHT, BALL_SIZE } from '@pong9/shared/constants';
import { GamePhase } from '@pong9/shared/interfaces';

/**
 * GameState schema for Colyseus state synchronization
 * Per domain_net.md: Server is "Source of Truth", client is a renderer
 */
export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();

  // Ball state
  @type('number') ballX: number = GAME_WIDTH / 2;
  @type('number') ballY: number = GAME_HEIGHT / 2;
  @type('number') ballVelX: number = 0;
  @type('number') ballVelY: number = 0;

  // Scores
  @type('number') score1: number = 0;
  @type('number') score2: number = 0;

  // Game phase
  @type('string') phase: string = GamePhase.WAITING;

  // Winner (1 or 2, 0 if no winner yet)
  @type('number') winner: number = 0;

  /**
   * Get the half-size for bounds checking
   */
  get ballHalfSize(): number {
    return BALL_SIZE / 2;
  }

  /**
   * Reset ball to center
   */
  resetBall(): void {
    this.ballX = GAME_WIDTH / 2;
    this.ballY = GAME_HEIGHT / 2;
    this.ballVelX = 0;
    this.ballVelY = 0;
  }
}
