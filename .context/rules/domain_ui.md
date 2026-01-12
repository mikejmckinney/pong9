# Domain Rules: User Interface & Graphics

## 🎨 Aesthetic Specification: "Synthwave Retro"
You must adhere to this strict color palette and style guide:
* **Background:** `#1b2853` (Deep Indigo) - Prevents OLED smear.
* **Grid/Scanlines:** `#2b2b2b` - Use CSS overlays for CRT effects.
* **Player 1:** `#04c4ca` (Neon Cyan) + PostFX Bloom.
* **Player 2:** `#ff2975` (Hot Pink) + PostFX Bloom.
* **Typography:** Google Font "Press Start 2P".

## 📱 Mobile Engineering Constraints
* **Viewport Scaling:**
    * MUST use `mode: Phaser.Scale.FIT`.
    * MUST use `autoCenter: Phaser.Scale.CENTER_BOTH`.
    * *Reasoning:* Ensures the game maximizes screen real estate without aspect ratio distortion.
* **Input Handling:**
    * **Touch Action:** Apply `touch-action: none` to the canvas container CSS to prevent browser scrolling.
    * **Controls:** Split-screen invisible touch zones.
        * Left 50% screen tap = Move Up.
        * Right 50% screen tap = Move Down.
        * *Note:* Support Multi-touch points.
* **Orientation:** Force Landscape.
    * Implement a CSS Overlay asking users to "Rotate Device" if `window.innerHeight > window.innerWidth`.

## 🔊 Audio Engineering
* **Policy:** Handle "Autoplay Policy". Unlock AudioContext on the first user interaction (tap).
* **Generation:** Use Oscillators.
    * *Square Wave:* Paddle Hits (Aggressive).
    * *Triangle Wave:* Wall Hits (Soft).
