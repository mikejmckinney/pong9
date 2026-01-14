/**
 * Shared game constants between client and server
 * These values ensure consistent behavior across the network
 */

// Game dimensions (match client/src/main.ts)
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Paddle configuration
export const PADDLE_WIDTH = 20;
export const PADDLE_HEIGHT = 100;
export const PADDLE_OFFSET = 50; // Distance from edge
export const PADDLE_SPEED = 500;

// Ball configuration
export const BALL_SIZE = 20;
export const BALL_SPEED = 400;

// Game rules
export const WINNING_SCORE = 5;

// Network constants
export const SERVER_TICK_RATE = 60; // Hz
export const CLIENT_INTERPOLATION_BUFFER = 100; // ms

// Power-up configuration (Phase 4)
export const POWERUP_SIZE = 30;
export const POWERUP_SPAWN_INTERVAL = 10000; // ms between spawn attempts
export const POWERUP_DURATION = 5000; // ms effect duration
export const POWERUP_SPAWN_CHANCE = 0.5; // 50% chance to spawn

// Power-up effect values
export const PADDLE_SIZE_MULTIPLIER = 1.5; // BigPaddle effect
export const BALL_SPEED_MULTIPLIER = 1.5; // SpeedUp effect
export const SLOW_BALL_MULTIPLIER = 0.6; // SlowDown effect
