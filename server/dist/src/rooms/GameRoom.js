import { Room } from 'colyseus';
import { GameState, Player } from '../schemas/index.js';
import { GamePhase } from '../../shared/interfaces';
import { PADDLE_SPEED, SERVER_TICK_RATE } from '../../shared/constants';
/**
 * GameRoom handles multiplayer Pong game sessions
 * Per domain_net.md: Server runs physics at 60Hz, client sends intent not position
 */
export class GameRoom extends Room {
    // Map of session IDs to player numbers (1 or 2)
    playerNumbers = new Map();
    // Map of session IDs to their current input
    playerInputs = new Map();
    // Simulation interval handle
    simulationInterval = null;
    // Last tick timestamp for delta calculation
    lastTickTime = 0;
    onCreate() {
        this.setState(new GameState());
        this.maxClients = 2;
        // Register message handlers
        this.onMessage('input', this.handleInput.bind(this));
        this.onMessage('ping', this.handlePing.bind(this));
        console.log(`[GameRoom] Room ${this.roomId} created`);
    }
    onJoin(client) {
        console.log(`[GameRoom] Player ${client.sessionId} joined room ${this.roomId}`);
        // Determine player number (first player is P1, second is P2)
        const playerNumber = this.playerNumbers.size === 0 ? 1 : 2;
        this.playerNumbers.set(client.sessionId, playerNumber);
        // Create player schema
        const player = new Player(playerNumber === 1);
        player.sessionId = client.sessionId;
        this.state.players.set(client.sessionId, player);
        // Initialize input state
        this.playerInputs.set(client.sessionId, { input: 'NONE', timestamp: Date.now() });
        // Check if we have both players to start the game
        if (this.playerNumbers.size === 2) {
            this.startGame();
        }
        else {
            // Notify that we're waiting for another player
            client.send('status', { message: 'Waiting for opponent...' });
        }
    }
    onLeave(client, consented) {
        console.log(`[GameRoom] Player ${client.sessionId} left room ${this.roomId} (consented: ${consented})`);
        const player = this.state.players.get(client.sessionId);
        if (player) {
            player.connected = false;
        }
        this.playerNumbers.delete(client.sessionId);
        this.playerInputs.delete(client.sessionId);
        // If game was in progress and a player leaves, end the game
        if (this.state.phase === GamePhase.PLAYING) {
            this.endGame();
        }
    }
    onDispose() {
        console.log(`[GameRoom] Room ${this.roomId} disposed`);
        this.stopSimulation();
    }
    /**
     * Handle player input messages
     * Per domain_net.md: Client sends intent (UP/DOWN), NOT position
     */
    handleInput(client, message) {
        this.playerInputs.set(client.sessionId, message);
    }
    /**
     * Handle ping messages for latency measurement
     */
    handlePing(client, message) {
        const response = {
            clientTime: message.clientTime,
            serverTime: Date.now(),
        };
        client.send('pong', response);
    }
    /**
     * Start the game when both players are ready
     */
    startGame() {
        console.log(`[GameRoom] Starting game in room ${this.roomId}`);
        this.state.phase = GamePhase.PLAYING;
        // Broadcast game start to all clients
        this.broadcast('gameStart', { message: 'Game starting!' });
        // Start the simulation loop at 60Hz
        this.lastTickTime = Date.now();
        this.simulationInterval = setInterval(() => this.tick(), 1000 / SERVER_TICK_RATE);
        // Launch ball after a short delay (1 second)
        setTimeout(() => this.launchBall(), 1000);
    }
    /**
     * Server simulation tick - runs at 60Hz
     * Per domain_net.md: Server runs the physics loop at 60Hz
     */
    tick() {
        if (this.state.phase !== GamePhase.PLAYING)
            return;
        const now = Date.now();
        const deltaSeconds = (now - this.lastTickTime) / 1000;
        this.lastTickTime = now;
        // Process player inputs
        this.processInputs(deltaSeconds);
        // Ball physics will be implemented in Phase 3
        // For now, just update player positions based on inputs
    }
    /**
     * Process pending player inputs
     */
    processInputs(deltaSeconds) {
        for (const [sessionId, input] of this.playerInputs) {
            const player = this.state.players.get(sessionId);
            if (!player || !player.connected)
                continue;
            switch (input.input) {
                case 'UP':
                    player.moveUp(PADDLE_SPEED, deltaSeconds);
                    break;
                case 'DOWN':
                    player.moveDown(PADDLE_SPEED, deltaSeconds);
                    break;
                case 'NONE':
                default:
                    // No movement
                    break;
            }
        }
    }
    /**
     * Launch the ball with a random direction
     * Full physics will be in Phase 3, this is just placeholder velocity
     */
    launchBall() {
        if (this.state.phase !== GamePhase.PLAYING)
            return;
        // For Phase 2, just set initial velocity
        // Full physics implementation in Phase 3
        const direction = Math.random() > 0.5 ? 1 : -1;
        const angle = (Math.random() - 0.5) * Math.PI / 3; // -30 to +30 degrees
        const speed = 400;
        this.state.ballVelX = direction * speed * Math.cos(angle);
        this.state.ballVelY = speed * Math.sin(angle);
        console.log(`[GameRoom] Ball launched with velocity (${this.state.ballVelX.toFixed(2)}, ${this.state.ballVelY.toFixed(2)})`);
    }
    /**
     * End the game (player disconnection or other reason)
     */
    endGame() {
        console.log(`[GameRoom] Ending game in room ${this.roomId}`);
        this.state.phase = GamePhase.FINISHED;
        this.stopSimulation();
        this.broadcast('gameEnd', { reason: 'Player disconnected' });
    }
    /**
     * Stop the simulation loop
     */
    stopSimulation() {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
    }
}
//# sourceMappingURL=GameRoom.js.map