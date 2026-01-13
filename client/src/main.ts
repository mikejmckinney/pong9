import Phaser from 'phaser';
import config from './config/gameConfig';

// Check orientation and show/hide rotate overlay
function checkOrientation() {
    const overlay = document.getElementById('rotate-overlay');
    if (overlay) {
        if (window.innerHeight > window.innerWidth) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
}

// Initialize orientation check
checkOrientation();
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);

// Initialize Phaser game
new Phaser.Game(config);

// TODO: Phase 4 - Unlock audio context on first user interaction for Web Audio API
// This placeholder will be implemented when adding procedural audio effects
// The audioUnlocked flag and unlockAudio function will initialize the Web Audio API context
// to comply with browser autoplay policies that require user interaction before playing audio.
