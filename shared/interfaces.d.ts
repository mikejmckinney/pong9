/**
 * Shared TypeScript interfaces for client-server communication
 * Defines the contract for game state synchronization
 */
/**
 * Input message sent from client to server
 * Client sends intent, NOT position (per domain_net.md)
 */
export interface PlayerInput {
    input: 'UP' | 'DOWN' | 'NONE';
    timestamp: number;
}
/**
 * Room options for creating/joining a game
 */
export interface RoomOptions {
    playerName?: string;
}
/**
 * Game state enum for room lifecycle
 */
export declare enum GamePhase {
    WAITING = "waiting",
    PLAYING = "playing",
    FINISHED = "finished"
}
/**
 * Server-to-client messages
 */
export interface GameOverMessage {
    winner: 1 | 2;
    score1: number;
    score2: number;
}
/**
 * Ping/Pong for latency measurement
 */
export interface PingMessage {
    clientTime: number;
}
export interface PongMessage {
    clientTime: number;
    serverTime: number;
}
