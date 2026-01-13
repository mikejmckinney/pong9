import { Schema, MapSchema } from '@colyseus/schema';
import { Player } from './Player.js';
/**
 * GameState schema for Colyseus state synchronization
 * Per domain_net.md: Server is "Source of Truth", client is a renderer
 */
export declare class GameState extends Schema {
    players: MapSchema<Player, string>;
    ballX: number;
    ballY: number;
    ballVelX: number;
    ballVelY: number;
    score1: number;
    score2: number;
    phase: string;
    winner: number;
    /**
     * Get the half-size for bounds checking
     */
    get ballHalfSize(): number;
    /**
     * Reset ball to center
     */
    resetBall(): void;
}
