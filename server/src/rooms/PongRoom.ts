import { Client, Room } from 'colyseus';
import { GameState, PlayerState } from '../../../shared/GameState';
import { GAME_HEIGHT, GAME_WIDTH, PADDLE_HEIGHT, PADDLE_SPEED, MAX_PLAYERS } from '../../../shared/constants';
import { InputDirection, InputMessage, MESSAGE_TYPES, PlayerSide } from '../../../shared/messages';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const BALL_SPEED = 500;
const MAX_BOUNCE_ANGLE_SPEED = 450;
const BALL_RESPAWN_DELAY_MS = 1000;
const PADDLE_WIDTH = 20;
const PADDLE_MARGIN = 50;

export class PongRoom extends Room<GameState> {
    maxClients = MAX_PLAYERS;
    // Map to store each player's current intended direction for time-based movement
    private playerDirections = new Map<string, InputDirection>();
    private ballVelocity = { x: 0, y: 0 };
    private ballRespawnTimer = 0;
    private isBallActive = false;

    onCreate() {
        this.setState(new GameState());

        this.onMessage<InputMessage>(MESSAGE_TYPES.INPUT, (client, message) => {
            this.handleInput(client, message);
        });

        this.onMessage(MESSAGE_TYPES.PING, (client, message) => {
            client.send(MESSAGE_TYPES.PONG, { timestamp: message?.timestamp ?? Date.now() });
        });

        this.setSimulationInterval((deltaTime) => this.updateState(deltaTime));
    }

    onJoin(client: Client) {
        // Get available side with error handling
        // While maxClients=2 should prevent overflow, this guards against edge cases
        // (e.g., reconnection logic, future maxClients changes)
        let side: PlayerSide;
        try {
            side = this.getAvailableSide();
        } catch (error) {
            console.error('Failed to assign player side:', error);
            // Disconnect the client if no side is available
            client.leave();
            return;
        }

        const player = new PlayerState();
        player.sessionId = client.sessionId;
        player.side = side;
        this.state.players.set(client.sessionId, player);
        this.playerDirections.set(client.sessionId, 'stop');

        if (this.state.players.size >= MAX_PLAYERS) {
            this.state.phase = 'playing';
            this.prepareNextServe();
        } else {
            this.state.phase = 'waiting';
        }
    }

    onLeave(client: Client) {
        this.state.players.delete(client.sessionId);
        this.playerDirections.delete(client.sessionId);
        this.state.phase = 'waiting';
        this.stopBall();
    }

    /**
     * Handle input by queuing the player's intended direction.
     * Actual movement is processed in updateState() using deltaTime for frame-rate independence.
     */
    private handleInput(client: Client, message: InputMessage) {
        const player = this.state.players.get(client.sessionId);
        if (!player || !message?.direction) {
            return;
        }

        // Queue the direction; movement will be applied in updateState with deltaTime
        this.playerDirections.set(client.sessionId, message.direction);
    }

    /**
     * Process player movements using deltaTime for frame-rate independent physics.
     * deltaTime is in milliseconds from setSimulationInterval.
     */
    private updateState(deltaTime: number) {
        // Convert deltaTime from ms to seconds for physics calculation
        const dt = deltaTime / 1000;

        this.state.players.forEach((player) => {
            const direction = this.playerDirections.get(player.sessionId) ?? 'stop';

            if (direction === 'up') {
                player.y -= PADDLE_SPEED * dt;
            } else if (direction === 'down') {
                player.y += PADDLE_SPEED * dt;
            }
            // 'stop' direction means no movement

            player.y = clamp(player.y, 0, GAME_HEIGHT - PADDLE_HEIGHT);
        });

        this.updateBall(deltaTime);
    }

    private getAvailableSide(): PlayerSide {
        const usedSides = new Set<PlayerSide>();
        this.state.players.forEach((player) => usedSides.add(player.side));

        if (!usedSides.has('left')) {
            return 'left';
        }

        if (!usedSides.has('right')) {
            return 'right';
        }

        throw new Error('No available player sides for this room');
    }

    private updateBall(deltaTime: number) {
        const dt = deltaTime / 1000;

        if (this.state.phase !== 'playing') {
            this.stopBall();
            return;
        }

        if (!this.isBallActive) {
            if (this.ballRespawnTimer > 0) {
                this.ballRespawnTimer -= deltaTime;
                return;
            }
            this.launchBall();
        }

        const ball = this.state.ball;
        ball.x += this.ballVelocity.x * dt;
        ball.y += this.ballVelocity.y * dt;

        if (this.handleScoring()) {
            return;
        }

        this.handleWallBounce();
        this.handlePaddleCollision();
    }

