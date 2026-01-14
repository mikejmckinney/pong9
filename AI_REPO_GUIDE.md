# AI_REPO_GUIDE.md

## What This Repo Does

This is a **mobile-first multiplayer Pong game** with a Retro Synthwave aesthetic. The repository contains a complete monorepo with a Phaser 3 game client, Colyseus multiplayer server, and shared TypeScript types.

**Current Status:** Phase 3 (Authoritative Physics) - Complete. The server runs authoritative physics at 60Hz. Ball movement, paddle collisions, wall collisions, and scoring are all server-controlled. The client uses interpolation for smooth rendering and local prediction for responsive paddle control.

## Tech Stack

- **Language:** TypeScript (Strict Mode) for both client and server
- **Frontend Engine:** Phaser 3.70.0
- **Build Tool:** Vite 7.x (client), TSC (server)
- **Backend Framework:** Node.js + Colyseus 0.16.5 (@colyseus/core 0.16.20)
- **Database:** Firebase v9 Modular SDK (planned for leaderboards)
- **Test Framework:** Jest (planned)
- **Monorepo:** npm workspaces
- **Deployment:** 
  - Client: GitHub Pages or Netlify (static)
  - Server: Docker container (Render/Railway/Fly.io)

## Folder Map

```
/
├── package.json           # Root workspace configuration
├── .gitignore            # Global gitignore for monorepo
├── client/                # Phaser 3 game client (Phase 1 complete, Phase 2 in progress)
│   ├── src/
│   │   ├── main.ts       # Phaser game bootstrap and configuration
│   │   ├── scenes/       # Game scenes
│   │   │   ├── LobbyScene.ts   # Multiplayer connection and waiting state
│   │   │   └── GameScene.ts    # Main gameplay scene with Synthwave aesthetic
│   │   ├── objects/      # Game entities
│   │   │   ├── Paddle.ts # Paddle class with procedural generation
│   │   │   └── Ball.ts   # Ball class with procedural generation
│   │   ├── input/        # Input handling
│   │   │   └── TouchInputManager.ts  # Split-screen touch controls
│   │   └── network/      # Network layer
│   │       └── NetworkManager.ts     # Colyseus client wrapper
│   ├── index.html        # HTML entry with CRT overlays and orientation detection
│   ├── package.json      # NPM dependencies and scripts
│   ├── tsconfig.json     # TypeScript configuration (strict mode)
│   └── vite.config.ts    # Vite build configuration
├── server/                # Colyseus multiplayer server (Phase 2)
│   ├── src/
│   │   ├── main.ts       # Server entry point
│   │   ├── rooms/        # Game room implementations
│   │   │   └── GameRoom.ts   # Main game room with player matching
│   │   └── schemas/      # Colyseus state schemas
│   │       ├── GameState.ts  # Game state with ball, scores, phase
│   │       └── Player.ts     # Player state with position
│   ├── package.json      # Server dependencies
│   └── tsconfig.json     # Server TypeScript configuration
├── shared/                # Shared TypeScript types and constants
│   ├── constants.ts      # Game constants (dimensions, speeds, etc.)
│   ├── interfaces.ts     # Message types and interfaces
│   ├── index.ts          # Module exports
│   ├── package.json      # Shared package configuration
│   └── tsconfig.json     # Shared TypeScript configuration
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
├── AGENTS.md             # Canonical agent documentation (primary reference)
├── AGENT.md              # Deprecated, redirects to AGENTS.md
├── install.sh            # Codespace setup script (VS Code extensions + prompts)
└── test.sh               # Template verification script
```

## Key Entry Points

**Client Application:**
- `client/src/main.ts` - Phaser game bootstrap and configuration
- `client/src/scenes/LobbyScene.ts` - Multiplayer connection UI
- `client/src/scenes/GameScene.ts` - Main gameplay scene

**Server Application:**
- `server/src/main.ts` - Colyseus server initialization
- `server/src/rooms/GameRoom.ts` - Game room with player matching and game loop

**Shared Types:**
- `shared/constants.ts` - Game constants (dimensions, speeds)
- `shared/interfaces.ts` - Message types for client-server communication

## Configuration Files

- **Root Configuration:**
  - `package.json` - npm workspaces configuration
  - `.gitignore` - Global gitignore for monorepo

- **Client Configuration:**
  - `client/package.json` - NPM dependencies and scripts
  - `client/tsconfig.json` - TypeScript strict mode configuration
  - `client/vite.config.ts` - Vite build configuration

- **Server Configuration:**
  - `server/package.json` - Server dependencies (Colyseus)
  - `server/tsconfig.json` - Server TypeScript configuration

- **Shared Configuration:**
  - `shared/package.json` - Shared package for npm workspaces
  - `shared/tsconfig.json` - Shared TypeScript configuration

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
# Install all workspace dependencies from root
npm install

