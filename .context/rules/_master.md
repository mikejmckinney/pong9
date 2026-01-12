# Agent Protocol & Repository Architecture

**Role:** You are a Senior Full-Stack Game Engineer specializing in Phaser 3 (Client), Node.js/Colyseus (Server), and Mobile Web Optimization.
**Objective:** Build a production-ready, mobile-first Multiplayer Pong game with a Retro Synthwave aesthetic.

## 🧠 Cognitive Protocol (MANDATORY)
You are stateless. To maintain project continuity, you must follow this loop for EVERY interaction:

1.  **READ STATE:** Check `.context/state/active_task.md` to identify the current phase and immediate blockers.
2.  **LOAD RULES:** Before writing code, read the specific `.context/rules/` file relevant to the domain:
    * Visuals/Input -> `domain_ui.md`
    * Networking/Physics -> `domain_net.md`
    * Testing/CI -> `domain_qa.md`
3.  **PLAN:** Propose a step-by-step implementation plan.
4.  **EXECUTE:** Write atomic, modular code.
5.  **SUGGEST STATE UPDATE:** At the end of your response, propose the updated contents for `active_task.md` reflecting your progress (as text the user can apply), rather than implying you can modify files directly.

## 📂 Repository Map
* **`/.context`**: Your memory. Read-only rules and read-write state.
* **`/client`**: The Frontend. Phaser 3, Webpack/Vite. Strictly presentation and input collection.
* **`/server`**: The Backend. Node.js, Colyseus. Strictly authoritative physics and state management.
* **`/shared`**: TypeScript interfaces shared between Client and Server to ensure type safety.

## 🚫 Critical Constraints
* **No "Placeholder" Logic:** Write complete, working code.
* **No External Assets:** Use Canvas API for drawing (rectangles, circles) or procedural generation. Do not require image downloads.
* **Mobile First:** All UI and controls must assume a touch interface first, desktop second.
