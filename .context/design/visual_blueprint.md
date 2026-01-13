# Visual Implementation Blueprint

This document serves as the technical specification for implementing the "No External Assets" Synthwave aesthetic in Phaser 3.

The AI agent must use this pattern during **Phase 1: The Core Loop** to establish the visual baseline before adding gameplay logic.

## Key Technical Requirements
1.  **Palette:** Use the hex codes defined in `domain_ui.md`.
2.  **Pipeline:** Must use Phaser's `BloomFX` post-processing pipeline on the main camera to achieve the neon glow.
3.  **Procedural Generation:** Grid lines must be drawn using `Phaser.GameObjects.Graphics`, not loaded as images.

## Reference Implementation (`GameScene.ts`)

Use the following code structure as the starting point for the main game scene's visual setup.

```typescript
// Blueprint for client/src/scenes/GameScene.ts (Visual Setup Only)

import Phaser from 'phaser';

// 1. Define Palette Constants (match values in domain_ui.md)
const COLORS = {
    BG: 0x1b2853,   // Deep Indigo
    GRID: 0x2b2b2b, // Dark gray grid lines (matches domain_ui.md)
    P1: 0x04c4ca,   // Neon Cyan
    P2: 0xff2975,   // Hot Pink
    BALL: 0xffffff  // White (bloom will color it based on surroundings eventually)
};

export default class GameScene extends Phaser.Scene {
    // Reference to the graphics object for drawing the grid
    private gridGraphics!: Phaser.GameObjects.Graphics;

    constructor() {
        super('GameScene');
    }

    create() {
        const { width, height } = this.scale;

        // 2. Set Solid Background Color
        this.cameras.main.setBackgroundColor(COLORS.BG);

        // 3. Implement the "Synthwave Glow" Pipeline (CRITICAL)
        // We add a Bloom effect to the entire camera view.
        // Ensure your Phaser config enables PostFX support.
        const bloom = this.cameras.main.postFX.addBloom();

        // Tweak these values during development to match the visual target concept.
        bloom.setStrength(1.5); // Intensity of the glow
        bloom.blurStrength = 2;       // Spread of the glow

        // 4. Generate the Procedural Grid underneath everything
        this.createProceduralGrid(width, height);

        // 5. Create Placeholder Entities (to verify the glow effect works)
        // Player 1 Paddle (Left - Cyan)
        this.add.rectangle(50, height / 2, 20, 100, COLORS.P1);
        // Player 2 Paddle (Right - Pink)
        this.add.rectangle(width - 50, height / 2, 20, 100, COLORS.P2);
        // Ball (Center - White)
        this.add.rectangle(width / 2, height / 2 - 50, 20, 20, COLORS.BALL);
    }

    /**
     * Draws a retro perspective grid using standard Canvas line operations.
     */
    createProceduralGrid(width: number, height: number) {
        this.gridGraphics = this.add.graphics();
        // Line Style: Thickness, Color, Alpha
        this.gridGraphics.lineStyle(2, COLORS.GRID, 0.5);

        const horizonY = height * 0.4; // Horizon line is at 40% screen height
        const centerX = width / 2;

        // A. Draw Perspective Lines (Fanning out from the horizon center)
        // We draw lines extending off-screen to ensure coverage at all resolutions.
        for (let i = -width; i < width * 2; i += 100) {
             this.gridGraphics.moveTo(centerX, horizonY);
             this.gridGraphics.lineTo(i, height);
        }
        // Commit the drawn lines to the canvas
        this.gridGraphics.strokePath();

        // B. Draw Horizontal Lines (Floor markers)
        // Reference implementation uses simple fixed spacing for clarity and ease of replication.
        // More advanced perspective illusions (e.g., non-linear spacing) can be added as a future enhancement.
        for (let y = horizonY; y < height; y += 40) {
            this.gridGraphics.moveTo(0, y);
            this.gridGraphics.lineTo(width, y);
        }
        // Commit the drawn lines
        this.gridGraphics.strokePath();
    }
}
```
