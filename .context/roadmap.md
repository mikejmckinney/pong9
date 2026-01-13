# Project Roadmap: Retro Pong AI

## Phase 1: The Core Loop (Local Prototype) ✅ COMPLETE
- [x] Setup Phaser 3 + TypeScript environment.
- [x] Implement Paddle/Ball Physics (Arcade Physics).
- [x] Implement Synthwave Graphics (Canvas drawing, Glow effects).
- [x] Implement Mobile Scale Manager (FIT mode) and Touch Inputs.

## Phase 2: The Network Plumbing ✅ COMPLETE
- [x] Setup Node.js + Colyseus Server.
- [x] Define `GameState` and `Player` Schemas.
- [x] Implement Room connection and "Waiting for Player" state.
- [x] Verify basic message passing (Ping/Pong).

## Phase 3: Authoritative Physics ✅ COMPLETE
- [x] Port Physics logic from Client to Server.
- [x] Implement Server Simulation Loop (60Hz with drift compensation).
- [x] Implement Client-Side Prediction (Local) & Interpolation (Remote).
- [ ] Add Power-Up Spawning Logic (Server-side) - deferred to Phase 4.

## Phase 4: Polish & Persistence
- [ ] Integrate Firebase v9 for Leaderboards.
- [x] Implement Procedural Audio (Web Audio API).
- [x] Finalize CSS CRT Overlays.
- [ ] Add Power-Up System (server-side spawning and collision).
- [ ] Configure Dockerfile for deployment.
- [ ] Add reconnection handling for dropped connections.
