# Pong9 - Retro Synthwave Multiplayer Pong

A mobile-first multiplayer Pong game with a Retro Synthwave aesthetic, built with Phaser 3 (client) and Node.js/Colyseus (server).

## 🎮 Project Status

**Current Phase:** Phase 2 - The Network Plumbing 🚧 (Phase 1 complete)

The game client is fully functional with:
- ✅ Phaser 3 game engine with TypeScript
- ✅ Synthwave retro aesthetic with neon glow effects
- ✅ Two-player local gameplay with touch controls
- ✅ Mobile-first responsive design
- ✅ Procedural graphics (no external assets)
- 🚧 Online multiplayer via Colyseus with server-authoritative paddle/ball simulation and scoring (falls back to local play when offline)

**Play it now:** See "Quick Start" below to run the game locally!

## 🚀 Quick Start

### Play the Game (Phase 1 Complete!)

```bash
# Clone the repository
git clone https://github.com/mikejmckinney/pong9.git
cd pong9/client

# Install dependencies
npm install

# Run the game
npm run dev
```

Then open http://localhost:3000 in your browser!

**Controls:**
- Touch the **left half** of the screen to control the **cyan paddle** (Player 1)
- Touch the **right half** of the screen to control the **pink paddle** (Player 2)
- Touch **upper half** to move **up**, **lower half** to move **down**

### Run the Colyseus server (Phase 2 online play)

```bash
cd server
npm install
npm run dev   # starts on ws://localhost:2567
```

The client auto-connects to `ws://<host>:2567` by default. Override with `VITE_COLYSEUS_ENDPOINT` if the server runs elsewhere; if unreachable, the game continues in local/offline mode.

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

# Build for production
cd client && npm run build
```

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

## 🎨 Features (Planned / In Progress)

**Phase 1 - ✅ COMPLETE:**
- ✅ **Mobile-First Design** - Touch controls with landscape orientation
- ✅ **Synthwave Aesthetic** - Neon colors (#04c4ca cyan, #ff2975 pink) with bloom effects
- ✅ **Procedural Assets** - Canvas-based graphics, no external images
- ✅ **Local Two-Player** - Split-screen touch zones for simultaneous control
- ✅ **Responsive Scaling** - Phaser.Scale.FIT for any screen size

**Phases 2-4 - Planned/In Progress:**
- **Multiplayer Networking (in progress)** - Authoritative server with paddle/ball simulation; client-side prediction/reconciliation still to come
- **Leaderboard** - Firebase v9 integration
- **Procedural Audio** - Web Audio API sounds

## 🛠️ Tech Stack

- **Frontend:** Phaser 3, TypeScript, Vite
- **Backend:** Node.js, Colyseus
- **Database:** Firebase v9 (Modular SDK)
- **Testing:** Jest (planned)

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

**Last Updated:** 2026-01-14  
**Maintained By:** mikejmckinney and AI agents
