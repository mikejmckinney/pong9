// Synthwave color palette constants
export const COLORS = {
    BG: 0x1b2853,   // Deep Indigo
    GRID: 0x027a7f, // Neon Cyan grid lines (dimmer than P1 for subtlety)
    P1: 0x04c4ca,   // Neon Cyan
    P2: 0xff2975,   // Hot Pink
    BALL: 0xffffff  // White
};

// Game configuration constants
export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;

// Physics constants
export const PADDLE_SPEED = 600;
export const BALL_SPEED = 500;
export const PADDLE_WIDTH = 20;
export const PADDLE_HEIGHT = 120;
export const BALL_SIZE = 20;

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
export const BALL_LAUNCH_DELAY_MS = 1000;

// Collision constants
export const MAX_BOUNCE_ANGLE_SPEED = 450;
