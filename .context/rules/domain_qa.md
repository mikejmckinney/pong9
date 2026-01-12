# Domain Rules: Quality Assurance (QA)

## 🧪 Testing Strategy: The Pyramid
1.  **Unit Tests (Jest):** Test individual logic (scoring algorithms, bounding box math).
2.  **Integration Tests (Headless):** Verify Physics/Server loops without rendering.
3.  **E2E Tests:** Minimal verification of flow.

## 🤖 Headless Phaser Testing
* **Environment:** Use `jest`, `jsdom`, and `node-canvas`.
* **Config:** Initialize Phaser in HEADLESS mode.
* **Protocol:** Simulate physics steps (calling `scene.update()`) and assert coordinate changes without requiring a browser window.

## 🔄 CI/CD & Self-Healing
* **Pipeline:** GitHub Actions triggers on push.
* **Rule:** If a test fails, you must analyze the failure log and do not proceed to the next roadmap item until the test passes.
