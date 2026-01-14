/**
 * LeaderboardService - Firebase v9 Modular SDK integration
 * Per tech_stack.md: Must use Firebase v9 modular imports
 */
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore,
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs
} from 'firebase/firestore';
import { LeaderboardEntry, GameResult } from '@pong9/shared/interfaces';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_APP_ID || ''
};

export class LeaderboardService {
  private app: FirebaseApp | null = null;
  private db: Firestore | null = null;
  private readonly COLLECTION_NAME = 'leaderboard';
  private initialized = false;

  /**
   * Initialize Firebase connection
   * Returns false if Firebase config is not set (allows running without Firebase)
   */
  async initialize(): Promise<boolean> {
    // Check if Firebase is configured
    if (!firebaseConfig.projectId) {
      console.log('[LeaderboardService] Firebase not configured - leaderboard disabled');
      console.log('[LeaderboardService] Set FIREBASE_PROJECT_ID environment variable to enable');
      return false;
    }

    try {
      this.app = initializeApp(firebaseConfig);
      this.db = getFirestore(this.app);
      this.initialized = true;
      console.log('[LeaderboardService] Firebase initialized successfully');
      return true;
    } catch (error) {
      console.error('[LeaderboardService] Failed to initialize Firebase:', error);
      return false;
    }
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.initialized && this.db !== null;
  }

  /**
   * Get or create a player entry by name
   */
  async getPlayerEntry(playerName: string): Promise<LeaderboardEntry | null> {
    if (!this.isReady() || !this.db) return null;

    try {
      const docRef = doc(this.db, this.COLLECTION_NAME, playerName.toLowerCase());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as LeaderboardEntry;
      }

      // Create new entry
      const newEntry: Omit<LeaderboardEntry, 'id'> = {
        playerName,
        wins: 0,
        losses: 0,
        totalGames: 0,
        winRate: 0,
        lastPlayed: Date.now()
      };

      await setDoc(docRef, newEntry);
      return { id: playerName.toLowerCase(), ...newEntry };
    } catch (error) {
      console.error('[LeaderboardService] Error getting player entry:', error);
      return null;
    }
  }

  /**
   * Record a game result and update both players' stats
   */
  async recordGameResult(result: GameResult): Promise<boolean> {
    if (!this.isReady() || !this.db) {
      console.log('[LeaderboardService] Not ready - skipping game result recording');
      return false;
    }

    try {
      // Update winner stats
      const winnerRef = doc(this.db, this.COLLECTION_NAME, result.winnerName.toLowerCase());
      const winnerSnap = await getDoc(winnerRef);

      if (winnerSnap.exists()) {
        const data = winnerSnap.data() as LeaderboardEntry;
        const newWins = data.wins + 1;
        const newTotal = data.totalGames + 1;
        await updateDoc(winnerRef, {
          wins: newWins,
          totalGames: newTotal,
          winRate: Math.round((newWins / newTotal) * 100),
          lastPlayed: result.timestamp
        });
      } else {
        await setDoc(winnerRef, {
          playerName: result.winnerName,
          wins: 1,
          losses: 0,
          totalGames: 1,
          winRate: 100,
          lastPlayed: result.timestamp
        });
      }

      // Update loser stats
      const loserRef = doc(this.db, this.COLLECTION_NAME, result.loserName.toLowerCase());
      const loserSnap = await getDoc(loserRef);

      if (loserSnap.exists()) {
        const data = loserSnap.data() as LeaderboardEntry;
        const newTotal = data.totalGames + 1;
        await updateDoc(loserRef, {
          losses: data.losses + 1,
          totalGames: newTotal,
          winRate: Math.round((data.wins / newTotal) * 100),
          lastPlayed: result.timestamp
        });
      } else {
        await setDoc(loserRef, {
          playerName: result.loserName,
          wins: 0,
          losses: 1,
          totalGames: 1,
          winRate: 0,
          lastPlayed: result.timestamp
        });
      }

      console.log(`[LeaderboardService] Recorded game: ${result.winnerName} beat ${result.loserName}`);
      return true;
    } catch (error) {
      console.error('[LeaderboardService] Error recording game result:', error);
      return false;
    }
  }

  /**
   * Get top players by wins
   */
  async getTopPlayers(count: number = 10): Promise<LeaderboardEntry[]> {
    if (!this.isReady() || !this.db) return [];

    try {
      const q = query(
        collection(this.db, this.COLLECTION_NAME),
        orderBy('wins', 'desc'),
        limit(count)
      );

      const querySnapshot = await getDocs(q);
      const entries: LeaderboardEntry[] = [];

      querySnapshot.forEach((docSnapshot) => {
        entries.push({ id: docSnapshot.id, ...docSnapshot.data() } as LeaderboardEntry);
      });

      return entries;
    } catch (error) {
      console.error('[LeaderboardService] Error getting top players:', error);
      return [];
    }
  }

  /**
   * Get top players by win rate (minimum 5 games)
   */
  async getTopByWinRate(count: number = 10): Promise<LeaderboardEntry[]> {
    if (!this.isReady() || !this.db) return [];

    try {
      const q = query(
        collection(this.db, this.COLLECTION_NAME),
        orderBy('winRate', 'desc'),
        limit(count * 2) // Get more to filter
      );

      const querySnapshot = await getDocs(q);
      const entries: LeaderboardEntry[] = [];

      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data() as LeaderboardEntry;
        if (data.totalGames >= 5) {
          entries.push({ id: docSnapshot.id, ...data });
        }
      });

      return entries.slice(0, count);
    } catch (error) {
      console.error('[LeaderboardService] Error getting top by win rate:', error);
      return [];
    }
  }
}

// Singleton instance
export const leaderboardService = new LeaderboardService();
