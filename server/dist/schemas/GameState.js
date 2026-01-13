var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Schema, type, MapSchema } from '@colyseus/schema';
import { Player } from './Player.js';
import { GAME_WIDTH, GAME_HEIGHT, BALL_SIZE } from '@pong9/shared/constants';
import { GamePhase } from '@pong9/shared/interfaces';
/**
 * GameState schema for Colyseus state synchronization
 * Per domain_net.md: Server is "Source of Truth", client is a renderer
 */
export class GameState extends Schema {
    players = new MapSchema();
    // Ball state
    ballX = GAME_WIDTH / 2;
    ballY = GAME_HEIGHT / 2;
    ballVelX = 0;
    ballVelY = 0;
    // Scores
    score1 = 0;
    score2 = 0;
    // Game phase
    phase = GamePhase.WAITING;
    // Winner (1 or 2, 0 if no winner yet)
    winner = 0;
    /**
     * Get the half-size for bounds checking
     */
    get ballHalfSize() {
        return BALL_SIZE / 2;
    }
    /**
     * Reset ball to center
     */
    resetBall() {
        this.ballX = GAME_WIDTH / 2;
        this.ballY = GAME_HEIGHT / 2;
        this.ballVelX = 0;
        this.ballVelY = 0;
    }
}
__decorate([
    type({ map: Player }),
    __metadata("design:type", Object)
], GameState.prototype, "players", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], GameState.prototype, "ballX", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], GameState.prototype, "ballY", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], GameState.prototype, "ballVelX", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], GameState.prototype, "ballVelY", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], GameState.prototype, "score1", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], GameState.prototype, "score2", void 0);
__decorate([
    type('string'),
    __metadata("design:type", String)
], GameState.prototype, "phase", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], GameState.prototype, "winner", void 0);
//# sourceMappingURL=GameState.js.map