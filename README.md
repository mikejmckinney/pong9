# Pong9 - Retro Synthwave Multiplayer Pong

A mobile-first multiplayer Pong game with a Retro Synthwave aesthetic, built with Phaser 3 (client) and Node.js/Colyseus (server).

## 🎮 Project Status

**Current Phase:** ✅ Complete (All 4 Phases)

The game is fully implemented with:
- Server-authoritative physics at 60Hz
- Power-up system with 4 types
- Firebase leaderboard integration
- Docker-ready deployment
- Reconnection handling

## 🚀 Quick Start

### Running the Game

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Start the server
cd server && npm start

# In another terminal, start the client
cd client && npm run dev
```

### Docker Deployment

```bash
# Build and run with Docker
docker build -t pong9 .
docker run -p 2567:2567 pong9

# Or use docker-compose
docker-compose up --build
```

### For AI Agents

1. **Read [`AI_REPO_GUIDE.md`](./AI_REPO_GUIDE.md) first** - Contains comprehensive repository documentation
2. Check [`.context/state/active_task.md`](.context/state/active_task.md) for current phase
3. Read relevant domain rules from [`.context/rules/`](.context/rules/)
4. Follow [`AGENTS.md`](./AGENTS.md) for agent interaction guidelines

## 📁 Repository Structure

```
├── .context/              # Agent memory and architectural rules
│   ├── rules/            # Domain-specific architectural rules
│   ├── state/            # Current project state
│   └── roadmap.md        # Four-phase development plan
├── .github/
│   ├── agents/           # Custom agent definitions
│   ├── prompts/          # Onboarding workflows
│   └── copilot-instructions.md
├── AI_REPO_GUIDE.md      # 📖 Canonical repository guide (read this!)
├── AGENTS.md             # Agent documentation and guidelines
├── install.sh            # Development environment setup
└── test.sh               # Template verification
```

## 🎨 Features (Planned)

- **Mobile-First Design** - Touch controls with landscape orientation
- **Synthwave Aesthetic** - Neon colors (#04c4ca cyan, #ff2975 pink) with bloom effects
- **Multiplayer Networking** - Authoritative server with client-side prediction
- **Procedural Assets** - Canvas-based graphics, Web Audio API sounds
- **Leaderboard** - Firebase v9 integration

## 🛠️ Tech Stack

- **Frontend:** Phaser 3, TypeScript, Vite
- **Backend:** Node.js, Colyseus
- **Database:** Firebase v9 (Modular SDK)
- **Testing:** Jest (planned)

### Dependency Version Notes

The following package versions are pinned in `package.json` overrides for compatibility:

| Package | Version | Reason |
|---------|---------|--------|
| `@colyseus/core` | 0.16.20 | Required for compatibility with `@colyseus/ws-transport` and stable schema serialization. Later versions (0.16.24+) introduced breaking changes in the transport layer. |
| `nanoid` | ^2.1.11 | Required for compatibility with Colyseus internal dependencies which expect CommonJS exports. nanoid v3+ uses ESM-only exports which cause issues with the server build. |

**Note:** These version pins are documented here per PR review suggestion to ensure future maintainers understand the compatibility requirements. Do not upgrade without testing the full multiplayer flow.

## 📋 Development Roadmap

See [`.context/roadmap.md`](.context/roadmap.md) for the complete four-phase plan:

1. **Phase 1:** The Core Loop (Local Prototype)
2. **Phase 2:** The Network Plumbing
3. **Phase 3:** Authoritative Physics
4. **Phase 4:** Polish & Persistence

## 📚 Documentation

- **[AI_REPO_GUIDE.md](./AI_REPO_GUIDE.md)** - Comprehensive repository guide (start here!)
- **[AGENTS.md](./AGENTS.md)** - Agent interaction guidelines
- **[.context/rules/](.context/rules/)** - Domain-specific architectural rules
  - `_master.md` - Core agent protocol
  - `tech_stack.md` - Technical specifications
  - `domain_ui.md` - UI/graphics requirements
  - `domain_net.md` - Networking patterns
  - `domain_qa.md` - Testing strategy

## 🤖 Working with AI Agents

This repository is designed for efficient collaboration with AI coding agents:

- All agents **must read `AI_REPO_GUIDE.md` first**
- Follow the cognitive protocol in `.context/rules/_master.md`
- Update state in `.context/state/active_task.md` as work progresses
- Maintain `AI_REPO_GUIDE.md` when making structural changes

## 🧪 Testing

```bash
# Verify template structure
bash test.sh
```

Game testing will be added in Phase 1 of the roadmap.

## 🔒 Security

- Never commit secrets or API keys
- Server validates all client input (authoritative pattern)
- Firebase security rules required for leaderboard
- No PII in logs

## 📝 License

[Add your license here]

## 🙏 Acknowledgments

Built with guidance from AI agent onboarding templates and architectural best practices.

---

**Last Updated:** 2026-01-13  
**Maintained By:** mikejmckinney and AI agents
