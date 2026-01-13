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

// Unlock audio context on first user interaction
let audioUnlocked = false;
const unlockAudio = () => {
    if (!audioUnlocked) {
        // This will be used in Phase 4 for Web Audio API
        audioUnlocked = true;
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('click', unlockAudio);
    }
};

document.addEventListener('touchstart', unlockAudio);
document.addEventListener('click', unlockAudio);
