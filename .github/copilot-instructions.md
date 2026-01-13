## Required Context

- Always read `/AI_REPO_GUIDE.md` first - it contains comprehensive repository documentation
- If `AI_REPO_GUIDE.md` is missing or stale: follow `.github/prompts/repo-onboarding.md` and update it in the same PR
- Check `.context/state/active_task.md` for current phase and active work
- Read relevant domain rules from `.context/rules/` before making changes in that domain

## Project Overview

**Pong9** is a mobile-first multiplayer Pong game with a Retro Synthwave aesthetic. Currently in the pre-development/template phase with architectural documentation in place but no game implementation yet.

### Tech Stack
- **Language:** TypeScript (Strict Mode) - planned for both client and server
- **Frontend:** Phaser 3 - mobile-optimized game engine (planned)
- **Backend:** Node.js + Colyseus - authoritative server framework (planned)
- **Database:** Firebase v9 (Modular SDK) - for leaderboards (planned)
- **Build Tool:** Vite or Webpack (planned)
- **Test Framework:** Jest with headless Phaser support (planned)

## Quick Commands

### Setup
```bash
# Set up development environment (Codespaces/VS Code)
bash install.sh
```

### Verify Template
```bash
# Run template structure verification
bash test.sh
```

Expected: All checks pass (21 passed, 0 warnings, 0 failed)

### Build/Test (Not Yet Implemented)
The actual game client and server are not yet implemented. When they are:
- Build will likely be: `npm run build` or `vite build`
- Tests will likely be: `npm test` or `jest`

## Project Structure

```
├── .context/              # Agent memory and architectural rules
│   ├── rules/            # Domain-specific rules (_master.md, tech_stack.md, domain_*.md)
│   ├── state/            # Current project state (active_task.md)
│   └── roadmap.md        # Four-phase development plan
├── .cursor/              # Cursor IDE configuration
├── .gemini/              # Gemini Code Assist configuration
├── .github/
│   ├── agents/           # Custom agent definitions (judge.agent.md)
│   ├── prompts/          # Onboarding workflows
│   └── copilot-instructions.md (this file)
├── AI_REPO_GUIDE.md      # Canonical repository guide
├── AGENTS.md             # Agent documentation
├── README.md             # Project readme
├── install.sh            # Development environment setup
└── test.sh               # Template verification
```

**Planned Structure (Not Yet Created):**
- `/client` - Phaser 3 frontend
- `/server` - Colyseus backend
- `/shared` - Shared TypeScript interfaces

## Key Files

| File | Purpose |
|------|---------|
| `AI_REPO_GUIDE.md` | Comprehensive repository guide - READ THIS FIRST |
| `AGENTS.md` | Agent interaction guidelines and quality requirements |
| `.context/rules/_master.md` | Core agent protocol and cognitive loop |
| `.context/state/active_task.md` | Current phase and active work tracking |
| `.context/roadmap.md` | Four-phase development roadmap |
| `test.sh` | Template verification script |
| `install.sh` | Development environment setup script |

## Conventions

### Agent Cognitive Protocol (Mandatory)

Every interaction must follow this loop:
1. **READ STATE:** Check `.context/state/active_task.md`
2. **LOAD RULES:** Read relevant `.context/rules/` file for the domain
3. **PLAN:** Propose step-by-step implementation plan
4. **EXECUTE:** Write atomic, modular code
5. **SUGGEST STATE UPDATE:** Propose updates to active_task.md

### Code Style (Planned)
- **TypeScript Strict Mode** for type safety
- **No placeholder logic** - all code must be complete and working
- **No external assets** - use Canvas API for procedural generation
- **Mobile-first** - touch controls as primary input
- **Atomic commits** - small, focused changes

### Architectural Patterns
- **Server Authority:** Server is source of truth, client is renderer
- **Monorepo:** Single repository for client + server with shared types
- **Synthwave Aesthetic:** Specific color palette (#04c4ca cyan, #ff2975 pink, #1b2853 background)

### Commit Message Format
- Use clear, descriptive commit messages
- Reference phase/task when applicable
- Update `.context/state/active_task.md` as work progresses

## Common Gotchas

### Template Phase
1. **No codebase yet** - This is a template repository. Client/server directories don't exist yet.
2. **AI_REPO_GUIDE.md is required** - Agents must read this file first. It contains comprehensive repository documentation.
3. **test.sh expects specific files** - Don't remove template files without updating the test script.
4. **Multiple agent configurations** - Different tools (.cursor, .gemini, .github) have their own config files.

### Architectural (When Implemented)
1. **Firebase v9 only** - Must use modular SDK: `import { getFirestore }` not v8 namespaced
2. **Mobile autoplay policy** - Audio context requires user interaction to unlock
3. **Touch-action CSS required** - Must set `touch-action: none` on canvas to prevent scrolling
4. **Server validates everything** - Never trust client position data
5. **Colyseus schema types** - Must use `@type()` decorators for state synchronization
6. **Landscape orientation** - Implement CSS overlay for portrait mode

### State Management
1. **Read active_task.md first** - Always check current phase before starting work
2. **Update AI_REPO_GUIDE.md** - Keep it current when commands/structure/conventions change
3. **Follow the roadmap** - Development follows four phases in `.context/roadmap.md`

## Before Submitting Changes

Always verify:
1. [ ] Template structure passes: `bash test.sh`
2. [ ] All required files exist and have proper structure
3. [ ] If you changed commands/structure/conventions: update `AI_REPO_GUIDE.md`
4. [ ] If in active development phase: appropriate domain rules were followed
5. [ ] `.context/state/active_task.md` is updated with current status

### When Game Code Exists (Future)
1. [ ] Tests pass: (command TBD when implemented)
2. [ ] Linting passes: (command TBD when implemented)
3. [ ] Build succeeds: (command TBD when implemented)

## Development Workflow

### Current Phase: Template Setup
1. Read `AI_REPO_GUIDE.md` thoroughly
2. Verify template with `bash test.sh`
3. Ready for Phase 1 implementation (see `.context/roadmap.md`)

### Future Phases
Follow the four-phase roadmap:
1. **Phase 1:** The Core Loop (Phaser setup, physics, graphics, mobile controls)
2. **Phase 2:** The Network Plumbing (Colyseus server, room connection)
3. **Phase 3:** Authoritative Physics (server simulation, prediction, interpolation)
4. **Phase 4:** Polish & Persistence (Firebase, audio, deployment)

## Quality Bar

- **Don't guess** - Verify APIs/behavior in repo files
- **Cite sources** - Reference specific files when making decisions
- **Run verification** - Use commands from AI_REPO_GUIDE.md
- **Maintain docs** - Update AI_REPO_GUIDE.md when structure changes
- **Follow domain rules** - Read `.context/rules/` for domain-specific guidance
- **No secrets** - Never commit API keys or sensitive data
- **No PII in logs** - Follow security guidelines

---

**Last Updated:** 2026-01-13 (Onboarding completion)
**Status:** Template setup complete, ready for Phase 1 implementation
