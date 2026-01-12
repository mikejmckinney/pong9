# Technical Stack & Architectural Constraints

## Core Architecture: Monorepo
* **Structure:** Single repository containing both Client and Server to facilitate shared types and unified CI/CD.
* **Language:** TypeScript (Strict Mode) for both environments to ensure schema validation.

## Frontend (Client)
* **Engine:** **Phaser 3**. Chosen for robust mobile scaling and WebGL support.
* **Build Tool:** Vite (preferred) or Webpack.
* **Assets:** Procedural generation only (Canvas API).
* **Audio:** Web Audio API (Oscillators) for procedural sound effects.

## Backend (Server)
* **Runtime:** Node.js.
* **Framework:** **Colyseus**. Chosen over raw Socket.io for its declarative State Schema and authoritative physics management.
* **Database:** **Firebase v9 (Modular SDK)**. Used strictly for the Leaderboard.
    * *Constraint:* Must use `import { getFirestore } from "firebase/firestore"`, not the namespaced v8 SDK.

## Deployment
* **Client:** GitHub Pages or Netlify (Static).
* **Server:** Docker container running Node.js (Render/Railway/Fly.io).
