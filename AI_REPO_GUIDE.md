# AI_REPO_GUIDE.md

## What This Repo Does

This is a mobile-first multiplayer Pong game with a Retro Synthwave aesthetic, built with Phaser 3 (client) and Node.js/Colyseus (server). The repository provides AI agent configurations, onboarding prompts, and structural conventions to facilitate rapid development.

**Current Status:** Phase 1 - The Core Loop (Local Prototype) implementation complete. Phase 2 networking is wrapping up with a Colyseus server, shared schemas, and server-authoritative paddle + ball simulation (scoring, serve timing). The client connects automatically, mirrors paddle/ball/score from the server with ping/pong health checks, and falls back to local play when offline or waiting for a peer.

## Tech Stack

- **Language:** TypeScript (Strict Mode) planned for both client and server
- **Frontend Engine:** Phaser 3 (planned)
- **Backend Framework:** Node.js + Colyseus (planned)
- **Database:** Firebase v9 Modular SDK (planned for leaderboards)
- **Build Tool:** Vite or Webpack (planned)
- **Test Framework:** Jest (planned)
- **Deployment:** 
  - Client: GitHub Pages or Netlify (static)
  - Server: Docker container (Render/Railway/Fly.io)

## Folder Map

```
/
├── .context/              # Agent memory and state tracking
│   ├── rules/            # Domain-specific architectural rules
│   │   ├── _master.md   # Core agent protocol and repository map
│   │   ├── tech_stack.md # Technical stack specifications
│   │   ├── domain_ui.md  # UI/graphics specifications (Synthwave aesthetic)
│   │   ├── domain_net.md # Networking and physics patterns
│   │   └── domain_qa.md  # Testing strategy and QA requirements
│   ├── design/           # Visual and architectural design specifications
│   │   ├── architecture.md      # Mermaid diagrams for system architecture
│   │   └── visual_blueprint.md  # Phaser 3 Synthwave reference implementation
│   ├── state/            # Current project state
│   │   └── active_task.md # Tracks current phase and active work
│   └── roadmap.md        # Four-phase development plan
├── .cursor/              # Cursor IDE agent configuration
│   └── BUGBOT.md         # Bug fixing agent instructions
├── .gemini/              # Gemini Code Assist configuration
│   └── styleguide.md     # PR review style guide for merge gate
├── .github/
│   ├── agents/           # Custom agent definitions
│   │   └── judge.agent.md # Plan-gate and diff-gate reviewer agent
│   ├── prompts/          # Onboarding prompt templates
│   │   ├── repo-onboarding.md    # General repository onboarding workflow
│   │   └── copilot-onboarding.md # Copilot-specific setup instructions
│   └── copilot-instructions.md   # GitHub Copilot agent instructions
├── client/               # Phaser 3 frontend (Phase 1 complete)
│   ├── src/
│   │   ├── config/      # Game configuration and constants
│   │   ├── objects/     # Game objects (Paddle, Ball)
│   │   ├── scenes/      # Phaser scenes (GameScene)
│   │   └── main.ts      # Entry point
│   ├── index.html       # HTML entry with mobile viewport
│   ├── package.json     # Client dependencies
│   ├── tsconfig.json    # TypeScript configuration
│   └── vite.config.ts   # Vite build configuration
├── server/               # Node.js + Colyseus backend (Phase 2 networking, authoritative paddle/ball simulation)
├── shared/               # Shared TypeScript interfaces (network state, constants, schemas)
├── AGENTS.md             # Canonical agent documentation (primary reference)
├── AGENT.md              # Deprecated, redirects to AGENTS.md
├── install.sh            # Codespace setup script (VS Code extensions + prompts)
└── test.sh               # Template verification script
```

## Key Entry Points

**Client (Phase 1 - Complete):**
- **Main Entry:** `/client/src/main.ts` - Phaser game initialization, orientation check, audio context unlock
- **Game Configuration:** `/client/src/config/gameConfig.ts` - Phaser config with scale settings
- **Game Scene:** `/client/src/scenes/GameScene.ts` - Main gameplay scene with visuals and physics
- **HTML Entry:** `/client/index.html` - Mobile-optimized HTML with landscape enforcement

**Server (Phase 2 - Networking):**
- **Server Entry:** `/server/src/index.ts` - Colyseus server bootstrap (WS transport, room registration)
- **Room Logic:** `/server/src/rooms/PongRoom.ts` - Authoritative paddle/ball simulation, scoring, serve timing

**Shared (Network Types):**
- **State Schemas:** `/shared/GameState.ts` - Colyseus schemas for players/ball/game phase
- **Constants:** `/shared/constants.ts` - Shared dimensions, speeds, serve angles
- **Messages/Utils:** `/shared/messages.ts`, `/shared/playerUtils.ts`

## Configuration Files

- **Agent Configuration:**
  - `.github/copilot-instructions.md` - GitHub Copilot agent instructions
  - `AGENTS.md` - Canonical agent documentation
  - `.context/rules/_master.md` - Core agent protocol
  
- **Build/Test Configuration:** 
  - `test.sh` - Template verification script
  - `install.sh` - Development environment setup script

