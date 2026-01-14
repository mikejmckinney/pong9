import Phaser from 'phaser';
import { NetworkManager, NetworkCallbacks } from '../network/NetworkManager.ts';
import { COLORS } from './GameScene.ts';
import { LeaderboardEntry } from '@pong9/shared/interfaces';

/**
 * Display constants for leaderboard
 * Fix for: "Add MAX_PLAYER_NAME_DISPLAY_LENGTH constant" - @gemini-code-assist suggestion
 * https://github.com/PR#comment
 */
const MAX_PLAYER_NAME_DISPLAY_LENGTH = 10;

/**
 * Leaderboard rank colors (gold, silver, bronze)
 * Fix for: "Add leaderboard rank colors as constants" - @gemini-code-assist suggestion
 * https://github.com/PR#comment
 */
const LEADERBOARD_COLORS = {
  RANK_1: '#ffff00', // Gold
  RANK_2: '#c0c0c0', // Silver
  RANK_3: '#cd7f32', // Bronze
  DEFAULT: '#ffffff', // White for other ranks
};

/**
 * LobbyScene handles the multiplayer connection and waiting state
 * Transitions to GameScene once both players are connected
 */
export class LobbyScene extends Phaser.Scene {
  private networkManager!: NetworkManager;
  private statusText!: Phaser.GameObjects.Text;
  private connectButton!: Phaser.GameObjects.Text;
  private leaderboardButton!: Phaser.GameObjects.Text;
  private isConnecting = false;
  private latencyText!: Phaser.GameObjects.Text;
  private playerName: string = '';
  private nameInput!: HTMLInputElement;
  private leaderboardContainer!: Phaser.GameObjects.Container;
  private showingLeaderboard = false;

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
    this.add.text(width / 2, height * 0.15, 'PONG9', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '64px',
      color: '#04c4ca',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height * 0.25, 'MULTIPLAYER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '24px',
      color: '#ff2975',
    }).setOrigin(0.5);

    // Name label
    this.add.text(width / 2, height * 0.38, 'ENTER YOUR NAME:', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Create HTML input for name (Phaser doesn't have native text input)
    this.createNameInput(width, height);

    // Status text
    this.statusText = this.add.text(width / 2, height * 0.55, '', {
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

    // Leaderboard button
    this.leaderboardButton = this.add.text(width / 2, height * 0.78, 'LEADERBOARD', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#ffff00',
      backgroundColor: '#2b2b2b',
      padding: { x: 15, y: 8 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.leaderboardButton.on('pointerover', () => {
      this.leaderboardButton.setColor('#ff2975');
    });
    this.leaderboardButton.on('pointerout', () => {
      this.leaderboardButton.setColor('#ffff00');
    });
    this.leaderboardButton.on('pointerdown', () => this.toggleLeaderboard());

    // Instructions
    this.add.text(width / 2, height * 0.9, 'Left side = P1 | Right side = P2', {
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

    // Create leaderboard container (hidden initially)
    this.createLeaderboardContainer(width, height);

    // Initialize network manager
    this.initNetworkManager();

    // Clean up input on scene shutdown
    this.events.on('shutdown', () => {
      if (this.nameInput && this.nameInput.parentNode) {
        this.nameInput.parentNode.removeChild(this.nameInput);
      }
    });
  }

  /**
   * Create name input element with responsive positioning
   * Fix for: "Input positioning scaling" - @Copilot review suggestion
   * https://github.com/PR#comment
   * Uses percentage-based positioning and handles canvas resize
   */
  private createNameInput(_width: number, height: number): void {
    // Create and style the HTML input element
    this.nameInput = document.createElement('input');
    this.nameInput.type = 'text';
    this.nameInput.placeholder = 'Anonymous';
    this.nameInput.maxLength = 12;
    
    // Apply initial positioning
    this.updateInputPosition(height);
    
    this.nameInput.addEventListener('input', () => {
      this.playerName = this.nameInput.value.trim() || 'Anonymous';
    });

    // Add to DOM
    const canvas = this.game.canvas;
    const parent = canvas.parentElement;
    if (parent) {
      parent.style.position = 'relative';
      parent.appendChild(this.nameInput);
    }

    // Handle canvas resize to reposition input
    this.scale.on('resize', (_gameSize: Phaser.Structs.Size) => {
      if (this.nameInput) {
        this.updateInputPosition(this.scale.height);
      }
    });
  }

  /**
   * Update input element position based on canvas size
   */
  private updateInputPosition(height: number): void {
    if (!this.nameInput) return;
    
    this.nameInput.style.cssText = `
      position: absolute;
      left: 50%;
      top: ${height * 0.44}px;
      transform: translateX(-50%);
      width: 200px;
      padding: 10px;
      font-family: "Press Start 2P", monospace;
      font-size: 14px;
      text-align: center;
      background-color: #2b2b2b;
      color: #04c4ca;
      border: 2px solid #04c4ca;
      border-radius: 4px;
      outline: none;
    `;
  }

  private createLeaderboardContainer(width: number, height: number): void {
    this.leaderboardContainer = this.add.container(width / 2, height / 2);
    this.leaderboardContainer.setVisible(false);

    // Background panel
    const panel = this.add.rectangle(0, 0, 500, 400, 0x1b2853, 0.95);
    panel.setStrokeStyle(2, 0x04c4ca);
    this.leaderboardContainer.add(panel);

    // Title
    const title = this.add.text(0, -170, 'LEADERBOARD', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '24px',
      color: '#ffff00',
    }).setOrigin(0.5);
    this.leaderboardContainer.add(title);

    // Close button
    const closeBtn = this.add.text(220, -170, 'X', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '20px',
      color: '#ff2975',
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    
    closeBtn.on('pointerdown', () => this.toggleLeaderboard());
    this.leaderboardContainer.add(closeBtn);

    // Loading text (will be replaced with leaderboard data)
    const loadingText = this.add.text(0, 0, 'Loading...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);
    loadingText.setName('loadingText');
    this.leaderboardContainer.add(loadingText);
  }

  private async toggleLeaderboard(): Promise<void> {
    this.showingLeaderboard = !this.showingLeaderboard;
    this.leaderboardContainer.setVisible(this.showingLeaderboard);
    
    if (this.showingLeaderboard) {
      // Hide name input when showing leaderboard
      if (this.nameInput) {
        this.nameInput.style.display = 'none';
      }
      await this.fetchLeaderboard();
    } else {
      // Show name input when hiding leaderboard
      if (this.nameInput) {
        this.nameInput.style.display = 'block';
      }
    }
  }

  private async fetchLeaderboard(): Promise<void> {
    try {
      const serverUrl = this.getServerUrl().replace('ws://', 'http://').replace('wss://', 'https://');
      const response = await fetch(`${serverUrl}/api/leaderboard`);
      const data = await response.json();

      if (data.success && data.data) {
        this.displayLeaderboard(data.data);
      } else {
        this.displayLeaderboardError('No data available');
      }
    } catch (error) {
      this.displayLeaderboardError('Could not load leaderboard');
    }
  }

  private displayLeaderboard(entries: LeaderboardEntry[]): void {
    // Remove existing entries
    const existingEntries = this.leaderboardContainer.getAll().filter(
      child => child.name?.startsWith('entry_') || child.name === 'loadingText'
    );
    existingEntries.forEach(entry => entry.destroy());

    if (entries.length === 0) {
      const noData = this.add.text(0, 0, 'No games played yet!', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '14px',
        color: '#666666',
      }).setOrigin(0.5);
      noData.setName('entry_nodata');
      this.leaderboardContainer.add(noData);
      return;
    }

    // Header
    const header = this.add.text(-200, -120, 'RANK  NAME         WINS  RATE', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#04c4ca',
    });
    header.setName('entry_header');
    this.leaderboardContainer.add(header);

    // Display entries
    entries.slice(0, 8).forEach((entry, index) => {
      const rank = (index + 1).toString().padStart(2, ' ');
      const name = (entry.playerName || 'Anonymous')
        .substring(0, MAX_PLAYER_NAME_DISPLAY_LENGTH)
        .padEnd(MAX_PLAYER_NAME_DISPLAY_LENGTH, ' ');
      const wins = entry.wins.toString().padStart(4, ' ');
      const rate = `${entry.winRate}%`.padStart(5, ' ');
      
      // Use rank-based colors from constants
      const color = index === 0 ? LEADERBOARD_COLORS.RANK_1 
                  : index === 1 ? LEADERBOARD_COLORS.RANK_2 
                  : index === 2 ? LEADERBOARD_COLORS.RANK_3 
                  : LEADERBOARD_COLORS.DEFAULT;
      
      const entryText = this.add.text(-200, -90 + index * 30, `${rank}.  ${name}  ${wins}  ${rate}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '12px',
        color,
      });
      entryText.setName(`entry_${index}`);
      this.leaderboardContainer.add(entryText);
    });
  }

  private displayLeaderboardError(message: string): void {
    const existingEntries = this.leaderboardContainer.getAll().filter(
      child => child.name?.startsWith('entry_') || child.name === 'loadingText'
    );
    existingEntries.forEach(entry => entry.destroy());

    const errorText = this.add.text(0, 0, message, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '12px',
      color: '#ff2975',
    }).setOrigin(0.5);
    errorText.setName('entry_error');
    this.leaderboardContainer.add(errorText);
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
        this.leaderboardButton.setVisible(false);
        if (this.nameInput) {
          this.nameInput.style.display = 'none';
        }
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
        this.leaderboardButton.setVisible(true);
        if (this.nameInput) {
          this.nameInput.style.display = 'block';
        }
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
        this.leaderboardButton.setVisible(true);
        if (this.nameInput) {
          this.nameInput.style.display = 'block';
        }
        this.isConnecting = false;
      },
    };

    this.networkManager.setCallbacks(callbacks);
  }

  private getServerUrl(): string {
    // Check for environment-configured server URL first (set at build time via Vite)
    const envServerUrl = (import.meta as ImportMeta & { env?: { VITE_SERVER_URL?: string } }).env?.VITE_SERVER_URL;
    if (envServerUrl) {
      return envServerUrl;
    }

    // Check for runtime override (useful for testing different server configurations)
    const runtimeOverride = (window as Window & { __PONG9_SERVER_URL__?: string }).__PONG9_SERVER_URL__;
    if (runtimeOverride) {
      return runtimeOverride;
    }

    // Default configuration based on hostname
    const hostname = window.location.hostname;
    
    // Determine port from environment or default to 2567
    let port = 2567;
    const envPort = (import.meta as ImportMeta & { env?: { VITE_SERVER_PORT?: string } }).env?.VITE_SERVER_PORT;
    if (envPort) {
      const numericPort = parseInt(envPort, 10);
      if (Number.isFinite(numericPort) && numericPort > 0 && numericPort < 65536) {
        port = numericPort;
      }
    }

    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    const protocol = isLocal ? 'ws' : 'wss';

    // For local development, use localhost with configured port
    // For deployed environments, assume server is on same host (proxy may handle port mapping)
    if (isLocal) {
      return `${protocol}://${hostname}:${port}`;
    }
    
    // For production, use the location host (allows reverse proxy to handle routing)
    // If no proxy is configured, fall back to explicit port
    return `${protocol}://${hostname}:${port}`;
  }

  private async onConnectClick(): Promise<void> {
    if (this.isConnecting) return;

    this.isConnecting = true;
    this.statusText.setText('CONNECTING...');
    this.connectButton.setVisible(false);

    // Get player name from input
    const name = this.playerName || this.nameInput?.value?.trim() || 'Anonymous';

    try {
      await this.networkManager.connect({ playerName: name });
    } catch {
      // Error handling is done in callbacks
    }
  }
}
