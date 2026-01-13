# Project Roadmap: Retro Pong AI

## Phase 1: The Core Loop (Local Prototype) ✅ COMPLETE
- [x] Setup Phaser 3 + TypeScript environment.
- [x] Implement Paddle/Ball Physics (Arcade Physics).
- [x] Implement Synthwave Graphics (Canvas drawing, Glow effects).
- [x] Implement Mobile Scale Manager (FIT mode) and Touch Inputs.

## Phase 2: The Network Plumbing
- [ ] Setup Node.js + Colyseus Server.
- [ ] Define `GameState` and `Player` Schemas.
- [ ] Implement Room connection and "Waiting for Player" state.
- [ ] Verify basic message passing (Ping/Pong).

## Phase 3: Authoritative Physics
- [ ] Port Physics logic from Client to Server.
- [ ] Implement Server Simulation Loop (60Hz).
- [ ] Implement Client-Side Prediction (Local) & Interpolation (Remote).
- [ ] Add Power-Up Spawning Logic (Server-side).

## Phase 4: Polish & Persistence
- [ ] Integrate Firebase v9 for Leaderboards.
- [ ] Implement Procedural Audio (Web Audio API).
- [ ] Finalize CSS CRT Overlays.
- [ ] Configure Dockerfile for deployment.