- **CI/CD:** Not yet configured (planned: GitHub Actions)

## How to Run Locally

### Setup Development Environment

```bash
# Run the installation script (for Codespaces/VS Code)
bash install.sh
```

This script:
- Installs VS Code extensions (Cline, Live Server, Prettier, Live Share)
- Copies AI prompts to `.github/prompts/`
- Sets up the development workspace

### Run the Client (Phase 1)

```bash
# Navigate to client directory
cd client

# Install dependencies (first time only)
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server runs on `http://localhost:3000`. Open in a browser to play the game.

**Mobile Testing:** For best experience, test on an actual mobile device in landscape mode or use browser DevTools device emulation.

### Run the Server (Phase 2 scaffolding)

```bash
cd server
npm install
npm run dev # defaults to ws://localhost:2567
```

The client auto-connects to `ws://<host>:2567`. Override with `VITE_COLYSEUS_ENDPOINT` when pointing at a remote Colyseus host.

### Verify Template Structure

```bash
# Run template verification
bash test.sh
```

Expected output: All required files should exist and pass validation checks.

## How to Test

### Template Verification

```bash
# Verify template structure and file integrity
bash test.sh
```

The test script checks for:
- Required files (AI_REPO_GUIDE.md, AGENTS.md, prompts, etc.)
- File content validation (proper references, shebangs)
- Script syntax validation
- Markdown structure

**Expected Result:** Test should pass with all checks green, possibly with warnings.

### Client Testing (Phase 1)

```bash
# Build the client to check for TypeScript errors
cd client
npm run build
```

**Expected Result:** Build should succeed without errors.

**Manual Testing:**
1. Run `npm run dev` to start the development server
2. Open `http://localhost:3000` in a browser
3. Test touch controls:
   - Touch left half of screen to move Player 1 paddle (cyan)
   - Touch right half of screen to move Player 2 paddle (pink)
   - Touch upper half to move up, lower half to move down
4. Verify game mechanics:
   - Ball bounces off paddles and walls
   - Scoring works when ball goes off screen
   - Synthwave visuals with bloom glow effect
   - Landscape orientation enforcement (rotate device message in portrait mode)

## Architectural Conventions

### Agent Protocol (Mandatory for AI Agents)

From `.context/rules/_master.md`, agents must follow this cognitive loop:

1. **READ STATE:** Check `.context/state/active_task.md`
2. **LOAD RULES:** Read relevant domain rules from `.context/rules/`
3. **PLAN:** Propose implementation plan
4. **EXECUTE:** Write atomic, modular code
5. **SUGGEST STATE UPDATE:** Propose updates to active_task.md

### Key Architectural Decisions

**Monorepo Structure:** Single repository for client + server to facilitate shared types

**Server Authority Pattern:** Server is source of truth; client is renderer
- Server runs physics at 60Hz
- Client sends intent (not position)
- Client performs local prediction + interpolation

**Mobile-First Design:**
- Touch controls as primary input
- Phaser Scale.FIT mode for responsive scaling
- Landscape orientation enforced

