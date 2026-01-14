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
export enum GamePhase {
  WAITING = 'waiting',
  PLAYING = 'playing',
  FINISHED = 'finished',
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

/**
 * Power-up types (Phase 4)
 */
export enum PowerUpType {
  BIG_PADDLE = 'big_paddle',     // Increases paddle size for collector
  SPEED_UP = 'speed_up',         // Speeds up the ball
  SLOW_DOWN = 'slow_down',       // Slows down the ball
  SHRINK_OPPONENT = 'shrink_opponent', // Shrinks opponent's paddle
}

/**
 * Power-up state for synchronization
 */
export interface PowerUpState {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  active: boolean;
}

/**
 * Active power-up effect on a player
 */
export interface ActiveEffect {
  type: PowerUpType;
  playerId: string;
  expiresAt: number;
}

/**
 * Leaderboard entry for Firebase storage
 */
export interface LeaderboardEntry {
  id?: string;
  playerName: string;
  wins: number;
  losses: number;
  totalGames: number;
  winRate: number;
  lastPlayed: number; // timestamp
}

/**
 * Game result for leaderboard updates
 */
export interface GameResult {
  winnerName: string;
  loserName: string;
  winnerScore: number;
  loserScore: number;
  timestamp: number;
}
