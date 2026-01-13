var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Schema, type } from '@colyseus/schema';
import { GAME_HEIGHT, PADDLE_HEIGHT, PADDLE_OFFSET, GAME_WIDTH } from '../../shared/constants';
/**
 * Player schema for Colyseus state synchronization
 * Per domain_net.md: Use strict @type() decorators to prevent state sync issues
 */
export class Player extends Schema {
    x;
    y;
    sessionId = '';
    connected = true;
    constructor(isPlayer1) {
        super();
        // Position paddles at opposite sides
        this.x = isPlayer1 ? PADDLE_OFFSET : GAME_WIDTH - PADDLE_OFFSET;
        this.y = GAME_HEIGHT / 2;
    }
    /**
     * Apply vertical movement with bounds checking
     */
    moveUp(speed, deltaSeconds) {
        const halfHeight = PADDLE_HEIGHT / 2;
        this.y = Math.max(halfHeight, this.y - speed * deltaSeconds);
    }
    moveDown(speed, deltaSeconds) {
        const halfHeight = PADDLE_HEIGHT / 2;
        this.y = Math.min(GAME_HEIGHT - halfHeight, this.y + speed * deltaSeconds);
    }
}
__decorate([
    type('number'),
    __metadata("design:type", Number)
], Player.prototype, "x", void 0);
__decorate([
    type('number'),
    __metadata("design:type", Number)
], Player.prototype, "y", void 0);
__decorate([
    type('string'),
    __metadata("design:type", String)
], Player.prototype, "sessionId", void 0);
__decorate([
    type('boolean'),
    __metadata("design:type", Boolean)
], Player.prototype, "connected", void 0);
//# sourceMappingURL=Player.js.map