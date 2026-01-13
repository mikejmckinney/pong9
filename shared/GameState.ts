import { MapSchema, Schema, type } from '@colyseus/schema';
import { BALL_SIZE, GAME_HEIGHT, GAME_WIDTH, PADDLE_HEIGHT } from './constants';
import type { GamePhase } from './messages';

export class PlayerState extends Schema {
    @type('string') sessionId: string = '';
    @type('number') y: number = (GAME_HEIGHT - PADDLE_HEIGHT) / 2;
    @type('number') score: number = 0;
}

export class BallState extends Schema {
    @type('number') x: number = GAME_WIDTH / 2;
    @type('number') y: number = GAME_HEIGHT / 2;
    @type('number') radius: number = BALL_SIZE / 2;
}

export class GameState extends Schema {
    @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
    @type(BallState) ball = new BallState();
    @type('string') phase: GamePhase = 'waiting';
}
