import { Room, Client } from 'colyseus';
import { GameState } from '../schemas/index.js';
/**
 * GameRoom handles multiplayer Pong game sessions
 * Per domain_net.md: Server runs physics at 60Hz, client sends intent not position
 */
export declare class GameRoom extends Room<GameState> {
    private playerNumbers;
    private playerInputs;
    private simulationInterval;
    private lastTickTime;
    onCreate(): void;
    onJoin(client: Client): void;
    onLeave(client: Client, consented: boolean): void;
    onDispose(): void;
    /**
     * Handle player input messages
     * Per domain_net.md: Client sends intent (UP/DOWN), NOT position
     */
    private handleInput;
    /**
     * Handle ping messages for latency measurement
     */
    private handlePing;
    /**
     * Start the game when both players are ready
     */
    private startGame;
    /**
     * Server simulation tick - runs at 60Hz
     * Per domain_net.md: Server runs the physics loop at 60Hz
     */
    private tick;
    /**
     * Process pending player inputs
     */
    private processInputs;
    /**
     * Launch the ball with a random direction
     * Full physics will be in Phase 3, this is just placeholder velocity
     */
    private launchBall;
    /**
     * End the game (player disconnection or other reason)
     */
    private endGame;
    /**
     * Stop the simulation loop
     */
    private stopSimulation;
}