# Or run the installation script (for Codespaces/VS Code)
bash install.sh
```

### Run the Game Client (Local Play)

```bash
# Start client development server (hot reload)
cd client && npm run dev
```

The game will be available at `http://localhost:3000` (or next available port).

### Run the Multiplayer Server

```bash
# Build shared types first
npm run build:shared

# Build and start the server
cd server && npm run build && npm start
```

The server will be available at `ws://localhost:2567`.

### Run Both for Multiplayer Testing

In two terminals:

```bash
# Terminal 1: Start server
cd server && npm run dev

# Terminal 2: Start client
cd client && npm run dev
```

Open two browser windows at `http://localhost:3000` to test multiplayer.

### Build for Production

```bash
# Build all packages
npm run build

# Or build individually:
npm run build:shared   # Build shared types
npm run build:server   # Build server
npm run build:client   # Build client
```

Client output will be in `client/dist/`.
Server output will be in `server/dist/`.

### Verify Template Structure

```bash
# Run template verification
bash test.sh
```

Expected output: All required files should exist and pass validation checks.

## How to Test

```bash
# Verify template structure and file integrity
bash test.sh

# Build the client (TypeScript compilation check)
cd client && npm run build
```

The test script checks for:
- Required files (AI_REPO_GUIDE.md, AGENTS.md, prompts, etc.)
- File content validation (proper references, shebangs)
- Script syntax validation
- Markdown structure

**Expected Result:** Test should pass with all checks green, possibly with warnings.

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

**Phase 1:** The Core Loop (Local Prototype) ✅ **COMPLETE**
- ✅ Setup Phaser 3 + TypeScript + Vite
- ✅ Implement Paddle/Ball Physics (Arcade Physics)
- ✅ Implement Synthwave Graphics (PostFX Bloom, procedural grid)
- ✅ Implement Mobile Scale Manager (FIT mode) and Touch Inputs

**Phase 2:** The Network Plumbing ✅ **COMPLETE**
- ✅ Setup npm workspaces monorepo structure
- ✅ Create shared package with TypeScript interfaces and constants
- ✅ Setup Node.js + Colyseus Server
- ✅ Define GameState and Player Schemas with @type() decorators
- ✅ Implement GameRoom with "Waiting for Player" state
- ✅ Create NetworkManager for client-side Colyseus connection
- ✅ Add LobbyScene for multiplayer connection flow
- ✅ Message passing (Ping/Pong) implemented

**Phase 3:** Authoritative Physics ✅ **COMPLETE**
- ✅ Port Physics to Server (ball movement, collision, scoring)
- ✅ Implement Server Simulation Loop (60Hz with drift compensation)
- ✅ Client-Side Prediction for local paddle
- ✅ Interpolation for remote paddle and ball
- ⏳ Power-Up Spawning Logic (deferred to Phase 4)

**Phase 4:** Polish & Persistence
- Integrate Firebase v9 for Leaderboards
- Add Power-Up System (server-side)
- Procedural Audio (Web Audio API) - ✅ Basic implementation done
- CSS CRT Overlays - ✅ Done
- Configure Dockerfile for deployment

## Where to Add Things

- **New Phaser Scenes** → `/client/src/scenes/`
- **Game Objects (Paddle, Ball, etc.)** → `/client/src/objects/`
- **Input Handlers** → `/client/src/input/`
- **Network Client Code** → `/client/src/network/`
- **Server Game Logic** → `/server/src/rooms/`
- **Server Schemas** → `/server/src/schemas/`
- **Shared Types** → `/shared/`
- **Tests** → Mirror source structure (`/client/tests/`, `/server/tests/`)
- **Configuration** → Root-level config files or workspace-specific
- **Agent Instructions** → `.context/rules/` or `.github/agents/`

## Known Risks/Gotchas

### Client-Specific

1. **Phaser PostFX Bloom** - Use direct property assignment (`bloom.strength = 1.5`), not setter methods.

2. **Audio context requires user interaction** - AudioContext is unlocked on first tap/click per mobile autoplay policy.

3. **Touch-action CSS required** - `touch-action: none` is applied to prevent browser scrolling during gameplay.

4. **Landscape orientation enforced** - CSS overlay prompts users to rotate device if in portrait mode.

### Template-Specific

1. **AI_REPO_GUIDE.md must exist** - Agents require this file. If missing or stale, follow `.github/prompts/repo-onboarding.md` to create it.

2. **copilot-instructions.md is configured** - This repo uses repository-specific Copilot instructions in `.github/copilot-instructions.md`. If those instructions become stale after major workflow or structure changes, refresh them using `.github/prompts/copilot-onboarding.md` once this guide is up to date.

3. **test.sh expects specific files** - Adding/removing template files requires updating the test script.

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

**Last Updated:** 2026-01-13
**Maintained By:** AI agents and human developers
**Update Frequency:** Any PR that changes commands, structure, conventions, or troubleshooting should update this file
