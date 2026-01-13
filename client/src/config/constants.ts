import {
    BALL_RESPAWN_DELAY_MS,
    BALL_SIZE as SHARED_BALL_SIZE,
    BALL_SPEED as SHARED_BALL_SPEED,
    GAME_HEIGHT as SHARED_GAME_HEIGHT,
    GAME_WIDTH as SHARED_GAME_WIDTH,
    MAX_BOUNCE_ANGLE_SPEED as SHARED_MAX_BOUNCE_ANGLE_SPEED,
    PADDLE_HEIGHT as SHARED_PADDLE_HEIGHT,
    PADDLE_SPEED as SHARED_PADDLE_SPEED,
    PADDLE_WIDTH as SHARED_PADDLE_WIDTH
} from '@shared/constants';

// Synthwave color palette constants
export const COLORS = {
    BG: 0x1b2853,   // Deep Indigo
    GRID: 0x027a7f, // Neon Cyan grid lines (dimmer than P1 for subtlety)
    P1: 0x04c4ca,   // Neon Cyan
    P2: 0xff2975,   // Hot Pink
    BALL: 0xffffff  // White
};

// Game configuration constants
export const GAME_WIDTH = SHARED_GAME_WIDTH;
export const GAME_HEIGHT = SHARED_GAME_HEIGHT;

// Physics constants
export const PADDLE_SPEED = SHARED_PADDLE_SPEED;
export const BALL_SPEED = SHARED_BALL_SPEED;
export const PADDLE_WIDTH = SHARED_PADDLE_WIDTH;
export const PADDLE_HEIGHT = SHARED_PADDLE_HEIGHT;
export const BALL_SIZE = SHARED_BALL_SIZE;

// Visual constants
export const GRID_PERSPECTIVE_SPACING = 100;
export const GRID_HORIZONTAL_SPACING = 40;
export const GRID_HORIZON_RATIO = 0.4;  // Horizon Y position as ratio of screen height
export const CENTER_LINE_DASH_LENGTH = 20;
export const CENTER_LINE_GAP_LENGTH = 20;

// Bloom PostFX constants
export const BLOOM_STRENGTH = 1.5;
export const BLOOM_BLUR_STRENGTH = 2;

// Gameplay timing constants
export const BALL_LAUNCH_DELAY_MS = BALL_RESPAWN_DELAY_MS;

// Collision constants
export const MAX_BOUNCE_ANGLE_SPEED = SHARED_MAX_BOUNCE_ANGLE_SPEED;
