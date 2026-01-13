# Pong9 - Retro Synthwave Multiplayer Pong

A mobile-first multiplayer Pong game with a Retro Synthwave aesthetic, built with Phaser 3 (client) and Node.js/Colyseus (server).

## 🎮 Project Status

**Current Phase:** Pre-development / Template Setup

This repository is currently in the template configuration phase. The game implementation has not yet begun.

## 🚀 Quick Start

### For AI Agents

1. **Read [`AI_REPO_GUIDE.md`](./AI_REPO_GUIDE.md) first** - Contains comprehensive repository documentation
2. Check [`.context/state/active_task.md`](.context/state/active_task.md) for current phase
3. Read relevant domain rules from [`.context/rules/`](.context/rules/)
4. Follow [`AGENTS.md`](./AGENTS.md) for agent interaction guidelines

### For Human Developers

```bash
# Setup development environment (for Codespaces/VS Code)
bash install.sh

# Verify template structure
bash test.sh
```

## 📁 Repository Structure

```
├── .context/              # Agent memory and architectural rules
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

## 📋 Development Roadmap

See [`.context/roadmap.md`](.context/roadmap.md) for the complete four-phase plan:

1. **Phase 1:** Core Loop (Local Prototype)
2. **Phase 2:** Network Plumbing
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
