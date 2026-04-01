import type { Level } from './word';

export interface WordMastery {
  wordId: string;
  box: 1 | 2 | 3 | 4 | 5;
  lastReviewDate: string;
  nextReviewDate: string;
  correctStreak: number;
  totalAttempts: number;
  totalCorrect: number;
}

export interface DailyStreak {
  current: number;
  lastPlayDate: string;
  graceDaysUsed: number;
}

export interface UserSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  speechRate: number;
  showChinese: boolean;
}

export interface GameStoreState {
  currentLevel: Level;
  wordMastery: Record<string, WordMastery>;
  totalStars: number;
  badges: string[];
  dailyStreak: DailyStreak;
  settings: UserSettings;
}
