import { Schema } from '@colyseus/schema';
/**
 * Player schema for Colyseus state synchronization
 * Per domain_net.md: Use strict @type() decorators to prevent state sync issues
 */
export declare class Player extends Schema {
    x: number;
    y: number;
    sessionId: string;
    connected: boolean;
    constructor(isPlayer1: boolean);
    /**
     * Apply vertical movement with bounds checking
     */
    moveUp(speed: number, deltaSeconds: number): void;
    moveDown(speed: number, deltaSeconds: number): void;
}
