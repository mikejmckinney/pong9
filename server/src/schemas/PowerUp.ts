import { Schema, type } from '@colyseus/schema';
import { PowerUpType } from '@pong9/shared/interfaces';

/**
 * PowerUp schema for Colyseus state synchronization
 * Server spawns and manages power-ups, client renders them
 */
export class PowerUp extends Schema {
  @type('string') id: string;
  @type('string') powerUpType: string; // PowerUpType enum value
  @type('number') x: number;
  @type('number') y: number;
  @type('boolean') active: boolean = true;

  constructor(id: string, type: PowerUpType, x: number, y: number) {
    super();
    this.id = id;
    this.powerUpType = type;
    this.x = x;
    this.y = y;
  }
}

/**
 * Active effect on a player
 */
export class ActiveEffect extends Schema {
  @type('string') effectType: string; // PowerUpType enum value
  @type('string') playerId: string;
  @type('number') expiresAt: number;

  constructor(type: PowerUpType, playerId: string, duration: number) {
    super();
    this.effectType = type;
    this.playerId = playerId;
    this.expiresAt = Date.now() + duration;
  }

  isExpired(): boolean {
    return Date.now() >= this.expiresAt;
  }
}
