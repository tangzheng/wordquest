import type { Level, Word } from './word';

export type GameMode = 'picture-word' | 'listen-spell' | 'word-matching' | 'comprehensive';

export interface GameSession {
  id: string;
  mode: GameMode;
  topic: string;
  level: Level;
  words: Word[];
  currentIndex: number;
  answers: AnswerResult[];
  startedAt: number;
}

export interface AnswerResult {
  wordId: string;
  correct: boolean;
  timeMs: number;
  attempts: number;
}

export interface GameResult {
  sessionId: string;
  mode: GameMode;
  topic: string;
  totalWords: number;
  correctCount: number;
  accuracy: number;
  stars: 1 | 2 | 3;
  newBadges: string[];
  timeMs: number;
}

export interface GameRound {
  word: Word;
  mode: GameMode;
}
