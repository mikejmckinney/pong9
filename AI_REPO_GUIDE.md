# AI_REPO_GUIDE.md

## What This Repo Does

This is a **mobile-first multiplayer Pong game** with a Retro Synthwave aesthetic. The repository contains AI agent configurations, onboarding prompts, structural conventions, and a working Phaser 3 game client.

**Current Status:** Phase 1 (The Core Loop) - Local prototype implemented. The game client is functional with paddles, ball physics, scoring, touch controls, and Synthwave visuals.

## Tech Stack

- **Language:** TypeScript (Strict Mode) for both client and server
- **Frontend Engine:** Phaser 3.70.0
- **Build Tool:** Vite 7.x
- **Backend Framework:** Node.js + Colyseus (planned for Phase 2)
- **Database:** Firebase v9 Modular SDK (planned for leaderboards)
- **Test Framework:** Jest (planned)
- **Deployment:** 
  - Client: GitHub Pages or Netlify (static)
  - Server: Docker container (Render/Railway/Fly.io)

## Folder Map

```
/
├── client/                # Phaser 3 game client (Phase 1 complete)
│   ├── src/
│   │   ├── main.ts       # Phaser game bootstrap and configuration
│   │   ├── scenes/       # Game scenes
│   │   │   └── GameScene.ts  # Main gameplay scene with Synthwave aesthetic
│   │   ├── objects/      # Game entities
│   │   │   ├── Paddle.ts # Paddle class with procedural generation
│   │   │   └── Ball.ts   # Ball class with procedural generation
│   │   └── input/        # Input handling
│   │       └── TouchInputManager.ts  # Split-screen touch controls
│   ├── index.html        # HTML entry with CRT overlays and orientation detection
│   ├── package.json      # NPM dependencies and scripts
│   ├── tsconfig.json     # TypeScript configuration (strict mode)
│   └── vite.config.ts    # Vite build configuration
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

**Note:** `/server` and `/shared` directories are planned for Phase 2 (Network Plumbing).

## Key Entry Points

**Client Application:**
- `client/src/main.ts` - Phaser game bootstrap and configuration
- `client/src/scenes/GameScene.ts` - Main gameplay scene

**Planned Entry Points (Phase 2+):**
- **Server:** Will be in `/server` directory (Colyseus server initialization)
- **Shared:** Will be in `/shared` directory (TypeScript interfaces)

## Configuration Files

- **Client Configuration:**
  - `client/package.json` - NPM dependencies and scripts
  - `client/tsconfig.json` - TypeScript strict mode configuration
  - `client/vite.config.ts` - Vite build configuration

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

### Run the Game Client

```bash
# Install dependencies
cd client && npm install

# Start development server (hot reload)
npm run dev
```

The game will be available at `http://localhost:3000` (or next available port).

### Build for Production

```bash
cd client && npm run build
```

Output will be in `client/dist/`.

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
- Procedural Audio (Web Audio API) - ✅ Basic implementation done
- CSS CRT Overlays - ✅ Done
- Configure Dockerfile for deployment

## Where to Add Things

- **New Phaser Scenes** → `/client/src/scenes/`
- **Game Objects (Paddle, Ball, etc.)** → `/client/src/objects/`
- **Input Handlers** → `/client/src/input/`
- **Server Game Logic** → `/server/src/rooms/` (Phase 2)
- **Shared Types** → `/shared/` (Phase 2)
- **Tests** → Mirror source structure (`/client/tests/`, `/server/tests/`)
- **Configuration** → Root-level config files or `client/` for client-specific
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
