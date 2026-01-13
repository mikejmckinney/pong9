import { Client, Room } from 'colyseus';
import { GameState, PlayerState } from '../../../shared/GameState';
import { GAME_HEIGHT, PADDLE_HEIGHT, PADDLE_SPEED, MAX_PLAYERS } from '../../../shared/constants';
import { InputDirection, InputMessage, MESSAGE_TYPES, PlayerSide } from '../../../shared/messages';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export class PongRoom extends Room<GameState> {
    maxClients = MAX_PLAYERS;
    // Map to store each player's current intended direction for time-based movement
    private playerDirections = new Map<string, InputDirection>();

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
        const player = new PlayerState();
        player.sessionId = client.sessionId;
        player.side = this.getAvailableSide();
        this.state.players.set(client.sessionId, player);
        this.playerDirections.set(client.sessionId, 'stop');

        if (this.state.players.size >= MAX_PLAYERS) {
            this.state.phase = 'playing';
        } else {
            this.state.phase = 'waiting';
        }
    }

    onLeave(client: Client) {
        this.state.players.delete(client.sessionId);
        this.playerDirections.delete(client.sessionId);
        this.state.phase = 'waiting';
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

        // Reserved for future server-side simulation (ball physics, scoring).
    }

    private getAvailableSide(): PlayerSide {
        const usedSides = new Set<PlayerSide>();
        this.state.players.forEach((player) => usedSides.add(player.side));

        if (!usedSides.has('left')) {
            return 'left';
        }

        return 'right';
    }
}
