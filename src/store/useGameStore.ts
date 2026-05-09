import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Level, WordMastery, DailyStreak, UserSettings } from '@/types';
import { todayStr, isYesterday, isDaysBefore, addDays } from '@/utils/date';
import { syncToRemote, loadFromRemote } from '@/services/userDatabase';

const LEITNER_INTERVALS = [0, 0, 1, 3, 7, 14]; // box 0 unused, boxes 1-5

interface GameStore {
  // State
  currentLevel: Level;
  wordMastery: Record<string, WordMastery>;
  totalStars: number;
  badges: string[];
  dailyStreak: DailyStreak;
  settings: UserSettings;

  // Sync state
  isSyncing: boolean;
  lastSyncedAt: number | null;

  // Actions
  setLevel: (level: Level) => void;
  updateMastery: (wordId: string, correct: boolean) => void;
  addStars: (count: number) => void;
  addBadge: (badgeId: string) => void;
  updateStreak: () => void;
  updateSettings: (partial: Partial<UserSettings>) => void;
  resetProgress: () => void;

  // Sync actions (call with userId when authenticated)
  syncToRemote: (userId: string) => Promise<void>;
  loadFromRemote: (userId: string) => Promise<boolean>;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      currentLevel: 'starters',
      wordMastery: {},
      totalStars: 0,
      badges: [],
      dailyStreak: { current: 0, lastPlayDate: '', graceDaysUsed: 0 },
      settings: {
        soundEnabled: true,
        musicEnabled: false,
        speechRate: 0.8,
        showChinese: true,
      },
      isSyncing: false,
      lastSyncedAt: null,

      setLevel: (level) => set({ currentLevel: level }),

      updateMastery: (wordId, correct) => {
        const { wordMastery } = get();
        const today = todayStr();
        const existing = wordMastery[wordId];

        if (!existing) {
          // First time seeing this word
          const newBox = correct ? 2 : 1;
          set({
            wordMastery: {
              ...wordMastery,
              [wordId]: {
                wordId,
                box: newBox as WordMastery['box'],
                lastReviewDate: today,
                nextReviewDate: addDays(today, LEITNER_INTERVALS[newBox]),
                correctStreak: correct ? 1 : 0,
                totalAttempts: 1,
                totalCorrect: correct ? 1 : 0,
              },
            },
          });
          return;
        }

        if (correct) {
          const newBox = Math.min(existing.box + 1, 5) as WordMastery['box'];
          set({
            wordMastery: {
              ...wordMastery,
              [wordId]: {
                ...existing,
                box: newBox,
                lastReviewDate: today,
                nextReviewDate: addDays(today, LEITNER_INTERVALS[newBox]),
                correctStreak: existing.correctStreak + 1,
                totalAttempts: existing.totalAttempts + 1,
                totalCorrect: existing.totalCorrect + 1,
              },
            },
          });
        } else {
          set({
            wordMastery: {
              ...wordMastery,
              [wordId]: {
                ...existing,
                box: 1,
                lastReviewDate: today,
                nextReviewDate: today,
                correctStreak: 0,
                totalAttempts: existing.totalAttempts + 1,
                totalCorrect: existing.totalCorrect,
              },
            },
          });
        }
      },

      addStars: (count) => set((state) => ({ totalStars: state.totalStars + count })),

      addBadge: (badgeId) =>
        set((state) => ({
          badges: state.badges.includes(badgeId)
            ? state.badges
            : [...state.badges, badgeId],
        })),

      updateStreak: () => {
        const { dailyStreak } = get();
        const today = todayStr();

        if (dailyStreak.lastPlayDate === today) return; // Already played today

        if (isYesterday(dailyStreak.lastPlayDate)) {
          set({
            dailyStreak: {
              current: dailyStreak.current + 1,
              lastPlayDate: today,
              graceDaysUsed: 0,
            },
          });
        } else if (
          isDaysBefore(dailyStreak.lastPlayDate, 2) &&
          dailyStreak.graceDaysUsed < 1
        ) {
          // Grace period: allow 1 day miss
          set({
            dailyStreak: {
              current: dailyStreak.current + 1,
              lastPlayDate: today,
              graceDaysUsed: 1,
            },
          });
        } else {
          // Streak broken
          set({
            dailyStreak: {
              current: 1,
              lastPlayDate: today,
              graceDaysUsed: 0,
            },
          });
        }
      },

      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),

      resetProgress: () =>
        set({
          wordMastery: {},
          totalStars: 0,
          badges: [],
          dailyStreak: { current: 0, lastPlayDate: '', graceDaysUsed: 0 },
        }),

      syncToRemote: async (userId) => {
        if (get().isSyncing) return;
        set({ isSyncing: true });
        try {
          const state = get();
          await syncToRemote(userId, {
            currentLevel: state.currentLevel,
            wordMastery: state.wordMastery,
            totalStars: state.totalStars,
            badges: state.badges,
            dailyStreak: state.dailyStreak,
            settings: state.settings,
          });
          set({ lastSyncedAt: Date.now() });
        } finally {
          set({ isSyncing: false });
        }
      },

      loadFromRemote: async (userId) => {
        const remoteState = await loadFromRemote(userId);
        if (!remoteState) return false;

        set({
          currentLevel: remoteState.currentLevel,
          wordMastery: remoteState.wordMastery,
          totalStars: remoteState.totalStars,
          badges: remoteState.badges,
          dailyStreak: remoteState.dailyStreak,
          settings: remoteState.settings,
          lastSyncedAt: Date.now(),
        });
        return true;
      },
    }),
    { name: 'wordquest-game-store' }
  )
);