**Aesthetic:** Synthwave Retro
- Deep indigo background (#1b2853)
- Neon cyan (#04c4ca) and hot pink (#ff2975) for players
- Press Start 2P font
- PostFX bloom effects

### Code Style Conventions

- **TypeScript Strict Mode** for both client and server
- **No placeholder logic** - all code must be complete and working
- **No external assets** - use Canvas API for procedural generation
- **Atomic, modular code** - follow single responsibility principle

### Testing Strategy (Planned)

The "Testing Pyramid" approach:
1. **Unit Tests (Jest)** - Test individual logic
2. **Integration Tests** - Verify physics/server loops (headless)
3. **E2E Tests** - Minimal flow verification

Headless Phaser testing using `jest`, `jsdom`, and `node-canvas`.

## Development Workflow

### For AI Agents

1. **Always read this file first** before making changes
2. Check `.context/state/active_task.md` for current phase
3. Read relevant domain rules from `.context/rules/`
4. Follow the four-phase roadmap in `.context/roadmap.md`
5. Update `AI_REPO_GUIDE.md` if your changes affect:
   - Commands
   - File structure  
   - Conventions
   - Entry points

### For Human Developers

1. Run `bash install.sh` to set up your environment
2. Read `AGENTS.md` for agent interaction guidelines
3. Follow the roadmap in `.context/roadmap.md`
4. Reference domain rules in `.context/rules/` for specific domains

## Project Roadmap

From `.context/roadmap.md`:

**Phase 1:** The Core Loop (Local Prototype)
- Setup Phaser 3 + TypeScript
- Implement Paddle/Ball Physics
- Implement Synthwave Graphics
- Implement Mobile Scale Manager and Touch Inputs

**Phase 2:** The Network Plumbing
- Setup Node.js + Colyseus Server
- Define GameState and Player Schemas
- Implement Room connection
- Verify message passing

**Phase 3:** Authoritative Physics
- Port Physics to Server
- Implement Server Simulation Loop (60Hz)
- Client-Side Prediction & Interpolation
- Power-Up Spawning Logic

**Phase 4:** Polish & Persistence
- Integrate Firebase v9 for Leaderboards
- Procedural Audio (Web Audio API)
- CSS CRT Overlays
- Configure Dockerfile for deployment

## Where to Add Things

**Client (Phase 1 - Active):**
- **New Scenes** → `/client/src/scenes/` (e.g., MenuScene, GameOverScene)
- **New Game Objects** → `/client/src/objects/` (e.g., PowerUp, Particle effects)
- **Client Input Logic** → Add to scenes or create `/client/src/input/`
- **Configuration Changes** → `/client/src/config/constants.ts` or `gameConfig.ts`
- **Styles** → Update `/client/index.html` `<style>` section

**Server (Phases 2-3 - Planned):**
- **Server Game Logic** → `/server/src/rooms/` (Colyseus rooms)
- **Server Configuration** → `/server/src/config/`

**Shared (Phases 2+ - Planned):**
- **Shared Types** → `/shared/` (TypeScript interfaces for network state)

**Testing (Phase 1+ - Planned):**
- **Tests** → Mirror source structure (`/client/tests/`, `/server/tests/`)

**Configuration & Documentation:**
- **Root Config Files** → Project root (package.json, tsconfig.json, etc.)
- **Agent Instructions** → `.context/rules/` or `.github/agents/`
- **Documentation Updates** → This file (`AI_REPO_GUIDE.md`), README.md, AGENTS.md

## Known Risks/Gotchas

### Template-Specific

1. **AI_REPO_GUIDE.md must exist** - Agents require this file. If missing or stale, follow `.github/prompts/repo-onboarding.md` to create it.

2. **copilot-instructions.md is configured** - This repo uses repository-specific Copilot instructions in `.github/copilot-instructions.md`. If those instructions become stale after major workflow or structure changes, refresh them using `.github/prompts/copilot-onboarding.md` once this guide is up to date.

3. **Colyseus endpoint** - Online play requires a running Colyseus server (defaults to `ws://<host>:2567`). Override with `VITE_COLYSEUS_ENDPOINT` when targeting a remote server; client falls back to local play if unreachable.

4. **test.sh expects specific files** - Adding/removing template files requires updating the test script.

### Architectural (Planned)

1. **Firebase v9 Modular SDK Required** - Must use `import { getFirestore }` not v8 namespaced SDK

2. **Mobile Autoplay Policy** - Audio context must be unlocked on first user interaction

3. **Touch Action CSS** - Must apply `touch-action: none` to canvas to prevent scrolling

4. **Colyseus Schema Types** - Must use strict `@type()` decorators to prevent state sync issues

5. **Server Authority** - Never trust client position data; validate all inputs server-side

6. **Landscape Orientation** - Implement CSS overlay for portrait mode with "Rotate Device" message

## Troubleshooting

### Template Verification Fails

**Problem:** `bash test.sh` reports missing files

**Solution:** Ensure all required template files exist:
- AI_REPO_GUIDE.md (this file)
- AGENTS.md
- .github/copilot-instructions.md
- .github/prompts/repo-onboarding.md
- .github/prompts/copilot-onboarding.md
- .github/agents/judge.agent.md
- .context/rules/* files
- install.sh and test.sh

### Install Script Fails

**Problem:** `install.sh` can't find workspace or dotfiles

**Solution:** 
- Set `WORKSPACE` environment variable to your workspace directory
- Set `DOTFILES` to point to this repository
- Or run directly: `WORKSPACE=/path/to/workspace bash install.sh`

### Copilot Instructions Seem Out-of-Date

**Problem:** `.github/copilot-instructions.md` appears inconsistent with this guide or recent repository changes.

**Solution:** This guide (`AI_REPO_GUIDE.md`) is the canonical source of truth. The `.github/copilot-instructions.md` file is a tailored version for editor/agent integrations and must be kept in sync. When commands, structure, or conventions change, update both this file and `.github/copilot-instructions.md` in the same PR. If the Copilot instructions drift or become generic again, re-run the workflow in `.github/prompts/copilot-onboarding.md` to regenerate them after first updating this guide.

### Agent State is Unclear

**Problem:** Not sure what phase the project is in

**Solution:** Check `.context/state/active_task.md` - this tracks the current phase and active work. Update it as you make progress.

## Security Considerations

- **No secrets in code** - Use environment variables for API keys
- **No PII in logs** - Follow `.gemini/styleguide.md` review guidelines
- **Server-side validation** - Never trust client input for game state
- **Firebase security rules** - Must implement proper auth rules for leaderboard writes

## Additional Resources

- **Agent Documentation:** `AGENTS.md` (canonical reference)
- **Onboarding Workflows:** `.github/prompts/` directory
- **Domain Rules:** `.context/rules/` directory
- **Project Status:** `.context/state/active_task.md`
- **Roadmap:** `.context/roadmap.md`

---

**Last Updated:** 2026-01-14
**Maintained By:** AI agents and human developers
**Update Frequency:** Any PR that changes commands, structure, conventions, or troubleshooting should update this file
