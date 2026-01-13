import Phaser from 'phaser';
import { NetworkManager, NetworkCallbacks } from '../network/NetworkManager.ts';
import { COLORS } from './GameScene.ts';

/**
 * LobbyScene handles the multiplayer connection and waiting state
 * Transitions to GameScene once both players are connected
 */
export class LobbyScene extends Phaser.Scene {
  private networkManager!: NetworkManager;
  private statusText!: Phaser.GameObjects.Text;
  private connectButton!: Phaser.GameObjects.Text;
  private isConnecting = false;
  private latencyText!: Phaser.GameObjects.Text;

  constructor() {
    super('LobbyScene');
  }

  create(): void {
    const { width, height } = this.scale;

    // Set background
    this.cameras.main.setBackgroundColor(COLORS.BG);

    // Add bloom effect
    const bloom = this.cameras.main.postFX.addBloom();
    bloom.strength = 1.5;
    bloom.blurStrength = 2;

    // Title
    this.add.text(width / 2, height * 0.2, 'PONG9', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '64px',
      color: '#04c4ca',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height * 0.3, 'MULTIPLAYER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '24px',
      color: '#ff2975',
    }).setOrigin(0.5);

    // Status text
    this.statusText = this.add.text(width / 2, height * 0.5, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Connect button
    this.connectButton = this.add.text(width / 2, height * 0.65, 'TAP TO CONNECT', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#04c4ca',
      backgroundColor: '#2b2b2b',
      padding: { x: 20, y: 10 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Button hover effects
    this.connectButton.on('pointerover', () => {
      this.connectButton.setColor('#ff2975');
    });
    this.connectButton.on('pointerout', () => {
      this.connectButton.setColor('#04c4ca');
    });
    this.connectButton.on('pointerdown', () => this.onConnectClick());

    // Instructions
    this.add.text(width / 2, height * 0.85, 'Left side = P1 | Right side = P2', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#666666',
    }).setOrigin(0.5);

    // Latency display (hidden initially)
    this.latencyText = this.add.text(width - 10, 10, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#04c4ca',
    }).setOrigin(1, 0).setVisible(false);

    // Initialize network manager
    this.initNetworkManager();
  }

  private initNetworkManager(): void {
    // Get server URL from environment or use default
    const serverUrl = this.getServerUrl();
    this.networkManager = new NetworkManager(serverUrl);

    const callbacks: NetworkCallbacks = {
      onConnected: (playerNumber) => {
        this.statusText.setText(`CONNECTED AS PLAYER ${playerNumber}`);
        this.statusText.setColor(playerNumber === 1 ? '#04c4ca' : '#ff2975');
        this.latencyText.setVisible(true);
      },
      onWaiting: () => {
        this.statusText.setText('WAITING FOR OPPONENT...');
        this.connectButton.setVisible(false);
        // Add pulsing animation
        this.tweens.add({
          targets: this.statusText,
          alpha: { from: 1, to: 0.5 },
          duration: 500,
          yoyo: true,
          repeat: -1,
        });
      },
      onGameStart: () => {
        this.statusText.setText('GAME STARTING!');
        this.tweens.killAll();
        this.statusText.setAlpha(1);
        
        // Transition to game scene with network manager
        this.time.delayedCall(1000, () => {
          this.scene.start('GameScene', { networkManager: this.networkManager });
        });
      },
      onGameEnd: (reason) => {
        this.statusText.setText(`GAME ENDED: ${reason}`);
        this.connectButton.setVisible(true);
        this.connectButton.setText('TAP TO RECONNECT');
        this.isConnecting = false;
      },
      onPong: (latency) => {
        this.latencyText.setText(`PING: ${Math.round(latency)}ms`);
      },
      onError: (error) => {
        this.statusText.setText(`ERROR: ${error.message}`);
        this.statusText.setColor('#ff0000');
        this.connectButton.setVisible(true);
        this.connectButton.setText('TAP TO RETRY');
        this.isConnecting = false;
      },
    };

    this.networkManager.setCallbacks(callbacks);
  }

  private getServerUrl(): string {
    // In production, this would come from environment config
    // For local development, use localhost
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'ws://localhost:2567';
    }
    // For deployed environments, assume server is on same host
    return `wss://${hostname}:2567`;
  }

  private async onConnectClick(): Promise<void> {
    if (this.isConnecting) return;

    this.isConnecting = true;
    this.statusText.setText('CONNECTING...');
    this.connectButton.setVisible(false);

    try {
      await this.networkManager.connect();
    } catch {
      // Error handling is done in callbacks
    }
  }
}
