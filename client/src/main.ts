import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene.ts';

// Game configuration following domain_ui.md specifications
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#1b2853', // Deep Indigo background
  scale: {
    mode: Phaser.Scale.FIT, // MUST use FIT mode per domain_ui.md
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [GameScene],
  // Enable WebGL for PostFX bloom effects
  render: {
    pixelArt: false,
    antialias: true,
  },
};

// Create Phaser game instance
const game = new Phaser.Game(config);

// Handle visibility changes (pause when tab is hidden)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.pause();
  } else {
    game.resume();
  }
});

// Unlock AudioContext on first user interaction (per domain_ui.md audio policy)
const unlockAudio = () => {
  const soundManager = game.sound as Phaser.Sound.WebAudioSoundManager;
  if (soundManager.context && soundManager.context.state === 'suspended') {
    soundManager.context.resume();
  }
};

document.addEventListener('touchstart', unlockAudio, { once: true });
document.addEventListener('click', unlockAudio, { once: true });

export { game };