    private stopBall() {
        this.isBallActive = false;
        this.ballRespawnTimer = 0;
        this.ballVelocity.x = 0;
        this.ballVelocity.y = 0;
        this.resetBallToCenter();
    }

    private prepareNextServe() {
        this.isBallActive = false;
        this.ballRespawnTimer = BALL_RESPAWN_DELAY_MS;
        this.ballVelocity.x = 0;
        this.ballVelocity.y = 0;
        this.resetBallToCenter();
    }

    private launchBall() {
        this.resetBallToCenter();
        const direction = Math.random() < 0.5 ? -1 : 1;
        const angleDeg = Math.random() * 90 - 45;
        const angleRad = (angleDeg * Math.PI) / 180;

        this.ballVelocity.x = Math.cos(angleRad) * BALL_SPEED * direction;
        this.ballVelocity.y = Math.sin(angleRad) * BALL_SPEED;
        this.isBallActive = true;
        this.ballRespawnTimer = 0;
    }

    private resetBallToCenter() {
        this.state.ball.x = GAME_WIDTH / 2;
        this.state.ball.y = GAME_HEIGHT / 2;
    }

    private handleWallBounce() {
        const ball = this.state.ball;
        const radius = ball.radius;

        if (ball.y - radius <= 0) {
            ball.y = radius;
            this.ballVelocity.y = Math.abs(this.ballVelocity.y);
        } else if (ball.y + radius >= GAME_HEIGHT) {
            ball.y = GAME_HEIGHT - radius;
            this.ballVelocity.y = -Math.abs(this.ballVelocity.y);
        }
    }

    private handlePaddleCollision() {
        const leftPlayer = this.getPlayerBySide('left');
        const rightPlayer = this.getPlayerBySide('right');

        if (leftPlayer) {
            this.checkPaddleCollision(leftPlayer, 'left');
        }

        if (rightPlayer) {
            this.checkPaddleCollision(rightPlayer, 'right');
        }
    }

    private checkPaddleCollision(player: PlayerState, side: PlayerSide) {
        const ball = this.state.ball;
        const radius = ball.radius;
        const halfPaddleWidth = PADDLE_WIDTH / 2;
        const paddleX = side === 'left' ? PADDLE_MARGIN : GAME_WIDTH - PADDLE_MARGIN;
        const paddleLeft = paddleX - halfPaddleWidth;
        const paddleRight = paddleX + halfPaddleWidth;
        const paddleTop = player.y;
        const paddleBottom = player.y + PADDLE_HEIGHT;

        const ballLeft = ball.x - radius;
        const ballRight = ball.x + radius;
        const ballTop = ball.y - radius;
        const ballBottom = ball.y + radius;

        const movingTowardPaddle = side === 'left' ? this.ballVelocity.x < 0 : this.ballVelocity.x > 0;

        if (
            movingTowardPaddle &&
            ballRight >= paddleLeft &&
            ballLeft <= paddleRight &&
            ballBottom >= paddleTop &&
            ballTop <= paddleBottom
        ) {
            const paddleCenterY = paddleTop + PADDLE_HEIGHT / 2;
            const offset = clamp((ball.y - paddleCenterY) / (PADDLE_HEIGHT / 2), -1, 1);

            this.ballVelocity.y = offset * MAX_BOUNCE_ANGLE_SPEED;
            this.ballVelocity.x = side === 'left' ? Math.abs(this.ballVelocity.x) : -Math.abs(this.ballVelocity.x);
            this.state.ball.x = side === 'left' ? paddleRight + radius : paddleLeft - radius;
        }
    }

    private handleScoring(): boolean {
        const ball = this.state.ball;
        const radius = ball.radius;

        if (ball.x + radius < 0) {
            this.awardPoint('right');
            return true;
        }

        if (ball.x - radius > GAME_WIDTH) {
            this.awardPoint('left');
            return true;
        }

        return false;
    }

    private awardPoint(side: PlayerSide) {
        const scorer = this.getPlayerBySide(side);
        if (scorer) {
            scorer.score += 1;
        }
        this.prepareNextServe();
    }

    private getPlayerBySide(side: PlayerSide): PlayerState | undefined {
        let found: PlayerState | undefined;
        this.state.players.forEach((player) => {
            if (player.side === side) {
                found = player;
            }
        });
        return found;
    }
}
