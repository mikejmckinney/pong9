export type InputDirection = 'up' | 'down' | 'stop';

export interface InputMessage {
    direction: InputDirection;
}

export interface PingMessage {
    timestamp: number;
}

export type GamePhase = 'waiting' | 'playing';
export type PlayerSide = 'left' | 'right';

export const MESSAGE_TYPES = {
    INPUT: 'input',
    PING: 'ping',
    PONG: 'pong'
} as const;

export const ROOM_NAME = 'pong_room';
