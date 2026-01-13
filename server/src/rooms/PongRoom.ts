import { Client, Room } from 'colyseus';
import { GameState, PlayerState } from '../../../shared/GameState';
import { GAME_HEIGHT, PADDLE_HEIGHT, PADDLE_SPEED, MAX_PLAYERS } from '../../../shared/constants';
import { InputMessage, MESSAGE_TYPES } from '../../../shared/messages';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const FRAME_RATE = 60;

export class PongRoom extends Room<GameState> {
    maxClients = MAX_PLAYERS;

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
        this.state.players.set(client.sessionId, player);

        if (this.state.players.size >= MAX_PLAYERS) {
            this.state.phase = 'playing';
        } else {
            this.state.phase = 'waiting';
        }
    }

    onLeave(client: Client) {
        this.state.players.delete(client.sessionId);
        this.state.phase = 'waiting';
    }

    private handleInput(client: Client, message: InputMessage) {
        const player = this.state.players.get(client.sessionId);
        if (!player || !message?.direction) {
            return;
        }

        const step = PADDLE_SPEED / FRAME_RATE;

        switch (message.direction) {
            case 'up':
                player.y -= step;
                break;
            case 'down':
                player.y += step;
                break;
            default:
                break;
        }

        player.y = clamp(player.y, 0, GAME_HEIGHT - PADDLE_HEIGHT);
    }

    private updateState(_deltaTime: number) {
        // Reserved for future server-side simulation (ball physics, scoring).
    }
}
