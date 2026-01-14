import { Server } from 'colyseus';
import { createServer } from 'http';
import { GameRoom } from './rooms/index.js';
import { leaderboardService } from './services/LeaderboardService.js';

/**
 * Pong9 Game Server
 * 
 * Per domain_net.md: Server is the "Source of Truth"
 * Matchmaking: Auto-match 2 players per room
 */

const port = Number(process.env.PORT) || 2567;

// Create HTTP server for REST endpoints
const httpServer = createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check endpoint
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }));
    return;
  }

  // Leaderboard endpoints
  if (req.url === '/api/leaderboard') {
    try {
      const leaderboard = await leaderboardService.getTopPlayers(10);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: leaderboard }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Failed to fetch leaderboard' }));
    }
    return;
  }

  if (req.url === '/api/leaderboard/winrate') {
    try {
      const leaderboard = await leaderboardService.getTopByWinRate(10);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, data: leaderboard }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Failed to fetch leaderboard' }));
    }
    return;
  }

  // 404 for unknown routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Create Colyseus server with HTTP server
const gameServer = new Server({ server: httpServer });

// Register the game room
// Colyseus handles matchmaking automatically - clients are placed in available rooms
// with capacity, or a new room is created if none available
gameServer.define('game', GameRoom);

// Initialize leaderboard service and start server
async function startServer(): Promise<void> {
  // Initialize Firebase leaderboard (optional - runs without it)
  await leaderboardService.initialize();

  // Start listening
  httpServer.listen(port, () => {
    console.log(`[GameServer] 🎮 Pong9 Server listening on port ${port}`);
    console.log(`[GameServer] WebSocket endpoint: ws://localhost:${port}`);
    console.log(`[GameServer] REST API: http://localhost:${port}/api/leaderboard`);
  });
}

startServer().catch(console.error);
