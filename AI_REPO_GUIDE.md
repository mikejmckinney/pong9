# AI_REPO_GUIDE.md

## What This Repo Does

This is a **template repository** for building a mobile-first multiplayer Pong game with a Retro Synthwave aesthetic. The repository provides AI agent configurations, onboarding prompts, and structural conventions to facilitate rapid development of a Phaser 3 (client) + Node.js/Colyseus (server) game architecture.

**Current Status:** Pre-development template phase. The repository contains agent instructions, style guides, and architectural documentation but no actual game implementation yet.

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

**Note:** `/client`, `/server`, and `/shared` directories are planned but not yet created.

## Key Entry Points

**Current State:** This is a template repository. No main application entry points exist yet.

**Planned Entry Points:**
- **Client:** Will be in `/client` directory (Phaser 3 bootstrap)
- **Server:** Will be in `/server` directory (Colyseus server initialization)
- **Shared:** Will be in `/shared` directory (TypeScript interfaces)

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

### Verify Template Structure

```bash
# Run template verification
bash test.sh
```

Expected output: All required files should exist and pass validation checks.

**Note:** No client/server applications exist yet to run. This repository is in the template/setup phase.

## How to Test

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

**Note:** Project structure not yet created. When implemented:

- **New UI Components** → `/client/src/scenes/` (Phaser scenes)
- **Client Input Logic** → `/client/src/input/` 
- **Server Game Logic** → `/server/src/rooms/` (Colyseus rooms)
- **Shared Types** → `/shared/` (TypeScript interfaces)
- **Tests** → Mirror source structure (`/client/tests/`, `/server/tests/`)
- **Configuration** → Root-level config files
- **Agent Instructions** → `.context/rules/` or `.github/agents/`

## Known Risks/Gotchas

### Template-Specific

1. **AI_REPO_GUIDE.md must exist** - Agents require this file. If missing or stale, follow `.github/prompts/repo-onboarding.md` to create it.

2. **copilot-instructions.md is generic** - It currently has placeholder content. Run copilot-onboarding after creating this guide.

3. **No actual codebase yet** - This is a template repository with instructions but no game implementation.

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

### Copilot Instructions Seem Generic

**Problem:** `.github/copilot-instructions.md` doesn't have repo-specific details

**Solution:** Follow `.github/prompts/copilot-onboarding.md` to update it with specific commands and conventions after AI_REPO_GUIDE.md is created and accurate.

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

**Last Updated:** 2026-01-13 (Initial creation during onboarding)
**Maintained By:** AI agents and human developers
**Update Frequency:** Any PR that changes commands, structure, conventions, or troubleshooting should update this file
