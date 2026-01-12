# Domain Rules: Networking & Physics

## 🧠 Server Authority Pattern
The Server is the "Source of Truth". The Client is a renderer.
1.  **Simulation:** Server runs the physics loop at 60Hz.
2.  **Input:** Client sends *intent* (e.g., `{ input: "UP" }`), NOT position.
3.  **State:** Server updates the `GameState` schema and broadcasts deltas.

## 💾 Colyseus Schema Definition
Define state using strict types to prevent hallucination:
```typescript
import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
    @type("number") x: number;
    @type("number") y: number;
}
export class GameState extends Schema {
    @type({ map: Player }) players = new MapSchema<Player>();
    @type("number") ballX: number;
    @type("number") ballY: number;
}
```

## ⚡ Lag Compensation
1. Local Prediction: Client moves the local paddle immediately on input. Reconcile with server state only if deviation > 5px.
2. Interpolation: Client buffers remote entity updates and interpolates (lerp) between snapshots to ensure smooth movement.
3. Matchmaking: Use Room logic to auto-match 2 players. If 1 player is waiting, create room; if room exists with 1 player, join it.

## 🛡️ Power-Up Synchronization
1. Spawn power-ups via Server Event.
2. Server handles collision validation.
3. Durations are managed by server timestamps.
