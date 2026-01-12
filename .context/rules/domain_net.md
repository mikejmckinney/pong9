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
