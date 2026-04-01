import { create } from 'zustand';
import type { GameSession, AnswerResult, GameResult, GameMode, Word, Level } from '@/types';

interface SessionStore {
  session: GameSession | null;
  result: GameResult | null;

  startSession: (config: {
    mode: GameMode;
    topic: string;
    level: Level;
    words: Word[];
  }) => void;
  submitAnswer: (answer: AnswerResult) => void;
  nextWord: () => void;
  completeSession: () => GameResult;
  clearSession: () => void;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  session: null,
  result: null,

  startSession: ({ mode, topic, level, words }) => {
    set({
      session: {
        id: `session-${Date.now()}`,
        mode,
        topic,
        level,
        words,
        currentIndex: 0,
        answers: [],
        startedAt: Date.now(),
      },
      result: null,
    });
  },

  submitAnswer: (answer) => {
    const { session } = get();
    if (!session) return;
    set({
      session: {
        ...session,
        answers: [...session.answers, answer],
      },
    });
  },

  nextWord: () => {
    const { session } = get();
    if (!session) return;
    set({
      session: {
        ...session,
        currentIndex: session.currentIndex + 1,
      },
    });
  },

  completeSession: () => {
    const { session } = get();
    if (!session) throw new Error('No active session');

    const correctCount = session.answers.filter((a) => a.correct).length;
    const accuracy = correctCount / session.words.length;
    const stars: 1 | 2 | 3 = accuracy >= 0.9 ? 3 : accuracy >= 0.7 ? 2 : 1;

    const result: GameResult = {
      sessionId: session.id,
      mode: session.mode,
      topic: session.topic,
      totalWords: session.words.length,
      correctCount,
      accuracy,
      stars,
      newBadges: [], // Will be populated by the game engine
      timeMs: Date.now() - session.startedAt,
    };

    set({ result });
    return result;
  },

  clearSession: () => set({ session: null, result: null }),
}));
