import { Server } from 'colyseus';
import { GameRoom } from './rooms/index.js';

/**
 * Pong9 Game Server
 * 
 * Per domain_net.md: Server is the "Source of Truth"
 * Matchmaking: Auto-match 2 players per room
 */

const port = Number(process.env.PORT) || 2567;

// Create Colyseus server
const gameServer = new Server();

// Register the game room
// Colyseus handles matchmaking automatically - clients are placed in available rooms
// with capacity, or a new room is created if none available
gameServer.define('game', GameRoom);

// Start listening
gameServer.listen(port).then(() => {
  console.log(`[GameServer] 🎮 Pong9 Server listening on port ${port}`);
  console.log(`[GameServer] WebSocket endpoint: ws://localhost:${port}`);
});
